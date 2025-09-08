// main.js
let playerData = null;
let episodes = [];
let currentEpisodeId = null;
let currentEpisodeIndex = 0;
let autoPlayNext = true;

function loadAutoPlaySetting() {
  // Can be expanded to persist user setting
  autoPlayNext = true;
}

function addAutoPlayStyles() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes countdownAnim {
      from { stroke-dashoffset: 0; }
      to { stroke-dashoffset: 100; }
    }
  `;
  document.head.appendChild(style);
}

document.addEventListener('DOMContentLoaded', () => {
  playerData = JSON.parse(sessionStorage.getItem('playerData') || 'null');
  if (!playerData) {
    showToast('No video data found. Please go back and select a video.');
    return;
  }

  initPlayer();
  setupPage();
  setupDownloadButton();
  setupDoubleTapSeeking();
  enableLandscapeOnFullScreen();
  updateLogoInFullscreen();
  document.addEventListener('keydown', handleKeyboardShortcuts);
  loadAutoPlaySetting();
  addAutoPlayStyles();
  if (window.cast && cast.framework) {
  initializeCastApi();
} else {
  window['__onGCastApiAvailable'] = function (isAvailable) {
    if (isAvailable) initializeCastApi();
  };
}

});

function handleKeyboardShortcuts(e) {
  if (e.key === 'ArrowLeft') seekBackward();
  else if (e.key === 'ArrowRight') seekForward();
  else if (e.key === 'd' || e.key === 'D') downloadVideo();
}

function seekForward() {
  if (!player) return;
  player.currentTime = Math.min(player.currentTime + 10, player.duration);
  showToast('Forwarded 10s');
}

function seekBackward() {
  if (!player) return;
  player.currentTime = Math.max(player.currentTime - 10, 0);
  showToast('Rewound 10s');
}

function setupPage() {
  document.getElementById('videoTitle').textContent = playerData.title;
  document.getElementById('videoPoster').src = playerData.image || '';
  document.getElementById('movieRating').textContent = playerData.rating || 'N/A';
  document.getElementById('director').textContent = playerData.director || 'N/A';
  document.getElementById('starring').textContent = playerData.starring || 'N/A';
  document.getElementById('genres').textContent = playerData.genre || 'N/A';
  document.getElementById('quality').textContent = playerData.quality || 'N/A';
  document.getElementById('language').textContent = playerData.language || 'N/A';
  document.getElementById('fileSize').textContent = playerData.fileSize || 'N/A';
  document.getElementById('lastUpdated').textContent = playerData.lastUpdated || 'N/A';

  if (playerData.episodes) {
    episodes = playerData.episodes;
    playEpisode(episodes[0].id);
    document.getElementById('episodesSection').style.display = 'block';
  } else {
    currentVideoSources = [{ url: playerData.video, quality: '1080p' }];
    loadVideo(playerData.video);
    document.getElementById('episodesSection').style.display = 'none';
  }
}

