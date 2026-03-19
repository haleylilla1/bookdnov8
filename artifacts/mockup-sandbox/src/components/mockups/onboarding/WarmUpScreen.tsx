import { useState } from "react";

const NAVY = "#03045E";
const AQUA = "#00B4D8";
const AQUA_BG = "#EAF9FF";

const options = [
  { id: "1w", label: "1 week after last day of work", sub: "Best for short gigs and quick turnarounds" },
  { id: "2w", label: "2 weeks after last day of work", sub: "Most popular. Worth checking in." },
  { id: "3w", label: "3 weeks after last day of work", sub: "Best for larger or longer-term contracts" },
];

export function WarmUpScreen() {
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
              transition: "width 0.3s",
            }} />
          );
        })}
      </div>

      {/* Scrollable Content */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "0 24px",
        paddingBottom: 16,
      }}>
        {/* Step label */}
        <p style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: AQUA,
          marginBottom: 10,
          marginTop: 4,
          fontFamily: "'Montserrat', sans-serif",
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
          marginBottom: 12,
          marginTop: 0,
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
          marginBottom: 20,
          marginTop: 0,
        }}>
          The data is clear — late and missing payments are the norm for independent workers.
        </p>

        {/* Stat Cards */}
        <div style={{ marginBottom: 10 }}>
          {/* Top row: two cards side by side */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            {/* Card 1 */}
            <div style={{
              backgroundColor: NAVY,
              borderRadius: 16,
              padding: "18px 16px",
            }}>
              <div style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 800,
                fontSize: 30,
                color: "#fff",
                marginBottom: 8,
                lineHeight: 1,
              }}>47%</div>
              <div style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.6)",
                lineHeight: 1.45,
              }}>
                of freelancers had a late or missing payment in their first 6 months
              </div>
            </div>

            {/* Card 2 */}
            <div style={{
              backgroundColor: NAVY,
              borderRadius: 16,
              padding: "18px 16px",
            }}>
              <div style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 800,
                fontSize: 30,
                color: "#fff",
                marginBottom: 8,
                lineHeight: 1,
              }}>1 in 5</div>
              <div style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.6)",
                lineHeight: 1.45,
              }}>
                contractors has at least one unpaid invoice at any given time
              </div>
            </div>
          </div>

          {/* Card 3 — full width, flex row */}
          <div style={{
            backgroundColor: NAVY,
            borderRadius: 16,
            padding: "18px 20px",
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}>
            <div style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 800,
              fontSize: 28,
              color: "#fff",
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}>37 - 42 days</div>
            <div style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.6)",
              lineHeight: 1.45,
            }}>
              is the average payment delay after invoice submission
            </div>
          </div>
        </div>

        {/* Source line */}
        <p style={{
          fontSize: 9,
          color: "#bbb",
          textAlign: "center",
          marginBottom: 20,
          marginTop: 10,
          lineHeight: 1.5,
        }}>
          Sources: Genius 2025 Freelance Report · Payoneer 2025 Global Freelancer Income Report · Freelancers Union
        </p>

        {/* Question */}
        <p style={{
          fontSize: 13,
          fontWeight: 700,
          color: NAVY,
          marginBottom: 12,
          marginTop: 0,
        }}>
          If a gig goes unpaid, when should we remind you?
        </p>

        {/* Option cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
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
                  padding: "14px 18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                }}
              >
                <div>
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
                {/* Circle check */}
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
                      <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* CTA Button — pinned to bottom */}
      <div style={{
        padding: "12px 24px 0",
        flexShrink: 0,
        background: "#fff",
      }}>
        <button style={{
          width: "100%",
          background: NAVY,
          borderRadius: 100,
          border: "none",
          padding: "16px 24px",
          cursor: "pointer",
          display: "block",
        }}>
          <div style={{
            fontSize: 15,
            fontWeight: 700,
            color: "#fff",
            fontFamily: "'Montserrat', sans-serif",
          }}>Set my reminder →</div>
          <div style={{
            fontSize: 10,
            color: "rgba(255,255,255,0.6)",
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
