import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/replit-auth";
import logoImage from "@assets/bookd-logo.png";
import { MessageSquare, LogOut, X } from "lucide-react";
import ContactSupport from "./contact-support";

const NAVY = "#03045E";
const AQUA = "#00B4D8";

interface AppHeaderProps {
  currentScreen: string;
  onScreenChange: (screen: any) => void;
}

export default function AppHeader({ currentScreen, onScreenChange }: AppHeaderProps) {
  const { user, logout, isLoggingOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  if (!user) return null;

  const initials = (name: string) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <>
      <header style={{ background: "#fff", borderBottom: "1px solid #f0f0f5", padding: "10px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <img src={logoImage} alt="bookd" style={{ height: 22 }} />

          <div ref={menuRef} style={{ position: "relative" }}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              style={{
                width: 38, height: 38, borderRadius: "50%",
                background: NAVY, border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: "'Poppins', sans-serif", letterSpacing: "0.02em" }}>
                {initials(user.name || user.email || "")}
              </span>
            </button>

            {menuOpen && (
              <div style={{
                position: "absolute", top: "calc(100% + 8px)", right: 0,
                background: "#fff", borderRadius: 18,
                boxShadow: "0 8px 32px rgba(3,4,94,0.14)", width: 240,
                overflow: "hidden", zIndex: 1000,
                border: "1px solid rgba(3,4,94,0.06)",
              }}>
                {/* User info */}
                <div style={{ padding: "16px 18px 14px", borderBottom: "1px solid #f0f0f5" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%", background: NAVY,
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", fontFamily: "'Poppins', sans-serif" }}>
                        {initials(user.name || user.email || "")}
                      </span>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, fontFamily: "'Poppins', sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {user.name || "User"}
                      </div>
                      <div style={{ fontSize: 11, color: "#9ca3af", fontFamily: "'Montserrat', sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {user.email}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div style={{ padding: "8px 0" }}>
                  <button
                    onClick={() => { setMenuOpen(false); setContactOpen(true); }}
                    style={{
                      width: "100%", background: "none", border: "none", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "11px 18px", textAlign: "left",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f8f9ff")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                  >
                    <div style={{ width: 30, height: 30, borderRadius: 10, background: "#EAF9FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <MessageSquare size={14} color={AQUA} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: NAVY, fontFamily: "'Montserrat', sans-serif" }}>Contact Support</span>
                  </button>

                  <div style={{ height: 1, background: "#f0f0f5", margin: "4px 18px" }} />

                  <button
                    onClick={() => { setMenuOpen(false); logout(); }}
                    disabled={isLoggingOut}
                    style={{
                      width: "100%", background: "none", border: "none", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "11px 18px", textAlign: "left",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#fff5f5")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                  >
                    <div style={{ width: 30, height: 30, borderRadius: 10, background: "#fff0f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <LogOut size={14} color="#ef4444" />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#ef4444", fontFamily: "'Montserrat', sans-serif" }}>
                      {isLoggingOut ? "Signing out…" : "Sign Out"}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <ContactSupport open={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
}
