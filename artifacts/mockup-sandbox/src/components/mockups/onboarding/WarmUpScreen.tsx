import { useState } from "react";

const NAVY = "#03045E";
const AQUA = "#00B4D8";
const AQUA_BG = "#EAF9FF";
const EMERALD = "#10B981";
const GLASS_BG = "rgba(3,4,94,0.04)";
const GLASS_BORDER = "rgba(3,4,94,0.09)";

const options = [
  { id: "2w", label: "2 weeks after last day of work", sub: "Good for shorter gigs and quick turnarounds" },
  { id: "3w", label: "3 weeks after last day of work", sub: "Most popular. Gives clients time to process." },
  { id: "4w", label: "4 weeks after last day of work", sub: "Best for larger or longer-term contracts" },
];

export function WarmUpScreen() {
  const [selected, setSelected] = useState("3w");

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
      {/* Progress Dots — fixed at top */}
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
              height: 6,
              width: isActive ? 24 : 6,
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
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: AQUA,
          margin: "0 0 10px",
          fontFamily: "'Montserrat', sans-serif",
        }}>
          Don't Let Them Forget You
        </p>

        {/* Headline — Poppins 800 */}
        <h1 style={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 800,
          fontSize: 24,
          color: NAVY,
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
          color: "#555",
          lineHeight: 1.55,
          margin: "0 0 18px",
        }}>The data is clear. Late and missing payments are the norm for independent workers.</p>

        {/* Stat Cards */}
        {/* Top row: two side by side */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
          <div style={{
            backgroundColor: "#fff",
            border: `1.5px solid ${AQUA}`,
            borderRadius: 16,
            padding: "16px 14px",
            boxShadow: "0 2px 10px rgba(0,180,216,0.1)",
          }}>
            <div style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 800,
              fontSize: 32,
              color: NAVY,
              lineHeight: 1,
              marginBottom: 8,
            }}>47%</div>
            <div style={{ fontSize: 11, color: "#4B5563", lineHeight: 1.5 }}>
              of freelancers had a late or missing payment in their first 6 months
            </div>
          </div>

          <div style={{
            backgroundColor: "#fff",
            border: `1.5px solid ${AQUA}`,
            borderRadius: 16,
            padding: "16px 14px",
            boxShadow: "0 2px 10px rgba(0,180,216,0.1)",
          }}>
            <div style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 800,
              fontSize: 32,
              color: NAVY,
              lineHeight: 1,
              marginBottom: 8,
            }}>1 in 5</div>
            <div style={{ fontSize: 11, color: "#4B5563", lineHeight: 1.5 }}>
              contractors has at least one unpaid invoice at any given time
            </div>
          </div>
        </div>

        {/* Full-width card — flex row */}
        <div style={{
          backgroundColor: "#fff",
          border: `1.5px solid ${AQUA}`,
          borderRadius: 16,
          padding: "16px 18px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 10,
          boxShadow: "0 2px 10px rgba(0,180,216,0.1)",
        }}>
          <div style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 800,
            fontSize: 26,
            color: NAVY,
            flexShrink: 0,
            whiteSpace: "nowrap",
          }}>37–42 days</div>
          <div style={{ fontSize: 12, color: "#4B5563", lineHeight: 1.5 }}>
            average payment delay after invoice submission
          </div>
        </div>

        {/* Sources */}
        <p style={{
          fontSize: 9,
          color: "#bbb",
          textAlign: "center",
          lineHeight: 1.5,
          margin: "10px 0 18px",
        }}>
          Sources: Genius 2025 Freelance Report · Payoneer 2025 Global Freelancer Income Report · Freelancers Union
        </p>

        {/* Question */}
        <p style={{
          fontSize: 13,
          fontWeight: 700,
          color: NAVY,
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
                  background: isSelected ? AQUA_BG : "#fff",
                  border: `1.5px solid ${isSelected ? AQUA : "#E8EBF0"}`,
                  borderRadius: 14,
                  padding: "14px 16px",
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
                    fontSize: 14,
                    fontWeight: 700,
                    color: NAVY,
                    marginBottom: 3,
                    fontFamily: "'Montserrat', sans-serif",
                  }}>{opt.label}</div>
                  <div style={{
                    fontSize: 11,
                    color: "#8A93A8",
                    fontFamily: "'Montserrat', sans-serif",
                  }}>{opt.sub}</div>
                </div>
                {/* Check circle */}
                <div style={{
                  width: 26,
                  height: 26,
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
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <path d="M2.5 6.5l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
      {/* CTA Button — pinned to bottom, never scrolls */}
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
            color: "rgba(255,255,255,0.6)",
            marginTop: 3,
            fontFamily: "'Montserrat', sans-serif",
          }}>We only notify you when it matters. No spam, ever.</div>
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
