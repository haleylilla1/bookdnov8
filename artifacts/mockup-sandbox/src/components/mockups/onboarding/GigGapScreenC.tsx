import { useState } from "react";

const NAVY = "#03045e";
const CYAN = "#00b4d8";
const CORAL = "#D84C2A";
const CORAL_BG = "#FFF5F3";
const CORAL_BORDER = "#FFE0DA";
const SLATE = "#475569";

const MILES_MIN = 0;
const MILES_MAX = 500;
const MILES_DEFAULT = 100;
const MILES_STEP = 10;

const EXP_MIN = 0;
const EXP_MAX = 500;
const EXP_DEFAULT = 150;
const EXP_STEP = 10;

const IRS_RATE = 0.725;

function fmt(val: number) {
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
  const [miles, setMiles] = useState(MILES_DEFAULT);
  const [expenses, setExpenses] = useState(EXP_DEFAULT);
  const [milesPulsing, setMilesPulsing] = useState(true);
  const [expPulsing, setExpPulsing] = useState(false);

  const mileageDeduction = miles * IRS_RATE;
  const totalMonthly = mileageDeduction + expenses;
  const totalAnnual = totalMonthly * 12;

  const milesPct = ((miles - MILES_MIN) / (MILES_MAX - MILES_MIN)) * 100;
  const expPct = ((expenses - EXP_MIN) / (EXP_MAX - EXP_MIN)) * 100;

  const totalForBar = mileageDeduction + expenses;
  const mileageBarPct = totalForBar > 0 ? Math.round((mileageDeduction / totalForBar) * 100) : 50;
  const expBarPct = 100 - mileageBarPct;

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
          Your Deductions
        </p>

        <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: 22, color: NAVY, lineHeight: 1.25, margin: "0 0 6px" }}>
          Here's where your{" "}
          <span style={{ color: CYAN }}>deductions come from.</span>
        </h1>
        <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 16px", lineHeight: 1.5, fontFamily: "'Montserrat', sans-serif" }}>
          Drag both sliders — see your breakdown live.
        </p>

        {/* Two sliders card */}
        <div style={{ background: "#f8fafc", border: `1.5px solid ${CYAN}`, borderRadius: 16, padding: "16px 18px 14px", marginBottom: 14 }}>
          {/* Miles slider */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'Montserrat', sans-serif" }}>Miles to gigs</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: NAVY, fontFamily: "'Poppins', sans-serif" }}>{miles} mi</span>
            </div>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", top: "50%", left: 0, transform: "translateY(-50%)", width: "100%", height: 6, borderRadius: 3, background: "#d1d5db", pointerEvents: "none" }} />
              <div style={{ position: "absolute", top: "50%", left: 0, transform: "translateY(-50%)", width: `${milesPct}%`, height: 6, borderRadius: 3, background: CYAN, pointerEvents: "none", transition: "width 0.05s ease" }} />
              <input
                type="range" min={MILES_MIN} max={MILES_MAX} step={MILES_STEP} value={miles}
                className={`slider-c${milesPulsing ? " pulse" : ""}`}
                onChange={(e) => { setMiles(Number(e.target.value)); setMilesPulsing(false); }}
                style={{ position: "relative", zIndex: 1, background: "transparent" }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
              <span style={{ fontSize: 10, color: "#9ca3af", fontFamily: "'Montserrat', sans-serif" }}>0 mi</span>
              <span style={{ fontSize: 10, color: "#9ca3af", fontFamily: "'Montserrat', sans-serif" }}>500 mi</span>
            </div>
          </div>

          <div style={{ borderTop: "1px solid #e5e7eb", marginBottom: 14 }} />

          {/* Expenses slider */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'Montserrat', sans-serif" }}>Work expenses</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: NAVY, fontFamily: "'Poppins', sans-serif" }}>${expenses}</span>
            </div>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", top: "50%", left: 0, transform: "translateY(-50%)", width: "100%", height: 6, borderRadius: 3, background: "#d1d5db", pointerEvents: "none" }} />
              <div style={{ position: "absolute", top: "50%", left: 0, transform: "translateY(-50%)", width: `${expPct}%`, height: 6, borderRadius: 3, background: CYAN, pointerEvents: "none", transition: "width 0.05s ease" }} />
              <input
                type="range" min={EXP_MIN} max={EXP_MAX} step={EXP_STEP} value={expenses}
                className={`slider-c${expPulsing ? " pulse" : ""}`}
                onChange={(e) => { setExpenses(Number(e.target.value)); setExpPulsing(false); }}
                style={{ position: "relative", zIndex: 1, background: "transparent" }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
              <span style={{ fontSize: 10, color: "#9ca3af", fontFamily: "'Montserrat', sans-serif" }}>$0</span>
              <span style={{ fontSize: 10, color: "#9ca3af", fontFamily: "'Montserrat', sans-serif" }}>$500</span>
            </div>
          </div>
        </div>

        {/* Split bar — mileage (navy) vs expenses (slate) */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", height: 40, borderRadius: 12, overflow: "hidden", marginBottom: 8 }}>
            <div style={{ flex: mileageBarPct, background: NAVY, display: "flex", alignItems: "center", justifyContent: "center", transition: "flex 0.3s ease", minWidth: mileageBarPct < 10 ? 0 : undefined }}>
              {mileageBarPct >= 15 && <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", fontFamily: "'Poppins', sans-serif" }}>{mileageBarPct}% miles</span>}
            </div>
            <div style={{ flex: expBarPct, background: SLATE, display: "flex", alignItems: "center", justifyContent: "center", transition: "flex 0.3s ease", minWidth: expBarPct < 10 ? 0 : undefined }}>
              {expBarPct >= 15 && <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", fontFamily: "'Poppins', sans-serif" }}>{expBarPct}% expenses</span>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: NAVY }} />
              <span style={{ fontSize: 11, color: "#6b7280", fontFamily: "'Montserrat', sans-serif" }}>Mileage</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: SLATE }} />
              <span style={{ fontSize: 11, color: "#6b7280", fontFamily: "'Montserrat', sans-serif" }}>Expenses</span>
            </div>
          </div>
        </div>

        {/* Annual + monthly summary */}
        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          <div style={{ flex: 2, background: CORAL_BG, border: `1px solid ${CORAL_BORDER}`, borderRadius: 14, padding: "14px 14px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: CORAL, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4, fontFamily: "'Montserrat', sans-serif" }}>Per year</div>
            <div style={{ fontSize: 30, fontWeight: 800, color: CORAL, lineHeight: 1.1, fontFamily: "'Poppins', sans-serif" }}>{fmt(totalAnnual)}</div>
          </div>
          <div style={{ flex: 1, background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 14, padding: "14px 14px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4, fontFamily: "'Montserrat', sans-serif" }}>Per month</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: NAVY, lineHeight: 1.1, fontFamily: "'Poppins', sans-serif" }}>{fmtCents(totalMonthly)}</div>
          </div>
        </div>

        {/* Breakdown card */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, overflow: "hidden", marginBottom: 12 }}>
          {[
            { title: "Mileage", sub: `${miles} mi × $${IRS_RATE}/mi (IRS 2026 rate)`, mo: mileageDeduction, subColor: "#9ca3af" },
            { title: "Business expenses", sub: "Phone, equipment, parking, supplies", mo: expenses, subColor: CYAN },
          ].map(({ title, sub, mo, subColor }, i) => (
            <div key={title} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: i === 0 ? "1px solid #f3f4f6" : "none" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#111827", fontFamily: "'Poppins', sans-serif" }}>{title}</div>
                <div style={{ fontSize: 11, color: subColor, marginTop: 2, fontFamily: "'Montserrat', sans-serif" }}>{sub}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, fontFamily: "'Poppins', sans-serif" }}>{fmtCents(mo)}/mo</div>
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2, fontFamily: "'Montserrat', sans-serif" }}>{fmt(mo * 12)}/yr</div>
              </div>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 10, color: "#b0b0b0", textAlign: "center", lineHeight: 1.55, margin: "0 0 8px", padding: "0 4px", fontFamily: "'Montserrat', sans-serif" }}>
          Mileage deduction uses the 2026 IRS standard rate of $0.725/mile. Expense deduction reflects the amount you entered. These are deduction values, not tax savings — actual tax savings depend on your rate and filing status.
        </p>
      </div>

      {/* Pinned CTA */}
      <div style={{ padding: "10px 24px 36px", background: "#fff" }}>
        <button style={{ width: "100%", background: NAVY, border: "none", borderRadius: 100, padding: "15px 20px", cursor: "pointer", textAlign: "center" }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#fff", fontFamily: "'Poppins', sans-serif" }}>Continue →</span>
        </button>
      </div>

      <HomeIndicator />
    </div>
  );
}
