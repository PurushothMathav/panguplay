// gestures.js
let initialDistance = null;

function getDistance(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

function handleTouchStart(e) {
  if (e.touches.length === 2) {
    initialDistance = getDistance(e.touches);
  }
}

function handleTouchMove(e) {
  if (e.touches.length === 2 && initialDistance !== null) {
    const currentDistance = getDistance(e.touches);
    const diff = currentDistance - initialDistance;

    if (Math.abs(diff) > 30) {
      const wrapper = document.querySelector('.player-wrapper');
      if (diff > 0) {
        wrapper.classList.add('stretch');
        showToast('Stretch to fill screen');
      } else {
        wrapper.classList.remove('stretch');
        showToast('Fit to screen');
      }
      initialDistance = null;
    }
  }
}

function handleTouchEnd(e) {
  if (e.touches.length < 2) {
    initialDistance = null;
  }
}

function setupDoubleTapSeeking() {
  const videoContainer = document.querySelector('.video-container');
  const playerElement = document.getElementById('player');
  let lastTap = 0;

  const leftOverlay = document.createElement('div');
  leftOverlay.className = 'tap-overlay tap-overlay-left';
  leftOverlay.innerHTML = '<i class="fas fa-backward"></i><span>-10s</span>';

  const rightOverlay = document.createElement('div');
  rightOverlay.className = 'tap-overlay tap-overlay-right';
  rightOverlay.innerHTML = '<i class="fas fa-forward"></i><span>+10s</span>';

  videoContainer.appendChild(leftOverlay);
  videoContainer.appendChild(rightOverlay);

  videoContainer.addEventListener('touchend', function (e) {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    const screenWidth = window.innerWidth;
    const touchX = e.changedTouches[0].clientX;
    const side = touchX < screenWidth / 2 ? 'left' : 'right';

    if (tapLength < 300 && tapLength > 0) {
      if (side === 'left') {
        player.currentTime = Math.max(player.currentTime - 10, 0);
        showTapOverlay(leftOverlay);
      } else {
        player.currentTime = Math.min(player.currentTime + 10, player.duration);
        showTapOverlay(rightOverlay);
      }
      e.preventDefault();
    }

    lastTap = currentTime;
  });

  function showTapOverlay(overlay) {
    overlay.classList.add('active');
    setTimeout(() => overlay.classList.remove('active'), 500);
  }
}
