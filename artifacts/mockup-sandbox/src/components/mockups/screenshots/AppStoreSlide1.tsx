const NAVY = "#03045e";
const CYAN = "#00b4d8";

const WORKER_TYPES = [
  "independent contractors.",
  "1099 workers.",
  "freelancers.",
  "gig workers.",
];

const CYCLE_DURATION = 12;
const WORD_DURATION = CYCLE_DURATION / WORKER_TYPES.length;

export function AppStoreSlide1() {
  return (
    <div style={{
      width: 393, height: 852,
      background: NAVY,
      display: "flex", flexDirection: "column",
      fontFamily: "'Poppins', sans-serif",
      overflow: "hidden",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes cycleWord {
          0%   { opacity: 0; transform: translateY(28px); }
          8%   { opacity: 1; transform: translateY(0); }
          24%  { opacity: 1; transform: translateY(0); }
          32%  { opacity: 0; transform: translateY(-28px); }
          100% { opacity: 0; transform: translateY(28px); }
        }
      `}</style>

      {/* TOP TEXT */}
      <div style={{ padding: "36px 28px 0", flexShrink: 0 }}>
        <h1 style={{
          fontSize: 42, fontWeight: 900, color: "#fff",
          lineHeight: 1.08, margin: 0, letterSpacing: "-1.2px",
        }}>
          Finances for
        </h1>
        <div style={{
          height: 52, overflow: "hidden",
          position: "relative", marginTop: 2,
        }}>
          {WORKER_TYPES.map((type, i) => (
            <span key={type} style={{
              position: "absolute", left: 0, top: 0,
              fontSize: 42, fontWeight: 900,
              color: CYAN, letterSpacing: "-1.2px",
              lineHeight: 1.08,
              opacity: 0,
              animation: `cycleWord ${CYCLE_DURATION}s ${i * WORD_DURATION}s infinite`,
              whiteSpace: "nowrap",
            }}>
              {type}
            </span>
          ))}
        </div>
      </div>

      {/* PHONE — fills remaining space */}
      <div style={{
        flex: 1,
        display: "flex", justifyContent: "center", alignItems: "flex-start",
        paddingTop: 12, position: "relative",
      }}>
        <div style={{
          position: "absolute", top: "6%", left: "50%",
          transform: "translateX(-50%)",
          width: 340, height: 340, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(0,180,216,0.22) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <img
          src="/__mockup/ss_dashboard_nobg.png"
          style={{
            width: "100%", height: "auto", display: "block",
            position: "relative", zIndex: 1,
            filter: "drop-shadow(0 16px 48px rgba(0,0,0,0.65))",
          }}
        />
      </div>

      {/* LOGO */}
      <div style={{ flexShrink: 0, padding: "0 28px 24px" }}>
        <img
          src="/__mockup/bookd-logo.png"
          style={{ width: 48, height: 48, borderRadius: 10, display: "block" }}
        />
      </div>
    </div>
  );
}
