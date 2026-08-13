/**
 * Anti-Copy, Anti-DevTools & Source Protection Deterrents Shield
 */
export function initSecurityShield() {
  if (typeof window === "undefined") return;

  // 1. Prevent Right-Click Context Menu
  window.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    return false;
  });

  // 2. Prevent Copy & Cut & Dragging
  window.addEventListener("copy", (e) => {
    e.preventDefault();
    return false;
  });

  window.addEventListener("cut", (e) => {
    e.preventDefault();
    return false;
  });

  window.addEventListener("dragstart", (e) => {
    e.preventDefault();
    return false;
  });

  // 3. Prevent DevTools & Source Inspect Keyboard Shortcuts
  window.addEventListener("keydown", (e) => {
    // F12
    if (e.key === "F12" || e.keyCode === 123) {
      e.preventDefault();
      return false;
    }

    const isCtrl = e.ctrlKey || e.metaKey;
    const isShift = e.shiftKey;

    if (isCtrl) {
      const key = e.key.toLowerCase();
      // Ctrl+U (View Source), Ctrl+S (Save Page), Ctrl+P (Print)
      if (key === "u" || key === "s" || key === "p") {
        e.preventDefault();
        return false;
      }
      // Ctrl+Shift+I (DevTools), Ctrl+Shift+J (Console), Ctrl+Shift+C (Inspect)
      if (isShift && (key === "i" || key === "j" || key === "c")) {
        e.preventDefault();
        return false;
      }
    }
  });

  // 4. Inject global CSS to disable text selection except in text inputs
  const style = document.createElement("style");
  style.textContent = `
    body, div, p, span, h1, h2, h3, h4, h5, h6, table, tr, td, th {
      -webkit-user-select: none !important;
      -moz-user-select: none !important;
      -ms-user-select: none !important;
      user-select: none !important;
      -webkit-touch-callout: none !important;
    }
    input, textarea {
      -webkit-user-select: text !important;
      -moz-user-select: text !important;
      -ms-user-select: text !important;
      user-select: text !important;
    }
  `;
  document.head.appendChild(style);
}
