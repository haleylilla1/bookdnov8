import { useEffect, useState, useCallback, useRef } from 'react';

const IOS_KEYBOARD_HEIGHT_ESTIMATE = 320;

export function KeyboardToolbar() {
  const [isVisible, setIsVisible] = useState(false);
  const [bottomOffset, setBottomOffset] = useState(0);
  const focusedElementRef = useRef<HTMLElement | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialWindowHeightRef = useRef<number>(0);

  const dismissKeyboard = useCallback(() => {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
      activeElement.blur();
    }
    setIsVisible(false);
    focusedElementRef.current = null;
  }, []);

  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (!isIOS) return;

    initialWindowHeightRef.current = window.innerHeight;

    const findScrollableParent = (element: HTMLElement): HTMLElement | null => {
      let parent = element.parentElement;
      while (parent && parent !== document.body) {
        const style = window.getComputedStyle(parent);
        const overflowY = style.overflowY;
        const isScrollable = overflowY === 'auto' || overflowY === 'scroll';
        const hasScrollableClass = parent.classList.contains('overflow-y-auto') || 
                                   parent.classList.contains('overflow-auto');
        const isRadixContent = parent.hasAttribute('data-radix-scroll-area-viewport') ||
                               parent.hasAttribute('data-radix-dialog-content');
        
        if (isScrollable || hasScrollableClass || isRadixContent) {
          return parent;
        }
        parent = parent.parentElement;
      }
      return null;
    };

    const getEstimatedKeyboardHeight = (): number => {
      const viewport = window.visualViewport;
      if (viewport) {
        const windowHeight = initialWindowHeightRef.current || window.innerHeight;
        const viewportHeight = viewport.height;
        const measuredHeight = windowHeight - viewportHeight;
        if (measuredHeight > 100) {
          return measuredHeight;
        }
      }
      return IOS_KEYBOARD_HEIGHT_ESTIMATE;
    };

    const scrollInputIntoView = (element: HTMLElement, keyboardHeight: number) => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const toolbarHeight = 50;
        const safeAreaBottom = keyboardHeight + toolbarHeight + 20;
        
        const visibleAreaHeight = windowHeight - safeAreaBottom;
        const inputBottom = rect.bottom;
        const inputTop = rect.top;
        
        const scrollableParent = findScrollableParent(element);
        
        if (inputBottom > visibleAreaHeight || inputTop < 80) {
          const targetY = Math.min(visibleAreaHeight * 0.4, 150);
          const scrollAmount = inputTop - targetY;
          
          if (scrollableParent) {
            scrollableParent.scrollBy({ 
              top: scrollAmount, 
              behavior: 'smooth' 
            });
          } else {
            const currentScroll = window.scrollY || document.documentElement.scrollTop;
            window.scrollTo({
              top: currentScroll + scrollAmount,
              behavior: 'smooth'
            });
          }
        }
      }, 100);
    };

    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        const inputType = (target as HTMLInputElement).type;
        if (inputType === 'date' || inputType === 'time' || inputType === 'datetime-local') {
          return;
        }
        
        focusedElementRef.current = target;
        
        const estimatedHeight = getEstimatedKeyboardHeight();
        setBottomOffset(estimatedHeight);
        setIsVisible(true);
        
        setTimeout(() => {
          const currentHeight = getEstimatedKeyboardHeight();
          setBottomOffset(currentHeight);
          scrollInputIntoView(target, currentHeight);
        }, 350);
      }
    };

    const handleFocusOut = (e: FocusEvent) => {
      setTimeout(() => {
        const active = document.activeElement;
        if (!active || (active.tagName !== 'INPUT' && active.tagName !== 'TEXTAREA')) {
          setIsVisible(false);
          setBottomOffset(0);
          focusedElementRef.current = null;
          if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
          }
        }
      }, 150);
    };

    const updateToolbarPosition = () => {
      if (!focusedElementRef.current) return;
      
      const keyboardHeight = getEstimatedKeyboardHeight();
      setBottomOffset(keyboardHeight);
      
      if (document.activeElement === focusedElementRef.current) {
        scrollInputIntoView(focusedElementRef.current, keyboardHeight);
      }
    };

    document.addEventListener('focusin', handleFocusIn, { passive: true });
    document.addEventListener('focusout', handleFocusOut, { passive: true });
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateToolbarPosition);
      window.visualViewport.addEventListener('scroll', updateToolbarPosition);
    }

    window.addEventListener('resize', updateToolbarPosition);

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateToolbarPosition);
        window.visualViewport.removeEventListener('scroll', updateToolbarPosition);
      }
      window.removeEventListener('resize', updateToolbarPosition);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (!isIOS || !isVisible) return null;

  return (
    <div
      data-testid="keyboard-toolbar"
      className="keyboard-toolbar"
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: bottomOffset,
        height: '44px',
        backgroundColor: '#d1d5db',
        borderTop: '1px solid #9ca3af',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingRight: '12px',
        paddingLeft: '12px',
        zIndex: 99999,
        WebkitTransform: 'translate3d(0, 0, 0)',
        transform: 'translate3d(0, 0, 0)',
        willChange: 'bottom',
      }}
    >
      <button
        type="button"
        data-testid="keyboard-done-button"
        onClick={dismissKeyboard}
        onTouchEnd={(e) => {
          e.preventDefault();
          dismissKeyboard();
        }}
        style={{
          backgroundColor: 'transparent',
          border: 'none',
          color: '#2563eb',
          fontSize: '17px',
          fontWeight: '600',
          padding: '8px 16px',
          cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
          minHeight: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        Done
      </button>
    </div>
  );
}

export default KeyboardToolbar;
