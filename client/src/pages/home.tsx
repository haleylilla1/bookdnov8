import { useState, useEffect, useLayoutEffect, type CSSProperties } from "react";
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
import { OnboardingFlow, GigGapStep } from "@/components/onboarding-flow";
import { WelcomeSequence } from "@/components/welcome-sequence";
import { useAuth } from "@/lib/replit-auth";
import { useToast } from "@/hooks/use-toast";
import type { Gig } from "@shared/schema";
import { Plus, Briefcase, Receipt, ChevronRight, Check, Sparkles } from "lucide-react";
import GotPaidSheet from "@/components/got-paid-sheet";
import { hapticLight, hapticSuccess } from "@/lib/haptics";
import { Capacitor } from "@capacitor/core";
import { Keyboard } from "@capacitor/keyboard";

export type Screen = "calendar" | "dashboard" | "profile" | "gig-form" | "expense-form" | "settings" | "gig-gap-tool";

const CYAN = "#00b4d8";
const NAVY = "#03045e";
const GREEN = "#10b981";

// Tooltip tour steps (4 tooltip steps + 1 completion modal)
// Each step targets a real DOM element by ID for accurate positioning.
const TOUR_STEPS = [
  {
    id: "add-gig",
    targetId: "fab-toggle",
    title: "Start here 👋",
    body: "Tap the + button below to log your first gig. Any job, under a minute.",
  },
  {
    id: "got-paid",
    targetId: "fab-paid",
    title: "Getting paid? Tap this 💚",
    body: "When a client pays you, tap the $ button. Bookd handles taxes, income tracking — all of it.",
  },
  {
    id: "tax-card",
    targetId: "tour-tax-card",
    title: "Your tax snapshot",
    body: "Tap the Tax Estimate card to see exactly how your estimate is calculated. No surprises at tax time.",
  },
  {
    id: "download-report",
    targetId: "tour-download-report",
    title: "Download your report",
    body: "Tap the button below to generate a full income report with earnings, expenses, and tax details.",
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
  const [tooltipStyle, setTooltipStyle] = useState<CSSProperties>({ opacity: 0, pointerEvents: "none" });
  const [caretSide, setCaretSide] = useState<"bottom-right" | "bottom-center" | "bottom-left">("bottom-center");
  const isCompletion = step === TOTAL_TOOLTIP_STEPS;

  // Paint html + body black while the dark overlay is visible.
  // On iOS, the safe-area zones (status bar top, home indicator bottom) are
  // filled with the html/body background color — not by any position:fixed
  // overlay. Using useLayoutEffect (runs before paint) + a CSS class toggle
  // ensures the safe zones are already black before the first frame is shown,
  // eliminating any white-flash race condition.
  useLayoutEffect(() => {
    document.documentElement.classList.add("tour-active");
    return () => {
      document.documentElement.classList.remove("tour-active");
    };
  }, []);

  useEffect(() => {
    if (isCompletion) return;
    setTooltipStyle({ opacity: 0, pointerEvents: "none" });

    const s = TOUR_STEPS[step];
    const TOOLTIP_WIDTH = 275;
    const GAP = 14;
    const EDGE_PAD = 12;

    const computePosition = () => {
      const el = document.getElementById(s.targetId);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return;

      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const elCenterX = rect.left + rect.width / 2;

      // Always place tooltip ABOVE the element
      const bottomFromViewport = vh - rect.top + GAP;

      let left: number | undefined;
      let right: number | undefined;
      let transform: string | undefined;
      let caret: "bottom-right" | "bottom-center" | "bottom-left" = "bottom-center";

      if (elCenterX > vw * 0.6) {
        // Element is on the right side — right-align tooltip
        right = Math.max(EDGE_PAD, vw - rect.right);
        caret = "bottom-right";
      } else if (elCenterX < vw * 0.4) {
        // Element is on the left side
        left = Math.max(EDGE_PAD, rect.left);
        caret = "bottom-left";
      } else {
        // Center over element, clamped to viewport
        left = Math.min(
          Math.max(EDGE_PAD + TOOLTIP_WIDTH / 2, elCenterX),
          vw - EDGE_PAD - TOOLTIP_WIDTH / 2
        );
        transform = "translateX(-50%)";
        caret = "bottom-center";
      }

      setCaretSide(caret);
      setTooltipStyle({
        bottom: bottomFromViewport,
        left,
        right,
        transform,
        maxWidth: TOOLTIP_WIDTH,
        opacity: 1,
        pointerEvents: "auto",
        transition: "opacity 0.2s ease",
      });
    };

    const el = document.getElementById(s.targetId);
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const offScreen = rect.top < 60 || rect.bottom > window.innerHeight - 60;

    if (offScreen) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(computePosition, 700);
    } else {
      setTimeout(computePosition, 100);
    }
  }, [step, isCompletion]);

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
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "20px" }}>
            <Sparkles size={16} color={CYAN} style={{ opacity: 0.6, marginTop: "10px" }} />
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: CYAN, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 24px rgba(0,180,216,0.5)` }}>
              <Check size={34} color="#ffffff" strokeWidth={2.5} />
            </div>
            <Sparkles size={16} color={CYAN} style={{ opacity: 0.6, marginBottom: "10px" }} />
          </div>
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
          ...tooltipStyle,
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
        <div style={{ fontSize: "15px", fontWeight: 800, color: "#ffffff", marginBottom: "8px", lineHeight: 1.3 }}>
          {s.title}
        </div>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.78)", lineHeight: 1.55, margin: "0 0 16px 0" }}>
          {s.body}
        </p>
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
        <Caret side={caretSide} />
      </div>
    </div>
  );
}

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("dashboard");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showDemoWelcome, setShowDemoWelcome] = useState(false);
  const [showDemoOnboarding, setShowDemoOnboarding] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [tourStep, setTourStep] = useState<number | null>(null);
  const [pendingTour, setPendingTour] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Got Paid sheet state
  const [showGotPaidSheet, setShowGotPaidSheet] = useState(false);
  const [gotPaidSheetVisible, setGotPaidSheetVisible] = useState(false);
  const [gotPaidSelectedGig, setGotPaidSelectedGig] = useState<Gig | null>(null);

  // Track visual viewport height as a CSS variable instead of React state.
  // React batches all setState calls during the keyboard animation into a single
  // re-render at the END of the animation — causing a visible gap the whole time.
  // Writing directly to a CSS variable bypasses React's scheduler entirely and
  // the browser picks it up each frame, so the sheet bottom tracks the keyboard
  // top with zero lag.
  useEffect(() => {
    const setVar = (h: number) =>
      document.documentElement.style.setProperty("--vp-height", `${h}px`);

    if (Capacitor.isNativePlatform()) {
      let showHandle: any, hideHandle: any;
      Keyboard.addListener("keyboardWillShow", (info) => {
        setVar((window.visualViewport?.height ?? window.innerHeight) - info.keyboardHeight);
      }).then(h => { showHandle = h; });
      Keyboard.addListener("keyboardWillHide", () => {
        setVar(window.visualViewport?.height ?? window.innerHeight);
      }).then(h => { hideHandle = h; });
      return () => { showHandle?.remove(); hideHandle?.remove(); };
    } else {
      const update = () => setVar(window.visualViewport?.height ?? window.innerHeight);
      window.visualViewport?.addEventListener("resize", update);
      update(); // set initial value
      return () => window.visualViewport?.removeEventListener("resize", update);
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

  // Always navigates to dashboard first, then fires tour once confirmed rendered
  const startTour = () => {
    setCurrentScreen("dashboard");
    setShowOnboarding(false);
    setPendingTour(true);
  };

  // Fires tour only after both conditions are confirmed true in a real render
  useEffect(() => {
    if (!pendingTour || showOnboarding || currentScreen !== "dashboard") return;
    const timer = setTimeout(() => {
      setTourStep(0);
      setPendingTour(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [pendingTour, showOnboarding, currentScreen]);

  const handleOnboardingComplete = () => {
    if (tourKey && !localStorage.getItem(tourKey)) {
      localStorage.setItem(tourKey, "pending");
    }
    startTour();
    // Delay invalidation so refetch doesn't race with the screen transition
    setTimeout(() => queryClient.invalidateQueries({ queryKey: ["/api/user"] }), 1000);
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

  const isMainScreen = currentScreen === "calendar" || currentScreen === "dashboard" || currentScreen === "profile";

  return (
    <div className="bg-gray-50" style={{ height: "100dvh", overflow: "hidden" }}>
      {/* Onboarding (full-screen overlay) */}
      <OnboardingFlow
        isOpen={showOnboarding}
        onComplete={handleOnboardingComplete}
        onClose={() => setShowOnboarding(false)}
      />

      {/* Demo overlays — rendered at root level so they appear above header/nav */}
      {showDemoWelcome && (
        <WelcomeSequence
          onComplete={() => {
            setShowDemoWelcome(false);
            setShowDemoOnboarding(true);
          }}
          onLogin={() => setShowDemoWelcome(false)}
        />
      )}
      <OnboardingFlow
        isOpen={showDemoOnboarding}
        onComplete={() => {
          setShowDemoOnboarding(false);
          startTour();
        }}
        onClose={() => setShowDemoOnboarding(false)}
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
      <div className="lg:ml-64" style={{ display: "flex", flexDirection: "column", height: "100dvh" }}>
        {/* App Header - hidden on desktop */}
        <div className="lg:hidden" style={{ flexShrink: 0 }}>
          <AppHeader currentScreen={currentScreen} onScreenChange={setCurrentScreen} />
        </div>

        {/* Always-mounted tab screens — instant crossfade on switch */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden", minHeight: 0 }}>
          {/* Dashboard */}
          <div className="tab-screen screen-content" style={{
            position: "absolute", inset: 0, overflowY: "auto",
            opacity: currentScreen === "dashboard" ? 1 : 0,
            pointerEvents: currentScreen === "dashboard" ? "auto" : "none",
            transition: "opacity 150ms ease",
            zIndex: currentScreen === "dashboard" ? 1 : 0,
          }}>
            <Dashboard
              isActive={currentScreen === "dashboard"}
              onOpenAddGig={() => setCurrentScreen("gig-form")}
              onOpenAddExpense={() => setCurrentScreen("expense-form")}
              tourStep={tourStep}
              onTourNext={handleTourNext}
            />
          </div>

          {/* Calendar */}
          <div className="tab-screen screen-content" style={{
            position: "absolute", inset: 0, overflowY: "auto",
            opacity: currentScreen === "calendar" ? 1 : 0,
            pointerEvents: currentScreen === "calendar" ? "auto" : "none",
            transition: "opacity 150ms ease",
            zIndex: currentScreen === "calendar" ? 1 : 0,
          }}>
            <CalendarView
              isActive={currentScreen === "calendar"}
              onGotPaid={(gig) => {
                setGotPaidSelectedGig(gig);
                openGotPaidSheet();
              }}
            />
          </div>

          {/* Profile */}
          <div className="tab-screen screen-content" style={{
            position: "absolute", inset: 0, overflowY: "auto",
            opacity: currentScreen === "profile" ? 1 : 0,
            pointerEvents: currentScreen === "profile" ? "auto" : "none",
            transition: "opacity 150ms ease",
            zIndex: currentScreen === "profile" ? 1 : 0,
          }}>
            <Profile isActive={currentScreen === "profile"} onDemoComplete={startTour} onStartDemo={() => setShowDemoWelcome(true)} />
            <div className="lg:hidden">
              <LegalFooter className="border-t border-gray-200 bg-white" />
            </div>
          </div>

        </div>

        {/* FABs — fixed to screen, always above the nav */}
        {currentScreen !== "profile" && isMainScreen && (
          <div className="lg:hidden" style={{ position: "fixed", bottom: 68, right: 24, zIndex: 49, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
            {/* Got Paid $ button */}
            <button
              id="fab-paid"
              onClick={() => { hapticSuccess(); setFabOpen(false); openGotPaidSheet(); }}
              style={{
                width: 64, height: 64, borderRadius: "50%",
                border: "2px solid rgba(0,180,216,0.55)",
                backgroundColor: GREEN, color: "#ffffff",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 20px rgba(16,185,129,0.5), 0 0 0 5px rgba(16,185,129,0.12)",
                flexShrink: 0,
              }}
            >
              {/* Custom $ — S-curve with a shorter vertical line that stays within the S body */}
              <svg width="16" height="21" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 4H7.5a3 3 0 0 0 0 6h1a3 3 0 0 1 0 6H4"
                  stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                />
                <line x1="8" y1="6" x2="8" y2="14" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
              </svg>
            </button>
            {/* + button */}
            <button
              id="fab-toggle"
              onClick={() => { hapticLight(); setFabOpen(!fabOpen); }}
              style={{ width: 64, height: 64, borderRadius: "50%", border: "none", backgroundColor: NAVY, color: "#ffffff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(3,4,94,0.35)", flexShrink: 0 }}
            >
              <Plus size={36} strokeWidth={1.5} />
            </button>
          </div>
        )}

        {/* Overlay screens — full-screen on top of tab layer */}
        {currentScreen === "gig-form" && (
          <div style={{ position: "fixed", inset: 0, zIndex: 200, backgroundColor: "#f5f7f5" }}>
            <SimpleGigForm onClose={() => setCurrentScreen("dashboard")} />
          </div>
        )}
        {currentScreen === "expense-form" && (
          <div style={{ position: "fixed", inset: 0, zIndex: 200, backgroundColor: "#f5f7f5" }}>
            <AddExpenseForm onClose={() => setCurrentScreen("dashboard")} />
          </div>
        )}
        {currentScreen === "gig-gap-tool" && (
          <div style={{ position: "fixed", inset: 0, zIndex: 200, backgroundColor: "#f5f7f5" }}>
            <GigGapStep onComplete={() => setCurrentScreen("dashboard")} />
          </div>
        )}

        {/* iOS Bottom Sheet — add menu */}
        {fabOpen && currentScreen !== "profile" && isMainScreen && (
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
                onClick={() => { hapticLight(); setFabOpen(false); setCurrentScreen("gig-form"); }}
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
                onClick={() => { hapticLight(); setFabOpen(false); setCurrentScreen("expense-form"); }}
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
            {/*
              Sheet container — fills exactly the visual viewport height via CSS var.
              --vp-height is set by a visualViewport "resize" listener that writes
              directly to the DOM (bypassing React's batching), so the container
              shrinks in lockstep with the keyboard animation — zero gap, zero lag.
              pointer-events:none so taps on the transparent top area close the sheet
              via the backdrop above.
            */}
            <div style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "var(--vp-height, 100dvh)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              alignItems: "center",
              zIndex: 56,
              pointerEvents: "none",
            }}>
            {/* White sheet panel — slides in from bottom */}
            <div style={{
              width: "100%",
              maxWidth: "480px",
              backgroundColor: "#ffffff",
              borderRadius: "20px 20px 0 0",
              paddingBottom: "max(env(safe-area-inset-bottom, 16px), 16px)",
              maxHeight: "calc(var(--vp-height, 100dvh) - 48px)",
              display: "flex",
              flexDirection: "column",
              transform: gotPaidSheetVisible ? "translateY(0)" : "translateY(100%)",
              transition: "transform 320ms cubic-bezier(0.32, 0.72, 0, 1)",
              pointerEvents: "all",
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
                              <div style={{ fontSize: "17px", fontWeight: 600, color: "#111111" }}>${Number(gig.expectedPay ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
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
                        <div style={{ fontSize: "17px", fontWeight: 600, color: "#111111" }}>${Number(gig.expectedPay ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
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
          </div>
        )}

        {/* Bottom Navigation — fixed to physical screen bottom */}
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
