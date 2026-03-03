import { useState } from "react";
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

type Step = "address" | "tax" | "gig-types" | "notifications" | "done";

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
            backgroundColor: i === current ? CYAN : "#e5e7eb",
            transition: "all 0.3s ease",
          }}
        />
      ))}
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
  const [showDone, setShowDone] = useState(false);

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
  const stepIndex = ["address", "tax", "gig-types"].indexOf(step);

  const handleSaveAndComplete = async () => {
    const taxValue = data.taxRate === "custom" ? parseInt(data.customTax) || 30 : data.taxRate;
    const resolvedGigTypes = data.gigTypes.map((t) =>
      t === "Other" && data.otherJobType.trim() ? data.otherJobType.trim() : t
    );
    await saveMutation.mutateAsync({
      homeAddress: data.homeAddress,
      defaultTaxPercentage: taxValue,
      gigTypes: resolvedGigTypes,
    });
    setShowDone(true);
  };

  const handleDone = () => {
    onComplete();
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

  // "You're all set!" modal
  if (showDone) {
    return (
      <div style={{ ...containerStyle, backgroundColor: "rgba(3,4,94,0.92)", justifyContent: "center" }}>
        <div style={{
          backgroundColor: "#ffffff",
          borderRadius: "24px",
          padding: "36px 28px",
          maxWidth: "340px",
          width: "calc(100% - 48px)",
          textAlign: "center",
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎉</div>
          <h2 style={{ fontSize: "24px", fontWeight: 700, color: NAVY, marginBottom: "12px" }}>You're all set!</h2>
          <p style={{ fontSize: "15px", color: "#6b7280", lineHeight: 1.6, marginBottom: "24px" }}>
            Your profile is ready. Start logging gigs, track what you earn, and know exactly what's yours to keep.
          </p>
          <p style={{ fontSize: "14px", color: "#9ca3af", marginBottom: "28px", fontStyle: "italic" }}>
            Thanks for supporting this app. — Haley
          </p>
          <button
            style={{ ...btnPrimary, marginTop: 0 }}
            onClick={handleDone}
          >
            Let's go
          </button>
        </div>
      </div>
    );
  }

  // STEP: Address
  if (step === "address") {
    return (
      <div style={containerStyle}>
        <div style={innerStyle}>
          <ProgressDots total={3} current={0} />

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

          <p style={{ fontSize: "12px", color: "#9ca3af", textAlign: "center", marginBottom: "24px" }}>
            🔒 We never share or sell your data.
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
          <ProgressDots total={3} current={1} />

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
      <div style={containerStyle}>
        <div style={innerStyle}>
          <ProgressDots total={3} current={2} />

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
                type="text"
                placeholder="What do you do? (e.g. Hair Stylist)"
                value={data.otherJobType}
                autoFocus
                onChange={(e) => setData({ ...data, otherJobType: e.target.value })}
                onFocus={(e) => setTimeout(() => e.target.scrollIntoView({ behavior: "smooth", block: "center" }), 350)}
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
            onClick={handleSaveAndComplete}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : null}
            Let's go
          </button>

          <button
            style={{ background: "none", border: "none", color: "#9ca3af", fontSize: "14px", marginTop: "16px", cursor: "pointer", padding: "8px", textAlign: "center", width: "100%" }}
            onClick={handleSaveAndComplete}
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
