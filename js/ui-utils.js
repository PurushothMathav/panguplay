// ui-utils.js
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.style.opacity = 1;
  setTimeout(() => {
    toast.style.opacity = 0;
  }, 3000);
}

function showLoading() {
  document.getElementById('loadingOverlay').style.display = 'flex';
}

function hideLoading() {
  document.getElementById('loadingOverlay').style.display = 'none';
}

function goBack() {
  window.history.back();
}

function toggleMenu() {
  document.getElementById('mobileMenu').classList.add('open');
  document.getElementById('mobileBackdrop').style.display = 'block';
}

function closeMenu() {
  document.getElementById('mobileMenu').classList.remove('open');
  document.getElementById('mobileBackdrop').style.display = 'none';
}

function searchFunction() {
  const input = document.getElementById('searchInput');
  const clearButton = document.getElementById('clearButton');
  if (input.value) {
    clearButton.style.display = 'block';
  } else {
    clearButton.style.display = 'none';
    document.getElementById('searchResults').style.display = 'none';
  }
}

function clearSearch() {
  const input = document.getElementById('searchInput');
  input.value = '';
  document.getElementById('clearButton').style.display = 'none';
  document.getElementById('searchResults').style.display = 'none';
}
