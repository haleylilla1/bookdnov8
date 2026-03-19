import { useState } from "react";

const NAVY = "#03045e";
const CYAN = "#00b4d8";
const CORAL_BG = "#FFF5F3";
const CORAL_BORDER = "#FFE0DA";
const CORAL_TEXT = "#D84C2A";

const MIN = 500;
const MAX = 10000;
const DEFAULT = 2500;

function formatCurrency(val: number) {
  return val >= 1000 ? `$${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}k` : `$${val}`;
}

function formatDollar(val: number) {
  return `$${val.toLocaleString()}`;
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
      <div style={{
        width: 24, height: 8, borderRadius: 4,
        background: CYAN,
      }} />
      {[5, 6].map((i) => (
        <div key={i} style={{
          width: 8, height: 8, borderRadius: "50%",
          background: "#d1d5db",
        }} />
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

export function GigGapScreen() {
  const [income, setIncome] = useState(DEFAULT);
  const [pulsing, setPulsing] = useState(true);

  const miles = Math.round((income / 1000) * 44);
  const mileageDeduction = Math.round(miles * 0.725);
  const businessExpenses = Math.round(income * 0.05);
  const monthlyMissed = mileageDeduction + businessExpenses;
  const annualMissed = monthlyMissed * 12;
  const pct = ((income - MIN) / (MAX - MIN)) * 100;
  const tickValues = [500, 3000, 5000, 8000, 10000];

  return (
    <div style={{
      width: 393, height: 852,
      borderRadius: 55,
      overflow: "hidden",
      position: "relative",
      background: "#fff",
      fontFamily: "'Montserrat', sans-serif",
      display: "flex",
      flexDirection: "column",
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

      {/* Scrollable content */}
      <div style={{
        flex: 1, overflowY: "auto",
        padding: "56px 24px 24px",
        boxSizing: "border-box",
      }}>
        <ProgressDots />

        {/* Step label */}
        <p style={{
          fontSize: 11, fontWeight: 700, color: CYAN,
          textTransform: "uppercase", letterSpacing: "0.07em",
          margin: "0 0 8px",
          fontFamily: "'Montserrat', sans-serif",
        }}>Your Gig Gap</p>

        {/* Headline */}
        <h1 style={{
          fontFamily: "'Poppins', sans-serif", fontWeight: 800,
          fontSize: 24, color: NAVY, lineHeight: 1.25,
          margin: "0 0 10px",
        }}>
          Drag to see how much you could be{" "}
          <span style={{ color: CYAN }}>leaving on the table</span>
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: 14, color: "#4b5563", lineHeight: 1.55,
          margin: "0 0 24px",
          fontFamily: "'Montserrat', sans-serif",
        }}>
          Most independent contractors have no idea how much of{" "}
          <span style={{ color: CYAN, fontWeight: 600 }}>their own money</span>
          {" "}they're leaving behind.
        </p>

        {/* Slider card */}
        <div style={{
          background: "#f8fafc",
          border: `1.5px solid ${CYAN}`,
          borderRadius: 18,
          padding: "18px 18px 14px",
          marginBottom: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <div style={{
              fontSize: 11, fontWeight: 700, color: "#9ca3af",
              textTransform: "uppercase", letterSpacing: "0.08em",
              fontFamily: "'Montserrat', sans-serif",
            }}>
              Your Monthly Income
            </div>
            <div style={{
              fontSize: 28, fontWeight: 800, color: NAVY,
              fontFamily: "'Poppins', sans-serif",
            }}>
              {formatDollar(income)}
            </div>
          </div>

          {/* Slider track */}
          <div style={{ position: "relative", marginBottom: 8 }}>
            <div style={{
              position: "absolute", top: "50%", left: 0,
              transform: "translateY(-50%)",
              width: "100%", height: 8,
              borderRadius: 4, background: "#d1d5db",
              pointerEvents: "none",
            }} />
            <div style={{
              position: "absolute", top: "50%", left: 0,
              transform: "translateY(-50%)",
              width: `${pct}%`, height: 8,
              borderRadius: 4, background: CYAN,
              pointerEvents: "none",
              transition: "width 0.05s ease",
            }} />
            <input
              type="range"
              min={MIN} max={MAX} step={100}
              value={income}
              className={`gig-slider${pulsing ? " pulsing" : ""}`}
              onChange={(e) => {
                setIncome(Number(e.target.value));
                setPulsing(false);
              }}
              style={{ position: "relative", zIndex: 1, background: "transparent" }}
            />
          </div>

          {/* Ticks */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            {tickValues.map((v) => (
              <span key={v} style={{
                fontSize: 11, color: "#9ca3af", fontWeight: 500,
                fontFamily: "'Montserrat', sans-serif",
              }}>
                {formatCurrency(v)}
              </span>
            ))}
          </div>
        </div>

        {/* Coral summary cards */}
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          {[
            { label: "Monthly", value: monthlyMissed },
            { label: "Annually", value: annualMissed },
          ].map(({ label, value }) => (
            <div key={label} style={{
              flex: 1,
              background: CORAL_BG,
              border: `1px solid ${CORAL_BORDER}`,
              borderRadius: 14, padding: "14px 12px",
            }}>
              <div style={{
                fontSize: 11, fontWeight: 700, color: CORAL_TEXT,
                textTransform: "uppercase", letterSpacing: "0.06em",
                marginBottom: 4,
                fontFamily: "'Montserrat', sans-serif",
              }}>{label}</div>
              <div style={{
                fontSize: 32, fontWeight: 800, color: CORAL_TEXT,
                lineHeight: 1.1, marginBottom: 2,
                fontFamily: "'Poppins', sans-serif",
              }}>{formatDollar(value)}</div>
              <div style={{
                fontSize: 13, fontWeight: 500, color: CORAL_TEXT, opacity: 0.8,
                fontFamily: "'Montserrat', sans-serif",
              }}>typically missed</div>
            </div>
          ))}
        </div>

        {/* Breakdown card */}
        <div style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 14, overflow: "hidden",
          marginBottom: 16,
        }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 18px",
            borderBottom: "1px solid #f3f4f6",
          }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#111827", fontFamily: "'Poppins', sans-serif" }}>Mileage</div>
              <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 3, fontFamily: "'Montserrat', sans-serif" }}>
                ~{miles.toLocaleString()} mi/mo · $0.725/mi
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: NAVY, fontFamily: "'Poppins', sans-serif" }}>
                {formatDollar(mileageDeduction)}/mo
              </div>
              <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 2, fontFamily: "'Montserrat', sans-serif" }}>
                {formatDollar(mileageDeduction * 12)}/yr
              </div>
            </div>
          </div>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 18px",
          }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#111827", fontFamily: "'Poppins', sans-serif" }}>Business expenses</div>
              <div style={{ fontSize: 13, color: CYAN, marginTop: 3, fontFamily: "'Montserrat', sans-serif" }}>
                Parking, supplies, equipment
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: NAVY, fontFamily: "'Poppins', sans-serif" }}>
                {formatDollar(businessExpenses)}/mo
              </div>
              <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 2, fontFamily: "'Montserrat', sans-serif" }}>
                {formatDollar(businessExpenses * 12)}/yr
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <p style={{
          fontSize: 10, color: "#b0b0b0", textAlign: "center",
          lineHeight: 1.55, margin: "0 0 16px",
          padding: "0 4px",
          fontFamily: "'Montserrat', sans-serif",
        }}>
          Mileage estimated at 44 miles per $1,000 earned × $0.725/mile (2026 IRS standard rate). Business expenses estimated at 5% of income, based on IRS Schedule C averages for 1099 workers. These are estimates only. Bookd does not guarantee any specific tax savings or deduction outcomes. Individual results will vary.
        </p>
      </div>

      {/* Pinned CTA */}
      <div style={{
        padding: "12px 24px 36px",
        background: "#fff",
        boxSizing: "border-box",
      }}>
        <button style={{
          width: "100%",
          background: NAVY,
          border: "none",
          borderRadius: 100,
          padding: "14px 20px 12px",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
        }}>
          <span style={{
            fontSize: 16, fontWeight: 700, color: "#fff",
            fontFamily: "'Poppins', sans-serif",
          }}>Save more money with Bookd →</span>
          <span style={{
            fontSize: 11, color: "rgba(255,255,255,0.6)",
            fontFamily: "'Montserrat', sans-serif",
          }}>Set up Bookd and start keeping what you earned</span>
        </button>
      </div>

      <HomeIndicator />
    </div>
  );
}
