import { useState, useRef } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AddressAutocomplete } from "@/components/address-autocomplete";
import { Loader2, ChevronRight, MapPin, Bell } from "lucide-react";

const CYAN = "#00b4d8";
const NAVY = "#03045e";

const GIG_TYPES = [
  "Brand Ambassador",
  "Delivery Driver",
  "Photographer",
  "Actor / Performer",
  "Dog Walker",
  "Content Creator",
  "Event Staff",
  "Rideshare Driver",
  "Tutor",
  "Other",
];

interface OnboardingFlowProps {
  isOpen: boolean;
  onComplete: () => void;
  onClose: () => void;
}

type Step = "address" | "tax" | "gig-types" | "gig-gap" | "notifications" | "done";

interface SetupData {
  homeAddress: string;
  taxRate: number | "custom";
  customTax: string;
  gigTypes: string[];
  otherJobType: string;
}

function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div style={{ display: "flex", gap: "6px", justifyContent: "center", marginBottom: "32px" }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: i === current ? "20px" : "8px",
            height: "8px",
            borderRadius: "4px",
            backgroundColor: i < current ? `rgba(0, 180, 216, 0.4)` : i === current ? CYAN : "#e5e7eb",
            transition: "all 0.3s ease",
          }}
        />
      ))}
    </div>
  );
}

