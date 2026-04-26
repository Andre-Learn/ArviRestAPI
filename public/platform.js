// ── ZFloryn Platform v2.0 Shared JS ──

// Theme management
function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  const next = isDark ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  const icon = document.getElementById('theme-icon');
  if (icon) icon.className = next === 'light' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  localStorage.setItem('zf_theme', next);
}

(function initTheme() {
  const t = localStorage.getItem('zf_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', t);
  const icon = document.getElementById('theme-icon');
  if (icon) icon.className = t === 'light' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
})();

// Mobile nav
function toggleMobileMenu() {
  let menu = document.querySelector('.nav-links');
  if (!menu) return;
  const isOpen = menu.dataset.mobileOpen === '1';
  if (!isOpen) {
    menu.style.cssText = 'display:flex;flex-direction:column;position:absolute;top:65px;left:0;right:0;background:var(--bg2);border-bottom:1px solid var(--border);padding:12px 16px;gap:4px;z-index:99;';
    menu.dataset.mobileOpen = '1';
  } else {
    menu.style.display = 'none';
    menu.dataset.mobileOpen = '0';
  }
}

// Toast
function showToast(msg, type = 'default') {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// Auth helpers
const Auth = {
  getToken: () => localStorage.getItem('zf_token'),
  getUser: () => { try { return JSON.parse(localStorage.getItem('zf_user') || 'null'); } catch { return null; } },
  setAuth: (token, user) => { localStorage.setItem('zf_token', token); localStorage.setItem('zf_user', JSON.stringify(user)); },
  clear: () => { localStorage.removeItem('zf_token'); localStorage.removeItem('zf_user'); },
  isLoggedIn: () => !!localStorage.getItem('zf_token'),
};

// Update nav based on auth state
function updateNavAuth() {
  const loggedIn = Auth.isLoggedIn();
  const loginBtn = document.getElementById('nav-login-btn');
  const registerBtn = document.getElementById('nav-register-btn');
  const dashBtn = document.getElementById('nav-dash-btn');
  const dashLink = document.getElementById('nav-dashboard-link');
  if (loginBtn) loginBtn.style.display = loggedIn ? 'none' : 'flex';
  if (registerBtn) registerBtn.style.display = loggedIn ? 'none' : 'flex';
  if (dashBtn) dashBtn.style.display = loggedIn ? 'flex' : 'none';
  if (dashLink) dashLink.style.display = loggedIn ? 'block' : 'none';
}
updateNavAuth();

// Scroll reveal
const _observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } });
}, { threshold: 0.08 });
function initReveal() {
  document.querySelectorAll('.reveal').forEach(el => _observer.observe(el));
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initReveal);
} else {
  initReveal();
}

// API helper
async function apiRequest(path, options = {}) {
  const token = Auth.getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const res = await fetch(path, { ...options, headers });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}
