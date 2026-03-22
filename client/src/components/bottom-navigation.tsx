import { TrendingUp, Calendar, User } from "lucide-react";
import type { Screen } from "@/pages/home";
import { hapticLight } from "@/lib/haptics";

const NAVY = "#03045e";
const CYAN = "#00b4d8";

interface BottomNavigationProps {
  currentScreen: Screen;
  onScreenChange: (screen: Screen) => void;
}

export default function BottomNavigation({ currentScreen, onScreenChange }: BottomNavigationProps) {
  const navItems = [
    { id: "dashboard" as const, label: "Dashboard", icon: TrendingUp },
    { id: "calendar" as const, label: "Calendar", icon: Calendar },
    { id: "profile" as const, label: "Profile", icon: User },
  ];

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        backgroundColor: "#ffffff",
        borderTop: "1px solid #f0f0f0",
        paddingTop: "4px",
        paddingBottom: "8px",
        display: "flex",
        boxShadow: "0 -2px 16px rgba(0,0,0,0.06)",
        zIndex: 50,
      }}
    >
      {navItems.map((item) => {
        const isActive = currentScreen === item.id;
        const Icon = item.icon;

        return (
          <button
            key={item.id}
            id={`${item.id}-tab`}
            onClick={() => { hapticLight(); onScreenChange(item.id); }}
            className="bottom-nav-btn"
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "2px",
              padding: "3px 0 2px",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: isActive ? NAVY : "#b0b0b0",
              minHeight: "unset",
              transition: "color 0.15s ease",
            }}
          >
            <div style={{ position: "relative" }}>
              <Icon
                size={20}
                strokeWidth={isActive ? 2.5 : 1.8}
                color={isActive ? NAVY : "#b0b0b0"}
              />
              {isActive && (
                <div style={{
                  position: "absolute",
                  bottom: "-4px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "4px",
                  height: "4px",
                  borderRadius: "50%",
                  backgroundColor: CYAN,
                }} />
              )}
            </div>
            <span style={{
              fontSize: "10px",
              fontWeight: isActive ? 600 : 400,
              color: isActive ? NAVY : "#b0b0b0",
              marginTop: "2px",
            }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
