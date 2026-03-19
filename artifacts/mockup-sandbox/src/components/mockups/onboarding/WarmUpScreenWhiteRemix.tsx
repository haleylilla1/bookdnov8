import { useState } from "react";

const NAVY = "#03045E";
const AQUA = "#00B4D8";
const EMERALD = "#10B981";

const CARD_BG = "rgba(3,4,94,0.04)";
const CARD_BORDER = "rgba(3,4,94,0.08)";

const options = [
  { id: "1w", label: "1 week after last day of work", sub: "Best for short gigs and quick turnarounds" },
  { id: "2w", label: "2 weeks after last day of work", sub: "Most popular. Worth checking in." },
  { id: "3w", label: "3 weeks after last day of work", sub: "Best for larger or longer-term contracts" },
];

export function WarmUpScreenWhiteRemix() {
  const [selected, setSelected] = useState("2w");

  return (
    <div style={{
      width: 390,
      height: 844,
      background: "#fff",
      display: "flex",
      flexDirection: "column",
      fontFamily: "'Montserrat', sans-serif",
      overflow: "hidden",
      position: "relative",
    }}>

      {/* Progress Dots */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingTop: 20,
        paddingBottom: 16,
        flexShrink: 0,
      }}>
        {[1,2,3,4,5,6].map((dot) => {
          const isActive = dot === 5;
          const isEmpty = dot === 6;
          return (
            <div key={dot} style={{
              height: 5,
              width: isActive ? 24 : 5,
              borderRadius: 100,
              backgroundColor: isEmpty ? "#E8EBF0" : AQUA,
              opacity: isActive ? 1 : isEmpty ? 1 : 0.4,
            }} />
          );
        })}
      </div>

      {/* Scrollable Content */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "0 22px",
        paddingBottom: 8,
      }}>

        {/* Step label */}
        <p style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: AQUA,
          margin: "0 0 10px",
        }}>
          Don't Let Them Forget You
        </p>

        {/* Headline */}
        <h1 style={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 800,
          fontSize: 24,
          color: NAVY,
          lineHeight: 1.25,
          margin: "0 0 10px",
        }}>
          Getting paid is{" "}
          <span style={{ color: AQUA }}>harder</span>
          {" "}than doing the work
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: 13,
          color: "#6B7280",
          lineHeight: 1.55,
          margin: "0 0 20px",
        }}>
          Late and missing payments are the norm for independent workers.
        </p>

        {/* ── HERO STAT ── full-width editorial card */}
        <div style={{
          background: CARD_BG,
          border: `1px solid ${CARD_BORDER}`,
          borderRadius: 20,
          padding: "20px 22px",
          marginBottom: 10,
          display: "flex",
          alignItems: "center",
          gap: 18,
        }}>
          {/* Giant number */}
          <div style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 900,
            fontSize: 64,
            color: AQUA,
            lineHeight: 1,
            flexShrink: 0,
            letterSpacing: "-2px",
          }}>47%</div>
          <div>
            <div style={{
              fontSize: 13,
              fontWeight: 700,
              color: NAVY,
              lineHeight: 1.35,
              marginBottom: 4,
            }}>had a late or missing payment</div>
            <div style={{
              fontSize: 11,
              color: "#9CA3AF",
              lineHeight: 1.4,
            }}>in their first 6 months of freelancing</div>
          </div>
        </div>

        {/* ── TWO SMALLER CARDS ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>

          {/* Card: 1 in 5 */}
          <div style={{
            background: CARD_BG,
            border: `1px solid ${CARD_BORDER}`,
            borderRadius: 16,
            padding: "16px 16px",
          }}>
            <div style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 800,
              fontSize: 26,
              color: NAVY,
              lineHeight: 1,
              marginBottom: 8,
            }}>1 in 5</div>
            <div style={{ fontSize: 11, color: "#9CA3AF", lineHeight: 1.45 }}>
              contractors has an unpaid invoice right now
            </div>
          </div>

          {/* Card: 37–42 days — emerald accent */}
          <div style={{
            background: "rgba(16,185,129,0.06)",
            border: "1px solid rgba(16,185,129,0.18)",
            borderRadius: 16,
            padding: "16px 16px",
          }}>
            <div style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 800,
              fontSize: 22,
              color: EMERALD,
              lineHeight: 1.1,
              marginBottom: 8,
            }}>37–42<br/>days</div>
            <div style={{ fontSize: 11, color: "#9CA3AF", lineHeight: 1.45 }}>
              avg delay after invoice submission
            </div>
          </div>
        </div>

        {/* Sources */}
        <p style={{
          fontSize: 9,
          color: "#C4C9D4",
          textAlign: "center",
          lineHeight: 1.5,
          margin: "8px 0 18px",
        }}>
          Sources: Genius 2025 Freelance Report · Payoneer 2025 Global Freelancer Income Report · Freelancers Union
        </p>

        {/* Divider */}
        <div style={{ height: 1, background: "#F0F2F7", marginBottom: 18 }} />

        {/* Question */}
        <p style={{
          fontSize: 13,
          fontWeight: 700,
          color: NAVY,
          margin: "0 0 12px",
        }}>
          If a gig goes unpaid, when should we remind you?
        </p>

        {/* Option Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
          {options.map((opt) => {
            const isSelected = selected === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setSelected(opt.id)}
                style={{
                  background: isSelected ? "rgba(0,180,216,0.07)" : CARD_BG,
                  border: `1.5px solid ${isSelected ? AQUA : CARD_BORDER}`,
                  borderRadius: 14,
                  padding: "13px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: NAVY,
                    marginBottom: 3,
                    fontFamily: "'Montserrat', sans-serif",
                  }}>{opt.label}</div>
                  <div style={{
                    fontSize: 11,
                    color: "#9CA3AF",
                    fontFamily: "'Montserrat', sans-serif",
                  }}>{opt.sub}</div>
                </div>
                {/* Check circle */}
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  border: `2px solid ${isSelected ? AQUA : "#D1D5DB"}`,
                  backgroundColor: isSelected ? AQUA : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginLeft: 12,
                }}>
                  {isSelected && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* CTA — pinned bottom */}
      <div style={{
        padding: "10px 22px 0",
        flexShrink: 0,
        background: "#fff",
      }}>
        <button style={{
          width: "100%",
          background: NAVY,
          borderRadius: 100,
          border: "none",
          padding: "13px 24px",
          cursor: "pointer",
          display: "block",
          boxSizing: "border-box",
        }}>
          <div style={{
            fontSize: 15,
            fontWeight: 700,
            color: "#fff",
            fontFamily: "'Montserrat', sans-serif",
            lineHeight: 1.3,
          }}>Set my reminder →</div>
          <div style={{
            fontSize: 10,
            color: "rgba(255,255,255,0.55)",
            marginTop: 3,
            fontFamily: "'Montserrat', sans-serif",
          }}>We only notify you when it matters — no spam, ever</div>
        </button>

        {/* Home indicator */}
        <div style={{
          width: 134,
          height: 5,
          background: "#1a1a2e",
          borderRadius: 3,
          margin: "8px auto 0",
        }} />
      </div>
    </div>
  );
}
