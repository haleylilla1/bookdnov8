const NAVY = "#03045e";
const CYAN = "#00b4d8";

export function AppStoreSlide5() {
  return (
    <div style={{
      width: 393, height: 852,
      background: NAVY,
      display: "flex", flexDirection: "column",
      fontFamily: "'Poppins', sans-serif",
      overflow: "hidden",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@700;800;900&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* ── TEXT SECTION ── */}
      <div style={{
        padding: "44px 28px 20px",
        display: "flex", flexDirection: "column", alignItems: "flex-start",
        flexShrink: 0,
      }}>
        <div style={{
          background: "rgba(0,180,216,0.15)",
          border: "1px solid rgba(0,180,216,0.4)",
          borderRadius: 20, padding: "4px 14px", marginBottom: 16,
        }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: CYAN, letterSpacing: "0.08em", fontFamily: "'Montserrat', sans-serif", textTransform: "uppercase" }}>
            Tax Reports
          </span>
        </div>

        <h1 style={{
          fontSize: 36, fontWeight: 900, color: "#fff",
          lineHeight: 1.12, margin: "0 0 12px",
          letterSpacing: "-0.8px",
        }}>
          Download your report —{" "}
          <span style={{ color: CYAN }}>walk into tax season prepared.</span>
        </h1>

        <p style={{
          fontSize: 14, color: "rgba(255,255,255,0.6)",
          lineHeight: 1.55, margin: "0 0 16px",
          fontFamily: "'Montserrat', sans-serif", fontWeight: 500,
        }}>
          One tap generates a complete income, mileage & deduction report — ready for your accountant or tax software.
        </p>

        {/* Stat row */}
        <div style={{ display: "flex", gap: 10, width: "100%" }}>
          {[
            { label: "Tax Estimate", value: "$2,116", sub: "Know before you file" },
            { label: "Total Deductions", value: "$1,301", sub: "Miles + expenses" },
          ].map((card) => (
            <div key={card.label} style={{
              flex: 1,
              background: "rgba(0,180,216,0.1)",
              border: "1px solid rgba(0,180,216,0.25)",
              borderRadius: 12, padding: "10px 12px",
            }}>
              <div style={{ fontSize: 10, color: CYAN, fontFamily: "'Montserrat', sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{card.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>{card.value}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'Montserrat', sans-serif", marginTop: 2 }}>{card.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SCREENSHOT SECTION ── */}
      <div style={{
        flex: 1,
        display: "flex", justifyContent: "center", alignItems: "flex-start",
        paddingTop: 8,
        background: "linear-gradient(to bottom, #03045e 0%, #020347 100%)",
        position: "relative",
      }}>
        <div style={{
          position: "absolute", top: "10%", left: "50%",
          transform: "translateX(-50%)",
          width: 260, height: 260, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(0,180,216,0.16) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <img
          src="/__mockup/ss_report_nobg.png"
          style={{
            width: "86%", height: "auto", display: "block",
            position: "relative", zIndex: 1,
            filter: "drop-shadow(0 8px 32px rgba(0,0,0,0.5))",
          }}
        />
      </div>
    </div>
  );
}
