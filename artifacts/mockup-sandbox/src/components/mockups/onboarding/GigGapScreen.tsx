import { useState } from "react";

const NAVY = "#03045e";
const CYAN = "#00b4d8";
const CORAL_BG = "#FFF5F3";
const CORAL_BORDER = "#FFE0DA";
const CORAL_TEXT = "#D84C2A";

const MILES_MIN = 0;
const MILES_MAX = 500;
const MILES_DEFAULT = 100;
const MILES_STEP = 10;

const EXP_MIN = 0;
const EXP_MAX = 500;
const EXP_DEFAULT = 150;
const EXP_STEP = 10;

const IRS_RATE = 0.725;

function formatDollar(val: number) {
  return `$${Math.round(val).toLocaleString()}`;
}

function fmtCents(val: number) {
  const rounded = Math.round(val * 100) / 100;
  const whole = Math.floor(rounded);
  const cents = Math.round((rounded - whole) * 100);
  if (cents === 0) return `$${whole.toLocaleString()}`;
  return `$${whole.toLocaleString()}.${String(cents).padStart(2, "0")}`;
}

function ProgressDots() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{
          width: 8, height: 8, borderRadius: "50%",
          background: CYAN, opacity: 0.4,
        }} />
      ))}
      <div style={{ width: 24, height: 8, borderRadius: 4, background: CYAN }} />
      {[5, 6].map((i) => (
        <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#d1d5db" }} />
      ))}
    </div>
  );
}

function HomeIndicator() {
  return (
    <div style={{
      position: "absolute", bottom: 10, left: "50%",
      transform: "translateX(-50%)",
      width: 134, height: 5,
      background: "#1a1a2e", borderRadius: 3,
    }} />
  );
}

function Slider({
  label, unit, min, max, step, value, pulsing,
  onChange,
}: {
  label: string; unit: string; min: number; max: number; step: number;
  value: number; pulsing: boolean; onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{
          fontSize: 11, fontWeight: 700, color: "#9ca3af",
          textTransform: "uppercase", letterSpacing: "0.08em",
          fontFamily: "'Montserrat', sans-serif",
        }}>{label}</span>
        <span style={{ fontSize: 22, fontWeight: 800, color: NAVY, fontFamily: "'Poppins', sans-serif" }}>
          {unit === "$" ? `$${value}` : `${value} mi`}
        </span>
      </div>
      <div style={{ position: "relative", marginBottom: 6 }}>
        <div style={{
          position: "absolute", top: "50%", left: 0,
          transform: "translateY(-50%)",
          width: "100%", height: 8, borderRadius: 4,
          background: "#d1d5db", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", top: "50%", left: 0,
          transform: "translateY(-50%)",
          width: `${pct}%`, height: 8, borderRadius: 4,
          background: CYAN, pointerEvents: "none",
          transition: "width 0.05s ease",
        }} />
        <input
          type="range" min={min} max={max} step={step} value={value}
          className={`gig-slider${pulsing ? " pulsing" : ""}`}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ position: "relative", zIndex: 1, background: "transparent" }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 10, color: "#9ca3af", fontFamily: "'Montserrat', sans-serif" }}>
          {unit === "$" ? "$0" : "0 mi"}
        </span>
        <span style={{ fontSize: 10, color: "#9ca3af", fontFamily: "'Montserrat', sans-serif" }}>
          {unit === "$" ? "$500" : "500 mi"}
        </span>
      </div>
    </div>
  );
}

