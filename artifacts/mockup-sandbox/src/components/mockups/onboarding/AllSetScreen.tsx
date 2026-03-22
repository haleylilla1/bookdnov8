const NAVY = "#03045e";
const CYAN = "#00b4d8";

function Sparkle({ size = 16, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <path d="M12 2L13.5 9.5L21 12L13.5 14.5L12 22L10.5 14.5L3 12L10.5 9.5L12 2Z" fill={CYAN} opacity={0.6} />
    </svg>
  );
}

export default function AllSetScreen() {
  return (
    <div style={{
      width: "100%", height: "100%",
      backgroundColor: "rgba(0,0,0,0.82)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "32px", boxSizing: "border-box",
      fontFamily: "'Montserrat', sans-serif",
    }}>
      <div style={{
        backgroundColor: NAVY,
        borderRadius: "24px",
        border: `2.5px solid ${CYAN}`,
        padding: "32px 28px",
        textAlign: "center",
        maxWidth: "340px",
        width: "100%",
      }}>
        {/* Icon row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "20px" }}>
          <Sparkle size={16} style={{ opacity: 0.6, marginTop: "10px" }} />
          <div style={{
            width: "64px", height: "64px", borderRadius: "50%",
            backgroundColor: CYAN,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 24px rgba(0,180,216,0.5)",
            flexShrink: 0,
          }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <Sparkle size={16} style={{ opacity: 0.6, marginBottom: "10px" }} />
        </div>

        {/* Title */}
        <div style={{ fontSize: "22px", fontWeight: 800, color: "#ffffff", marginBottom: "14px", lineHeight: 1.25, fontFamily: "'Poppins', sans-serif" }}>
          You're all set!
        </div>

        {/* Body */}
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.75)", lineHeight: 1.65, marginBottom: "10px", margin: "0 0 10px" }}>
          Bookd will track every gig, every payment, and every dollar you're owed — so you can stay focused on the work you love.
        </p>

        {/* Signature */}
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", marginBottom: "28px", fontStyle: "italic", margin: "0 0 28px" }}>
          Thanks for supporting this app. — Haley
        </p>

        {/* CTA */}
        <button style={{
          width: "100%",
          backgroundColor: CYAN,
          color: "#ffffff",
          border: "none",
          borderRadius: "100px",
          padding: "16px",
          fontSize: "16px",
          fontWeight: 700,
          cursor: "pointer",
          fontFamily: "'Poppins', sans-serif",
        }}>
          Add your first gig →
        </button>
      </div>
    </div>
  );
}
