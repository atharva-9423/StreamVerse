/**
 * This file patches the browser's History API to emit custom events
 * that we can listen to for navigation tracking.
 * 
 * This helps make our back button functionality more robust.
 */

// Only run in browser environment
if (typeof window !== 'undefined') {
  // Save references to original methods
  const originalPushState = window.history.pushState;
  const originalReplaceState = window.history.replaceState;

  // Create custom events
  const pushStateEvent = new Event('pushstate');
  const replaceStateEvent = new Event('replacestate');

  // Override pushState
  window.history.pushState = function(state, title, url) {
    // Call the original method
    originalPushState.apply(this, [state, title, url]);
    
    // Dispatch our custom event
    window.dispatchEvent(pushStateEvent);
  };

  // Override replaceState
  window.history.replaceState = function(state, title, url) {
    // Call the original method
    originalReplaceState.apply(this, [state, title, url]);
    
    // Dispatch our custom event
    window.dispatchEvent(replaceStateEvent);
  };
}

export {};