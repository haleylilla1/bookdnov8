import { useState, useEffect, type CSSProperties } from "react";
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
import type { Gig } from "@shared/schema";
import { Plus, Briefcase, Receipt, ChevronRight, DollarSign } from "lucide-react";
import GotPaidSheet from "@/components/got-paid-sheet";
import { Capacitor } from "@capacitor/core";
import { Keyboard } from "@capacitor/keyboard";

export type Screen = "calendar" | "dashboard" | "profile" | "gig-form" | "expense-form" | "settings";

const CYAN = "#00b4d8";
const NAVY = "#03045e";
const GREEN = "#10b981";

// Tooltip tour steps (4 tooltip steps + 1 completion modal)
// Tapping anywhere on the overlay or the tooltip card advances the step.
const TOUR_STEPS = [
  {
    id: "add-gig",
    title: "Start here 👋",
    body: "Tap the + button below to log your first gig. Any job, under a minute.",
    tooltipStyle: { bottom: "230px", right: "12px", maxWidth: "275px" } as CSSProperties,
    caretSide: "bottom-right" as const,
  },
  {
    id: "got-paid",
    title: "Getting paid? Tap this 💚",
    body: "When a client pays you, tap the $ button. Bookd handles taxes, income tracking — all of it.",
    tooltipStyle: { bottom: "315px", right: "12px", maxWidth: "275px" } as CSSProperties,
    caretSide: "bottom-right" as const,
  },
  {
    id: "tax-card",
    title: "Your tax snapshot",
    body: "Tap the Tax Estimate card to see exactly how your estimate is calculated. No surprises at tax time.",
    tooltipStyle: { bottom: "310px", left: "50%", transform: "translateX(-50%)", maxWidth: "300px" } as CSSProperties,
    caretSide: "bottom-center" as const,
  },
  {
    id: "download-report",
    title: "Download your report",
    body: "Tap the button below to generate a full income report with earnings, expenses, and tax details.",
    tooltipStyle: { bottom: "230px", left: "50%", transform: "translateX(-50%)", maxWidth: "300px" } as CSSProperties,
    caretSide: "bottom-center" as const,
  },
];

const TOTAL_TOOLTIP_STEPS = TOUR_STEPS.length;

function Caret({ side }: { side: "bottom-right" | "bottom-center" | "bottom-left" }) {
  const base: CSSProperties = {
    position: "absolute",
    width: 0,
    height: 0,
    borderLeft: "10px solid transparent",
    borderRight: "10px solid transparent",
    borderTop: `12px solid ${NAVY}`,
  };
  if (side === "bottom-right") return <div style={{ ...base, bottom: "-12px", right: "24px" }} />;
  if (side === "bottom-left") return <div style={{ ...base, bottom: "-12px", left: "24px" }} />;
  return <div style={{ ...base, bottom: "-12px", left: "50%", transform: "translateX(-50%)" }} />;
}

