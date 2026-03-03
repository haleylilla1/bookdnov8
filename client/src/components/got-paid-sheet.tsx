import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, Check, Navigation, Loader2 } from "lucide-react";
import { BUSINESS_EXPENSE_CATEGORIES } from "@shared/schema";
import { AddressAutocomplete } from "@/components/address-autocomplete";
import type { Gig } from "@shared/schema";

const GREEN = "#10b981";
const CYAN = "#00b4d8";
const IRS_RATE = 0.70;

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
  businessPurpose: string;
  amount: string;
  category: string;
}

interface GotPaidSheetProps {
  gig: Gig;
  homeAddress?: string;
  onBack: () => void;
  onSuccess: () => void;
}

export default function GotPaidSheet({ gig, homeAddress, onBack, onSuccess }: GotPaidSheetProps) {
  const [step, setStep] = useState(1);
  const { toast } = useToast();

  // Step 1: Amount
  const [totalReceived, setTotalReceived] = useState(
    String(Number(gig.expectedPay ?? 0).toFixed(2))
  );
  const [paymentMethod, setPaymentMethod] = useState("other");

  // Step 2: Expenses
  const [hasParking, setHasParking] = useState(false);
  const [parkingSpent, setParkingSpent] = useState("");
  const [parkingReimbursed, setParkingReimbursed] = useState("");
  const [hasOtherExpenses, setHasOtherExpenses] = useState(false);
  const [otherExpenses, setOtherExpenses] = useState<OtherExpense[]>([
    { businessPurpose: "", amount: "", category: "Supplies" },
  ]);

  // Step 3: Mileage
  const [startingAddress, setStartingAddress] = useState(homeAddress || "");
  const [startingAddressFormatted, setStartingAddressFormatted] = useState(homeAddress || "");
  const [gigAddressValue, setGigAddressValue] = useState((gig as any).gigAddress || "");
  const [gigAddressFormatted, setGigAddressFormatted] = useState((gig as any).gigAddress || "");
  const [miles, setMiles] = useState(String((gig as any).mileage ?? 0));
  const [isCalculatingMileage, setIsCalculatingMileage] = useState(false);
  const [mileageAutoCalculated, setMileageAutoCalculated] = useState(false);
  const [manualMilesOverride, setManualMilesOverride] = useState(false);

  // Step 4: Tax
  const [taxPct, setTaxPct] = useState(String(gig.taxPercentage ?? 25));

  const mileageDeduction = parseFloat(miles || "0") * IRS_RATE;
  const totalParkingSpent = hasParking ? parseFloat(parkingSpent || "0") : 0;
  const totalParkingReimbursed = hasParking ? parseFloat(parkingReimbursed || "0") : 0;
  const validOtherExpenses = hasOtherExpenses
    ? otherExpenses
        .filter((e) => e.businessPurpose && e.amount)
        .map((e) => ({
          businessPurpose: e.businessPurpose,
          amount: parseFloat(e.amount),
          category: e.category,
          reimbursedAmount: 0,
        }))
    : [];
  const totalOtherExpenses = validOtherExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Auto-calculate mileage when both addresses are filled (and not manually overridden)
  const calculateMileage = async (origin: string, destination: string) => {
    if (!origin || !destination || origin.length < 5 || destination.length < 5) return;
    setIsCalculatingMileage(true);
    try {
      const res = await apiRequest("POST", "/api/calculate-distance", {
        startAddress: origin,
        endAddress: destination,
      });
      if (res.ok) {
        const data = await res.json();
        const calculated = Math.round((data.distance || 0) * 10) / 10;
        setMiles(String(calculated));
        setMileageAutoCalculated(true);
        setManualMilesOverride(false);
      }
    } catch {
      // Silently fail — user can enter miles manually
    } finally {
      setIsCalculatingMileage(false);
    }
  };

  // Recalculate whenever either formatted address changes (and user hasn't overridden)
  useEffect(() => {
    if (!manualMilesOverride && startingAddressFormatted && gigAddressFormatted) {
      calculateMileage(startingAddressFormatted, gigAddressFormatted);
    }
  }, [startingAddressFormatted, gigAddressFormatted]);

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
        taxPercentage: parseFloat(taxPct || "25"),
        gigAddress: gigAddressFormatted || gigAddressValue || undefined,
        startingAddress: startingAddressFormatted || startingAddress || undefined,
      });
      if (!response.ok) throw new Error("Failed to process payment");
      return response.json();
    },
    onSuccess: () => {
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Something went wrong",
        description: "Please try again.",
        variant: "destructive",
      });
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
    padding: "16px 0",
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
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "3px",
          left: on ? "21px" : "3px",
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          backgroundColor: "#ffffff",
          transition: "left 200ms ease",
          boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
        }}
      />
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
                    <input
                      type="number"
                      inputMode="decimal"
                      value={parkingSpent}
                      onChange={(e) => setParkingSpent(e.target.value)}
                      style={inputStyle}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={labelStyle}>Reimbursed</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ color: "#9B9B9B", fontSize: "16px" }}>$</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={parkingReimbursed}
                      onChange={(e) => setParkingReimbursed(e.target.value)}
                      style={inputStyle}
                      placeholder="0.00"
                    />
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
                  <div
                    key={i}
                    style={{ backgroundColor: "#F9F9F9", borderRadius: "12px", padding: "14px", marginBottom: "10px" }}
                  >
                    <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
                      <div style={{ flex: 2 }}>
                        <div style={labelStyle}>Description</div>
                        <input
                          type="text"
                          value={exp.businessPurpose}
                          onChange={(e) => {
                            const updated = [...otherExpenses];
                            updated[i] = { ...updated[i], businessPurpose: e.target.value };
                            setOtherExpenses(updated);
                          }}
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
                            onChange={(e) => {
                              const updated = [...otherExpenses];
                              updated[i] = { ...updated[i], amount: e.target.value };
                              setOtherExpenses(updated);
                            }}
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
                        onChange={(e) => {
                          const updated = [...otherExpenses];
                          updated[i] = { ...updated[i], category: e.target.value };
                          setOtherExpenses(updated);
                        }}
                        style={{ ...inputStyle, fontSize: "14px", cursor: "pointer" }}
                      >
                        {BUSINESS_EXPENSE_CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    {otherExpenses.length > 1 && (
                      <button
                        onClick={() => setOtherExpenses(otherExpenses.filter((_, idx) => idx !== i))}
                        style={{ background: "none", border: "none", color: "#ef4444", fontSize: "12px", cursor: "pointer", marginTop: "10px", padding: 0 }}
                      >
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
            <div style={subStyle}>Enter your addresses and we'll calculate the mileage</div>

            {/* Starting address */}
            <div style={{ marginBottom: "18px", position: "relative", zIndex: 20 }}>
              <AddressAutocomplete
                label="Starting from"
                placeholder="Your home or starting location"
                value={startingAddress}
                onChange={(display, formatted) => {
                  setStartingAddress(display);
                  setStartingAddressFormatted(formatted || display);
                  setManualMilesOverride(false);
                  setMileageAutoCalculated(false);
                }}
              />
            </div>

            {/* Gig address */}
            <div style={{ marginBottom: "20px", position: "relative", zIndex: 10 }}>
              <AddressAutocomplete
                label="Gig location"
                placeholder="Where was the gig?"
                value={gigAddressValue}
                onChange={(display, formatted) => {
                  setGigAddressValue(display);
                  setGigAddressFormatted(formatted || display);
                  setManualMilesOverride(false);
                  setMileageAutoCalculated(false);
                }}
              />
            </div>

            {/* Calculated miles display */}
            <div style={{ marginBottom: "16px" }}>
              <div style={{ ...labelStyle, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span>Miles driven</span>
                {isCalculatingMileage && (
                  <span style={{ display: "flex", alignItems: "center", gap: "4px", color: CYAN, fontSize: "11px", textTransform: "none", letterSpacing: 0 }}>
                    <Loader2 size={11} className="animate-spin" />
                    Calculating…
                  </span>
                )}
                {mileageAutoCalculated && !isCalculatingMileage && (
                  <span style={{ display: "flex", alignItems: "center", gap: "4px", color: GREEN, fontSize: "11px", textTransform: "none", letterSpacing: 0 }}>
                    <Navigation size={11} />
                    Auto-calculated
                  </span>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
                <input
                  type="number"
                  inputMode="decimal"
                  value={miles}
                  onChange={(e) => {
                    setMiles(e.target.value);
                    setManualMilesOverride(true);
                    setMileageAutoCalculated(false);
                  }}
                  onFocus={(e) => e.target.select()}
                  style={{ ...inputStyle, fontSize: "36px", fontWeight: 700, flex: 1 }}
                />
                <span style={{ fontSize: "18px", color: "#9B9B9B", fontWeight: 500, flexShrink: 0 }}>miles</span>
              </div>
            </div>

            {/* Deduction preview */}
            {parseFloat(miles || "0") > 0 && !isCalculatingMileage && (
              <div style={{ backgroundColor: "#f0fdf4", borderRadius: "10px", padding: "12px 14px", marginBottom: "16px" }}>
                <span style={{ fontSize: "13px", color: GREEN, fontWeight: 500 }}>
                  That's a <strong>${mileageDeduction.toFixed(2)}</strong> deduction at the 2025 IRS rate (70¢/mile)
                </span>
              </div>
            )}

            <button
              onClick={() => { setMiles("0"); setStep(4); }}
              style={{ background: "none", border: "none", color: "#9B9B9B", fontSize: "13px", cursor: "pointer", padding: "4px 0" }}
            >
              Skip — I didn't drive
            </button>
          </div>
        );

      case 4:
        return (
          <div>
            <div style={questionStyle}>What's your tax rate?</div>
            <div style={subStyle}>Used to estimate what you'll owe on this income</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "12px" }}>
              <input
                type="number"
                inputMode="decimal"
                value={taxPct}
                onChange={(e) => setTaxPct(e.target.value)}
                onFocus={(e) => e.target.select()}
                style={{ ...inputStyle, fontSize: "40px", fontWeight: 700, flex: 1 }}
                min="0"
                max="100"
                autoFocus
              />
              <span style={{ fontSize: "28px", fontWeight: 600, color: "#9B9B9B" }}>%</span>
            </div>
            <div style={{ fontSize: "12px", color: "#9B9B9B" }}>
              Most gig workers set this between 25–30%
            </div>
          </div>
        );

      case 5: {
        const received = parseFloat(totalReceived || "0");
        const tax = received * (parseFloat(taxPct || "0") / 100);
        const netParking = totalParkingSpent - totalParkingReimbursed;
        const milesNum = parseFloat(miles || "0");

        const rows: { label: string; value: string; highlight?: boolean }[] = [
          { label: "Gig", value: (gig as any).gigType || gig.eventName || "—" },
          { label: "Client", value: gig.clientName || "—" },
          { label: "Amount received", value: `$${received.toFixed(2)}`, highlight: true },
          { label: "Payment method", value: PAYMENT_METHODS.find((m) => m.value === paymentMethod)?.label ?? paymentMethod },
          ...(milesNum > 0
            ? [
                { label: "Miles driven", value: `${milesNum} mi` },
                { label: "Mileage deduction", value: `$${(milesNum * IRS_RATE).toFixed(2)}` },
              ]
            : []),
          ...(netParking > 0
            ? [{ label: "Net parking cost", value: `$${netParking.toFixed(2)}` }]
            : []),
          ...(totalOtherExpenses > 0
            ? [{ label: "Other expenses", value: `$${totalOtherExpenses.toFixed(2)}` }]
            : []),
          { label: "Tax rate", value: `${taxPct}%` },
          { label: "Est. tax owed", value: `$${tax.toFixed(2)}`, highlight: true },
        ];

        return (
          <div>
            <div style={questionStyle}>Here's your summary</div>
            <div style={subStyle}>Review everything before confirming</div>
            {rows.map(({ label, value, highlight }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "13px 0",
                  borderBottom: "1px solid #F0F0F0",
                }}
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
    if (step < STEPS.length) {
      setStep(step + 1);
    } else {
      mutate();
    }
  };

  const handleBack = () => {
    if (step === 1) {
      onBack();
    } else {
      setStep(step - 1);
    }
  };

  const isLastStep = step === STEPS.length;

  return (
    <>
      {/* Step header: back arrow + progress dots */}
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
          disabled={isPending || (step === 3 && isCalculatingMileage)}
          style={{
            width: "100%",
            height: "52px",
            borderRadius: "999px",
            backgroundColor: isPending || (step === 3 && isCalculatingMileage) ? "#9ca3af" : isLastStep ? GREEN : "#111111",
            color: "#ffffff",
            fontSize: "15px",
            fontWeight: 600,
            border: "none",
            cursor: isPending || (step === 3 && isCalculatingMileage) ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            transition: "background-color 150ms ease",
          }}
        >
          {isPending
            ? "Confirming…"
            : step === 3 && isCalculatingMileage
            ? <><Loader2 size={15} className="animate-spin" />Calculating…</>
            : isLastStep
            ? <><Check size={16} />Confirm Payment</>
            : "Next →"}
        </button>
      </div>
    </>
  );
}
