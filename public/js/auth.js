const API_BASE = 'http://localhost:5000/api';

// ── Session helpers ───────────────────────────────────────────────────
function getToken() { return localStorage.getItem('cp_token'); }
function getUser()  { return JSON.parse(localStorage.getItem('cp_user') || 'null'); }

function saveSession(token, user) {
	localStorage.setItem('cp_token', token);
	localStorage.setItem('cp_user',  JSON.stringify(user));
}

function clearSession() {
	localStorage.removeItem('cp_token');
	localStorage.removeItem('cp_user');
}

function logout() {
	clearSession();
	window.location.href = 'index.html';
}

function redirectByRole(role) {
	const map = {
		resident:          'dashboard.html',
		authority_officer: 'officer.html',
		admin:             'admin.html',
	};
	window.location.href = map[role] || 'index.html';
}

// ── Alert helpers ─────────────────────────────────────────────────────
function showError(id, msg) {
	const el = document.getElementById(id);
	if (el) { el.textContent = msg; el.className = 'alert alert-error show'; }
}
function showSuccess(id, msg) {
	const el = document.getElementById(id);
	if (el) { el.textContent = msg; el.className = 'alert alert-success show'; }
}
function hideAlert(id) {
	const el = document.getElementById(id);
	if (el) el.classList.remove('show');
}

// ── XSS sanitisation ─────────────────────────────────────────────────
function esc(str) {
	if (!str) return '';
	const div = document.createElement('div');
	div.textContent = str;
	return div.innerHTML;
}

// ── Auto-redirect if already logged in (on login/register pages) ─────
(function autoRedirect() {
	const path = window.location.pathname;
	const isAuthPage = path.endsWith('index.html') || path.endsWith('register.html') || path === '/' || path.endsWith('/pages/');
	if (isAuthPage) {
		const token = getToken();
		const user  = getUser();
		if (token && user && user.role) {
			redirectByRole(user.role);
		}
	}
})();

// ── LOGIN ─────────────────────────────────────────────────────────────
const loginForm = document.getElementById('login-form');
if (loginForm) {
	loginForm.addEventListener('submit', async (e) => {
		e.preventDefault();
		hideAlert('error-msg');
		const btn = document.getElementById('login-btn');
		btn.disabled = true;
		btn.innerHTML = '<span class="spinner"></span> Signing in...';

		const email    = document.getElementById('email').value.trim();
		const password = document.getElementById('password').value;

		try {
			const res  = await fetch(`${API_BASE}/auth/login`, {
				method:  'POST',
				headers: { 'Content-Type': 'application/json' },
				body:    JSON.stringify({ email, password }),
			});
			const data = await res.json();

			if (!res.ok) {
				showError('error-msg', data.error || 'Login failed.');
				btn.disabled = false;
				btn.innerHTML = 'Sign in';
				return;
			}

			saveSession(data.token, data.user);
			redirectByRole(data.user.role);

		} catch (err) {
			showError('error-msg', 'Server unreachable. Is the backend running?');
			btn.disabled = false;
			btn.innerHTML = 'Sign in';
		}
	});
}

// ── REGISTER ──────────────────────────────────────────────────────────
const registerForm = document.getElementById('register-form');
if (registerForm) {
	// Load wards into dropdown
	(async () => {
		try {
			const res   = await fetch(`${API_BASE}/wards`);
			const data  = await res.json();
			const sel   = document.getElementById('ward_id');
			if (sel && data.wards) {
				data.wards.forEach(w => {
					const opt = document.createElement('option');
					opt.value       = w.id;
					opt.textContent = `${w.name} (${w.subcounty})`;
					sel.appendChild(opt);
				});
			}
		} catch (_) {}
	})();

	registerForm.addEventListener('submit', async (e) => {
		e.preventDefault();
		hideAlert('error-msg');
		hideAlert('success-msg');

		const btn = document.getElementById('register-btn');
		btn.disabled = true;
		btn.innerHTML = '<span class="spinner"></span> Creating account...';

		const full_name = document.getElementById('full_name').value.trim();
		const email     = document.getElementById('email').value.trim();
		const ward_id   = document.getElementById('ward_id').value || null;
		const password  = document.getElementById('password').value;

		if (password.length < 8) {
			showError('error-msg', 'Password must be at least 8 characters.');
			btn.disabled = false;
			btn.innerHTML = 'Create account';
			return;
		}

		try {
			const res  = await fetch(`${API_BASE}/auth/register`, {
				method:  'POST',
				headers: { 'Content-Type': 'application/json' },
				body:    JSON.stringify({ full_name, email, password, ward_id }),
			});
			const data = await res.json();


			if (!res.ok) {
				showError('error-msg', data.error || 'Registration failed.');
				btn.disabled = false;
				btn.innerHTML = 'Create account';
				return;
			}

			// If registration is successful, show verification notice
			showSuccess('success-msg', 'Account created! Please check your email to verify your account before logging in.');
			btn.disabled = false;
			btn.innerHTML = 'Create account';

		} catch (err) {
			showError('error-msg', 'Server unreachable. Is the backend running?');
			btn.disabled = false;
			btn.innerHTML = 'Create account';
		}
	});
}
