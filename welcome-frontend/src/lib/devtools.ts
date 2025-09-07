// Hot reload enhancement for better debugging
export function enableDevTools() {
  if (import.meta.env.DEV) {
    // Enable React DevTools
    if (typeof window !== 'undefined') {
      (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ || {};
    }
    
    // Add debugging helpers
    if (typeof window !== 'undefined') {
      (window as any).debugApp = {
        // Add API debugging helper
        api: () => import('../lib/api'),
        // Clear all localStorage
        clearStorage: () => {
          localStorage.clear();
          sessionStorage.clear();
          console.log('🧹 Storage cleared');
        },
        // Force page reload
        reload: () => window.location.reload(),
        // Show environment info
        env: () => console.table(import.meta.env),
      };
      
      console.log('🔧 Debug tools available on window.debugApp');
    }
  }
}

// Auto-reload on significant errors
export function setupErrorHandling() {
  if (import.meta.env.DEV) {
    window.addEventListener('error', (event) => {
      console.error('🚨 Runtime error:', event.error);
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      console.error('🚨 Unhandled promise rejection:', event.reason);
    });
  }
}