export function GigGapStep({ onComplete }: { onComplete: () => void }) {
  const MIN = 500;
  const MAX = 10000;
  const DEFAULT = 2500;

  const [income, setIncome] = useState(DEFAULT);
  const [pulsing, setPulsing] = useState(true);

  const miles = Math.round((income / 1000) * 44);
  const mileageDeduction = Math.round(miles * 0.725);
  const businessExpenses = Math.round(income * 0.05);
  const monthlyMissed = mileageDeduction + businessExpenses;
  const annualMissed = monthlyMissed * 12;

  const pct = ((income - MIN) / (MAX - MIN)) * 100;

  const formatCurrency = (val: number) =>
    val >= 1000 ? `$${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}k` : `$${val}`;

  const formatDollar = (val: number) => `$${val.toLocaleString()}`;

  const tickValues = [500, 3000, 5000, 8000, 10000];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "#ffffff",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}
    >
      <style>{`
        @keyframes sliderPulse {
          0%, 100% { box-shadow: 0 0 0 4px rgba(0, 180, 216, 0.3); }
          50% { box-shadow: 0 0 0 12px rgba(0, 180, 216, 0.08); }
        }
        .gig-gap-slider.slider-thumb-pulse::-webkit-slider-thumb {
          animation: sliderPulse 1.5s ease-in-out infinite;
        }
        .gig-gap-slider.slider-thumb-pulse::-moz-range-thumb {
          animation: sliderPulse 1.5s ease-in-out infinite;
        }
        .gig-gap-slider.slider-no-pulse::-webkit-slider-thumb {
          animation: none;
        }
        .gig-gap-slider.slider-no-pulse::-moz-range-thumb {
          animation: none;
        }
        .gig-gap-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 8px;
          border-radius: 4px;
          outline: none;
          cursor: pointer;
          border: none;
          padding: 0;
          background: transparent;
        }
        .gig-gap-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: ${CYAN};
          cursor: pointer;
          border: 3px solid #ffffff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        .gig-gap-slider::-moz-range-thumb {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: ${CYAN};
          cursor: pointer;
          border: 3px solid #ffffff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
      `}</style>

      {/* Scrollable content area */}
      <div
        style={{
          width: "100%",
          maxWidth: "390px",
          flex: 1,
          overflowY: "auto",
          padding: "0 24px",
          paddingTop: "56px",
          paddingBottom: "24px",
          boxSizing: "border-box",
        }}
      >
        <ProgressDots total={6} current={3} />

        <div style={{ marginBottom: "8px" }}>
          <span style={{ fontSize: "13px", fontWeight: 600, color: CYAN, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            YOUR GIG GAP
          </span>
        </div>

        <h1 style={{ fontSize: "26px", fontWeight: 800, color: NAVY, marginBottom: "10px", marginTop: "8px", lineHeight: 1.25 }}>
          Drag to see how much you could be <span style={{ color: CYAN }}>leaving on the table</span>
        </h1>
        <p style={{ fontSize: "15px", color: "#4b5563", marginBottom: "24px", lineHeight: 1.55 }}>
          Most independent contractors have no idea how much of <span style={{ color: CYAN, fontWeight: 600 }}>their own money</span> they're leaving behind.
        </p>

        {/* Income slider card */}
        <div
          style={{
            backgroundColor: "#f8fafc",
            border: "1px solid #e5e7eb",
            borderRadius: "16px",
            padding: "18px 18px 14px",
            marginBottom: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              YOUR MONTHLY INCOME
            </div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: NAVY }}>
              {formatDollar(income)}
            </div>
          </div>

          {/* Slider track wrapper */}
          <div style={{ position: "relative", marginBottom: "8px" }}>
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: 0,
                transform: "translateY(-50%)",
                width: "100%",
                height: "8px",
                borderRadius: "4px",
                backgroundColor: "#d1d5db",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: 0,
                transform: "translateY(-50%)",
                width: `${pct}%`,
                height: "8px",
                borderRadius: "4px",
                backgroundColor: CYAN,
                pointerEvents: "none",
                transition: "width 0.05s ease",
              }}
            />
            <input
              type="range"
              min={MIN}
              max={MAX}
              step={100}
              value={income}
              className={`gig-gap-slider ${pulsing ? "slider-thumb-pulse" : "slider-no-pulse"}`}
              onChange={(e) => {
                setIncome(Number(e.target.value));
                setPulsing(false);
              }}
              style={{
                position: "relative",
                zIndex: 1,
                background: "transparent",
              }}
            />
          </div>

          {/* Tick labels */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
            {tickValues.map((v) => (
              <span key={v} style={{ fontSize: "11px", color: "#9ca3af", fontWeight: 500 }}>
                {formatCurrency(v)}
              </span>
            ))}
          </div>
        </div>

        {/* Coral summary cards */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
          <div
            style={{
              flex: 1,
              backgroundColor: "#FFF5F3",
              border: "1px solid #FFE0DA",
              borderRadius: "14px",
              padding: "14px 12px",
              textAlign: "left",
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#D84C2A", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
              MONTHLY
            </div>
            <div style={{ fontSize: "32px", fontWeight: 800, color: "#D84C2A", lineHeight: 1.1, marginBottom: "2px" }}>
              {formatDollar(monthlyMissed)}
            </div>
            <div style={{ fontSize: "13px", fontWeight: 500, color: "#D84C2A", opacity: 0.8 }}>
              typically missed
            </div>
          </div>
          <div
            style={{
              flex: 1,
              backgroundColor: "#FFF5F3",
              border: "1px solid #FFE0DA",
              borderRadius: "14px",
              padding: "14px 12px",
              textAlign: "left",
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#D84C2A", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
              ANNUALLY
            </div>
            <div style={{ fontSize: "32px", fontWeight: 800, color: "#D84C2A", lineHeight: 1.1, marginBottom: "2px" }}>
              {formatDollar(annualMissed)}
            </div>
            <div style={{ fontSize: "13px", fontWeight: 500, color: "#D84C2A", opacity: 0.8 }}>
              typically missed
            </div>
          </div>
        </div>

        {/* Breakdown card */}
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "14px",
            overflow: "hidden",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 18px",
              borderBottom: "1px solid #f3f4f6",
            }}
          >
            <div>
              <div style={{ fontSize: "17px", fontWeight: 700, color: "#111827" }}>Mileage</div>
              <div style={{ fontSize: "13px", color: "#9ca3af", marginTop: "3px" }}>
                ~{miles.toLocaleString()} mi/mo · $0.725/mi
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "17px", fontWeight: 700, color: NAVY }}>
                {formatDollar(mileageDeduction)}/mo
              </div>
              <div style={{ fontSize: "13px", color: "#9ca3af", marginTop: "2px" }}>
                {formatDollar(mileageDeduction * 12)}/yr
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 18px",
            }}
          >
            <div>
              <div style={{ fontSize: "17px", fontWeight: 700, color: "#111827" }}>Business expenses</div>
              <div style={{ fontSize: "13px", color: CYAN, marginTop: "3px" }}>
                Parking, supplies, equipment
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "17px", fontWeight: 700, color: NAVY }}>
                {formatDollar(businessExpenses)}/mo
              </div>
              <div style={{ fontSize: "13px", color: "#9ca3af", marginTop: "2px" }}>
                {formatDollar(businessExpenses * 12)}/yr
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <p style={{ fontSize: "11px", color: "#b0b0b0", textAlign: "center", lineHeight: 1.55, marginBottom: "16px", padding: "0 4px" }}>
          Mileage estimated at 44 miles per $1,000 earned × $0.725/mile (2026 IRS standard rate). Business expenses estimated at 5% of income, based on IRS Schedule C averages for 1099 workers. These are estimates only. Bookd does not guarantee any specific tax savings or deduction outcomes. Individual results will vary.
        </p>
      </div>

      {/* Pinned CTA — outside scroll area */}
      <div
        style={{
          width: "100%",
          maxWidth: "390px",
          padding: "12px 24px",
          paddingBottom: "calc(24px + env(safe-area-inset-bottom, 0px))",
          backgroundColor: "#ffffff",
          boxSizing: "border-box",
          flexShrink: 0,
        }}
      >
        <button
          onClick={onComplete}
          style={{
            width: "100%",
            padding: "16px 24px",
            backgroundColor: NAVY,
            color: "#ffffff",
            border: "none",
            borderRadius: "100px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: "17px", fontWeight: 600 }}>Save more money with Bookd →</span>
        </button>
      </div>
    </div>
  );
}