function TourOverlay({ step, onNext, onSkip }: {
  step: number;
  onNext: () => void;
  onSkip: () => void;
}) {
  const isCompletion = step === TOTAL_TOOLTIP_STEPS;

  // Final "You're all set!" modal
  if (isCompletion) {
    return (
      <div
        style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.82)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px" }}
        onClick={onNext}
      >
        <div
          style={{ backgroundColor: NAVY, borderRadius: "24px", border: `2.5px solid ${CYAN}`, padding: "32px 28px", textAlign: "center", maxWidth: "340px", width: "100%" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ fontSize: "28px", marginBottom: "16px" }}>🎉</div>
          <div style={{ fontSize: "22px", fontWeight: 800, color: "#ffffff", marginBottom: "14px", lineHeight: 1.25 }}>
            You're all set!
          </div>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.75)", lineHeight: 1.65, marginBottom: "10px" }}>
            Bookd will track every gig, every payment, and every dollar you're owed — so you can stay focused on the work you love.
          </p>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", marginBottom: "28px", fontStyle: "italic" }}>
            Thanks for supporting this app. — Haley
          </p>
          <button
            style={{ width: "100%", backgroundColor: CYAN, color: "#ffffff", border: "none", borderRadius: "100px", padding: "16px", fontSize: "16px", fontWeight: 700, cursor: "pointer", minHeight: "unset" }}
            onClick={onNext}
          >
            Let's go
          </button>
        </div>
      </div>
    );
  }

  const s = TOUR_STEPS[step];

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.72)", zIndex: 10000 }} onClick={onNext}>
      <div
        style={{
          ...s.tooltipStyle,
          position: "fixed",
          zIndex: 10001,
          backgroundColor: NAVY,
          borderRadius: "20px",
          border: `2.5px solid ${CYAN}`,
          padding: "18px 20px 16px",
          boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
        }}
        onClick={(e) => { e.stopPropagation(); onNext(); }}
      >
        {/* Title */}
        <div style={{ fontSize: "15px", fontWeight: 800, color: "#ffffff", marginBottom: "8px", lineHeight: 1.3 }}>
          {s.title}
        </div>

        {/* Body */}
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.78)", lineHeight: 1.55, margin: "0 0 16px 0" }}>
          {s.body}
        </p>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: "5px" }}>
            {Array.from({ length: TOTAL_TOOLTIP_STEPS }).map((_, i) => (
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
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", cursor: "pointer" }}>
            tap to continue
          </span>
        </div>

        <Caret side={s.caretSide} />
      </div>
    </div>
  );
}

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("dashboard");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [tourStep, setTourStep] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Got Paid sheet state
  const [showGotPaidSheet, setShowGotPaidSheet] = useState(false);
  const [gotPaidSheetVisible, setGotPaidSheetVisible] = useState(false);
  const [gotPaidSelectedGig, setGotPaidSelectedGig] = useState<Gig | null>(null);

  // Keyboard height tracking — pushes bottom sheets above the keyboard on iOS
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      // Native iOS app: Capacitor Keyboard plugin gives exact keyboard height
      let showHandle: any, hideHandle: any;
      Keyboard.addListener("keyboardWillShow", (info) => {
        setKeyboardOffset(info.keyboardHeight);
      }).then(h => { showHandle = h; });
      Keyboard.addListener("keyboardWillHide", () => {
        setKeyboardOffset(0);
      }).then(h => { hideHandle = h; });
      return () => {
        showHandle?.remove();
        hideHandle?.remove();
      };
    } else {
      // Web (Safari/browser): use visualViewport + fallbacks
      const update = () => {
        const vp = window.visualViewport;
        if (vp) {
          const kh = Math.max(0, window.innerHeight - vp.height - vp.offsetTop);
          setKeyboardOffset(kh);
        }
      };
      window.visualViewport?.addEventListener("resize", update);
      window.visualViewport?.addEventListener("scroll", update);
      window.addEventListener("resize", update);
      const onFocusIn = (e: Event) => {
        if ((e.target as HTMLElement)?.matches("input, textarea, select")) {
          setTimeout(update, 100);
          setTimeout(update, 400);
        }
      };
      const onFocusOut = () => setTimeout(update, 150);
      document.addEventListener("focusin", onFocusIn);
      document.addEventListener("focusout", onFocusOut);
      return () => {
        window.visualViewport?.removeEventListener("resize", update);
        window.visualViewport?.removeEventListener("scroll", update);
        window.removeEventListener("resize", update);
        document.removeEventListener("focusin", onFocusIn);
        document.removeEventListener("focusout", onFocusOut);
      };
    }
  }, []);

  const openGotPaidSheet = () => {
    setShowGotPaidSheet(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setGotPaidSheetVisible(true)));
  };

  const closeGotPaidSheet = () => {
    setGotPaidSheetVisible(false);
    setTimeout(() => {
      setShowGotPaidSheet(false);
      setGotPaidSelectedGig(null);
    }, 320);
  };

  const { data: gigsData } = useQuery<{ gigs: Gig[] }>({
    queryKey: ["/api/gigs"],
    enabled: !!user,
  });
  const pendingGigs = (gigsData?.gigs ?? []).filter((g) =>
    g.status === "pending" || g.status === "pending payment" || g.status === "pending_payment"
  );
  const upcomingGigs = (gigsData?.gigs ?? []).filter((g) => g.status === "upcoming");

  const { data: userData } = useQuery<any>({
    queryKey: ["/api/user"],
    enabled: !!user,
  });

  // Show onboarding if user hasn't completed it yet
  useEffect(() => {
    if (userData && typeof userData === "object" && "onboardingCompleted" in userData && !userData.onboardingCompleted) {
      setShowOnboarding(true);
    }
  }, [userData]);

  const tourKey = user ? `bookd_tour_seen_${user.id ?? user.username ?? "user"}` : null;

  const markTourDone = () => {
    if (tourKey) localStorage.setItem(tourKey, "done");
  };

  const startTour = () => {
    setTimeout(() => setTourStep(0), 300);
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setCurrentScreen("dashboard"); // always land on dashboard before tour
    queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    // Only mark "pending" for brand-new users who have never seen the tour
    if (tourKey && !localStorage.getItem(tourKey)) {
      localStorage.setItem(tourKey, "pending");
    }
    // Explicitly fire the tour — 300ms lets the onboarding overlay fully unmount first
    startTour();
  };

  const handleTourNext = () => {
    if (tourStep === null) return;
    // Completion modal — dismiss and stay on dashboard
    if (tourStep >= TOTAL_TOOLTIP_STEPS) {
      markTourDone();
      setTourStep(null);
    } else {
      setTourStep(tourStep + 1);
    }
  };

  const handleTourSkip = () => {
    markTourDone();
    setTourStep(null);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "calendar": return <CalendarView onGotPaid={(gig) => {
        setGotPaidSelectedGig(gig);
        openGotPaidSheet();
      }} />;
      case "dashboard": return <Dashboard onOpenAddGig={() => setCurrentScreen("gig-form")} onOpenAddExpense={() => setCurrentScreen("expense-form")} tourStep={tourStep} onTourNext={handleTourNext} />;
      case "profile": return <Profile onDemoComplete={startTour} />;
      case "gig-form": return <SimpleGigForm onClose={() => setCurrentScreen("dashboard")} />;
      case "expense-form": return <AddExpenseForm onClose={() => setCurrentScreen("dashboard")} />;
      default: return <Dashboard onOpenAddGig={() => setCurrentScreen("gig-form")} onOpenAddExpense={() => setCurrentScreen("expense-form")} tourStep={tourStep} onTourNext={handleTourNext} />;
    }
  };

  const isMainScreen = currentScreen === "calendar" || currentScreen === "dashboard" || currentScreen === "profile";

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

        {/* iOS Bottom Sheet — add menu */}
        {fabOpen && isMainScreen && (
          <div className="lg:hidden">
            {/* Backdrop */}
            <div
              style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", zIndex: 55 }}
              onClick={() => setFabOpen(false)}
            />
            {/* Sheet */}
            <div style={{
              position: "fixed",
              bottom: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: "100%",
              maxWidth: "480px",
              backgroundColor: "#ffffff",
              borderRadius: "20px 20px 0 0",
              zIndex: 56,
              paddingBottom: "max(env(safe-area-inset-bottom, 16px), 16px)",
            }}>
              {/* Handle */}
              <div style={{ display: "flex", justifyContent: "center", paddingTop: "12px", paddingBottom: "8px" }}>
                <div style={{ width: "36px", height: "4px", borderRadius: "2px", backgroundColor: "#e5e7eb" }} />
              </div>

              {/* Add a gig */}
              <button
                onClick={() => { setFabOpen(false); setCurrentScreen("gig-form"); }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  padding: "16px 20px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  gap: "14px",
                  minHeight: "unset",
                }}
              >
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Briefcase size={20} color={NAVY} />
                </div>
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={{ fontSize: "16px", fontWeight: 600, color: "#111827" }}>Add a gig</div>
                  <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "1px" }}>Log a new job</div>
                </div>
                <ChevronRight size={18} color="#d1d5db" />
              </button>

              {/* Divider */}
              <div style={{ height: "1px", backgroundColor: "#f3f4f6", marginLeft: "74px" }} />

              {/* Add an expense */}
              <button
                onClick={() => { setFabOpen(false); setCurrentScreen("expense-form"); }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  padding: "16px 20px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  gap: "14px",
                  minHeight: "unset",
                }}
              >
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "#fef9ee", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Receipt size={20} color="#d97706" />
                </div>
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={{ fontSize: "16px", fontWeight: 600, color: "#111827" }}>Add an expense</div>
                  <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "1px" }}>Track a business cost</div>
                </div>
                <ChevronRight size={18} color="#d1d5db" />
              </button>

              <div style={{ height: "8px" }} />
            </div>
          </div>
        )}

        {/* Got Paid Bottom Sheet */}
        {showGotPaidSheet && (
          <div className="lg:hidden">
            {/* Backdrop */}
            <div
              style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 55, transition: "opacity 320ms ease", opacity: gotPaidSheetVisible ? 1 : 0 }}
              onClick={closeGotPaidSheet}
            />
            {/* Sheet */}
            <div style={{
              position: "fixed",
              bottom: keyboardOffset,
              left: "50%",
              transform: gotPaidSheetVisible ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(100%)",
              transition: "transform 320ms cubic-bezier(0.32, 0.72, 0, 1), bottom 120ms ease-out",
              width: "100%",
              maxWidth: "480px",
              backgroundColor: "#ffffff",
              borderRadius: "20px 20px 0 0",
              zIndex: 56,
              paddingBottom: keyboardOffset > 0 ? "12px" : "max(env(safe-area-inset-bottom, 24px), 24px)",
              maxHeight: `min(85vh, calc(100vh - ${keyboardOffset}px - 40px))`,
              display: "flex",
              flexDirection: "column",
            }}>
              {/* Grabber */}
              <div style={{ display: "flex", justifyContent: "center", paddingTop: "12px", paddingBottom: "4px", flexShrink: 0 }}>
                <div style={{ width: "36px", height: "4px", borderRadius: "2px", backgroundColor: "#e5e7eb" }} />
              </div>

              {gotPaidSelectedGig ? (
                /* Multi-step Got Paid flow */
                <GotPaidSheet
                  gig={gotPaidSelectedGig}
                  homeAddress={userData?.homeAddress || ""}
                  defaultTaxPercentage={userData?.defaultTaxPercentage}
                  onBack={() => setGotPaidSelectedGig(null)}
                  onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ["/api/gigs"] });
                    closeGotPaidSheet();
                    toast({ title: "Payment confirmed!", description: "Gig marked as paid." });
                  }}
                />
              ) : (
                /* Gig picker */
                <>
              {/* Header */}
              <div style={{ padding: "12px 20px 16px", flexShrink: 0 }}>
                <div style={{ fontSize: "20px", fontWeight: 600, color: "#111111" }}>Mark as Paid</div>
                <div style={{ fontSize: "13px", color: "#9B9B9B", marginTop: "4px" }}>Select the gig you got paid for</div>
              </div>
              {/* Gig list */}
              <div style={{ overflowY: "auto", flex: 1, padding: "0 16px" }}>
                {pendingGigs.length === 0 ? (
                  <>
                    <div style={{ textAlign: "center", padding: "20px 0 16px", color: "#9B9B9B", fontSize: "14px" }}>
                      No pending gigs right now
                    </div>
                    {upcomingGigs.length > 0 && (
                      <>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                          <div style={{ flex: 1, height: "1px", backgroundColor: "#F0F0F0" }} />
                          <span style={{ fontSize: "11px", fontWeight: 600, color: "#9B9B9B", textTransform: "uppercase" as const, letterSpacing: "0.6px", whiteSpace: "nowrap" as const }}>Your upcoming gigs</span>
                          <div style={{ flex: 1, height: "1px", backgroundColor: "#F0F0F0" }} />
                        </div>
                        {upcomingGigs.map((gig) => (
                          <div
                            key={gig.id}
                            style={{ backgroundColor: "#F9F9F9", borderRadius: "14px", padding: "16px", marginBottom: "10px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                            onClick={() => setGotPaidSelectedGig(gig)}
                          >
                            <div>
                              <div style={{ fontSize: "15px", fontWeight: 600, color: "#111111" }}>{gig.gigType || gig.eventName}</div>
                              <div style={{ fontSize: "13px", color: "#9B9B9B", marginTop: "2px" }}>{gig.clientName}</div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <div style={{ fontSize: "17px", fontWeight: 600, color: "#111111" }}>${Number(gig.expectedPay ?? 0).toFixed(2)}</div>
                              <ChevronRight size={16} color="#d1d5db" />
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </>
                ) : (
                  pendingGigs.map((gig) => (
                    <div
                      key={gig.id}
                      style={{ backgroundColor: "#F9F9F9", borderRadius: "14px", padding: "16px", marginBottom: "10px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                      onClick={() => setGotPaidSelectedGig(gig)}
                    >
                      <div>
                        <div style={{ fontSize: "15px", fontWeight: 600, color: "#111111" }}>{gig.gigType || gig.eventName}</div>
                        <div style={{ fontSize: "13px", color: "#9B9B9B", marginTop: "2px" }}>{gig.clientName}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ fontSize: "17px", fontWeight: 600, color: "#111111" }}>${Number(gig.expectedPay ?? 0).toFixed(2)}</div>
                        <ChevronRight size={16} color="#d1d5db" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
            </div>
          </div>
        )}

        {/* Legal Footer - mobile only */}
        <div className="lg:hidden">
          <LegalFooter className="border-t border-gray-200 bg-white" />
        </div>

        {/* Unified bottom bar — FABs always sit exactly above nav, never covered */}
        <div className="lg:hidden" style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: "480px", zIndex: 50 }}>
          {/* FABs — absolute positioned above the nav bar via bottom: 100% */}
          {isMainScreen && (
            <div style={{ position: "absolute", bottom: "100%", right: "24px", paddingBottom: "12px", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "12px" }}>
              {/* Got Paid $ button */}
              <button
                id="fab-paid"
                onClick={() => {
                  setFabOpen(false);
                  openGotPaidSheet();
                }}
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  border: "none",
                  backgroundColor: GREEN,
                  color: "#ffffff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 16px rgba(16,185,129,0.45)",
                  flexShrink: 0,
                }}
              >
                <DollarSign size={36} strokeWidth={1.5} />
              </button>

              {/* + button */}
              <button
                id="fab-toggle"
                onClick={() => setFabOpen(!fabOpen)}
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  border: "none",
                  backgroundColor: NAVY,
                  color: "#ffffff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 16px rgba(3,4,94,0.35)",
                  flexShrink: 0,
                }}
              >
                <Plus size={36} strokeWidth={1.5} />
              </button>
            </div>
          )}

          <BottomNavigation
            currentScreen={currentScreen}
            onScreenChange={setCurrentScreen}
          />
        </div>
      </div>
    </div>
  );
}
