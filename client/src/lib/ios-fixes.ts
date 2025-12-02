// iOS Safari mobile fixes and zoom prevention
export class IOSMobileFixes {
  private static isIOS(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  }

  private static isSafari(): boolean {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  }

  static init(): void {
    if (!this.isIOS()) return;

    console.log('🍎 Initializing iOS Safari fixes for entire app');

    // Prevent zoom on input focus
    this.preventInputZoom();
    
    // Handle virtual keyboard
    this.handleVirtualKeyboard();
    
    // Fix viewport issues
    this.fixViewport();
    
    // Additional global fixes
    this.applyGlobalIOSFixes();
  }

  private static applyGlobalIOSFixes(): void {
    // Prevent double-tap zoom only on form inputs, allow normal button interactions
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
      const target = e.target as HTMLElement;
      const now = (new Date()).getTime();
      // Only prevent double-tap zoom on form inputs, NOT on interactive buttons/calendar
      if (now - lastTouchEnd <= 300 && target.matches('input, textarea, select')) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    }, { passive: false });

    // Add event listeners for focus events to ensure zoom prevention and auto-scroll
    document.addEventListener('focusin', (e) => {
      const target = e.target as HTMLElement;
      if (target.matches('input, textarea, select')) {
        target.style.fontSize = '16px';
        target.style.webkitTextSizeAdjust = '100%';
        (target.style as any).textSizeAdjust = '100%';
        
        // Auto-scroll input into view after keyboard opens
        this.scrollInputIntoView(target);
      }
    });
  }

  // Track active scroll operation to cancel on field switch
  private static activeScrollController: AbortController | null = null;

  // Helper to find scrollable parent container
  private static findScrollableParent(element: HTMLElement): HTMLElement | null {
    let parent = element.parentElement;
    while (parent && parent !== document.body) {
      const style = window.getComputedStyle(parent);
      const overflowY = style.overflowY;
      if (overflowY === 'auto' || overflowY === 'scroll') {
        return parent;
      }
      if (parent.classList.contains('overflow-y-auto') || 
          parent.classList.contains('overflow-auto') ||
          parent.hasAttribute('data-radix-scroll-area-viewport') ||
          parent.hasAttribute('data-radix-dialog-content')) {
        return parent;
      }
      parent = parent.parentElement;
    }
    return null;
  }

  // Auto-scroll focused input into view above keyboard with polling
  private static scrollInputIntoView(element: HTMLElement): void {
    // Cancel any previous scroll operation
    if (this.activeScrollController) {
      this.activeScrollController.abort();
    }
    
    const controller = new AbortController();
    this.activeScrollController = controller;
    
    // Cancel scroll if element loses focus
    const handleFocusOut = () => {
      controller.abort();
      element.removeEventListener('blur', handleFocusOut);
    };
    element.addEventListener('blur', handleFocusOut);
    
    let lastViewportHeight = window.visualViewport?.height || window.innerHeight;
    let stableCount = 0;
    let scrollAttempts = 0;
    const maxAttempts = 30; // ~1 second at 33ms intervals
    const startTime = Date.now();
    
    const attemptScroll = () => {
      if (controller.signal.aborted) return;
      
      // Stop after 1 second or max attempts
      if (Date.now() - startTime > 1000 || scrollAttempts >= maxAttempts) {
        element.removeEventListener('blur', handleFocusOut);
        return;
      }
      
      scrollAttempts++;
      
      const viewport = window.visualViewport;
      const windowHeight = window.innerHeight;
      const currentViewportHeight = viewport?.height || windowHeight;
      
      // Check if viewport is stable (keyboard finished animating)
      if (Math.abs(currentViewportHeight - lastViewportHeight) < 5) {
        stableCount++;
      } else {
        stableCount = 0;
        lastViewportHeight = currentViewportHeight;
      }
      
      // Estimate keyboard height
      let keyboardHeight = 320; // Fallback for external keyboards
      if (viewport && viewport.height < windowHeight * 0.85) {
        keyboardHeight = windowHeight - viewport.height;
      }
      
      const rect = element.getBoundingClientRect();
      const safeAreaBottom = keyboardHeight + 40; // Extra padding
      const visibleAreaHeight = windowHeight - safeAreaBottom;
      
      // Check if input is hidden by keyboard or too close to top
      const needsScroll = rect.bottom > visibleAreaHeight || rect.top < 60;
      
      if (needsScroll) {
        // Target position: input at ~30% from top of visible area
        const targetY = Math.min(visibleAreaHeight * 0.3, 120);
        const scrollAmount = rect.top - targetY;
        
        if (Math.abs(scrollAmount) > 10) {
          const scrollableParent = this.findScrollableParent(element);
          const scrollTarget = scrollableParent || window;
          
          // Use instant scroll during keyboard animation, smooth when stable
          const behavior = stableCount > 3 ? 'smooth' : 'instant';
          
          if (scrollableParent) {
            scrollableParent.scrollBy({ top: scrollAmount, behavior });
          } else {
            window.scrollBy({ top: scrollAmount, behavior });
          }
        }
      }
      
      // Continue polling if viewport not yet stable
      if (stableCount < 5) {
        requestAnimationFrame(attemptScroll);
      } else {
        element.removeEventListener('blur', handleFocusOut);
      }
    };
    
    // Start polling after brief initial delay for keyboard to start opening
    setTimeout(() => {
      if (!controller.signal.aborted) {
        attemptScroll();
      }
    }, 100);
  }

  private static preventInputZoom(): void {
    // Ensure ALL inputs throughout the app have 16px font size to prevent zoom
    const applyZoomPrevention = (element: HTMLElement) => {
      element.style.fontSize = '16px';
      element.style.webkitTextSizeAdjust = '100%';
      (element.style as any).textSizeAdjust = '100%';
      element.style.webkitTransform = 'translateZ(0)';
      element.style.transform = 'translateZ(0)';
    };

    // Apply to existing inputs
    const inputs = document.querySelectorAll('input, textarea, select, button[type="submit"]');
    inputs.forEach((input) => {
      applyZoomPrevention(input as HTMLElement);
    });

    // Listen for dynamically added inputs (React re-renders, new forms, etc.)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            
            // Check if the node itself is an input
            if (element.matches('input, textarea, select, button[type="submit"]')) {
              applyZoomPrevention(element as HTMLElement);
            }
            
            // Check for child inputs
            const newInputs = element.querySelectorAll('input, textarea, select, button[type="submit"]');
            newInputs.forEach((input) => {
              applyZoomPrevention(input as HTMLElement);
            });
            
            // Special handling for form components and dialogs
            if (element.matches('[data-radix-dialog-content], form, [class*="form"], [class*="dialog"]')) {
              const formInputs = element.querySelectorAll('input, textarea, select');
              formInputs.forEach((input) => {
                applyZoomPrevention(input as HTMLElement);
              });
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  private static handleVirtualKeyboard(): void {
    let keyboardHeight = 0;
    
    // Listen for viewport changes (keyboard open/close)
    const handleViewportChange = () => {
      const viewport = window.visualViewport;
      if (!viewport) return;

      const currentHeight = viewport.height;
      const windowHeight = window.innerHeight;
      
      if (currentHeight < windowHeight * 0.75) {
        // Keyboard is likely open
        keyboardHeight = windowHeight - currentHeight;
        document.body.classList.add('keyboard-open');
        document.body.style.setProperty('--keyboard-height', `${keyboardHeight}px`);
      } else {
        // Keyboard is likely closed
        keyboardHeight = 0;
        document.body.classList.remove('keyboard-open');
        document.body.style.setProperty('--keyboard-height', '0px');
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
    }

    // Fallback for older iOS versions
    window.addEventListener('resize', () => {
      setTimeout(handleViewportChange, 300);
    });
  }

  private static fixViewport(): void {
    // Fix safe area handling (removed overscrollBehavior to allow keyboard scrolling)
    const root = document.documentElement;
    root.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top, 0px)');
    root.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom, 0px)');
    root.style.setProperty('--safe-area-inset-left', 'env(safe-area-inset-left, 0px)');
    root.style.setProperty('--safe-area-inset-right', 'env(safe-area-inset-right, 0px)');
  }

  // Method to be called when a modal/dialog opens - simplified to avoid conflicts
  static handleDialogOpen(): void {
    if (!this.isIOS()) return;
    
    try {
      // Store current scroll position
      const scrollY = window.scrollY;
      document.body.dataset.scrollY = scrollY.toString();
      
      // Gentle scroll prevention without aggressive positioning
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } catch (error) {
      console.warn('iOS dialog open handling failed:', error);
    }
  }

  // Method to be called when a modal/dialog closes - simplified to avoid conflicts
  static handleDialogClose(): void {
    if (!this.isIOS()) return;
    
    try {
      // Get stored scroll position
      const scrollY = document.body.dataset.scrollY || '0';
      
      // Restore scrolling gently
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      
      // Clean up data attribute
      delete document.body.dataset.scrollY;
      
      // Gentle scroll restoration
      requestAnimationFrame(() => {
        window.scrollTo(0, parseInt(scrollY));
      });
    } catch (error) {
      console.warn('iOS dialog close handling failed:', error);
    }
  }
}

// Auto-initialize on load
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => IOSMobileFixes.init());
  } else {
    IOSMobileFixes.init();
  }
}