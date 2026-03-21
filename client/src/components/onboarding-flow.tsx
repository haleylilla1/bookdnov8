import { useState, useRef } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AddressAutocomplete } from "@/components/address-autocomplete";
import { Loader2, ChevronRight, MapPin } from "lucide-react";

const CYAN = "#00b4d8";
const NAVY = "#03045e";
const CORAL = "#D84C2A";
const CORAL_BG = "#FFF5F3";
const CORAL_BORDER = "#FFE0DA";

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

const REMINDER_OPTIONS = [
  { id: "2w", label: "2 weeks after last day of work", sub: "Good for shorter gigs and quick turnarounds" },
  { id: "3w", label: "3 weeks after last day of work", sub: "Most popular. Gives clients time to process." },
  { id: "4w", label: "4 weeks after last day of work", sub: "Best for larger or longer-term contracts" },
];

const PAYWALL_CHECK_ITEMS = [
  "Every mile logged. Money back at tax time.",
  "Log a gig in 90 seconds. Nothing left behind.",
  "Know your tax bill all year, not just in April.",
  "One tap 1099 report.",
];

const IRS_RATE = 0.725;
const MILES_MIN = 0, MILES_MAX = 500, MILES_DEFAULT = 100, MILES_STEP = 10;
const EXP_MIN = 0, EXP_MAX = 500, EXP_DEFAULT = 150, EXP_STEP = 10;

interface OnboardingFlowProps {
  isOpen: boolean;
  onComplete: () => void;
  onClose: () => void;
}

type Step = "address" | "tax" | "gig-types" | "gig-gap" | "warm-up" | "what-you-get" | "paywall";

interface SetupData {
  homeAddress: string;
  taxRate: number | "custom";
  customTax: string;
  gigTypes: string[];
  otherJobType: string;
}

function fmtCents(val: number) {
  const rounded = Math.round(val * 100) / 100;
  const whole = Math.floor(rounded);
  const cents = Math.round((rounded - whole) * 100);
  if (cents === 0) return `$${whole.toLocaleString()}`;
  return `$${whole.toLocaleString()}.${String(cents).padStart(2, "0")}`;
}

function fmt(val: number) {
  return `$${Math.round(val).toLocaleString()}`;
}

