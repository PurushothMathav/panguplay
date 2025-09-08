// Function to handle orientation lock
function setupOrientationLock() {
  // Check if this is a mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  if (!isMobile) return; // Exit if not on mobile

  // Check if we're on the player page
  const isPlayerPage = window.location.pathname.includes('player.html');

  // Track fullscreen state
  let isFullScreen = false;
  let orientationLockTimeout = null;
  let fullscreenTransitionTimeout = null;

  // Function to check if we're in fullscreen mode (more comprehensive)
  function checkFullScreen() {
    return !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement ||
      (window.screen && window.screen.height === window.innerHeight)
    );
  }

  // Function to clear any pending orientation lock timeouts
  function clearOrientationTimeouts() {
    if (orientationLockTimeout) {
      clearTimeout(orientationLockTimeout);
      orientationLockTimeout = null;
    }
    if (fullscreenTransitionTimeout) {
      clearTimeout(fullscreenTransitionTimeout);
      fullscreenTransitionTimeout = null;
    }
  }

  // Function to lock orientation to portrait with delay
  function lockToPortrait(delay = 0) {
    clearOrientationTimeouts();
    
    orientationLockTimeout = setTimeout(() => {
      // Double-check fullscreen state before locking
      const currentFullScreen = checkFullScreen();
      if (currentFullScreen) {
        console.log('Skipping orientation lock - in fullscreen mode');
        return;
      }

      if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('portrait').catch(err => {
          console.log('Orientation lock failed: ', err);
          // Fallback for devices that don't support orientation lock
          handleOrientationFallback();
        });
      } else if (window.orientation !== undefined) {
        // Handle older devices (mostly iOS)
        handleOrientationFallback();
      }
    }, delay);
  }

  // Fallback orientation handling for older devices
  function handleOrientationFallback() {
    if (window.orientation !== undefined) {
      const orientation = window.orientation;
      if (orientation !== 0 && orientation !== 180) {
        console.log('Please rotate to portrait mode');
        if (isPlayerPage && !checkFullScreen()) {
          // Only enter fullscreen if we're on player page and not already in fullscreen
          setTimeout(enterVideoFullscreen, 300);
        }
      }
    }
  }

  // Function to enter fullscreen for the video
  function enterVideoFullscreen() {
    if (isPlayerPage && !checkFullScreen()) {
      const videoElement = document.querySelector('video');
      if (videoElement) {
        console.log('Attempting to enter video fullscreen');
        
        // Try different fullscreen methods
        const enterFullscreen = () => {
          if (videoElement.requestFullscreen) {
            return videoElement.requestFullscreen();
          } else if (videoElement.webkitRequestFullscreen) {
            return videoElement.webkitRequestFullscreen();
          } else if (videoElement.mozRequestFullScreen) {
            return videoElement.mozRequestFullScreen();
          } else if (videoElement.msRequestFullscreen) {
            return videoElement.msRequestFullscreen();
          } else if (videoElement.webkitEnterFullscreen) {
            // iOS Safari fallback
            return videoElement.webkitEnterFullscreen();
          }
          return Promise.reject('Fullscreen not supported');
        };

        enterFullscreen().catch(err => {
          console.log('Fullscreen request failed:', err);
        });
      }
    }
  }

  // Update fullscreen tracking state with improved logic
  function updateFullScreenState() {
    clearOrientationTimeouts();
    
    const wasFullScreen = isFullScreen;
    
    // Add a small delay to ensure fullscreen state is properly updated
    fullscreenTransitionTimeout = setTimeout(() => {
      isFullScreen = checkFullScreen();
      
      console.log('Fullscreen state changed:', { wasFullScreen, isFullScreen });

      // Handle exiting fullscreen
      if (wasFullScreen && !isFullScreen) {
        console.log('Exited fullscreen - applying orientation lock');
        // Wait longer after exiting fullscreen to ensure browser is stable
        lockToPortrait(500);
      }
      
      // Handle entering fullscreen
      if (!wasFullScreen && isFullScreen) {
        console.log('Entered fullscreen - clearing orientation locks');
        clearOrientationTimeouts();
      }
    }, 100);
  }

  // Add fullscreen change event listeners
  const fullscreenEvents = [
    'fullscreenchange',
    'webkitfullscreenchange', 
    'mozfullscreenchange',
    'MSFullscreenChange'
  ];

  fullscreenEvents.forEach(eventName => {
    document.addEventListener(eventName, updateFullScreenState);
  });

  // Apply lock on page load
  setTimeout(() => {
    lockToPortrait(100);
  }, 200);

  // Apply lock when page becomes visible again
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') {
      setTimeout(() => {
        if (!checkFullScreen()) {
          lockToPortrait(200);
        }
      }, 300);
    }
  });

  // Handle orientation changes with improved logic
  window.addEventListener('orientationchange', function () {
    console.log('Orientation changed:', window.orientation);
    
    // Clear any pending timeouts
    clearOrientationTimeouts();
    
    // Wait for orientation change to complete
    setTimeout(() => {
      const currentFullScreen = checkFullScreen();
      
      if (isPlayerPage) {
        const orientation = window.orientation;
        
        if (orientation === 90 || orientation === -90) {
          // Landscape mode
          if (!currentFullScreen) {
            console.log('Landscape detected - entering fullscreen');
            setTimeout(enterVideoFullscreen, 200);
          }
        } else {
          // Portrait mode
          if (!currentFullScreen) {
            console.log('Portrait detected - locking orientation');
            setTimeout(() => lockToPortrait(), 300);
          }
        }
      } else {
        // Non-player pages - always lock to portrait
        if (!currentFullScreen) {
          setTimeout(() => lockToPortrait(), 300);
        }
      }
    }, 300);
  });

  // Handle SPA navigation or back/forward actions
  window.addEventListener('popstate', function () {
    setTimeout(() => {
      if (!checkFullScreen()) {
        lockToPortrait(200);
      }
    }, 100);
  });

  // Handle window resize (additional safety net)
  window.addEventListener('resize', function() {
    // Only trigger if significant size change (likely orientation change)
    clearTimeout(window.resizeTimeout);
    window.resizeTimeout = setTimeout(() => {
      const currentFullScreen = checkFullScreen();
      if (!currentFullScreen && window.orientation !== undefined) {
        const orientation = window.orientation;
        if (orientation === 0 || orientation === 180) {
          // Portrait orientation
          lockToPortrait(100);
        }
      }
    }, 250);
  });

  // Cleanup function for better memory management
  window.cleanupOrientationLock = function() {
    clearOrientationTimeouts();
    fullscreenEvents.forEach(eventName => {
      document.removeEventListener(eventName, updateFullScreenState);
    });
  };
}

// Set up the orientation lock when the DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupOrientationLock);
} else {
  setupOrientationLock();
}