export function OnboardingFlow({ isOpen, onComplete, onClose }: OnboardingFlowProps) {
  const [step, setStep] = useState<Step>("address");
  const [data, setData] = useState<SetupData>({
    homeAddress: "",
    taxRate: 30,
    customTax: "",
    gigTypes: [],
    otherJobType: "",
  });

  const [otherFocused, setOtherFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const otherInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: userData } = useQuery<any>({ queryKey: ["/api/user"] });

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiRequest("POST", "/api/user/setup", payload);
      if (!res.ok) throw new Error("Failed to save setup");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    },
  });

  if (!isOpen) return null;

  const userName = userData?.name?.split(" ")[0] || "there";

  const handleSaveAndNavigateToGigGap = async () => {
    const taxValue = data.taxRate === "custom" ? parseInt(data.customTax) || 30 : data.taxRate;
    const resolvedGigTypes = data.gigTypes.map((t) =>
      t === "Other" && data.otherJobType.trim() ? data.otherJobType.trim() : t
    );
    await saveMutation.mutateAsync({
      homeAddress: data.homeAddress,
      defaultTaxPercentage: taxValue,
      gigTypes: resolvedGigTypes,
    });
    setStep("gig-gap");
  };

  const containerStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    backgroundColor: "#ffffff",
    zIndex: 9999,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    overflowY: "auto",
    paddingTop: "env(safe-area-inset-top, 0px)",
  };

  const innerStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: "390px",
    padding: "0 24px",
    paddingTop: "56px",
    paddingBottom: "48px",
    flex: 1,
    display: "flex",
    flexDirection: "column",
  };

  const btnPrimary: React.CSSProperties = {
    width: "100%",
    height: "52px",
    backgroundColor: CYAN,
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: 600,
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    marginTop: "auto",
  };

  const btnDisabled: React.CSSProperties = {
    ...btnPrimary,
    backgroundColor: "#e5e7eb",
    color: "#9ca3af",
    cursor: "default",
  };

  // STEP: Gig Gap
  if (step === "gig-gap") {
    return <GigGapStep onComplete={onComplete} />;
  }

  // STEP: Address
  if (step === "address") {
    return (
      <div style={containerStyle}>
        <div style={innerStyle}>
          <ProgressDots total={6} current={0} />

          <div style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#e0f7fa", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <MapPin size={18} color={CYAN} />
            </div>
            <span style={{ fontSize: "13px", fontWeight: 600, color: CYAN, textTransform: "uppercase", letterSpacing: "0.05em" }}>Step 1 of 3</span>
          </div>

          <h1 style={{ fontSize: "26px", fontWeight: 700, color: NAVY, marginBottom: "10px", marginTop: "12px" }}>
            Where are you based?
          </h1>
          <p style={{ fontSize: "15px", color: "#6b7280", marginBottom: "28px", lineHeight: 1.5 }}>
            We use your home address to calculate mileage deductions for your gigs — one of the biggest tax breaks for freelancers.
          </p>

          <div style={{ marginBottom: "12px" }}>
            <AddressAutocomplete
              label="Home address"
              placeholder="123 Main St, City, State"
              value={data.homeAddress}
              onChange={(display, resolved) => setData({ ...data, homeAddress: resolved || display })}
              className="text-base"
            />
          </div>

          <p style={{ fontSize: "12px", color: "#9ca3af", textAlign: "center", marginBottom: "20px" }}>
            🔒 We never share or sell your data.
          </p>

          <p style={{ fontSize: "13px", color: "#10b981", lineHeight: 1.55, marginBottom: "8px" }}>
            <strong>TIP:</strong> For 2026, the IRS standard mileage rate for business use of a vehicle is <strong>72.5 cents per mile</strong>. Independent contractors (1099 workers) can use this rate to deduct business-related driving expenses.
          </p>

          <div style={{ flex: 1 }} />

          <button
            style={data.homeAddress.trim() ? btnPrimary : btnDisabled}
            onClick={() => data.homeAddress.trim() && setStep("tax")}
          >
            Continue <ChevronRight size={18} />
          </button>

          <button
            style={{ background: "none", border: "none", color: "#9ca3af", fontSize: "14px", marginTop: "16px", cursor: "pointer", padding: "8px", textAlign: "center", width: "100%" }}
            onClick={() => setStep("tax")}
          >
            Skip for now
          </button>
        </div>
      </div>
    );
  }

  // STEP: Tax Rate
  if (step === "tax") {
    const options: { label: string; sub: string; value: number | "custom" }[] = [
      { label: "30%", sub: "Safe bet — keeps you covered", value: 30 },
      { label: "28%", sub: "Sweet spot for most freelancers", value: 28 },
      { label: "Other", sub: "I know my rate", value: "custom" },
    ];

    return (
      <div style={containerStyle}>
        <div style={innerStyle}>
          <ProgressDots total={6} current={1} />

          <div style={{ marginBottom: "8px" }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: CYAN, textTransform: "uppercase", letterSpacing: "0.05em" }}>Step 2 of 3</span>
          </div>

          <h1 style={{ fontSize: "26px", fontWeight: 700, color: NAVY, marginBottom: "10px", marginTop: "12px" }}>
            What's your tax rate?
          </h1>
          <p style={{ fontSize: "15px", color: "#6b7280", marginBottom: "28px", lineHeight: 1.5 }}>
            This helps estimate how much to set aside from each gig. You can update this anytime in your profile.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
            {options.map((opt) => {
              const isSelected = data.taxRate === opt.value;
              return (
                <button
                  key={String(opt.value)}
                  onClick={() => setData({ ...data, taxRate: opt.value })}
                  style={{
                    padding: "16px 20px",
                    borderRadius: "14px",
                    border: isSelected ? `2px solid ${CYAN}` : "1.5px solid #e5e7eb",
                    backgroundColor: isSelected ? "#e0f7fa" : "#ffffff",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    textAlign: "left",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "18px", fontWeight: 700, color: NAVY }}>{opt.label}</div>
                    <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "2px" }}>{opt.sub}</div>
                  </div>
                  {isSelected && (
                    <div style={{ width: "22px", height: "22px", borderRadius: "50%", backgroundColor: CYAN, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {data.taxRate === "custom" && (
            <div style={{ marginBottom: "200px" }}>
              <label style={{ fontSize: "14px", fontWeight: 500, color: "#374151", display: "block", marginBottom: "6px" }}>Enter your tax rate</label>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="60"
                  placeholder="e.g. 25"
                  autoFocus
                  value={data.customTax}
                  onChange={(e) => setData({ ...data, customTax: e.target.value })}
                  onFocus={(e) => setTimeout(() => e.target.scrollIntoView({ behavior: "smooth", block: "center" }), 350)}
                  style={{
                    width: "100px",
                    height: "48px",
                    fontSize: "16px",
                    padding: "0 14px",
                    border: "1.5px solid #d1d5db",
                    borderRadius: "10px",
                    backgroundColor: "#ffffff",
                    color: "#111827",
                    outline: "none",
                    WebkitAppearance: "none",
                  }}
                />
                <span style={{ fontSize: "20px", fontWeight: 600, color: NAVY }}>%</span>
              </div>
            </div>
          )}

          <div style={{ flex: 1 }} />

          <button
            style={btnPrimary}
            onClick={() => setStep("gig-types")}
          >
            Continue <ChevronRight size={18} />
          </button>

          <button
            style={{ background: "none", border: "none", color: "#9ca3af", fontSize: "14px", marginTop: "16px", cursor: "pointer", padding: "8px", textAlign: "center", width: "100%" }}
            onClick={() => setStep("gig-types")}
          >
            Skip for now
          </button>
        </div>
      </div>
    );
  }

  // STEP: Gig Types
  if (step === "gig-types") {
    const toggle = (type: string) => {
      setData((prev) => ({
        ...prev,
        gigTypes: prev.gigTypes.includes(type)
          ? prev.gigTypes.filter((t) => t !== type)
          : [...prev.gigTypes, type],
      }));
    };

    return (
      <div ref={containerRef} style={containerStyle}>
        <div style={{ ...innerStyle, paddingBottom: otherFocused ? "360px" : "48px" }}>
          <ProgressDots total={6} current={2} />

          <div style={{ marginBottom: "8px" }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: CYAN, textTransform: "uppercase", letterSpacing: "0.05em" }}>Step 3 of 3</span>
          </div>

          <h1 style={{ fontSize: "26px", fontWeight: 700, color: NAVY, marginBottom: "10px", marginTop: "12px" }}>
            What kind of work do you do?
          </h1>
          <p style={{ fontSize: "15px", color: "#6b7280", marginBottom: "28px", lineHeight: 1.5 }}>
            Select all that apply. This helps us tailor your experience.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "16px" }}>
            {GIG_TYPES.map((type) => {
              const selected = data.gigTypes.includes(type);
              return (
                <button
                  key={type}
                  onClick={() => toggle(type)}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "100px",
                    border: selected ? `2px solid ${CYAN}` : "1.5px solid #e5e7eb",
                    backgroundColor: selected ? CYAN : "#ffffff",
                    color: selected ? "#ffffff" : "#374151",
                    fontSize: "14px",
                    fontWeight: selected ? 600 : 400,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {type}
                </button>
              );
            })}
          </div>

          {data.gigTypes.includes("Other") && (
            <div style={{ marginBottom: "20px" }}>
              <input
                ref={otherInputRef}
                type="text"
                placeholder="What do you do? (e.g. Hair Stylist)"
                value={data.otherJobType}
                autoFocus
                onChange={(e) => setData({ ...data, otherJobType: e.target.value })}
                onFocus={() => {
                  setOtherFocused(true);
                  setTimeout(() => {
                    if (containerRef.current && otherInputRef.current) {
                      const container = containerRef.current;
                      const input = otherInputRef.current;
                      const inputBottom = input.getBoundingClientRect().bottom;
                      const containerBottom = container.getBoundingClientRect().bottom;
                      if (inputBottom > containerBottom - 20) {
                        container.scrollTop += inputBottom - containerBottom + 40;
                      }
                      input.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
                  }, 450);
                }}
                onBlur={() => setOtherFocused(false)}
                style={{
                  width: "100%",
                  height: "48px",
                  fontSize: "16px",
                  padding: "0 14px",
                  border: `1.5px solid ${CYAN}`,
                  borderRadius: "12px",
                  backgroundColor: "#ffffff",
                  color: "#111827",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          )}

          <div style={{ flex: 1 }} />

          <button
            style={saveMutation.isPending ? btnDisabled : btnPrimary}
            onClick={handleSaveAndNavigateToGigGap}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : null}
            Let's go
          </button>

          <button
            style={{ background: "none", border: "none", color: "#9ca3af", fontSize: "14px", marginTop: "16px", cursor: "pointer", padding: "8px", textAlign: "center", width: "100%" }}
            onClick={handleSaveAndNavigateToGigGap}
            disabled={saveMutation.isPending}
          >
            Skip for now
          </button>
        </div>
      </div>
    );
  }

  return null;
}
