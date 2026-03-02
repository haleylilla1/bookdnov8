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
const GREEN = "#10b981";

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

  // Position the coach mark per step anchor
  const getCoachPosition = (): React.CSSProperties => {
    if (s.anchor === "fab-add") {
      return { position: "fixed", bottom: "190px", right: "12px", maxWidth: "270px" };
    }
    if (s.anchor === "fab-paid") {
      return { position: "fixed", bottom: "250px", right: "12px", maxWidth: "270px" };
    }
    if (s.anchor === "dashboard-tab") {
      return { position: "fixed", bottom: "100px", left: "50%", transform: "translateX(-50%)", maxWidth: "300px" };
    }
    if (s.anchor === "profile-tab") {
      return { position: "fixed", bottom: "100px", right: "12px", maxWidth: "270px" };
    }
    return { position: "fixed", bottom: "120px", left: "50%", transform: "translateX(-50%)", maxWidth: "300px" };
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(3,4,94,0.72)",
        zIndex: 10000,
      }}
      onClick={onNext}
    >
      {/* Coach mark — dark navy pill card */}
      <div
        style={{
          ...getCoachPosition(),
          zIndex: 10001,
          backgroundColor: NAVY,
          borderRadius: "20px",
          border: `2.5px solid ${CYAN}`,
          padding: "18px 20px 16px",
          boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Emoji + title row */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
          <span style={{ fontSize: "22px", lineHeight: 1 }}>{s.emoji}</span>
          <span style={{ fontSize: "16px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.01em", lineHeight: 1.2 }}>
            {s.title}
          </span>
        </div>

        {/* Body text */}
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.78)", lineHeight: 1.55, marginBottom: "16px", marginLeft: "32px" }}>
          {s.body}
        </p>

        {/* Footer row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginLeft: "32px" }}>
          {/* Dot indicators */}
          <div style={{ display: "flex", gap: "5px" }}>
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === step ? "18px" : "6px",
                  height: "6px",
                  borderRadius: "3px",
                  backgroundColor: i === step ? CYAN : "rgba(255,255,255,0.25)",
                  transition: "all 0.25s ease",
                }}
              />
            ))}
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {!isLast && (
              <button
                style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: "12px", cursor: "pointer", padding: "4px 6px", minHeight: "unset" }}
                onClick={onSkip}
              >
                Skip
              </button>
            )}
            <button
              style={{
                backgroundColor: CYAN,
                color: "#ffffff",
                border: "none",
                borderRadius: "100px",
                padding: "7px 18px",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                minHeight: "unset",
                letterSpacing: "0.01em",
              }}
              onClick={onNext}
            >
              {isLast ? "Done ✓" : "Next →"}
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
