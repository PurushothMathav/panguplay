// autoplay.js
let autoPlayTimeout;
let countdownInterval;

function handleVideoEnded() {
  if (!episodes.length || episodes.length <= 1 || !autoPlayNext) {
    return;
  }
  if (currentEpisodeIndex < episodes.length - 1) {
    showAutoPlayOverlay();
  } else {
    showToast('Series completed! 🎉');
  }
}

function showAutoPlayOverlay() {
  const nextEpisode = episodes[currentEpisodeIndex + 1];
  let countdown = 3;

  let btn = document.getElementById('autoPlayNextBtn');
  if (!btn) {
    btn = createAutoPlayNextButton();
  }

  const label = btn.querySelector('.label');
  const progress = btn.querySelector('.progress-ring');

  label.textContent = `Auto: Next in ${countdown}s`;
  btn.style.display = 'flex';
  progress.style.animation = `countdownAnim ${countdown}s linear forwards`;

  countdownInterval = setInterval(() => {
    countdown--;
    label.textContent = `Auto: Next in ${countdown}s`;
    if (countdown <= 0) {
      clearInterval(countdownInterval);
      hideAutoPlayOverlay();
      playNextEpisode();
    }
  }, 1000);
}

function createAutoPlayNextButton() {
  const btn = document.createElement('div');
  btn.id = 'autoPlayNextBtn';
  btn.className = 'auto-play-next-btn';
  btn.innerHTML = `
    <svg class="progress-ring" viewBox="0 0 36 36">
      <path class="progress-ring-path"
            stroke="#ff4500"
            stroke-width="3"
            fill="none"
            stroke-dasharray="100, 100"
            d="M18 2.0845
               a 15.9155 15.9155 0 0 1 0 31.831
               a 15.9155 15.9155 0 0 1 0 -31.831" />
    </svg>
    <span class="label">Auto: Next</span>
  `;
  btn.onclick = () => {
    clearInterval(countdownInterval);
    hideAutoPlayOverlay();
    playNextEpisode();
  };

  const container = document.fullscreenElement || document.querySelector('.video-container');
  if (!document.getElementById('autoPlayNextBtn')) {
    container.appendChild(btn);
  }

  return btn;
}

function hideAutoPlayOverlay() {
  const btn = document.getElementById('autoPlayNextBtn');
  if (btn) btn.style.display = 'none';
  if (countdownInterval) clearInterval(countdownInterval);
}

document.addEventListener('fullscreenchange', () => {
  const btn = document.getElementById('autoPlayNextBtn');
  if (btn && btn.style.display === 'flex') {
    document.fullscreenElement?.appendChild(btn);
  }
});
