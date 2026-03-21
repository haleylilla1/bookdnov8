import { useState } from "react";

const CYAN = "#00b4d8";
const NAVY = "#03045e";
const IRS_RATE = 0.725;
const MILES_MIN = 0, MILES_MAX = 500, MILES_DEFAULT = 100, MILES_STEP = 10;
const EXP_MIN = 0, EXP_MAX = 500, EXP_DEFAULT = 150, EXP_STEP = 10;

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

export function GigGapScreenGlossy() {
  const [miles, setMiles] = useState(MILES_DEFAULT);
  const [expenses, setExpenses] = useState(EXP_DEFAULT);

  const mileageDeduction = miles * IRS_RATE;
  const totalMonthly = mileageDeduction + expenses;
  const totalAnnual = totalMonthly * 12;
  const milesPct = ((miles - MILES_MIN) / (MILES_MAX - MILES_MIN)) * 100;
  const expPct = ((expenses - EXP_MIN) / (EXP_MAX - EXP_MIN)) * 100;

  return (
    <div style={{
      width: 393, height: 852,
      borderRadius: 55, overflow: "hidden",
      position: "relative",
      background: "#f5fafd",
      fontFamily: "'Montserrat', sans-serif",
      display: "flex", flexDirection: "column",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&family=Montserrat:wght@400;500;600;700&display=swap');
        .slider-g { -webkit-appearance:none; appearance:none; width:100%; height:6px; border-radius:3px; outline:none; cursor:pointer; border:none; padding:0; background:transparent; }
        .slider-g::-webkit-slider-thumb { -webkit-appearance:none; width:24px; height:24px; border-radius:50%; background:${NAVY}; cursor:pointer; border:3px solid rgba(255,255,255,0.9); box-shadow:0 2px 8px rgba(3,4,94,.25); }
        .slider-g::-moz-range-thumb { width:24px; height:24px; border-radius:50%; background:${NAVY}; cursor:pointer; border:3px solid rgba(255,255,255,0.9); box-shadow:0 2px 8px rgba(3,4,94,.25); }
      `}</style>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "56px 20px 16px", boxSizing: "border-box" }}>

        {/* Progress dots */}
        <div style={{ display: "flex", gap: 6, marginBottom: 24, justifyContent: "center" }}>
          {[0,1,2,3,4,5].map(i => (
            <div key={i} style={{
              width: i === 3 ? 24 : 8, height: 8, borderRadius: 4,
              backgroundColor: i < 3 ? `rgba(0,180,216,0.4)` : i === 3 ? CYAN : "#e5e7eb",
              transition: "all 0.3s ease",
            }} />
          ))}
        </div>

        <p style={{ fontSize: 10, fontWeight: 700, color: CYAN, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 6px" }}>
          Your Deductions
        </p>

        <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: 18, color: NAVY, lineHeight: 1.3, margin: "0 0 12px" }}>
          See what you{" "}
          <span style={{ color: CYAN }}>could be keeping</span>
          {" "}by tracking everything.
        </h1>

        {/* ── GLOSSY CARD ── */}
        <div style={{
          position: "relative",
          borderRadius: 20,
          padding: "18px 18px 16px",
          marginBottom: 10,
          background: "linear-gradient(145deg, #ffffff 0%, #e4f6fc 55%, #cdf0f8 100%)",
          border: "1.5px solid rgba(255, 255, 255, 0.85)",
          boxShadow: "0 8px 32px rgba(0, 180, 216, 0.14), 0 2px 8px rgba(3, 4, 94, 0.06), inset 0 1px 0 rgba(255,255,255,0.95)",
          overflow: "hidden",
        }}>

          {/* Glass highlight — top sheen */}
          <div style={{
            position: "absolute",
            top: 0, left: 0, right: 0,
            height: "45%",
            background: "linear-gradient(to bottom, rgba(255,255,255,0.65) 0%, transparent 100%)",
            borderRadius: "20px 20px 0 0",
            pointerEvents: "none",
            zIndex: 1,
          }} />

          {/* Content sits above the sheen */}
          <div style={{ position: "relative", zIndex: 2 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(3,4,94,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px" }}>
              potential annual deductions
            </p>

            <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: 40, color: NAVY, lineHeight: 1, margin: "0 0 6px" }}>
              {fmt(totalAnnual)}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "0 0 18px" }}>
              <div style={{ flex: 1, height: 1, background: "rgba(0,180,216,0.25)" }} />
              <p style={{ fontSize: 12, color: CYAN, margin: 0, fontWeight: 600 }}>
                {fmtCents(totalMonthly)} / month
              </p>
              <div style={{ flex: 1, height: 1, background: "rgba(0,180,216,0.25)" }} />
            </div>

            {/* Miles slider */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(3,4,94,0.5)", textTransform: "uppercase", letterSpacing: "0.07em" }}>monthly business miles</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: NAVY, fontFamily: "'Poppins', sans-serif" }}>{miles} mi</span>
              </div>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", top: "50%", left: 0, transform: "translateY(-50%)", width: "100%", height: 6, borderRadius: 3, background: "rgba(3,4,94,0.1)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", top: "50%", left: 0, transform: "translateY(-50%)", width: `${milesPct}%`, height: 6, borderRadius: 3, background: CYAN, pointerEvents: "none", transition: "width 0.05s ease" }} />
                <input
                  type="range" min={MILES_MIN} max={MILES_MAX} step={MILES_STEP} value={miles}
                  className="slider-g"
                  onChange={(e) => setMiles(Number(e.target.value))}
                  style={{ position: "relative", zIndex: 1, background: "transparent" }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                <span style={{ fontSize: 10, color: "rgba(3,4,94,0.25)" }}>0 mi</span>
                <span style={{ fontSize: 10, color: "rgba(3,4,94,0.25)" }}>500 mi</span>
              </div>
            </div>

            {/* Expenses slider */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(3,4,94,0.5)", textTransform: "uppercase", letterSpacing: "0.07em" }}>monthly business expenses</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: NAVY, fontFamily: "'Poppins', sans-serif" }}>${expenses}</span>
              </div>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", top: "50%", left: 0, transform: "translateY(-50%)", width: "100%", height: 6, borderRadius: 3, background: "rgba(3,4,94,0.1)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", top: "50%", left: 0, transform: "translateY(-50%)", width: `${expPct}%`, height: 6, borderRadius: 3, background: CYAN, pointerEvents: "none", transition: "width 0.05s ease" }} />
                <input
                  type="range" min={EXP_MIN} max={EXP_MAX} step={EXP_STEP} value={expenses}
                  className="slider-g"
                  onChange={(e) => setExpenses(Number(e.target.value))}
                  style={{ position: "relative", zIndex: 1, background: "transparent" }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                <span style={{ fontSize: 10, color: "rgba(3,4,94,0.25)" }}>$0</span>
                <span style={{ fontSize: 10, color: "rgba(3,4,94,0.25)" }}>$500</span>
              </div>
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
          Mileage deduction uses the 2026 IRS standard rate of $0.725/mile. These are deduction values, not tax savings.
        </p>
      </div>

      {/* Pinned CTA */}
      <div style={{ padding: "10px 20px 36px", background: "#f5fafd", boxSizing: "border-box" }}>
        <button style={{
          width: "100%", background: NAVY, border: "none",
          borderRadius: 100, padding: "14px 20px",
          cursor: "pointer", textAlign: "center",
          boxShadow: "0 4px 16px rgba(3,4,94,0.25)",
        }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#fff", fontFamily: "'Poppins', sans-serif" }}>
            Continue →
          </span>
        </button>
      </div>
    </div>
  );
}
