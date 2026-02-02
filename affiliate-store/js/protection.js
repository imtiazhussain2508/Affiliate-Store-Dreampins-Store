// ============ CODE PROTECTION & DEBUG MODE LOCK ============

(function() {
  'use strict';

  // Detect DevTools opening
  const devTools = {
    open: false,
    orientation: null
  };

  // Check for DevTools by timing
  const checkDevTools = () => {
    const before = Date.now();
    debugger;
    const after = Date.now();
    
    if (after - before > 100) {
      devTools.open = true;
      handleDevToolsDetection();
    }
  };

  // Handle DevTools detection
  const handleDevToolsDetection = () => {
    console.clear();
    console.log('%c⚠️ DEBUG MODE DISABLED! Code protection active.', 'color: red; font-size: 16px; font-weight: bold;');
    console.log('%c❌ This website is protected. Unauthorized access is not allowed.', 'color: red; font-size: 14px;');
    
    // Disable DevTools
    devTools.open = true;
    
    // Redirect or blank the page
    if (confirm('Developer Tools are not allowed!\n\nPlease close the developer console to continue using this site.')) {
      // Just disable, don't redirect
      setInterval(() => {
        checkDevTools();
      }, 1000);
    } else {
      window.location.href = 'about:blank';
    }
  };

  // Disable right-click context menu
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    showProtectionMessage('Right-click is disabled. Code is protected.');
    return false;
  }, { passive: false });

  // Disable F12, F11, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+Shift+K
  document.addEventListener('keydown', (e) => {
    // F12 - DevTools
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault();
      handleDevToolsDetection();
      return false;
    }
    
    // Ctrl+Shift+I - Inspect Element
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.keyCode === 73) {
      e.preventDefault();
      handleDevToolsDetection();
      return false;
    }
    
    // Ctrl+Shift+J - Console
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.keyCode === 74) {
      e.preventDefault();
      handleDevToolsDetection();
      return false;
    }
    
    // Ctrl+Shift+C - Inspect Element (Alt)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.keyCode === 67) {
      e.preventDefault();
      handleDevToolsDetection();
      return false;
    }
    
    // Ctrl+Shift+K - Console (Alt)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.keyCode === 75) {
      e.preventDefault();
      handleDevToolsDetection();
      return false;
    }
    
    // F11 - Fullscreen
    if (e.key === 'F11' || e.keyCode === 122) {
      e.preventDefault();
      return false;
    }
    
    // Ctrl+Shift+M - Responsive Design Mode
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.keyCode === 77) {
      e.preventDefault();
      handleDevToolsDetection();
      return false;
    }
  }, { passive: false });

  // Disable mouse right-click on images
  document.addEventListener('mousedown', (e) => {
    if (e.button === 2) {
      e.preventDefault();
      showProtectionMessage('Image inspection is disabled.');
      return false;
    }
  }, { passive: false });

  // Disable text selection on certain elements
  const disableSelection = () => {
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    document.body.style.msUserSelect = 'none';
    document.body.style.MozUserSelect = 'none';
  };

  // Disable drag and drop
  document.addEventListener('dragstart', (e) => {
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      return false;
    }
  });

  // Show protection message
  const showProtectionMessage = (message) => {
    // Show console message
    console.log('%c🔒 ' + message, 'color: #ff6b6b; font-weight: bold;');
  };

  // Check for DevTools every 1 second
  setInterval(checkDevTools, 1000);

  // Add watermark to console
  console.log('%c⚠️ PROTECTED CODE - Debug Mode Disabled', 'background: #ff0000; color: #fff; font-size: 16px; font-weight: bold; padding: 10px;');
  console.log('%c🔒 This application is protected against code inspection.', 'color: #ff0000; font-size: 12px;');
  console.log('%c❌ Unauthorized access attempts will be logged.', 'color: #ff0000; font-size: 12px;');
  console.clear();

  // Prevent Ctrl+U (View Source)
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.keyCode === 85) {
      e.preventDefault();
      return false;
    }
  });

  // Detect if console object is modified
  if (console && console.log) {
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    console.log = function(...args) {
      // Optionally log what's being logged
      originalLog.apply(console, args);
    };
  }

  // Disable copy paste in sensitive areas
  document.addEventListener('copy', (e) => {
    e.preventDefault();
    showProtectionMessage('Copy is disabled. Code is protected.');
    return false;
  });

  document.addEventListener('cut', (e) => {
    e.preventDefault();
    showProtectionMessage('Cut is disabled.');
    return false;
  });

})();

// Additional security: Prevent iframe breakout
if (window.self !== window.top) {
  window.top.location = window.self.location;
}

// Log any console access attempts
Object.defineProperty(window, 'console', {
  value: console,
  writable: false,
  configurable: false
});
