import { useState } from "react";

const NAVY = "#03045e";
const CYAN = "#00b4d8";
const CORAL = "#D84C2A";
const CORAL_BG = "#FFF5F3";
const CORAL_BORDER = "#FFE0DA";
const MISSED_COLOR = "#475569";

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
          <span style={{ color: CYAN }}>this much disappears.</span>
        </h1>
        <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 18px", lineHeight: 1.5, fontFamily: "'Montserrat', sans-serif" }}>
          Drag to see your personal gig gap.
        </p>

        {/* Income slider card */}
        <div style={{ background: "#f8fafc", border: `1.5px solid ${CYAN}`, borderRadius: 16, padding: "16px 18px 14px", marginBottom: 16 }}>
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

        {/* Split bar — navy (kept) vs slate (missed), no aggressive colors */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", height: 40, borderRadius: 12, overflow: "hidden", marginBottom: 8 }}>
            <div style={{ flex: keptPct, background: NAVY, display: "flex", alignItems: "center", justifyContent: "center", transition: "flex 0.3s ease" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", fontFamily: "'Poppins', sans-serif" }}>{keptPct}% kept</span>
            </div>
            <div style={{ flex: missedPct, background: MISSED_COLOR, display: "flex", alignItems: "center", justifyContent: "center", transition: "flex 0.3s ease" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", fontFamily: "'Poppins', sans-serif" }}>{missedPct}% gone</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: NAVY }} />
              <span style={{ fontSize: 11, color: "#6b7280", fontFamily: "'Montserrat', sans-serif" }}>You keep</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: MISSED_COLOR }} />
              <span style={{ fontSize: 11, color: "#6b7280", fontFamily: "'Montserrat', sans-serif" }}>Unclaimed deductions</span>
            </div>
          </div>
        </div>

        {/* Monthly + Annually — same style as original A */}
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          {[{ label: "Monthly", val: monthlyMissed }, { label: "Annually", val: annualMissed }].map(({ label, val }) => (
            <div key={label} style={{ flex: 1, background: CORAL_BG, border: `1px solid ${CORAL_BORDER}`, borderRadius: 14, padding: "14px 12px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: CORAL, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4, fontFamily: "'Montserrat', sans-serif" }}>{label}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: CORAL, lineHeight: 1.1, marginBottom: 2, fontFamily: "'Poppins', sans-serif" }}>{fmt(val)}</div>
              <div style={{ fontSize: 12, color: CORAL, opacity: 0.7, fontFamily: "'Montserrat', sans-serif" }}>typically missed</div>
            </div>
          ))}
        </div>

        {/* Breakdown */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, overflow: "hidden", marginBottom: 14 }}>
          {[
            { title: "Mileage", sub: `~${miles.toLocaleString()} mi/mo · $0.725/mi`, mo: mileageDeduction, yr: mileageDeduction * 12, subColor: "#9ca3af" },
            { title: "Business expenses", sub: "Parking, supplies, equipment", mo: businessExpenses, yr: businessExpenses * 12, subColor: CYAN },
          ].map(({ title, sub, mo, yr, subColor }, i) => (
            <div key={title} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: i === 0 ? "1px solid #f3f4f6" : "none" }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", fontFamily: "'Poppins', sans-serif" }}>{title}</div>
                <div style={{ fontSize: 12, color: subColor, marginTop: 2, fontFamily: "'Montserrat', sans-serif" }}>{sub}</div>
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
