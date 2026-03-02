import { useState, useEffect } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import CalendarView from "@/components/calendar-view";
import SimpleGigForm from "@/components/simple-gig-form";
import AddExpenseForm from "@/components/add-expense-form";
import Dashboard from "@/components/dashboard";
import Profile from "@/components/profile";
import BottomNavigation from "@/components/bottom-navigation";
import AppHeader from "@/components/app-header";
import DesktopSidebar from "@/components/desktop-sidebar";
import LegalFooter from "@/components/legal-footer";
import { OnboardingFlow } from "@/components/onboarding-flow";
import { useAuth } from "@/lib/replit-auth";
import { useToast } from "@/hooks/use-toast";
import { Plus, X, Briefcase, Receipt } from "lucide-react";

export type Screen = "calendar" | "dashboard" | "profile" | "gig-form" | "expense-form" | "settings";

const CYAN = "#00b4d8";
const NAVY = "#03045e";
const GREEN = "#16a34a";

// Tooltip tour steps
const TOUR_STEPS = [
  {
    id: "add-gig",
    emoji: "👋",
    title: "Start here",
    body: "This is where you add a gig. Log any job in under a minute.",
    anchor: "fab-add",
    position: "top-right",
  },
  {
    id: "got-paid",
    emoji: "💚",
    title: "Getting paid? Tap this",
    body: "Once a client pays you, hit this button. Bookd will handle the rest — taxes, income tracking, all of it.",
    anchor: "fab-paid",
    position: "top-right",
  },
  {
    id: "dashboard",
    emoji: "📊",
    title: "Your dashboard is your home base",
    body: "Tap any card for a detailed breakdown of your income, taxes owed, and expenses. Everything in one place.",
    anchor: "dashboard-tab",
    position: "top-center",
  },
  {
    id: "profile",
    emoji: "👤",
    title: "One last thing",
    body: "Head to your profile anytime to update your tax rate and address. Keeping this accurate means better estimates for you.",
    anchor: "profile-tab",
    position: "top-right",
  },
];

