import { useState } from "react";

const NAVY = "#03045e";
const CYAN = "#00b4d8";

const GOAL_OPTIONS = [
  {
    id: "income",
    label: "Track income & expenses",
    sub: "Know exactly what I'm making after every gig",
  },
  {
    id: "taxes",
    label: "Maximize my tax deductions",
    sub: "Keep more of what I earn — legally",
  },
  {
    id: "paid",
    label: "Get paid on time",
    sub: "Stop chasing clients for money I've already earned",
  },
  {
    id: "mileage",
    label: "Track business mileage",
    sub: "Never miss a deductible mile or drive",
  },
  {
    id: "season",
    label: "Prepare for tax season",
    sub: "Stay organized all year so April isn't a nightmare",
  },
  {
    id: "clarity",
    label: "Understand my true earnings",
    sub: "See net income after expenses, taxes, and miles",
  },
];

function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div style={{ display: "flex", gap: "6px", justifyContent: "center", marginBottom: "24px" }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: i === current ? "24px" : "8px",
          height: "8px",
          borderRadius: "4px",
          backgroundColor: i < current ? "rgba(0,180,216,0.4)" : i === current ? CYAN : "#e5e7eb",
          transition: "all 0.3s ease",
        }} />
      ))}
    </div>
  );
}

export function GoalsScreen() {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const isReady = selected.size > 0;

  return (
    <div style={{
      position: "relative",
      width: 393, height: 852, borderRadius: 55, overflow: "hidden",
      background: "#ffffff",
      display: "flex", flexDirection: "column",
      paddingTop: "env(safe-area-inset-top, 0px)",
      fontFamily: "'Montserrat', sans-serif",
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@700;800&family=Montserrat:wght@400;500;600;700&display=swap');`}</style>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto", overscrollBehavior: "none", padding: "56px 22px 8px", maxWidth: "390px", width: "100%", margin: "0 auto", boxSizing: "border-box" }}>

        <ProgressDots total={7} current={6} />

        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: CYAN, margin: "0 0 10px" }}>
          Your Goals
        </p>

        <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: 24, color: NAVY, lineHeight: 1.25, margin: "0 0 10px" }}>
          What do you want{" "}
          <span style={{ color: CYAN }}>to improve</span>
          {" "}most?
        </h1>

        <p style={{ fontSize: 13, color: "#555", lineHeight: 1.55, margin: "0 0 18px" }}>
          Pick everything that applies — we'll make sure Bookd works for <em>your</em> situation.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
          {GOAL_OPTIONS.map((opt) => {
            const isOn = selected.has(opt.id);
            return (
              <button
                key={opt.id}
                onClick={() => toggle(opt.id)}
                style={{
                  background: isOn ? "#EAF9FF" : "#fff",
                  border: `1.5px solid ${isOn ? CYAN : "#E8EBF0"}`,
                  borderRadius: 14, padding: "14px 16px",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  cursor: "pointer", textAlign: "left", width: "100%", boxSizing: "border-box",
                  transition: "background 0.15s, border-color 0.15s",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 3 }}>{opt.label}</div>
                  <div style={{ fontSize: 11, color: "#8A93A8" }}>{opt.sub}</div>
                </div>
                <div style={{
                  width: 26, height: 26, borderRadius: 6,
                  border: `2px solid ${isOn ? CYAN : "#D1D5DB"}`,
                  backgroundColor: isOn ? CYAN : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, marginLeft: 12,
                  transition: "background 0.15s, border-color 0.15s",
                }}>
                  {isOn && (
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <path d="M2.5 6.5l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pinned CTA */}
      <div style={{
        padding: "10px 22px", paddingBottom: "calc(16px + env(safe-area-inset-bottom, 0px))",
        flexShrink: 0, background: "#fff",
        maxWidth: "390px", width: "100%", margin: "0 auto", boxSizing: "border-box",
      }}>
        <button
          style={{
            width: "100%",
            background: isReady ? NAVY : "#e5e7eb",
            borderRadius: 100, border: "none", padding: "13px 24px",
            cursor: isReady ? "pointer" : "default",
            display: "block", boxSizing: "border-box",
            transition: "background 0.2s",
            boxShadow: isReady ? "0 4px 16px rgba(3,4,94,0.22)" : "none",
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 700, color: isReady ? "#fff" : "#9ca3af", lineHeight: 1.3, fontFamily: "'Poppins', sans-serif" }}>
            Let's get started →
          </div>
          <div style={{ fontSize: 10, color: isReady ? "rgba(255,255,255,0.6)" : "#c0c0c0", marginTop: 3 }}>
            {isReady ? `${selected.size} goal${selected.size > 1 ? "s" : ""} selected — we've got you covered` : "Select at least one goal to continue"}
          </div>
        </button>
      </div>
    </div>
  );
}
