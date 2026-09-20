import { useEffect, useRef } from "react";

// Keep mobile navigation keyboard-accessible without affecting the desktop rail.
export function useNavigationDrawer(open, onClose) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open || !window.matchMedia("(max-width: 1023px)").matches) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const drawer = ref.current;
    const focusable = () =>
      [
        ...drawer.querySelectorAll(
          'a[href], button:not(:disabled), [tabindex="0"]',
        ),
      ].filter((element) => element.getClientRects().length > 0);
    focusable()[0]?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
      if (event.key !== "Tab") return;
      const elements = focusable();
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    const onResize = () => {
      if (window.innerWidth >= 1024) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
      previousFocus?.focus();
    };
  }, [open, onClose]);
  return ref;
}
