import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./lib/ios-fixes";
import { initSentry } from "./lib/sentry";
import { initRevenueCat } from "./lib/revenuecat";
// Mobile optimizations removed for simplicity

// Initialize Sentry before rendering the app
initSentry();

// Initialize RevenueCat for iOS subscriptions
initRevenueCat();

createRoot(document.getElementById("root")!).render(<App />);
