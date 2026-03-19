import { useState } from "react";

const NAVY = "#03045E";
const AQUA = "#00B4D8";
const EMERALD = "#10B981";

const options = [
  { id: "1w", label: "1 week after last day of work", sub: "Best for short gigs and quick turnarounds" },
  { id: "2w", label: "2 weeks after last day of work", sub: "Most popular. Worth checking in." },
  { id: "3w", label: "3 weeks after last day of work", sub: "Best for larger or longer-term contracts" },
];

export function WarmUpScreenBookd() {
  const [selected, setSelected] = useState("2w");

  return (
    <div style={{
      width: 390,
      height: 844,
      background: NAVY,
      display: "flex",
      flexDirection: "column",
      fontFamily: "'Montserrat', sans-serif",
      overflow: "hidden",
      position: "relative",
    }}>

      {/* Subtle radial glow top-right */}
      <div style={{
        position: "absolute",
        top: -80,
        right: -80,
        width: 260,
        height: 260,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,180,216,0.18) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

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
              backgroundColor: isEmpty ? "rgba(255,255,255,0.15)" : AQUA,
              opacity: isActive ? 1 : isEmpty ? 1 : 0.35,
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
          fontFamily: "'Montserrat', sans-serif",
        }}>
          Don't Let Them Forget You
        </p>

        {/* Headline */}
        <h1 style={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 800,
          fontSize: 24,
          color: "#fff",
          lineHeight: 1.25,
          margin: "0 0 12px",
        }}>
          Getting paid is{" "}
          <span style={{ color: AQUA }}>harder</span>
          {" "}than doing the work
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: 13,
          color: "rgba(255,255,255,0.55)",
          lineHeight: 1.55,
          margin: "0 0 20px",
        }}>
          Late and missing payments are the norm for independent workers. The data speaks for itself.
        </p>

        {/* Stat Cards — white/glass on navy */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>

          {/* Card 1 */}
          <div style={{
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 16,
            padding: "18px 16px",
          }}>
            <div style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 800,
              fontSize: 32,
              color: AQUA,
              lineHeight: 1,
              marginBottom: 10,
            }}>47%</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", lineHeight: 1.45 }}>
              of freelancers had a late or missing payment in their first 6 months
            </div>
          </div>

          {/* Card 2 */}
          <div style={{
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 16,
            padding: "18px 16px",
          }}>
            <div style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 800,
              fontSize: 32,
              color: AQUA,
              lineHeight: 1,
              marginBottom: 10,
            }}>1 in 5</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", lineHeight: 1.45 }}>
              contractors has at least one unpaid invoice at any given time
            </div>
          </div>
        </div>

        {/* Full-width card */}
        <div style={{
          background: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 16,
          padding: "18px 20px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 10,
        }}>
          <div style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 800,
            fontSize: 26,
            color: EMERALD,
            flexShrink: 0,
            whiteSpace: "nowrap",
            lineHeight: 1.1,
          }}>37–42<br/>days</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
            average payment delay after invoice submission
          </div>
        </div>

        {/* Sources */}
        <p style={{
          fontSize: 9,
          color: "rgba(255,255,255,0.25)",
          textAlign: "center",
          lineHeight: 1.5,
          margin: "10px 0 20px",
        }}>
          Sources: Genius 2025 Freelance Report · Payoneer 2025 Global Freelancer Income Report · Freelancers Union
        </p>

        {/* Divider */}
        <div style={{
          height: 1,
          background: "rgba(255,255,255,0.1)",
          marginBottom: 20,
        }} />

        {/* Question */}
        <p style={{
          fontSize: 13,
          fontWeight: 700,
          color: "#fff",
          margin: "0 0 12px",
          fontFamily: "'Montserrat', sans-serif",
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
                  background: isSelected ? "rgba(0,180,216,0.15)" : "rgba(255,255,255,0.05)",
                  border: `1.5px solid ${isSelected ? AQUA : "rgba(255,255,255,0.1)"}`,
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
                    color: isSelected ? "#fff" : "rgba(255,255,255,0.8)",
                    marginBottom: 3,
                    fontFamily: "'Montserrat', sans-serif",
                  }}>{opt.label}</div>
                  <div style={{
                    fontSize: 11,
                    color: isSelected ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.35)",
                    fontFamily: "'Montserrat', sans-serif",
                  }}>{opt.sub}</div>
                </div>
                {/* Check circle */}
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  border: `2px solid ${isSelected ? AQUA : "rgba(255,255,255,0.2)"}`,
                  backgroundColor: isSelected ? AQUA : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginLeft: 12,
                }}>
                  {isSelected && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke={NAVY} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* CTA — pinned to bottom */}
      <div style={{
        padding: "10px 22px 0",
        flexShrink: 0,
        background: NAVY,
      }}>
        <button style={{
          width: "100%",
          background: AQUA,
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
            color: NAVY,
            fontFamily: "'Montserrat', sans-serif",
            lineHeight: 1.3,
          }}>Set my reminder →</div>
          <div style={{
            fontSize: 10,
            color: "rgba(3,4,94,0.55)",
            marginTop: 3,
            fontFamily: "'Montserrat', sans-serif",
          }}>We only notify you when it matters — no spam, ever</div>
        </button>

        {/* Home indicator */}
        <div style={{
          width: 134,
          height: 5,
          background: "rgba(255,255,255,0.15)",
          borderRadius: 3,
          margin: "8px auto 0",
        }} />
      </div>
    </div>
  );
}
