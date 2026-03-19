import { useState } from "react";

const NAVY = "#03045e";
const CYAN = "#00b4d8";
const CORAL = "#D84C2A";
const CORAL_LIGHT = "#FFF5F3";

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

export function GigGapScreenC() {
  const [income, setIncome] = useState(DEFAULT);
  const [pulsing, setPulsing] = useState(true);

  const miles = Math.round((income / 1000) * 44);
  const mileageDeduction = Math.round(miles * 0.725);
  const businessExpenses = Math.round(income * 0.05);
  const monthlyMissed = mileageDeduction + businessExpenses;
  const annualMissed = monthlyMissed * 12;
  const annualIncome = income * 12;

  const missedPct = Math.round((annualMissed / annualIncome) * 100);
  const keptPct = 100 - missedPct;

  const sliderPct = ((income - MIN) / (MAX - MIN)) * 100;

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
        @keyframes pulse-c {
          0%,100% { box-shadow: 0 0 0 4px rgba(0,180,216,0.3); }
          50%      { box-shadow: 0 0 0 12px rgba(0,180,216,0.08); }
        }
        .slider-c { -webkit-appearance:none; appearance:none; width:100%; height:6px; border-radius:3px; outline:none; cursor:pointer; border:none; padding:0; background:transparent; }
        .slider-c::-webkit-slider-thumb { -webkit-appearance:none; width:26px; height:26px; border-radius:50%; background:${CYAN}; cursor:pointer; border:3px solid #fff; box-shadow:0 2px 8px rgba(0,0,0,.2); }
        .slider-c::-moz-range-thumb { width:26px; height:26px; border-radius:50%; background:${CYAN}; cursor:pointer; border:3px solid #fff; box-shadow:0 2px 8px rgba(0,0,0,.2); }
        .slider-c.pulse::-webkit-slider-thumb { animation: pulse-c 1.5s ease-in-out infinite; }
        .slider-c.pulse::-moz-range-thumb { animation: pulse-c 1.5s ease-in-out infinite; }
      `}</style>

      <div style={{ flex: 1, overflowY: "auto", padding: "52px 24px 24px", boxSizing: "border-box" }}>
        <ProgressDots />

        <p style={{ fontSize: 11, fontWeight: 700, color: CYAN, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 8px", fontFamily: "'Montserrat', sans-serif" }}>
          Your Gig Gap
        </p>

        <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: 22, color: NAVY, lineHeight: 1.25, margin: "0 0 6px" }}>
          Of every dollar you earn,{" "}
          <span style={{ color: CORAL }}>this much disappears.</span>
        </h1>
        <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 20px", lineHeight: 1.5, fontFamily: "'Montserrat', sans-serif" }}>
          Drag the slider to see your personal gig gap.
        </p>

        {/* Income slider card */}
        <div style={{ background: "#f8fafc", border: `1.5px solid ${CYAN}`, borderRadius: 16, padding: "16px 18px 14px", marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'Montserrat', sans-serif" }}>Monthly income</span>
            <span style={{ fontSize: 26, fontWeight: 800, color: NAVY, fontFamily: "'Poppins', sans-serif" }}>{fmt(income)}</span>
          </div>
          <div style={{ position: "relative", marginBottom: 6 }}>
            <div style={{ position: "absolute", top: "50%", left: 0, transform: "translateY(-50%)", width: "100%", height: 6, borderRadius: 3, background: "#d1d5db", pointerEvents: "none" }} />
            <div style={{ position: "absolute", top: "50%", left: 0, transform: "translateY(-50%)", width: `${sliderPct}%`, height: 6, borderRadius: 3, background: CYAN, pointerEvents: "none", transition: "width 0.05s ease" }} />
            <input
              type="range" min={MIN} max={MAX} step={100} value={income}
              className={`slider-c${pulsing ? " pulse" : ""}`}
              onChange={(e) => { setIncome(Number(e.target.value)); setPulsing(false); }}
              style={{ position: "relative", zIndex: 1, background: "transparent" }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            {[500, 3000, 5000, 8000, 10000].map((v) => (
              <span key={v} style={{ fontSize: 10, color: "#9ca3af", fontFamily: "'Montserrat', sans-serif" }}>{fmtShort(v)}</span>
            ))}
          </div>
        </div>

        {/* Split bar visual */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", height: 44, borderRadius: 12, overflow: "hidden", marginBottom: 10 }}>
            <div style={{
              flex: keptPct, background: NAVY,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "flex 0.3s ease",
            }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", fontFamily: "'Poppins', sans-serif" }}>
                {keptPct}% kept
              </span>
            </div>
            <div style={{
              flex: missedPct, background: CORAL,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "flex 0.3s ease",
            }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", fontFamily: "'Poppins', sans-serif" }}>
                {missedPct}% gone
              </span>
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: NAVY }} />
              <span style={{ fontSize: 12, color: "#6b7280", fontFamily: "'Montserrat', sans-serif" }}>You keep</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: CORAL }} />
              <span style={{ fontSize: 12, color: "#6b7280", fontFamily: "'Montserrat', sans-serif" }}>Unclaimed deductions</span>
            </div>
          </div>
        </div>

        {/* Big coral missed card */}
        <div style={{ background: CORAL_LIGHT, border: "1.5px solid #FFE0DA", borderRadius: 18, padding: "18px 20px", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: CORAL, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 4px", fontFamily: "'Montserrat', sans-serif" }}>Annually missed</p>
              <div style={{ fontSize: 42, fontWeight: 800, color: CORAL, lineHeight: 1, fontFamily: "'Poppins', sans-serif" }}>{fmt(annualMissed)}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: CORAL, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 4px", fontFamily: "'Montserrat', sans-serif", opacity: 0.7 }}>Monthly</p>
              <div style={{ fontSize: 24, fontWeight: 800, color: CORAL, lineHeight: 1, fontFamily: "'Poppins', sans-serif", opacity: 0.8 }}>{fmt(monthlyMissed)}</div>
            </div>
          </div>

          {/* Two breakdown pills */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", background: "rgba(216,76,42,0.08)", borderRadius: 10, padding: "10px 14px" }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 600, color: CORAL, fontFamily: "'Montserrat', sans-serif" }}>Mileage</span>
                <span style={{ fontSize: 11, color: CORAL, opacity: 0.65, marginLeft: 6, fontFamily: "'Montserrat', sans-serif" }}>~{miles.toLocaleString()} mi/mo</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: CORAL, fontFamily: "'Poppins', sans-serif" }}>{fmt(mileageDeduction)}/mo</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", background: "rgba(216,76,42,0.08)", borderRadius: 10, padding: "10px 14px" }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 600, color: CORAL, fontFamily: "'Montserrat', sans-serif" }}>Business expenses</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: CORAL, fontFamily: "'Poppins', sans-serif" }}>{fmt(businessExpenses)}/mo</span>
            </div>
          </div>
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