export function GigGapScreen() {
  const [miles, setMiles] = useState(MILES_DEFAULT);
  const [expenses, setExpenses] = useState(EXP_DEFAULT);
  const [milesPulsing, setMilesPulsing] = useState(true);
  const [expPulsing, setExpPulsing] = useState(false);

  const mileageDeduction = miles * IRS_RATE;
  const totalMonthly = mileageDeduction + expenses;
  const totalAnnual = totalMonthly * 12;

  return (
    <div style={{
      width: 393, height: 852,
      borderRadius: 55, overflow: "hidden",
      position: "relative", background: "#fff",
      fontFamily: "'Montserrat', sans-serif",
      display: "flex", flexDirection: "column",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&family=Montserrat:wght@400;500;600;700&display=swap');
        @keyframes sliderPulse {
          0%, 100% { box-shadow: 0 0 0 4px rgba(0,180,216,0.3); }
          50%       { box-shadow: 0 0 0 12px rgba(0,180,216,0.08); }
        }
        .gig-slider { -webkit-appearance:none; appearance:none; width:100%; height:8px; border-radius:4px; outline:none; cursor:pointer; border:none; padding:0; background:transparent; }
        .gig-slider::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:28px; height:28px; border-radius:50%; background:${CYAN}; cursor:pointer; border:3px solid #fff; box-shadow:0 2px 8px rgba(0,0,0,.2); }
        .gig-slider::-moz-range-thumb { width:28px; height:28px; border-radius:50%; background:${CYAN}; cursor:pointer; border:3px solid #fff; box-shadow:0 2px 8px rgba(0,0,0,.2); }
        .gig-slider.pulsing::-webkit-slider-thumb { animation: sliderPulse 1.5s ease-in-out infinite; }
        .gig-slider.pulsing::-moz-range-thumb    { animation: sliderPulse 1.5s ease-in-out infinite; }
      `}</style>
      <div style={{ flex: 1, overflowY: "auto", padding: "52px 24px 24px", boxSizing: "border-box" }}>
        <ProgressDots />

        <p style={{
          fontSize: 11, fontWeight: 700, color: CYAN,
          textTransform: "uppercase", letterSpacing: "0.07em",
          margin: "0 0 8px", fontFamily: "'Montserrat', sans-serif",
        }}>Your Deductions</p>

        <h1 style={{
          fontFamily: "'Poppins', sans-serif", fontWeight: 800,
          fontSize: 22, color: NAVY, lineHeight: 1.25,
          margin: "0 0 8px",
        }}>
          Slide to see your{" "}
          <span style={{ color: CYAN }}>deductions add up.</span>
        </h1>

        <p style={{
          fontSize: 13, color: "#4b5563", lineHeight: 1.5,
          margin: "0 0 18px", fontFamily: "'Montserrat', sans-serif",
        }}>Enter your typical miles and expenses. See what you could potentially deduct this year by tracking.</p>

        {/* Two sliders card */}
        <div style={{
          background: "#f8fafc", border: `1.5px solid ${CYAN}`,
          borderRadius: 18, padding: "18px 18px 12px",
          marginBottom: 16,
        }}>
          <Slider
            label="Miles driven to gigs" unit="mi"
            min={MILES_MIN} max={MILES_MAX} step={MILES_STEP}
            value={miles} pulsing={milesPulsing}
            onChange={(v) => { setMiles(v); setMilesPulsing(false); }}
          />
          <div style={{ borderTop: "1px solid #e5e7eb", margin: "12px 0" }} />
          <Slider
            label="Monthly work expenses" unit="$"
            min={EXP_MIN} max={EXP_MAX} step={EXP_STEP}
            value={expenses} pulsing={expPulsing}
            onChange={(v) => { setExpenses(v); setExpPulsing(false); }}
          />
        </div>

        {/* Hero deduction number */}
        <div style={{
          background: CORAL_BG, border: `1px solid ${CORAL_BORDER}`,
          borderRadius: 18, padding: "18px 20px 14px",
          marginBottom: 14, textAlign: "center",
        }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: CORAL_TEXT,
            textTransform: "uppercase", letterSpacing: "0.08em",
            marginBottom: 4, fontFamily: "'Montserrat', sans-serif",
          }}>Annual deduction value</div>
          <div style={{
            fontSize: 58, fontWeight: 800, color: CORAL_TEXT,
            lineHeight: 1, fontFamily: "'Poppins', sans-serif",
            marginBottom: 4,
          }}>{formatDollar(totalAnnual)}</div>
          <div style={{
            fontSize: 13, color: CORAL_TEXT, opacity: 0.65,
            fontFamily: "'Montserrat', sans-serif",
          }}>
            {fmtCents(totalMonthly)} per month
          </div>
        </div>

        {/* Breakdown card */}
        <div style={{
          background: "#fff", border: "1px solid #e5e7eb",
          borderRadius: 14, overflow: "hidden", marginBottom: 14,
        }}>
          {[
            {
              title: "Mileage",
              sub: `${miles} mi × $${IRS_RATE}/mi (IRS 2026 rate)`,
              mo: mileageDeduction,
              subColor: "#9ca3af",
            },
            {
              title: "Business expenses",
              sub: "Phone, equipment, parking, supplies",
              mo: expenses,
              subColor: CYAN,
            },
          ].map(({ title, sub, mo, subColor }, i) => (
            <div key={title} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 18px",
              borderBottom: i === 0 ? "1px solid #f3f4f6" : "none",
            }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", fontFamily: "'Poppins', sans-serif" }}>{title}</div>
                <div style={{ fontSize: 12, color: subColor, marginTop: 2, fontFamily: "'Montserrat', sans-serif" }}>{sub}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: NAVY, fontFamily: "'Poppins', sans-serif" }}>{fmtCents(mo)}/mo</div>
                <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2, fontFamily: "'Montserrat', sans-serif" }}>{formatDollar(mo * 12)}/yr</div>
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <p style={{
          fontSize: 10, color: "#b0b0b0", textAlign: "center",
          lineHeight: 1.55, margin: "0 0 8px", padding: "0 4px",
          fontFamily: "'Montserrat', sans-serif",
        }}>
          Mileage deduction uses the 2026 IRS standard rate of $0.725/mile. Expense deduction reflects the amount you entered. These are deduction values, not tax savings — actual tax savings depend on your rate and filing status.
        </p>
      </div>
      {/* Pinned CTA */}
      <div style={{ padding: "12px 24px 36px", background: "#fff", boxSizing: "border-box" }}>
        <button style={{
          width: "100%", background: NAVY, border: "none",
          borderRadius: 100, padding: "15px 20px",
          cursor: "pointer", textAlign: "center",
        }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#fff", fontFamily: "'Poppins', sans-serif" }}>
            Continue →
          </span>
        </button>
      </div>
      <HomeIndicator />
    </div>
  );
}
