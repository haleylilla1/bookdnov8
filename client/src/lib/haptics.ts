import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { Capacitor } from "@capacitor/core";

async function safeHaptic(fn: () => Promise<void>): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await fn();
  } catch {
    // silently ignore on web/unsupported platforms
  }
}

export function hapticLight(): void {
  safeHaptic(() => Haptics.impact({ style: ImpactStyle.Light }));
}

export function hapticMedium(): void {
  safeHaptic(() => Haptics.impact({ style: ImpactStyle.Medium }));
}

export function hapticSuccess(): void {
  safeHaptic(() => Haptics.notification({ type: NotificationType.Success }));
}
