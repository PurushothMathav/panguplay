// episode-navigation.js
function playEpisode(episodeId) {
  const index = episodes.findIndex(e => e.id === episodeId);
  if (index === -1) return;
  currentEpisodeId = episodeId;
  currentEpisodeIndex = index;
  const episode = episodes[index];
  currentVideoSources = [];
  if (episode.videoUrl) {
    currentVideoSources.push({ url: episode.videoUrl, quality: '1080p' });
  }
  if (episode.altVideoUrl) {
    currentVideoSources.push({ url: episode.altVideoUrl, quality: '720p' });
  }
  setupResolutionSelector();
  loadVideo(currentVideoSources[0]?.url || '');
  updateHeaderTitle(playerData.title, true, episode.season, episode.episode, episode.title);
  updateEpisodeButtons();
  updateNavButtons();
}

function updateHeaderTitle(title, isSeries = false, seasonNumber = null, episodeNumber = null, episodeTitle = null) {
  const headerElement = document.getElementById('pageHeading');
  if (isSeries && seasonNumber !== null && episodeNumber !== null) {
    headerElement.textContent = `S${String(seasonNumber).padStart(2, '0')}E${String(episodeNumber).padStart(2, '0')} - ${episodeTitle || `Episode ${episodeNumber}`}`;
  } else {
    headerElement.textContent = title;
  }
}

function updateEpisodeButtons() {
  const container = document.getElementById('episodeButtons');
  container.innerHTML = '';
  episodes.forEach(ep => {
    const btn = document.createElement('button');
    btn.className = 'episode-button' + (ep.id === currentEpisodeId ? ' active' : '');
    btn.textContent = `E${ep.episode}`;
    btn.onclick = () => playEpisode(ep.id);
    container.appendChild(btn);
  });
}

function updateNavButtons() {
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const navContainer = document.getElementById('navButtons');

  if (episodes.length <= 1) {
    navContainer.style.display = 'none';
    return;
  }

  navContainer.style.display = 'flex';
  const prevIndex = currentEpisodeIndex - 1;
  const nextIndex = currentEpisodeIndex + 1;

  if (prevIndex >= 0) {
    prevBtn.disabled = false;
    prevBtn.innerHTML = `<i class="fas fa-step-backward"></i> EP${episodes[prevIndex].episode}`;
  } else {
    prevBtn.disabled = true;
    prevBtn.innerHTML = `<i class="fas fa-step-backward"></i> EP-`;
  }

  if (nextIndex < episodes.length) {
    nextBtn.disabled = false;
    nextBtn.innerHTML = `EP${episodes[nextIndex].episode} <i class="fas fa-step-forward"></i>`;
  } else {
    nextBtn.disabled = true;
    nextBtn.innerHTML = `EP- <i class="fas fa-step-forward"></i>`;
  }
}

function playPreviousEpisode() {
  if (currentEpisodeIndex > 0) {
    playEpisode(episodes[currentEpisodeIndex - 1].id);
  }
}

function playNextEpisode() {
  if (currentEpisodeIndex < episodes.length - 1) {
    playEpisode(episodes[currentEpisodeIndex + 1].id);
  }
}
