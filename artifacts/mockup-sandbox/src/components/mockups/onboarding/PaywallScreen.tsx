import { useState } from "react";

const NAVY = "#03045e";
const CYAN = "#00b4d8";

function HomeIndicator() {
  return (
    <div style={{
      position: "absolute", bottom: 10, left: "50%",
      transform: "translateX(-50%)",
      width: 134, height: 5, background: "#1a1a2e", borderRadius: 3,
    }} />
  );
}

const CHECK_ITEMS = [
  "Automatic mileage tracking",
  "Income & expense logging",
  "Tax estimate calculator",
  "Downloadable 1099 report",
];

export function PaywallScreen() {
  const [plan, setPlan] = useState<"annual" | "monthly">("annual");

  const price = plan === "annual" ? "$40/year" : "$4/month";
  const billingNote = plan === "annual" ? "Just $3.33/mo — billed annually" : "Billed every month";
  const chargeLabel = plan === "annual" ? "$40 charged after trial" : "$4 charged after trial";

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
      `}</style>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "48px 24px 20px", boxSizing: "border-box" }}>

        {/* Header */}
        <p style={{
          fontSize: 11, fontWeight: 700, color: CYAN,
          textTransform: "uppercase", letterSpacing: "0.09em",
          margin: "0 0 8px", fontFamily: "'Montserrat', sans-serif",
        }}>7 Days Free</p>

        <h1 style={{
          fontFamily: "'Poppins', sans-serif", fontWeight: 800,
          fontSize: 26, color: NAVY, lineHeight: 1.2, margin: "0 0 6px",
        }}>
          Start keeping more of{" "}
          <span style={{ color: CYAN }}>what you earned.</span>
        </h1>

        <p style={{
          fontSize: 13, color: "#6b7280", lineHeight: 1.5,
          margin: "0 0 22px", fontFamily: "'Montserrat', sans-serif",
        }}>
          No charge today. Cancel anytime before your trial ends.
        </p>

        {/* Vertical trial timeline */}
        <div style={{
          background: "#f8fafc", border: "1px solid #e5e7eb",
          borderRadius: 16, padding: "18px 18px 14px",
          marginBottom: 20,
        }}>
          <p style={{
            fontSize: 11, fontWeight: 700, color: "#9ca3af",
            textTransform: "uppercase", letterSpacing: "0.08em",
            margin: "0 0 16px", fontFamily: "'Montserrat', sans-serif",
          }}>What happens next</p>

          {[
            { day: "Today", dot: CYAN,      title: "Free trial begins",    sub: "Full access, nothing charged.",           last: false },
            { day: "Day 6", dot: "#9ca3af", title: "Reminder email",       sub: "We'll remind you before your trial ends.", last: false },
            { day: "Day 7", dot: NAVY,      title: "Subscription starts",  sub: chargeLabel,                                last: true  },
          ].map(({ day, dot, title, sub, last }) => (
            <div key={day} style={{ display: "flex", gap: 14 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 20, flexShrink: 0 }}>
                <div style={{
                  width: 12, height: 12, borderRadius: "50%",
                  background: dot, flexShrink: 0, marginTop: 2,
                  boxShadow: dot === CYAN ? "0 0 0 3px rgba(0,180,216,0.2)" : "none",
                }} />
                {!last && <div style={{ width: 2, flex: 1, background: "#e5e7eb", margin: "4px 0" }} />}
              </div>
              <div style={{ paddingBottom: last ? 0 : 16 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 2 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    color: dot === CYAN ? CYAN : dot === NAVY ? NAVY : "#9ca3af",
                    fontFamily: "'Montserrat', sans-serif",
                    textTransform: "uppercase", letterSpacing: "0.07em",
                  }}>{day}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#111827", fontFamily: "'Poppins', sans-serif" }}>{title}</span>
                </div>
                <p style={{ fontSize: 12, color: "#9ca3af", margin: 0, fontFamily: "'Montserrat', sans-serif", lineHeight: 1.4 }}>{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Plan cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>

          {/* Annual — recommended */}
          <div
            onClick={() => setPlan("annual")}
            style={{
              borderRadius: 16,
              border: plan === "annual" ? "2px solid transparent" : "2px solid #e5e7eb",
              background: plan === "annual" ? NAVY : "#fafafa",
              padding: "16px 18px",
              cursor: "pointer",
              position: "relative",
              transition: "all 0.2s ease",
            }}
          >
            {/* Best value badge */}
            <div style={{
              position: "absolute", top: -11, left: 18,
              background: CYAN, borderRadius: 100,
              padding: "3px 12px",
              fontSize: 10, fontWeight: 700, color: "#fff",
              fontFamily: "'Montserrat', sans-serif",
              letterSpacing: "0.06em", textTransform: "uppercase",
            }}>Best Value — Save 17%</div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{
                  fontSize: 15, fontWeight: 700,
                  color: plan === "annual" ? "#fff" : NAVY,
                  fontFamily: "'Poppins', sans-serif", marginBottom: 3,
                }}>Annual</div>
                <div style={{
                  fontSize: 12,
                  color: plan === "annual" ? "rgba(255,255,255,0.6)" : "#9ca3af",
                  fontFamily: "'Montserrat', sans-serif",
                }}>{plan === "annual" ? "Just $3.33/mo · billed annually" : "$3.33/mo · billed annually"}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{
                    fontSize: 22, fontWeight: 800,
                    color: plan === "annual" ? "#fff" : NAVY,
                    fontFamily: "'Poppins', sans-serif", lineHeight: 1,
                  }}>$40</div>
                  <div style={{
                    fontSize: 11,
                    color: plan === "annual" ? "rgba(255,255,255,0.5)" : "#9ca3af",
                    fontFamily: "'Montserrat', sans-serif",
                  }}>/year</div>
                </div>
                {/* Radio */}
                <div style={{
                  width: 20, height: 20, borderRadius: "50%",
                  border: `2px solid ${plan === "annual" ? CYAN : "#d1d5db"}`,
                  background: plan === "annual" ? CYAN : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  {plan === "annual" && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
                </div>
              </div>
            </div>
          </div>

          {/* Monthly */}
          <div
            onClick={() => setPlan("monthly")}
            style={{
              borderRadius: 16,
              border: plan === "monthly" ? `2px solid ${NAVY}` : "2px solid #e5e7eb",
              background: plan === "monthly" ? "#f0f4ff" : "#fafafa",
              padding: "16px 18px",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{
                  fontSize: 15, fontWeight: 700, color: NAVY,
                  fontFamily: "'Poppins', sans-serif", marginBottom: 3,
                }}>Monthly</div>
                <div style={{
                  fontSize: 12, color: "#9ca3af",
                  fontFamily: "'Montserrat', sans-serif",
                }}>Billed every month</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{
                    fontSize: 22, fontWeight: 800, color: NAVY,
                    fontFamily: "'Poppins', sans-serif", lineHeight: 1,
                  }}>$4</div>
                  <div style={{
                    fontSize: 11, color: "#9ca3af",
                    fontFamily: "'Montserrat', sans-serif",
                  }}>/month</div>
                </div>
                <div style={{
                  width: 20, height: 20, borderRadius: "50%",
                  border: `2px solid ${plan === "monthly" ? NAVY : "#d1d5db"}`,
                  background: plan === "monthly" ? NAVY : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  {plan === "monthly" && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature list */}
        <div style={{ marginBottom: 20 }}>
          {CHECK_ITEMS.map((item) => (
            <div key={item} style={{
              display: "flex", alignItems: "center", gap: 10,
              marginBottom: 8,
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: "50%",
                background: "#E8FAF7",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                  <path d="M1 4.5L4 7.5L10 1" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span style={{ fontSize: 13, color: "#374151", fontFamily: "'Montserrat', sans-serif" }}>{item}</span>
            </div>
          ))}
        </div>

        <p style={{
          fontSize: 10, color: "#b0b0b0", textAlign: "center",
          lineHeight: 1.55, margin: "0 0 6px",
          fontFamily: "'Montserrat', sans-serif",
        }}>
          Cancel anytime in app settings or by emailing support. {billingNote}. Subscription auto-renews unless cancelled.
        </p>
      </div>

      {/* Pinned CTA */}
      <div style={{ padding: "10px 24px 36px", background: "#fff", boxSizing: "border-box" }}>
        <button style={{
          width: "100%", background: NAVY, border: "none",
          borderRadius: 100, padding: "14px 20px 12px",
          cursor: "pointer", display: "flex",
          flexDirection: "column", alignItems: "center", gap: 3,
        }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#fff", fontFamily: "'Poppins', sans-serif" }}>
            Start 7-Day Free Trial →
          </span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontFamily: "'Montserrat', sans-serif" }}>
            {price} after trial · cancel anytime
          </span>
        </button>

        <p style={{
          textAlign: "center", fontSize: 11, color: "#9ca3af",
          margin: "10px 0 0", fontFamily: "'Montserrat', sans-serif",
        }}>
          No charge today
        </p>
      </div>

      <HomeIndicator />
    </div>
  );
}