function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div style={{ display: "flex", gap: "6px", justifyContent: "center", marginBottom: "24px" }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: i === current ? "24px" : "8px",
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

/* ────────────────────────────────────────
   GigGap Variant B — shared UI
──────────────────────────────────────── */
function GigGapBUI({ onContinue, ctaLabel, showDots, dotsIndex }: {
  onContinue: () => void;
  ctaLabel: string;
  showDots?: boolean;
  dotsIndex?: number;
}) {
  const [miles, setMiles] = useState(MILES_DEFAULT);
  const [expenses, setExpenses] = useState(EXP_DEFAULT);
  const [milesPulsing, setMilesPulsing] = useState(true);
  const [expPulsing, setExpPulsing] = useState(false);

  const mileageDeduction = miles * IRS_RATE;
  const totalMonthly = mileageDeduction + expenses;
  const totalAnnual = totalMonthly * 12;
  const milesPct = ((miles - MILES_MIN) / (MILES_MAX - MILES_MIN)) * 100;
  const expPct = ((expenses - EXP_MIN) / (EXP_MAX - EXP_MIN)) * 100;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "#ffffff",
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      paddingTop: "env(safe-area-inset-top, 0px)",
      fontFamily: "'Montserrat', sans-serif",
    }}>
      <style>{`
        @keyframes pulse-b {
          0%,100% { box-shadow: 0 0 0 4px rgba(0,180,216,0.3); }
          50%      { box-shadow: 0 0 0 12px rgba(0,180,216,0.08); }
        }
        .slider-b { -webkit-appearance:none; appearance:none; width:100%; height:6px; border-radius:3px; outline:none; cursor:pointer; border:none; padding:0; background:transparent; }
        .slider-b::-webkit-slider-thumb { -webkit-appearance:none; width:26px; height:26px; border-radius:50%; background:${CYAN}; cursor:pointer; border:3px solid rgba(255,255,255,0.25); box-shadow:0 2px 8px rgba(0,0,0,.3); }
        .slider-b::-moz-range-thumb { width:26px; height:26px; border-radius:50%; background:${CYAN}; cursor:pointer; border:3px solid rgba(255,255,255,0.25); box-shadow:0 2px 8px rgba(0,0,0,.3); }
        .slider-b.pulse::-webkit-slider-thumb { animation: pulse-b 1.5s ease-in-out infinite; }
        .slider-b.pulse::-moz-range-thumb { animation: pulse-b 1.5s ease-in-out infinite; }
      `}</style>

      <div style={{ flex: 1, overflowY: "auto", padding: "36px 22px 16px", boxSizing: "border-box", maxWidth: "390px", width: "100%", margin: "0 auto" }}>
        {showDots && <ProgressDots total={6} current={dotsIndex ?? 3} />}

        <p style={{ fontSize: 10, fontWeight: 700, color: CYAN, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 6px" }}>
          Your Deductions
        </p>

        <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: 18, color: NAVY, lineHeight: 1.3, margin: "0 0 12px" }}>
          See what you{" "}
          <span style={{ color: CYAN }}>could be keeping</span>
          {" "}by tracking everything.
        </h1>

        {/* Navy hero card */}
        <div style={{ background: NAVY, borderRadius: 20, padding: "16px 18px 14px", marginBottom: 10 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px" }}>potential annual deductions</p>
          <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: 40, color: "#fff", lineHeight: 1, margin: "0 0 8px" }}>
            {fmt(totalAnnual)}
          </div>
          <p style={{ fontSize: 12, color: CYAN, margin: "0 0 16px" }}>
            {fmtCents(totalMonthly)} per month
          </p>

          {/* Miles slider */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.07em" }}>monthly business miles</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: "#fff", fontFamily: "'Poppins', sans-serif" }}>{miles} mi</span>
            </div>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", top: "50%", left: 0, transform: "translateY(-50%)", width: "100%", height: 6, borderRadius: 3, background: "rgba(255,255,255,0.15)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", top: "50%", left: 0, transform: "translateY(-50%)", width: `${milesPct}%`, height: 6, borderRadius: 3, background: CYAN, pointerEvents: "none", transition: "width 0.05s ease" }} />
              <input
                type="range" min={MILES_MIN} max={MILES_MAX} step={MILES_STEP} value={miles}
                className={`slider-b${milesPulsing ? " pulse" : ""}`}
                onChange={(e) => { setMiles(Number(e.target.value)); setMilesPulsing(false); }}
                style={{ position: "relative", zIndex: 1, background: "transparent" }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>0 mi</span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>500 mi</span>
            </div>
          </div>

          {/* Expenses slider */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.07em" }}>monthly business expenses</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: "#fff", fontFamily: "'Poppins', sans-serif" }}>${expenses}</span>
            </div>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", top: "50%", left: 0, transform: "translateY(-50%)", width: "100%", height: 6, borderRadius: 3, background: "rgba(255,255,255,0.15)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", top: "50%", left: 0, transform: "translateY(-50%)", width: `${expPct}%`, height: 6, borderRadius: 3, background: CYAN, pointerEvents: "none", transition: "width 0.05s ease" }} />
              <input
                type="range" min={EXP_MIN} max={EXP_MAX} step={EXP_STEP} value={expenses}
                className={`slider-b${expPulsing ? " pulse" : ""}`}
                onChange={(e) => { setExpenses(Number(e.target.value)); setExpPulsing(false); }}
                style={{ position: "relative", zIndex: 1, background: "transparent" }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>$0</span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>$500</span>
            </div>
          </div>
        </div>

        {/* Breakdown */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", marginBottom: 8 }}>
          {[
            { title: "Mileage", sub: `${miles} mi × $${IRS_RATE}/mi (IRS 2026 rate)`, mo: mileageDeduction, subColor: "#9ca3af" },
            { title: "Business expenses", sub: "Phone, equipment, parking, supplies", mo: expenses, subColor: CYAN },
          ].map(({ title, sub, mo, subColor }, i) => (
            <div key={title} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderBottom: i === 0 ? "1px solid #f3f4f6" : "none" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", fontFamily: "'Poppins', sans-serif" }}>{title}</div>
                <div style={{ fontSize: 10, color: subColor, marginTop: 1 }}>{sub}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, fontFamily: "'Poppins', sans-serif" }}>{fmtCents(mo)}/mo</div>
                <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 1 }}>{fmt(mo * 12)}/yr</div>
              </div>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 9, color: "#b0b0b0", textAlign: "center", lineHeight: 1.55, margin: "0 0 6px", padding: "0 4px" }}>
          Mileage deduction uses the 2026 IRS standard rate of $0.725/mile. These are deduction values, not tax savings. Actual savings depend on your rate and filing status.
        </p>
      </div>

      {/* Pinned CTA */}
      <div style={{
        width: "100%", maxWidth: "390px", margin: "0 auto",
        padding: "10px 24px",
        paddingBottom: "calc(24px + env(safe-area-inset-bottom, 0px))",
        background: "#fff", boxSizing: "border-box", flexShrink: 0,
      }}>
        <button
          onClick={onContinue}
          style={{ width: "100%", background: NAVY, border: "none", borderRadius: 100, padding: "15px 20px", cursor: "pointer", textAlign: "center" }}
        >
          <span style={{ fontSize: 16, fontWeight: 700, color: "#fff", fontFamily: "'Poppins', sans-serif" }}>{ctaLabel}</span>
        </button>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────
   WarmUp step
──────────────────────────────────────── */
function WarmUpStep({ onNext }: { onNext: (reminderWeeks: string) => void }) {
  const [selected, setSelected] = useState("3w");

  return (
    <div style={{
      position: "fixed", inset: 0, backgroundColor: "#ffffff", zIndex: 9999,
      display: "flex", flexDirection: "column",
      paddingTop: "env(safe-area-inset-top, 0px)",
      fontFamily: "'Montserrat', sans-serif",
    }}>
      {/* Progress dots */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, paddingTop: 20, paddingBottom: 4, flexShrink: 0 }}>
        <ProgressDots total={6} current={4} />
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 22px 8px", maxWidth: "390px", width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: CYAN, margin: "0 0 10px" }}>
          Don't Let Them Forget You
        </p>

        <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: 24, color: NAVY, lineHeight: 1.25, margin: "0 0 12px" }}>
          Getting paid is{" "}
          <span style={{ color: CYAN }}>harder</span>
          {" "}than doing the work
        </h1>

        <p style={{ fontSize: 13, color: "#555", lineHeight: 1.55, margin: "0 0 18px" }}>
          The data is clear. Late and missing payments are the norm for independent workers.
        </p>

        {/* Stat cards — top row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
          {[
            { stat: "47%", desc: "of freelancers had a late or missing payment in their first 6 months" },
            { stat: "1 in 5", desc: "contractors has at least one unpaid invoice at any given time" },
          ].map(({ stat, desc }) => (
            <div key={stat} style={{ backgroundColor: "#fff", border: `1.5px solid ${CYAN}`, borderRadius: 16, padding: "16px 14px", boxShadow: "0 2px 10px rgba(0,180,216,0.1)" }}>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: 32, color: NAVY, lineHeight: 1, marginBottom: 8 }}>{stat}</div>
              <div style={{ fontSize: 11, color: "#4B5563", lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </div>

        {/* Full-width stat card */}
        <div style={{ backgroundColor: "#fff", border: `1.5px solid ${CYAN}`, borderRadius: 16, padding: "16px 18px", display: "flex", alignItems: "center", gap: 16, marginBottom: 10, boxShadow: "0 2px 10px rgba(0,180,216,0.1)" }}>
          <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: 26, color: NAVY, flexShrink: 0, whiteSpace: "nowrap" }}>37–42 days</div>
          <div style={{ fontSize: 12, color: "#4B5563", lineHeight: 1.5 }}>average payment delay after invoice submission</div>
        </div>

        <p style={{ fontSize: 9, color: "#bbb", textAlign: "center", lineHeight: 1.5, margin: "10px 0 18px" }}>
          Sources: Genius 2025 Freelance Report · Payoneer 2025 Global Freelancer Income Report · Freelancers Union
        </p>

        <p style={{ fontSize: 13, fontWeight: 700, color: NAVY, margin: "0 0 12px" }}>
          If a gig goes unpaid, when should we remind you?
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
          {REMINDER_OPTIONS.map((opt) => {
            const isSelected = selected === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setSelected(opt.id)}
                style={{
                  background: isSelected ? "#EAF9FF" : "#fff",
                  border: `1.5px solid ${isSelected ? CYAN : "#E8EBF0"}`,
                  borderRadius: 14, padding: "14px 16px",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  cursor: "pointer", textAlign: "left", width: "100%", boxSizing: "border-box",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 3 }}>{opt.label}</div>
                  <div style={{ fontSize: 11, color: "#8A93A8" }}>{opt.sub}</div>
                </div>
                <div style={{
                  width: 26, height: 26, borderRadius: "50%",
                  border: `2px solid ${isSelected ? CYAN : "#D1D5DB"}`,
                  backgroundColor: isSelected ? CYAN : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, marginLeft: 12,
                }}>
                  {isSelected && (
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <path d="M2.5 6.5l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pinned CTA */}
      <div style={{ padding: "10px 22px", paddingBottom: "calc(16px + env(safe-area-inset-bottom, 0px))", flexShrink: 0, background: "#fff", maxWidth: "390px", width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
        <button
          onClick={() => onNext(selected)}
          style={{ width: "100%", background: NAVY, borderRadius: 100, border: "none", padding: "13px 24px", cursor: "pointer", display: "block", boxSizing: "border-box" }}
        >
          <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>Set my reminder →</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", marginTop: 3 }}>We only notify you when it matters. No spam, ever.</div>
        </button>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────
   What You Get step
──────────────────────────────────────── */
const FEATURES: { icon: React.ReactNode; title: string; body: string }[] = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M3 17h2l1-3h12l1 3h2M5 17v2a1 1 0 001 1h1a1 1 0 001-1v-1h8v1a1 1 0 001 1h1a1 1 0 001-1v-2" stroke={NAVY} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 14l1.5-6h9L18 14" stroke={NAVY} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="8.5" cy="17" r="0.5" fill={NAVY} />
        <circle cx="15.5" cy="17" r="0.5" fill={NAVY} />
      </svg>
    ),
    title: "Mileage deduction tracker",
    body: "Log every drive at the IRS rate. Your tax savings add up automatically.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="5" width="18" height="14" rx="2" stroke={NAVY} strokeWidth="1.8" />
        <path d="M8 12h8M12 9v6" stroke={NAVY} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    title: "Gig income logging",
    body: "Add a gig in 20 seconds. See what's paid, pending, or owed at a glance.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M4 5h16M7 10h10M10.5 15h3" stroke={NAVY} strokeWidth="2" strokeLinecap="round" />
        <path d="M12 15v5" stroke={CYAN} strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    title: "Only your real income gets taxed",
    body: "Enter what hit your bank. Bookd auto-separates parking and expense reimbursements so they never inflate your tax bill.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M7 3h10a1 1 0 011 1v16a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z" stroke={NAVY} strokeWidth="1.8" />
        <path d="M9 8h6M9 12h6M9 16h4" stroke={NAVY} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    title: "Expense tracking",
    body: "Capture every business cost in seconds. Organized by category for tax time.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="3" width="16" height="18" rx="2" stroke={NAVY} strokeWidth="1.8" />
        <path d="M8 7h8M8 11h8M8 15h5" stroke={NAVY} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M15 14.5l2 2 3-3" stroke={CYAN} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Real-time tax estimator",
    body: "With your inputted tax rate, know exactly what to set aside per gig, per month, per quarter, and per year.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M12 3v12m0 0l-4-4m4 4l4-4" stroke={NAVY} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke={NAVY} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    title: "One tap 1099 report",
    body: "Download a clean income report. Share it or file it yourself.",
  },
];

function WhatYouGetStep({ onNext }: { onNext: () => void }) {
  return (
    <div style={{
      position: "fixed", inset: 0, backgroundColor: "#ffffff", zIndex: 9999,
      display: "flex", flexDirection: "column",
      paddingTop: "env(safe-area-inset-top, 0px)",
      fontFamily: "'Montserrat', sans-serif",
    }}>
      {/* Scrollable content — flex column so the spacer between header and features fills dead space */}
      <div style={{ flex: 1, overflowY: "auto", padding: "32px 24px 16px", maxWidth: "390px", width: "100%", margin: "0 auto", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>

        {/* Header block */}
        <div style={{ flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <ProgressDots total={6} current={5} />
          </div>

          <p style={{ fontSize: 10, fontWeight: 700, color: CYAN, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px" }}>
            What's included
          </p>

          <h1 style={{ fontSize: 24, fontWeight: 800, color: NAVY, margin: "0 0 4px", lineHeight: 1.2, fontFamily: "'Poppins', sans-serif" }}>
            Everything You'll Get
          </h1>
          <p style={{ fontSize: 13, color: "#6b7280", margin: 0, lineHeight: 1.5 }}>
            All the tools you need to keep more of what you earn.
          </p>
        </div>

        {/* Flexible spacer: expands to fill available height, capped so it doesn't get absurdly tall */}
        <div style={{ flex: 1, minHeight: 28, maxHeight: 56 }} />

        {/* Features list — sits naturally above the CTA */}
        <div style={{ flexShrink: 0 }}>
          {FEATURES.map((f, i) => (
            <div key={i}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14, paddingBottom: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "#E0F7FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                  {f.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, fontFamily: "'Poppins', sans-serif", marginBottom: 2, lineHeight: 1.3 }}>{f.title}</div>
                  <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5 }}>{f.body}</div>
                </div>
              </div>
              {i < FEATURES.length - 1 && (
                <div style={{ height: 1, background: "#f0f0f4", marginBottom: 14 }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pinned CTA */}
      <div style={{ padding: "10px 24px", paddingBottom: "calc(14px + env(safe-area-inset-bottom, 0px))", background: "#fff", boxSizing: "border-box", flexShrink: 0, maxWidth: "390px", width: "100%", margin: "0 auto" }}>
        <button
          onClick={onNext}
          style={{ width: "100%", background: NAVY, border: "none", borderRadius: 100, padding: "15px 20px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <span style={{ fontSize: 16, fontWeight: 700, color: "#fff", fontFamily: "'Poppins', sans-serif" }}>
            Continue →
          </span>
        </button>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────
   Paywall step
──────────────────────────────────────── */
function PaywallStep({ onComplete }: { onComplete: () => void }) {
  const [plan, setPlan] = useState<"annual" | "monthly">("annual");

  const price = plan === "annual" ? "$39/year" : "$4/month";
  const billingNote = plan === "annual" ? "Just $3.25/mo billed annually" : "Billed every month";
  const chargeLabel = plan === "annual" ? "$39 charged after trial" : "$4 charged after trial";

  const checkItems = [
    plan === "annual"
      ? "Bookd is 100% deductible. Write off $39/yr at tax time."
      : "Bookd is 100% deductible. Write off $4/mo at tax time.",
    ...PAYWALL_CHECK_ITEMS,
  ];

  return (
    <div style={{
      position: "fixed", inset: 0, backgroundColor: "#ffffff", zIndex: 9999,
      display: "flex", flexDirection: "column",
      paddingTop: "env(safe-area-inset-top, 0px)",
      fontFamily: "'Montserrat', sans-serif",
    }}>
      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "48px 24px 20px", boxSizing: "border-box", maxWidth: "390px", width: "100%", margin: "0 auto" }}>

        <p style={{ fontSize: 11, fontWeight: 700, color: CYAN, textTransform: "uppercase", letterSpacing: "0.09em", margin: "0 0 8px" }}>7 Days Free</p>

        <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: 26, color: NAVY, lineHeight: 1.2, margin: "0 0 6px" }}>
          Start keeping more of{" "}
          <span style={{ color: CYAN }}>what you earned.</span>
        </h1>

        <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.5, margin: "0 0 22px" }}>
          No charge today. Cancel anytime before your trial ends.
        </p>

        {/* Trial timeline */}
        <div style={{ background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 16, padding: "18px 18px 14px", marginBottom: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 16px" }}>What happens next</p>
          {[
            { day: "Today", dot: CYAN,      title: "Free trial begins",   sub: "Full access, nothing charged.",            last: false },
            { day: "Day 6", dot: "#9ca3af", title: "Reminder email",      sub: "We'll remind you before your trial ends.", last: false },
            { day: "Day 8", dot: NAVY,      title: "Subscription starts", sub: chargeLabel,                                last: true  },
          ].map(({ day, dot, title, sub, last }) => (
            <div key={day} style={{ display: "flex", gap: 14 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 20, flexShrink: 0 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: dot, flexShrink: 0, marginTop: 2, boxShadow: dot === CYAN ? "0 0 0 3px rgba(0,180,216,0.2)" : "none" }} />
                {!last && <div style={{ width: 2, flex: 1, background: "#e5e7eb", margin: "4px 0" }} />}
              </div>
              <div style={{ paddingBottom: last ? 0 : 16 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 2 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: dot === CYAN ? CYAN : dot === NAVY ? NAVY : "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em" }}>{day}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#111827", fontFamily: "'Poppins', sans-serif" }}>{title}</span>
                </div>
                <p style={{ fontSize: 12, color: "#9ca3af", margin: 0, lineHeight: 1.4 }}>{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Plan cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {/* Annual */}
          <div
            onClick={() => setPlan("annual")}
            style={{ borderRadius: 16, border: plan === "annual" ? "2px solid transparent" : "2px solid #e5e7eb", background: plan === "annual" ? NAVY : "#fafafa", padding: "16px 18px", cursor: "pointer", position: "relative", transition: "all 0.2s ease" }}
          >
            <div style={{ position: "absolute", top: -11, left: 18, background: CYAN, borderRadius: 100, padding: "3px 12px", fontSize: 10, fontWeight: 700, color: "#fff", letterSpacing: "0.06em", textTransform: "uppercase" }}>Best Value — Save 19%</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: plan === "annual" ? "#fff" : NAVY, fontFamily: "'Poppins', sans-serif", marginBottom: 3 }}>Annual</div>
                <div style={{ fontSize: 12, color: plan === "annual" ? "rgba(255,255,255,0.6)" : "#9ca3af" }}>Just $3.25/mo · billed annually</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: plan === "annual" ? "#fff" : NAVY, fontFamily: "'Poppins', sans-serif", lineHeight: 1 }}>$39</div>
                  <div style={{ fontSize: 11, color: plan === "annual" ? "rgba(255,255,255,0.5)" : "#9ca3af" }}>/year</div>
                </div>
                <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${plan === "annual" ? CYAN : "#d1d5db"}`, background: plan === "annual" ? CYAN : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {plan === "annual" && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
                </div>
              </div>
            </div>
          </div>

          {/* Monthly */}
          <div
            onClick={() => setPlan("monthly")}
            style={{ borderRadius: 16, border: plan === "monthly" ? `2px solid ${NAVY}` : "2px solid #e5e7eb", background: plan === "monthly" ? "#f0f4ff" : "#fafafa", padding: "16px 18px", cursor: "pointer", transition: "all 0.2s ease" }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: NAVY, fontFamily: "'Poppins', sans-serif", marginBottom: 3 }}>Monthly</div>
                <div style={{ fontSize: 12, color: "#9ca3af" }}>Billed every month</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: NAVY, fontFamily: "'Poppins', sans-serif", lineHeight: 1 }}>$4</div>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>/month</div>
                </div>
                <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${plan === "monthly" ? NAVY : "#d1d5db"}`, background: plan === "monthly" ? NAVY : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {plan === "monthly" && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature checklist */}
        <div style={{ marginBottom: 20 }}>
          {checkItems.map((item) => (
            <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#E0F7FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
                  <path d="M6 1L7.18 4.38L10.76 4.45L7.9 6.62L8.94 10.05L6 8L3.06 10.05L4.1 6.62L1.24 4.45L4.82 4.38Z" fill="#00b4d8" />
                </svg>
              </div>
              <span style={{ fontSize: 13, color: "#374151" }}>{item}</span>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 10, color: "#b0b0b0", textAlign: "center", lineHeight: 1.55, margin: "0 0 6px" }}>
          Cancel anytime in app settings or by emailing support. {billingNote}. Subscription auto-renews unless cancelled.
        </p>
      </div>

      {/* Pinned CTA */}
      <div style={{ padding: "10px 24px", paddingBottom: "calc(24px + env(safe-area-inset-bottom, 0px))", background: "#fff", boxSizing: "border-box", maxWidth: "390px", width: "100%", margin: "0 auto", flexShrink: 0 }}>
        <button
          onClick={onComplete}
          style={{ width: "100%", background: NAVY, border: "none", borderRadius: 100, padding: "14px 20px 12px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}
        >
          <span style={{ fontSize: 16, fontWeight: 700, color: "#fff", fontFamily: "'Poppins', sans-serif" }}>
            Start 7-Day Free Trial →
          </span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>
            {price} after trial · cancel anytime
          </span>
        </button>
        <p style={{ textAlign: "center", fontSize: 11, color: "#9ca3af", margin: "10px 0 0" }}>
          No charge today
        </p>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────
   Exported GigGapStep (used in home.tsx)
──────────────────────────────────────── */
export function GigGapStep({ onComplete }: { onComplete: () => void }) {
  return (
    <GigGapBUI
      onContinue={onComplete}
      ctaLabel="See what I'm missing →"
      showDots={false}
    />
  );
}

/* ────────────────────────────────────────
   Main OnboardingFlow
──────────────────────────────────────── */
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

  const saveReminderMutation = useMutation({
    mutationFn: async (reminderWeeks: string) => {
      const res = await apiRequest("POST", "/api/user/preferences", { reminderWeeks });
      return res.ok ? res.json() : null;
    },
  });

  if (!isOpen) return null;

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

  /* ── Gig Gap ── */
  if (step === "gig-gap") {
    return (
      <GigGapBUI
        onContinue={() => setStep("warm-up")}
        ctaLabel="Continue →"
        showDots={true}
        dotsIndex={3}
      />
    );
  }

  /* ── Warm Up ── */
  if (step === "warm-up") {
    return (
      <WarmUpStep
        onNext={(reminderWeeks) => {
          saveReminderMutation.mutate(reminderWeeks);
          setStep("what-you-get");
        }}
      />
    );
  }

  /* ── What You Get ── */
  if (step === "what-you-get") {
    return <WhatYouGetStep onNext={() => setStep("paywall")} />;
  }

  /* ── Paywall ── */
  if (step === "paywall") {
    return <PaywallStep onComplete={onComplete} />;
  }

  /* ── Address ── */
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
            We use your home address to calculate mileage deductions for your gigs.
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

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginBottom: "20px" }}>
            <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1.5" y="7" width="11" height="8" rx="2" fill={NAVY} />
              <path d="M4 7V5C4 3.343 5.343 2 7 2C8.657 2 10 3.343 10 5V7" stroke={NAVY} strokeWidth="1.8" strokeLinecap="round" fill="none" />
              <circle cx="7" cy="11" r="1.2" fill="#00b4d8" />
              <rect x="6.35" y="11" width="1.3" height="2" rx="0.65" fill="#00b4d8" />
            </svg>
            <span style={{ fontSize: "12px", color: "#9ca3af" }}>We never share or sell your data.</span>
          </div>

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

  /* ── Tax Rate ── */
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
                    padding: "16px 20px", borderRadius: "14px",
                    border: isSelected ? `2px solid ${CYAN}` : "1.5px solid #e5e7eb",
                    backgroundColor: isSelected ? "#e0f7fa" : "#ffffff",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", textAlign: "left",
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
                  type="number" inputMode="numeric" min="0" max="60" placeholder="e.g. 25" autoFocus
                  value={data.customTax}
                  onChange={(e) => setData({ ...data, customTax: e.target.value })}
                  onFocus={(e) => setTimeout(() => e.target.scrollIntoView({ behavior: "smooth", block: "center" }), 350)}
                  style={{ width: "100px", height: "48px", fontSize: "16px", padding: "0 14px", border: "1.5px solid #d1d5db", borderRadius: "10px", backgroundColor: "#ffffff", color: "#111827", outline: "none", WebkitAppearance: "none" }}
                />
                <span style={{ fontSize: "20px", fontWeight: 600, color: NAVY }}>%</span>
              </div>
            </div>
          )}

          <div style={{ flex: 1 }} />

          <button style={btnPrimary} onClick={() => setStep("gig-types")}>
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

  /* ── Gig Types ── */
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
                    padding: "10px 16px", borderRadius: "100px",
                    border: selected ? `2px solid ${CYAN}` : "1.5px solid #e5e7eb",
                    backgroundColor: selected ? CYAN : "#ffffff",
                    color: selected ? "#ffffff" : "#374151",
                    fontSize: "14px", fontWeight: selected ? 600 : 400,
                    cursor: "pointer", transition: "all 0.15s ease",
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
                style={{ width: "100%", height: "48px", fontSize: "16px", padding: "0 14px", border: `1.5px solid ${CYAN}`, borderRadius: "12px", backgroundColor: "#ffffff", color: "#111827", outline: "none", boxSizing: "border-box" }}
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
