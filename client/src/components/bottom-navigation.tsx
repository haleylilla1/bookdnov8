import { Calendar, PieChart, User } from "lucide-react";
import type { Screen } from "@/pages/home";

const NAVY = "#03045e";
const CYAN = "#00b4d8";

interface BottomNavigationProps {
  currentScreen: Screen;
  onScreenChange: (screen: Screen) => void;
}

export default function BottomNavigation({ currentScreen, onScreenChange }: BottomNavigationProps) {
  const navItems = [
    { id: "calendar" as const, label: "Calendar", icon: Calendar },
    { id: "dashboard" as const, label: "Dashboard", icon: PieChart },
    { id: "profile" as const, label: "Profile", icon: User },
  ];

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: "480px",
        backgroundColor: "#ffffff",
        borderTop: "1px solid #f0f0f0",
        paddingTop: "8px",
        paddingBottom: "env(safe-area-inset-bottom, 12px)",
        display: "flex",
        zIndex: 50,
        boxShadow: "0 -2px 16px rgba(0,0,0,0.06)",
      }}
    >
      {navItems.map((item) => {
        const isActive = currentScreen === item.id;
        const Icon = item.icon;

        return (
          <button
            key={item.id}
            id={`${item.id}-tab`}
            onClick={() => onScreenChange(item.id)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "3px",
              padding: "6px 0 4px",
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
                size={22}
                strokeWidth={isActive ? 2.5 : 1.8}
                color={isActive ? NAVY : "#b0b0b0"}
              />
              {isActive && (
                <div style={{
                  position: "absolute",
                  bottom: "-6px",
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
              fontSize: "11px",
              fontWeight: isActive ? 600 : 400,
              color: isActive ? NAVY : "#b0b0b0",
              marginTop: "4px",
            }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
