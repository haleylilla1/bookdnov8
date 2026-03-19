const NAVY = "#03045e";
const CYAN = "#00b4d8";

export function AppStoreSlide5() {
  return (
    <div style={{
      width: 393, height: 852,
      background: `radial-gradient(ellipse at 50% 25%, #05077a 0%, ${NAVY} 70%)`,
      display: "flex", flexDirection: "column", alignItems: "center",
      position: "relative", overflow: "hidden",
      fontFamily: "'Poppins', sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@700;800;900&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div style={{ position: "absolute", top: -80, right: -60, width: 280, height: 280, borderRadius: "50%", background: "rgba(0,180,216,0.07)" }} />
      <div style={{ position: "absolute", top: 100, left: -80, width: 200, height: 200, borderRadius: "50%", background: "rgba(0,180,216,0.05)" }} />

      <div style={{ paddingTop: 52, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px" }}>bookd</span>
        <span style={{ fontSize: 22, fontWeight: 900, color: CYAN }}>✓</span>
      </div>

      <div style={{ padding: "24px 28px 0", textAlign: "center" }}>
        <div style={{
          display: "inline-block", background: "rgba(0,180,216,0.15)",
          border: `1px solid rgba(0,180,216,0.35)`,
          borderRadius: 20, padding: "5px 16px", marginBottom: 18,
        }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: CYAN, letterSpacing: "0.08em", fontFamily: "'Montserrat', sans-serif", textTransform: "uppercase" }}>
            Tax Reports
          </span>
        </div>

        <h1 style={{
          fontSize: 40, fontWeight: 900, color: "#fff",
          lineHeight: 1.1, margin: "0 0 16px",
          letterSpacing: "-1px",
        }}>
          Tax time,{" "}
          <span style={{ color: CYAN }}>handled.</span>
        </h1>

        <p style={{
          fontSize: 15, color: "rgba(255,255,255,0.7)", lineHeight: 1.55,
          margin: "0 0 20px", fontFamily: "'Montserrat', sans-serif", fontWeight: 500,
        }}>
          Download a complete income & deduction report — ready for your accountant or tax software.
        </p>

        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          {[
            { label: "Tax Estimate", value: "$2,116", sub: "Estimated liability" },
            { label: "Deductions", value: "$1,301", sub: "Miles + expenses" },
          ].map((card) => (
            <div key={card.label} style={{
              flex: 1, background: "rgba(0,180,216,0.1)",
              border: "1px solid rgba(0,180,216,0.25)",
              borderRadius: 14, padding: "14px 12px", textAlign: "center",
            }}>
              <div style={{ fontSize: 11, color: CYAN, fontFamily: "'Montserrat', sans-serif", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>{card.label}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>{card.value}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontFamily: "'Montserrat', sans-serif", marginTop: 4 }}>{card.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 330 }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 80,
          background: `linear-gradient(to bottom, ${NAVY}, transparent)`, zIndex: 1,
        }} />
        <img src="/__mockup/ss_report.png" style={{ width: "100%", display: "block" }} />
      </div>
    </div>
  );
}
