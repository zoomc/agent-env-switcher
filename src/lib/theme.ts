const MEDIA_QUERY = '(prefers-color-scheme: dark)';

function applyTheme(isDark: boolean) {
  document.documentElement.classList.toggle('dark', isDark);
}

export function initTheme() {
  const mq = window.matchMedia(MEDIA_QUERY);
  applyTheme(mq.matches);
  mq.addEventListener('change', (e) => applyTheme(e.matches));
}
