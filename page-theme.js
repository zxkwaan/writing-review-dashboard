const themeButton = document.getElementById('theme');

themeButton.addEventListener('click', () => {
  const dark = document.documentElement.classList.toggle('dark');
  themeButton.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
});
