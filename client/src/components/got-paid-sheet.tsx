import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, Check, Navigation, Loader2, RotateCcw } from "lucide-react";
import { BUSINESS_EXPENSE_CATEGORIES } from "@shared/schema";
import { AddressAutocomplete } from "@/components/address-autocomplete";
import type { Gig } from "@shared/schema";

const GREEN = "#10b981";
const CYAN = "#00b4d8";
const IRS_RATE = 0.725;

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "check", label: "Check" },
  { value: "direct_deposit", label: "Direct Deposit" },
  { value: "venmo", label: "Venmo" },
  { value: "paypal", label: "PayPal" },
  { value: "zelle", label: "Zelle" },
  { value: "other", label: "Other" },
];

const STEPS = ["Amount", "Expenses", "Mileage", "Tax Rate", "Summary"];

interface OtherExpense {
  id?: number;
  businessPurpose: string;
  amount: string;
  category: string;
}

interface GotPaidSheetProps {
  gig: Gig;
  homeAddress?: string;
  defaultTaxPercentage?: number;
  onBack: () => void;
  onSuccess: () => void;
}

export default function GotPaidSheet({ gig, homeAddress, defaultTaxPercentage, onBack, onSuccess }: GotPaidSheetProps) {
  const [step, setStep] = useState(1);
  const { toast } = useToast();

  // Step 1: Amount
  const [totalReceived, setTotalReceived] = useState(
    String(Number(gig.expectedPay ?? 0).toFixed(2))
  );
  const [paymentMethod, setPaymentMethod] = useState("other");

  // Step 2: Expenses — pre-fill from any existing data on the gig
  const _existingParking = Number((gig as any).parkingExpense ?? 0);
  const _existingParkingReimbursed = Number((gig as any).reimbursedParking ?? 0);
  const _existingOther = Number((gig as any).otherExpenses ?? 0);
  const _existingOtherDesc = (gig as any).otherExpenseDescription || "";

  const [hasParking, setHasParking] = useState(_existingParking > 0);
  const [parkingSpent, setParkingSpent] = useState(_existingParking > 0 ? _existingParking.toFixed(2) : "");
  const [parkingReimbursed, setParkingReimbursed] = useState(_existingParkingReimbursed > 0 ? _existingParkingReimbursed.toFixed(2) : "");
  const [hasOtherExpenses, setHasOtherExpenses] = useState(_existingOther > 0);
  const [otherExpenses, setOtherExpenses] = useState<OtherExpense[]>(
    _existingOther > 0
      ? [{ businessPurpose: _existingOtherDesc, amount: _existingOther.toFixed(2), category: "Supplies" }]
      : [{ businessPurpose: "", amount: "", category: "Supplies" }]
  );

  // Fetch any expenses already linked to this gig so we can pre-fill step 2
  const prefillInitialized = useRef(false);
  const { data: linkedExpenses } = useQuery<any[]>({
    queryKey: [`/api/gigs/${gig.id}/expenses`],
    staleTime: 0,
  });

  useEffect(() => {
    if (prefillInitialized.current) return;
    if (!linkedExpenses || linkedExpenses.length === 0) return;
    prefillInitialized.current = true;
    const prefilledExpenses: OtherExpense[] = linkedExpenses.map((e: any) => ({
      id: e.id,
      businessPurpose: e.businessPurpose || "",
      amount: String(parseFloat(e.amount) || ""),
      category: e.category || "Supplies",
    }));
    setOtherExpenses(prefilledExpenses);
    setHasOtherExpenses(true);
  }, [linkedExpenses]);

  // Step 3: Mileage — addresses
  const [startingAddress, setStartingAddress] = useState(homeAddress || "");
  const [startingAddressFormatted, setStartingAddressFormatted] = useState(homeAddress || "");
  const [gigAddressDisplay, setGigAddressDisplay] = useState((gig as any).gigAddress || "");
  const [gigAddressFormatted, setGigAddressFormatted] = useState((gig as any).gigAddress || "");

  // Step 3: Mileage — calculation
  const [baseOnewayMiles, setBaseOnewayMiles] = useState<number | null>(null);
  const [miles, setMiles] = useState(String(Number((gig as any).mileage ?? 0)));
  const [isCalculatingMileage, setIsCalculatingMileage] = useState(false);
  const [mileageAutoCalculated, setMileageAutoCalculated] = useState(false);
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const [isRoundTripPerDay, setIsRoundTripPerDay] = useState(false);

  // Step 4: Tax
  const profileRate = defaultTaxPercentage ?? (gig.taxPercentage ?? 28);
  const [taxTreatment, setTaxTreatment] = useState<"default" | "custom" | "w2">("default");
  const [taxPct, setTaxPct] = useState(String(profileRate));
  const [customRateError, setCustomRateError] = useState("");

  const effectiveTaxRate =
    taxTreatment === "w2" ? 0 :
    taxTreatment === "custom" ? parseFloat(taxPct || "0") :
    profileRate;

  // Multi-day info
  const gigStartDate = (gig as any).startDate;
  const gigEndDate = (gig as any).endDate;
  const gigDays = gigStartDate && gigEndDate
    ? Math.max(1, Math.round((new Date(gigEndDate).getTime() - new Date(gigStartDate).getTime()) / (1000 * 60 * 60 * 24)) + 1)
    : 1;
  const isMultiDayGig = gigDays > 1;

  // Recompute miles from base whenever round trip toggles change
  useEffect(() => {
    if (baseOnewayMiles === null) return;
    const multiplier = (isRoundTrip ? 2 : 1) * (isRoundTripPerDay ? gigDays : 1);
    const computed = Math.round(baseOnewayMiles * multiplier * 10) / 10;
    setMiles(String(computed));
  }, [baseOnewayMiles, isRoundTrip, isRoundTripPerDay, gigDays]);

  // Derived values
  const mileageDeduction = parseFloat(miles || "0") * IRS_RATE;
  const totalParkingSpent = hasParking ? parseFloat(parkingSpent || "0") : 0;
  const totalParkingReimbursed = hasParking ? parseFloat(parkingReimbursed || "0") : 0;
  const validOtherExpenses = hasOtherExpenses
    ? otherExpenses
        .filter((e) => e.businessPurpose && e.amount)
        .map((e) => ({
          id: e.id,
          businessPurpose: e.businessPurpose,
          amount: parseFloat(e.amount),
          category: e.category,
          reimbursedAmount: 0,
        }))
    : [];
  const totalOtherExpenses = validOtherExpenses.reduce((sum, e) => sum + e.amount, 0);

  const canCalculate =
    (startingAddressFormatted || startingAddress).length >= 5 &&
    (gigAddressFormatted || gigAddressDisplay).length >= 5;

  const handleCalculateMileage = async () => {
    const origin = startingAddressFormatted || startingAddress;
    const destination = gigAddressFormatted || gigAddressDisplay;
    if (!canCalculate) return;
    setIsCalculatingMileage(true);
    try {
      const res = await apiRequest("POST", "/api/calculate-distance", {
        startAddress: origin,
        endAddress: destination,
        roundTrip: false, // Always fetch one-way; we apply multipliers client-side
      });
      if (res.ok) {
        const data = await res.json();
        const oneway = Math.round((data.distanceMiles || 0) * 10) / 10;
        setBaseOnewayMiles(oneway);
        setMileageAutoCalculated(true);
        // miles will be set by the useEffect above
      } else {
        toast({ title: "Couldn't calculate mileage", description: "Enter miles manually below.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Couldn't calculate mileage", description: "Enter miles manually below.", variant: "destructive" });
    } finally {
      setIsCalculatingMileage(false);
    }
  };

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/gigs/${gig.id}/got-paid`, {
        totalReceived: parseFloat(totalReceived || "0"),
        mileage: parseFloat(miles || "0"),
        parkingSpent: totalParkingSpent,
        parkingReimbursed: totalParkingReimbursed,
        otherExpenses: validOtherExpenses,
        otherReimbursed: 0,
        paymentMethod,
        taxPercentage: Math.round(effectiveTaxRate),
        taxRateUsed: effectiveTaxRate,
        taxTreatment,
        isW2: taxTreatment === "w2",
        gigAddress: gigAddressFormatted || gigAddressDisplay || undefined,
        startingAddress: startingAddressFormatted || startingAddress || undefined,
      });
      if (!response.ok) throw new Error("Failed to process payment");
      return response.json();
    },
    onSuccess: () => {
      onSuccess();
    },
    onError: () => {
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
    },
  });

  // ─── Shared styles ────────────────────────────────────────────────────────
  const questionStyle: React.CSSProperties = {
    fontSize: "20px",
    fontWeight: 600,
    color: "#111111",
    lineHeight: 1.3,
    marginBottom: "6px",
  };
  const subStyle: React.CSSProperties = {
    fontSize: "13px",
    color: "#9B9B9B",
    marginBottom: "24px",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: "12px",
    color: "#9B9B9B",
    marginBottom: "5px",
    textTransform: "uppercase",
    letterSpacing: "0.4px",
    fontWeight: 500,
  };
  const inputStyle: React.CSSProperties = {
    width: "100%",
    fontSize: "17px",
    fontWeight: 500,
    color: "#111111",
    border: "none",
    borderBottom: "2px solid #F0F0F0",
    outline: "none",
    background: "transparent",
    padding: "8px 0",
  };
  const toggleRowStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 0",
    borderBottom: "1px solid #F0F0F0",
    cursor: "pointer",
  };

  const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
    <div
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      style={{
        width: "44px",
        height: "26px",
        borderRadius: "13px",
        backgroundColor: on ? GREEN : "#E5E7EB",
        position: "relative",
        flexShrink: 0,
        transition: "background-color 200ms ease",
        cursor: "pointer",
      }}
    >
      <div style={{
        position: "absolute",
        top: "3px",
        left: on ? "21px" : "3px",
        width: "20px",
        height: "20px",
        borderRadius: "50%",
        backgroundColor: "#ffffff",
        transition: "left 200ms ease",
        boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
      }} />
    </div>
  );

  // ─── Step content ─────────────────────────────────────────────────────────
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <div style={questionStyle}>What hit your bank account?</div>
            <div style={subStyle}>Include any reimbursements you received</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "28px" }}>
              <span style={{ fontSize: "28px", fontWeight: 700, color: "#9B9B9B" }}>$</span>
              <input
                type="number"
                inputMode="decimal"
                value={totalReceived}
                onChange={(e) => setTotalReceived(e.target.value)}
                onFocus={(e) => e.target.select()}
                style={{ ...inputStyle, fontSize: "40px", fontWeight: 700, flex: 1 }}
                autoFocus
              />
            </div>
            <div style={labelStyle}>Payment method</div>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={{ ...inputStyle, fontSize: "16px", fontWeight: 400, cursor: "pointer" }}
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
        );

      case 2:
        return (
          <div>
            <div style={questionStyle}>Any expenses or reimbursements?</div>
            <div style={subStyle}>These reduce what you owe in taxes</div>

            <div style={toggleRowStyle} onClick={() => setHasParking(!hasParking)}>
              <div>
                <div style={{ fontSize: "15px", fontWeight: 500, color: "#111111" }}>Parking costs</div>
                <div style={{ fontSize: "12px", color: "#9B9B9B", marginTop: "2px" }}>Did you pay for parking?</div>
              </div>
              <Toggle on={hasParking} onToggle={() => setHasParking(!hasParking)} />
            </div>

            {hasParking && (
              <div style={{ padding: "16px 0 4px", display: "flex", gap: "16px" }}>
                <div style={{ flex: 1 }}>
                  <div style={labelStyle}>Amount spent</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ color: "#9B9B9B", fontSize: "16px" }}>$</span>
                    <input type="number" inputMode="decimal" value={parkingSpent} onChange={(e) => setParkingSpent(e.target.value)} style={inputStyle} placeholder="0.00" />
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={labelStyle}>Reimbursed</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ color: "#9B9B9B", fontSize: "16px" }}>$</span>
                    <input type="number" inputMode="decimal" value={parkingReimbursed} onChange={(e) => setParkingReimbursed(e.target.value)} style={inputStyle} placeholder="0.00" />
                  </div>
                </div>
              </div>
            )}

            <div style={toggleRowStyle} onClick={() => setHasOtherExpenses(!hasOtherExpenses)}>
              <div>
                <div style={{ fontSize: "15px", fontWeight: 500, color: "#111111" }}>Other business expenses</div>
                <div style={{ fontSize: "12px", color: "#9B9B9B", marginTop: "2px" }}>Supplies, meals, equipment, etc.</div>
              </div>
              <Toggle on={hasOtherExpenses} onToggle={() => setHasOtherExpenses(!hasOtherExpenses)} />
            </div>

            {hasOtherExpenses && (
              <div style={{ paddingTop: "14px" }}>
                {otherExpenses.map((exp, i) => (
                  <div key={i} style={{ backgroundColor: "#F9F9F9", borderRadius: "12px", padding: "14px", marginBottom: "10px" }}>
                    <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
                      <div style={{ flex: 2 }}>
                        <div style={labelStyle}>Description</div>
                        <input
                          type="text"
                          value={exp.businessPurpose}
                          onChange={(e) => { const u = [...otherExpenses]; u[i] = { ...u[i], businessPurpose: e.target.value }; setOtherExpenses(u); }}
                          style={inputStyle}
                          placeholder="e.g. Studio supplies"
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={labelStyle}>Amount</div>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <span style={{ color: "#9B9B9B", fontSize: "16px" }}>$</span>
                          <input
                            type="number"
                            inputMode="decimal"
                            value={exp.amount}
                            onChange={(e) => { const u = [...otherExpenses]; u[i] = { ...u[i], amount: e.target.value }; setOtherExpenses(u); }}
                            style={inputStyle}
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <div style={labelStyle}>Category</div>
                      <select
                        value={exp.category}
                        onChange={(e) => { const u = [...otherExpenses]; u[i] = { ...u[i], category: e.target.value }; setOtherExpenses(u); }}
                        style={{ ...inputStyle, fontSize: "14px", cursor: "pointer" }}
                      >
                        {BUSINESS_EXPENSE_CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    {otherExpenses.length > 1 && (
                      <button onClick={() => setOtherExpenses(otherExpenses.filter((_, idx) => idx !== i))} style={{ background: "none", border: "none", color: "#ef4444", fontSize: "12px", cursor: "pointer", marginTop: "10px", padding: 0 }}>
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => setOtherExpenses([...otherExpenses, { businessPurpose: "", amount: "", category: "Supplies" }])}
                  style={{ background: "none", border: "none", color: CYAN, fontSize: "13px", fontWeight: 600, cursor: "pointer", padding: "6px 0" }}
                >
                  + Add another expense
                </button>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div>
            <div style={questionStyle}>How far did you drive?</div>
            <div style={subStyle}>Enter your addresses and tap Calculate</div>

            {/* Starting address */}
            <div style={{ marginBottom: "18px", position: "relative", zIndex: 20 }}>
              <AddressAutocomplete
                label="Starting from"
                placeholder="Your home or starting location"
                value={startingAddress}
                onChange={(display, formatted) => {
                  setStartingAddress(display);
                  setStartingAddressFormatted(formatted || display);
                  setMileageAutoCalculated(false);
                }}
              />
            </div>

            {/* Gig address */}
            <div style={{ marginBottom: "16px", position: "relative", zIndex: 10 }}>
              <AddressAutocomplete
                label="Gig location"
                placeholder="Where was the gig?"
                value={gigAddressDisplay}
                onChange={(display, formatted) => {
                  setGigAddressDisplay(display);
                  setGigAddressFormatted(formatted || display);
                  setMileageAutoCalculated(false);
                }}
              />
            </div>

            {/* Calculate button */}
            <button
              onClick={handleCalculateMileage}
              disabled={!canCalculate || isCalculatingMileage}
              style={{
                width: "100%",
                height: "44px",
                borderRadius: "10px",
                border: `1.5px solid ${canCalculate && !isCalculatingMileage ? CYAN : "#E5E7EB"}`,
                backgroundColor: "transparent",
                color: canCalculate && !isCalculatingMileage ? CYAN : "#9B9B9B",
                fontSize: "14px",
                fontWeight: 600,
                cursor: canCalculate && !isCalculatingMileage ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                marginBottom: "20px",
                transition: "all 150ms ease",
              }}
            >
              {isCalculatingMileage
                ? <><Loader2 size={14} className="animate-spin" />Calculating…</>
                : <><RotateCcw size={14} />Calculate miles</>}
            </button>

            {/* Round trip toggles */}
            <div style={toggleRowStyle} onClick={() => setIsRoundTrip(!isRoundTrip)}>
              <div>
                <div style={{ fontSize: "15px", fontWeight: 500, color: "#111111" }}>Round trip</div>
                <div style={{ fontSize: "12px", color: "#9B9B9B", marginTop: "2px" }}>
                  {isRoundTrip && baseOnewayMiles !== null
                    ? `${baseOnewayMiles} mi each way × 2`
                    : "Double the distance for the return drive"}
                </div>
              </div>
              <Toggle on={isRoundTrip} onToggle={() => setIsRoundTrip(!isRoundTrip)} />
            </div>

            {isMultiDayGig && (
              <div style={toggleRowStyle} onClick={() => setIsRoundTripPerDay(!isRoundTripPerDay)}>
                <div>
                  <div style={{ fontSize: "15px", fontWeight: 500, color: "#111111" }}>Round trip per day</div>
                  <div style={{ fontSize: "12px", color: "#9B9B9B", marginTop: "2px" }}>
                    {isRoundTripPerDay && baseOnewayMiles !== null
                      ? `${baseOnewayMiles} mi × ${isRoundTrip ? "2" : "1"} × ${gigDays} days`
                      : `Multiply miles across all ${gigDays} days`}
                  </div>
                </div>
                <Toggle on={isRoundTripPerDay} onToggle={() => setIsRoundTripPerDay(!isRoundTripPerDay)} />
              </div>
            )}

            {/* Miles field */}
            <div style={{ marginTop: "16px" }}>
              <div style={{ ...labelStyle, display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                <span>Total miles</span>
                {mileageAutoCalculated && !isCalculatingMileage && (
                  <span style={{ display: "flex", alignItems: "center", gap: "4px", color: GREEN, fontSize: "11px", textTransform: "none", letterSpacing: 0 }}>
                    <Navigation size={11} />
                    Auto-calculated
                  </span>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                <input
                  type="number"
                  inputMode="decimal"
                  value={miles}
                  onChange={(e) => {
                    setMiles(e.target.value);
                    setBaseOnewayMiles(null);
                    setMileageAutoCalculated(false);
                  }}
                  onFocus={(e) => e.target.select()}
                  style={{ ...inputStyle, fontSize: "34px", fontWeight: 700, flex: 1 }}
                />
                <span style={{ fontSize: "16px", color: "#9B9B9B", fontWeight: 500, flexShrink: 0 }}>miles</span>
              </div>
            </div>

            {/* Deduction preview */}
            {parseFloat(miles || "0") > 0 && !isCalculatingMileage && (
              <div style={{ backgroundColor: "#f0fdf4", borderRadius: "10px", padding: "12px 14px", marginTop: "14px", marginBottom: "12px" }}>
                <span style={{ fontSize: "13px", color: GREEN, fontWeight: 500 }}>
                  That's a <strong>${mileageDeduction.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> deduction at the 2026 IRS rate (72.5¢/mile)
                </span>
              </div>
            )}

            <button
              onClick={() => { setMiles("0"); setBaseOnewayMiles(null); setMileageAutoCalculated(false); setStep(4); }}
              style={{ background: "none", border: "none", color: "#9B9B9B", fontSize: "13px", cursor: "pointer", padding: "4px 0", marginTop: "4px" }}
            >
              Skip — I didn't drive
            </button>
          </div>
        );

      case 4: {
        const optionCard = (
          value: "default" | "custom" | "w2",
          title: string,
          description: string,
        ) => {
          const selected = taxTreatment === value;
          return (
            <div
              onClick={() => setTaxTreatment(value)}
              style={{
                border: `2px solid ${selected ? CYAN : "#E5E7EB"}`,
                borderRadius: "14px",
                padding: "16px",
                marginBottom: "10px",
                cursor: "pointer",
                backgroundColor: selected ? "#f0fbff" : "#ffffff",
                transition: "border-color 150ms ease, background-color 150ms ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: "15px", fontWeight: 600, color: "#111111", marginBottom: "3px" }}>{title}</div>
                  <div style={{ fontSize: "12px", color: "#9B9B9B" }}>{description}</div>
                </div>
                <div style={{
                  width: "20px", height: "20px", borderRadius: "50%",
                  border: `2px solid ${selected ? CYAN : "#E5E7EB"}`,
                  backgroundColor: selected ? CYAN : "transparent",
                  flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 150ms ease",
                }}>
                  {selected && <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#fff" }} />}
                </div>
              </div>
            </div>
          );
        };

        return (
          <div>
            <div style={questionStyle}>How are taxes handled?</div>
            <div style={subStyle}>Choose how to calculate your tax estimate</div>

            {optionCard("default", `Use my default rate (${profileRate}%)`, "Applies the rate set in your profile")}
            {optionCard("custom", "Custom rate for this gig", "Type any rate — only applies to this gig")}
            {optionCard("w2", "W2 — taxes already withheld", "Employer withheld taxes; nothing to set aside")}

            {taxTreatment === "custom" && (
              <div style={{ marginTop: "16px" }}>
                <div style={labelStyle}>Your rate for this gig</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={taxPct}
                    onChange={(e) => { setTaxPct(e.target.value); setCustomRateError(""); }}
                    onFocus={(e) => e.target.select()}
                    style={{ ...inputStyle, fontSize: "40px", fontWeight: 700, flex: 1, borderColor: customRateError ? "#EF4444" : undefined }}
                    autoFocus
                    placeholder="0"
                  />
                  <span style={{ fontSize: "28px", fontWeight: 600, color: "#9B9B9B" }}>%</span>
                </div>
                {customRateError && (
                  <div style={{ fontSize: "13px", color: "#EF4444", marginTop: "6px" }}>{customRateError}</div>
                )}
              </div>
            )}

            {taxTreatment !== "custom" && (
              <div style={{ marginTop: "16px", padding: "14px 16px", backgroundColor: "#F9F9F9", borderRadius: "12px" }}>
                <span style={{ fontSize: "14px", color: "#374151" }}>
                  {taxTreatment === "w2"
                    ? "0% — taxes were withheld by your employer"
                    : `${profileRate}% — pulled from your profile`}
                </span>
              </div>
            )}
          </div>
        );
      }

      case 5: {
        const received = parseFloat(totalReceived || "0");
        const tax = taxTreatment === "w2" ? 0 : received * (effectiveTaxRate / 100);
        const netParking = totalParkingSpent - totalParkingReimbursed;
        const milesNum = parseFloat(miles || "0");

        const taxRateLabel =
          taxTreatment === "w2" ? "W2 — withheld by employer" :
          taxTreatment === "custom" ? `${effectiveTaxRate}% (custom)` :
          `${effectiveTaxRate}% (profile default)`;

        const rows: { label: string; value: string; highlight?: boolean }[] = [
          { label: "Gig", value: (gig as any).gigType || gig.eventName || "—" },
          { label: "Client", value: gig.clientName || "—" },
          { label: "Amount received", value: `$${received.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, highlight: true },
          { label: "Payment method", value: PAYMENT_METHODS.find((m) => m.value === paymentMethod)?.label ?? paymentMethod },
          ...(milesNum > 0
            ? [
                { label: "Miles driven", value: `${milesNum} mi${isRoundTrip ? " (round trip)" : ""}${isRoundTripPerDay && isMultiDayGig ? ` × ${gigDays} days` : ""}` },
                { label: "Mileage deduction", value: `$${(milesNum * IRS_RATE).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
              ]
            : []),
          ...(netParking > 0
            ? [{ label: "Net parking cost", value: `$${netParking.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` }]
            : []),
          ...(totalOtherExpenses > 0
            ? [{ label: "Other expenses", value: `$${totalOtherExpenses.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` }]
            : []),
          { label: "Tax treatment", value: taxRateLabel },
          ...(taxTreatment !== "w2"
            ? [{ label: "Est. tax owed", value: `$${tax.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, highlight: true }]
            : [{ label: "Est. tax owed", value: "$0.00 — W2 income", highlight: true }]),
        ];

        return (
          <div>
            <div style={questionStyle}>Here's your summary</div>
            <div style={subStyle}>Review everything before confirming</div>
            {rows.map(({ label, value, highlight }) => (
              <div
                key={label}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 0", borderBottom: "1px solid #F0F0F0" }}
              >
                <span style={{ fontSize: "14px", color: "#9B9B9B" }}>{label}</span>
                <span style={{ fontSize: "14px", fontWeight: highlight ? 600 : 500, color: "#111111" }}>{value}</span>
              </div>
            ))}
          </div>
        );
      }

      default:
        return null;
    }
  };

  const handleNext = () => {
    if (step === 4 && taxTreatment === "custom") {
      const val = parseFloat(taxPct || "0");
      if (!taxPct || val <= 0) {
        setCustomRateError("Please enter a valid tax rate");
        return;
      }
      setCustomRateError("");
    }
    if (step < STEPS.length) setStep(step + 1);
    else mutate();
  };

  const handleBack = () => {
    if (step === 1) onBack();
    else setStep(step - 1);
  };

  const isLastStep = step === STEPS.length;
  const nextDisabled = isPending || (step === 3 && isCalculatingMileage);

  return (
    <>
      {/* Progress header */}
      <div style={{ display: "flex", alignItems: "center", padding: "4px 20px 14px", flexShrink: 0 }}>
        <button
          onClick={handleBack}
          style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 10px 4px 0", display: "flex", alignItems: "center" }}
        >
          <ChevronLeft size={22} color="#111111" />
        </button>
        <div style={{ flex: 1, display: "flex", justifyContent: "center", gap: "6px" }}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              style={{
                width: i + 1 === step ? "20px" : "6px",
                height: "6px",
                borderRadius: "3px",
                backgroundColor: i + 1 <= step ? GREEN : "#E5E7EB",
                transition: "all 0.25s ease",
              }}
            />
          ))}
        </div>
        <div style={{ width: "32px" }} />
      </div>

      {/* Step content */}
      <div style={{ overflowY: "auto", flex: 1, padding: "0 20px 16px" }}>
        {renderStep()}
      </div>

      {/* Next / Confirm button */}
      <div style={{ padding: "8px 20px 0", flexShrink: 0 }}>
        <button
          onClick={handleNext}
          disabled={nextDisabled}
          style={{
            width: "100%",
            height: "52px",
            borderRadius: "999px",
            backgroundColor: nextDisabled ? "#9ca3af" : isLastStep ? GREEN : "#111111",
            color: "#ffffff",
            fontSize: "15px",
            fontWeight: 600,
            border: "none",
            cursor: nextDisabled ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            transition: "background-color 150ms ease",
          }}
        >
          {isPending ? "Confirming…"
            : isLastStep ? <><Check size={16} />Confirm Payment</>
            : "Next →"}
        </button>
      </div>
    </>
  );
}