function TourOverlay({ step, total, onNext, onSkip }: {
  step: number;
  total: number;
  onNext: () => void;
  onSkip: () => void;
}) {
  const s = TOUR_STEPS[step];
  const isLast = step === total - 1;

  // Position the tooltip differently per step
  const getTooltipStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: "fixed",
      backgroundColor: "#ffffff",
      borderRadius: "16px",
      padding: "16px 18px",
      maxWidth: "260px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
      zIndex: 10001,
    };

    if (s.anchor === "fab-add") {
      return { ...base, bottom: "180px", right: "16px" };
    }
    if (s.anchor === "fab-paid") {
      return { ...base, bottom: "240px", right: "16px" };
    }
    if (s.anchor === "dashboard-tab") {
      return { ...base, bottom: "100px", left: "50%", transform: "translateX(-50%)" };
    }
    if (s.anchor === "profile-tab") {
      return { ...base, bottom: "100px", right: "16px" };
    }
    return base;
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(3,4,94,0.55)",
        zIndex: 10000,
        display: "flex",
        alignItems: "flex-end",
      }}
      onClick={onNext}
    >
      {/* Tooltip bubble */}
      <div
        style={getTooltipStyle()}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: "24px", marginBottom: "6px" }}>{s.emoji}</div>
        <div style={{ fontSize: "15px", fontWeight: 700, color: NAVY, marginBottom: "4px" }}>{s.title}</div>
        <div style={{ fontSize: "13px", color: "#6b7280", lineHeight: 1.5, marginBottom: "14px" }}>{s.body}</div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button
            style={{ background: "none", border: "none", color: "#9ca3af", fontSize: "13px", cursor: "pointer", padding: 0, minHeight: "unset" }}
            onClick={onSkip}
          >
            Skip tour
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ display: "flex", gap: "4px" }}>
              {Array.from({ length: total }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: i === step ? CYAN : "#e5e7eb",
                  }}
                />
              ))}
            </div>
            <button
              style={{
                backgroundColor: CYAN,
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                padding: "6px 14px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                minHeight: "unset",
              }}
              onClick={onNext}
            >
              {isLast ? "Done" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("calendar");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [tourStep, setTourStep] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: userData } = useQuery<any>({
    queryKey: ["/api/user"],
    enabled: !!user,
  });

  useEffect(() => {
    if (userData && typeof userData === "object" && "onboardingCompleted" in userData && !userData.onboardingCompleted) {
      setShowOnboarding(true);
    }
  }, [userData]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    // Start tooltip tour
    setTourStep(0);
  };

  const handleTourNext = () => {
    if (tourStep === null) return;
    // Navigate to dashboard for step 2 (dashboard card) 
    if (tourStep === 1) setCurrentScreen("dashboard");
    if (tourStep === TOUR_STEPS.length - 1) {
      setTourStep(null);
    } else {
      setTourStep(tourStep + 1);
    }
  };

  const handleTourSkip = () => {
    setTourStep(null);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "calendar": return <CalendarView />;
      case "dashboard": return <Dashboard />;
      case "profile": return <Profile />;
      case "gig-form": return <SimpleGigForm onClose={() => setCurrentScreen("calendar")} />;
      case "expense-form": return <AddExpenseForm onClose={() => setCurrentScreen("calendar")} />;
      default: return <Dashboard />;
    }
  };

  const isMainScreen = currentScreen === "calendar" || currentScreen === "dashboard";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Onboarding (full-screen overlay) */}
      <OnboardingFlow
        isOpen={showOnboarding}
        onComplete={handleOnboardingComplete}
        onClose={() => setShowOnboarding(false)}
      />

      {/* Tooltip Tour Overlay */}
      {tourStep !== null && (
        <TourOverlay
          step={tourStep}
          total={TOUR_STEPS.length}
          onNext={handleTourNext}
          onSkip={handleTourSkip}
        />
      )}

      {/* Desktop Sidebar */}
      <DesktopSidebar currentScreen={currentScreen} onScreenChange={setCurrentScreen} />

      {/* Main Content Area */}
      <div className="lg:ml-64">
        {/* App Header - hidden on desktop */}
        <div className="lg:hidden">
          <AppHeader currentScreen={currentScreen} onScreenChange={setCurrentScreen} />
        </div>

        {/* Main Content */}
        <main className="screen-content main-content-area">
          {renderScreen()}
        </main>

        {/* FAB backdrop (when open) */}
        {fabOpen && isMainScreen && (
          <div
            style={{ position: "fixed", inset: 0, zIndex: 39 }}
            onClick={() => setFabOpen(false)}
          />
        )}

        {/* Floating Action Buttons — mobile only */}
        {isMainScreen && (
          <div className="lg:hidden" style={{ position: "fixed", bottom: "88px", right: "16px", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px", zIndex: 40 }}>

            {/* Expanded FAB menu */}
            {fabOpen && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px" }}>
                {/* Add Expense */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "10px",
                    padding: "6px 12px",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#374151",
                    whiteSpace: "nowrap",
                  }}>
                    Add Expense
                  </div>
                  <button
                    onClick={() => { setFabOpen(false); setCurrentScreen("expense-form"); }}
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      border: "none",
                      backgroundColor: "#c258d1",
                      color: "#ffffff",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 12px rgba(194,88,209,0.4)",
                      flexShrink: 0,
                    }}
                  >
                    <Receipt size={18} />
                  </button>
                </div>

                {/* Add Gig */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "10px",
                    padding: "6px 12px",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#374151",
                    whiteSpace: "nowrap",
                  }}>
                    Add Gig
                  </div>
                  <button
                    id="fab-add"
                    onClick={() => { setFabOpen(false); setCurrentScreen("gig-form"); }}
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      border: "none",
                      backgroundColor: NAVY,
                      color: "#ffffff",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 12px rgba(3,4,94,0.35)",
                      flexShrink: 0,
                    }}
                  >
                    <Briefcase size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* Got Paid $ button */}
            <button
              id="fab-paid"
              onClick={() => {
                setFabOpen(false);
                setCurrentScreen("calendar");
                toast({ title: "Tap a gig to mark it as paid", description: "Open any gig from your calendar to log a payment." });
              }}
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "50%",
                border: "none",
                backgroundColor: GREEN,
                color: "#ffffff",
                fontSize: "22px",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 16px rgba(22,163,74,0.45)",
                flexShrink: 0,
              }}
            >
              $
            </button>

            {/* + / X toggle button */}
            <button
              id="fab-toggle"
              onClick={() => setFabOpen(!fabOpen)}
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                border: "none",
                backgroundColor: fabOpen ? "#6b7280" : NAVY,
                color: "#ffffff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 16px rgba(3,4,94,0.35)",
                transition: "background-color 0.2s ease",
                flexShrink: 0,
              }}
            >
              {fabOpen ? <X size={22} /> : <Plus size={24} />}
            </button>
          </div>
        )}

        {/* Legal Footer - mobile only */}
        <div className="lg:hidden">
          <LegalFooter className="border-t border-gray-200 bg-white" />
        </div>

        {/* Bottom Navigation - mobile only */}
        <div className="lg:hidden">
          <BottomNavigation
            currentScreen={currentScreen}
            onScreenChange={setCurrentScreen}
          />
        </div>
      </div>
    </div>
  );
}
