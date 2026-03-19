import { useState } from "react";

const NAVY = "#03045e";
const CYAN = "#00b4d8";
const CORAL = "#D84C2A";
const CORAL_BG = "#FFF5F3";
const CORAL_BORDER = "#FFE0DA";

const MIN = 500;
const MAX = 10000;
const DEFAULT = 2500;

function fmt(val: number) {
  return `$${val.toLocaleString()}`;
}

function fmtShort(val: number) {
  return val >= 1000 ? `$${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}k` : `$${val}`;
}

function ProgressDots() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: CYAN, opacity: 0.4 }} />
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
      width: 134, height: 5, background: "#1a1a2e", borderRadius: 3,
    }} />
  );
}

export function GigGapScreenB() {
  const [income, setIncome] = useState(DEFAULT);
  const [pulsing, setPulsing] = useState(true);

  const miles = Math.round((income / 1000) * 44);
  const mileageDeduction = Math.round(miles * 0.725);
  const businessExpenses = Math.round(income * 0.05);
  const monthlyMissed = mileageDeduction + businessExpenses;
  const annualMissed = monthlyMissed * 12;
  const pct = ((income - MIN) / (MAX - MIN)) * 100;

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
        @keyframes pulse-b {
          0%,100% { box-shadow: 0 0 0 4px rgba(0,180,216,0.3); }
          50%      { box-shadow: 0 0 0 12px rgba(0,180,216,0.08); }
        }
        .slider-b { -webkit-appearance:none; appearance:none; width:100%; height:6px; border-radius:3px; outline:none; cursor:pointer; border:none; padding:0; background:transparent; }
        .slider-b::-webkit-slider-thumb { -webkit-appearance:none; width:26px; height:26px; border-radius:50%; background:${CYAN}; cursor:pointer; border:3px solid #fff; box-shadow:0 2px 8px rgba(0,0,0,.2); }
        .slider-b::-moz-range-thumb { width:26px; height:26px; border-radius:50%; background:${CYAN}; cursor:pointer; border:3px solid #fff; box-shadow:0 2px 8px rgba(0,0,0,.2); }
        .slider-b.pulse::-webkit-slider-thumb { animation: pulse-b 1.5s ease-in-out infinite; }
        .slider-b.pulse::-moz-range-thumb { animation: pulse-b 1.5s ease-in-out infinite; }
      `}</style>

      <div style={{ flex: 1, overflowY: "auto", padding: "52px 24px 24px", boxSizing: "border-box" }}>
        <ProgressDots />

        <p style={{ fontSize: 11, fontWeight: 700, color: CYAN, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 8px", fontFamily: "'Montserrat', sans-serif" }}>
          Your Gig Gap
        </p>

        <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: 22, color: NAVY, lineHeight: 1.25, margin: "0 0 20px" }}>
          Here's what you're{" "}
          <span style={{ color: CYAN }}>leaving behind</span>{" "}
          every year.
        </h1>

        {/* Hero navy card — annual missed front and center */}
        <div style={{
          background: NAVY, borderRadius: 22,
          padding: "24px 24px 20px",
          marginBottom: 16, textAlign: "center",
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 6px", fontFamily: "'Montserrat', sans-serif" }}>
            Estimated annual deductions missed
          </p>
          <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: 58, color: "#FF6B47", lineHeight: 1, margin: "0 0 6px" }}>
            {fmt(annualMissed)}
          </div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", margin: 0, fontFamily: "'Montserrat', sans-serif" }}>
            based on {fmtShort(income)}/mo income · adjust below
          </p>

          {/* Inline mini slider */}
          <div style={{ marginTop: 20, position: "relative" }}>
            <div style={{ position: "absolute", top: "50%", left: 0, transform: "translateY(-50%)", width: "100%", height: 6, borderRadius: 3, background: "rgba(255,255,255,0.15)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", top: "50%", left: 0, transform: "translateY(-50%)", width: `${pct}%`, height: 6, borderRadius: 3, background: CYAN, pointerEvents: "none", transition: "width 0.05s ease" }} />
            <input
              type="range" min={MIN} max={MAX} step={100} value={income}
              className={`slider-b${pulsing ? " pulse" : ""}`}
              onChange={(e) => { setIncome(Number(e.target.value)); setPulsing(false); }}
              style={{ position: "relative", zIndex: 1, background: "transparent" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              {[500, 3000, 5000, 8000, 10000].map((v) => (
                <span key={v} style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: "'Montserrat', sans-serif" }}>{fmtShort(v)}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly + Annually side by side */}
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          {[{ label: "Monthly", val: monthlyMissed }, { label: "Annually", val: annualMissed }].map(({ label, val }) => (
            <div key={label} style={{ flex: 1, background: CORAL_BG, border: `1px solid ${CORAL_BORDER}`, borderRadius: 14, padding: "14px 12px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: CORAL, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4, fontFamily: "'Montserrat', sans-serif" }}>{label}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: CORAL, lineHeight: 1.1, marginBottom: 2, fontFamily: "'Poppins', sans-serif" }}>{fmt(val)}</div>
              <div style={{ fontSize: 12, color: CORAL, opacity: 0.7, fontFamily: "'Montserrat', sans-serif" }}>typically missed</div>
            </div>
          ))}
        </div>

        {/* Breakdown rows */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, overflow: "hidden", marginBottom: 14 }}>
          {[
            { title: "Mileage", sub: `~${miles.toLocaleString()} mi/mo · $0.725/mi`, mo: mileageDeduction, yr: mileageDeduction * 12 },
            { title: "Business expenses", sub: "Parking, supplies, equipment", mo: businessExpenses, yr: businessExpenses * 12, subColor: CYAN },
          ].map(({ title, sub, mo, yr, subColor }, i) => (
            <div key={title} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: i === 0 ? "1px solid #f3f4f6" : "none" }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", fontFamily: "'Poppins', sans-serif" }}>{title}</div>
                <div style={{ fontSize: 12, color: subColor || "#9ca3af", marginTop: 2, fontFamily: "'Montserrat', sans-serif" }}>{sub}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: NAVY, fontFamily: "'Poppins', sans-serif" }}>{fmt(mo)}/mo</div>
                <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2, fontFamily: "'Montserrat', sans-serif" }}>{fmt(yr)}/yr</div>
              </div>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 10, color: "#b0b0b0", textAlign: "center", lineHeight: 1.55, margin: "0 0 8px", padding: "0 4px", fontFamily: "'Montserrat', sans-serif" }}>
          Mileage estimated at 44 mi per $1,000 earned × $0.725/mi (2026 IRS rate). Expenses estimated at 5% of income. Estimates only — results vary.
        </p>
      </div>

      {/* Pinned CTA */}
      <div style={{ padding: "10px 24px 36px", background: "#fff" }}>
        <button style={{ width: "100%", background: NAVY, border: "none", borderRadius: 100, padding: "14px 20px 12px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#fff", fontFamily: "'Poppins', sans-serif" }}>Save more money with Bookd →</span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontFamily: "'Montserrat', sans-serif" }}>Set up Bookd and start keeping what you earned</span>
        </button>
      </div>

      <HomeIndicator />
    </div>
  );
}
