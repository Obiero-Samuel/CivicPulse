// admin.js — admin panel logic
// Depends on: auth.js (API_BASE, getToken, getUser, logout, esc)

const token = getToken();
const user  = getUser();

// ── Session + role guard ──────────────────────────────────────────────
if (!token || !user) {
	window.location.href = 'index.html';
}
if (user && user.role !== 'admin') {
	window.location.href = 'index.html';
}

// ── Populate nav user info ────────────────────────────────────────────
if (user) {
	const initials = user.full_name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || '?';
	const el = document.getElementById('avatar-initials');
	if (el) el.textContent = initials;
	const nameEl = document.getElementById('sidebar-name');
	if (nameEl) nameEl.textContent = user.full_name || user.email;
	const navUser = document.getElementById('nav-user');
	if (navUser) navUser.textContent = user.full_name || '';
}

// ── Page switching ────────────────────────────────────────────────────
function showPage(pageId, navEl) {
	document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
	document.getElementById(pageId)?.classList.add('active');
	document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
	if (navEl) navEl.classList.add('active');
	if (pageId === 'analytics-page') loadAnalytics();
	if (pageId === 'manage-users-page') loadUsers();
	if (pageId === 'manage-wards-page') loadWards();
}

function logout() {
	clearSession();
	window.location.href = 'index.html';
}

// ── Dark mode ─────────────────────────────────────────────────────────
function setTheme(theme) {
	document.documentElement.setAttribute('data-theme', theme);
	document.body.classList.toggle('dark', theme === 'dark');
	localStorage.setItem('cp_theme', theme);
	const btn = document.getElementById('theme-toggle');
	if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌓';
}
function toggleTheme() {
	const current = localStorage.getItem('cp_theme') || 'light';
	setTheme(current === 'dark' ? 'light' : 'dark');
}
document.getElementById('theme-toggle').onclick = toggleTheme;
(function() {
	const saved = localStorage.getItem('cp_theme');
	if (saved) setTheme(saved);
})();

// ── Analytics ─────────────────────────────────────────────────────────
async function loadAnalytics() {
	const el = document.getElementById('analytics-content');
	if (!el) return;
	try {
		const res = await fetch(`${API_BASE}/analytics/summary`, {
			headers: { 'Authorization': 'Bearer ' + token }
		});
		const data = await res.json();

		const r = data.reports || {};
		const u = data.users || {};

		el.innerHTML = `
			<div class="grid-4 mb-2">
				<div class="stat-card">
					<div class="stat-value">${r.total_reports || 0}</div>
					<div class="stat-label">Total Reports</div>
				</div>
				<div class="stat-card">
					<div class="stat-value" style="color:var(--accent)">${r.open_reports || 0}</div>
					<div class="stat-label">Open</div>
				</div>
				<div class="stat-card">
					<div class="stat-value" style="color:var(--teal)">${r.in_progress_reports || 0}</div>
					<div class="stat-label">In Progress</div>
				</div>
				<div class="stat-card accent">
					<div class="stat-value">${r.resolved_reports || 0}</div>
					<div class="stat-label">Resolved</div>
				</div>
			</div>
			<div class="grid-3 mb-2">
				<div class="stat-card">
					<div class="stat-value">${r.escalated_reports || 0}</div>
					<div class="stat-label">Escalated</div>
				</div>
				<div class="stat-card">
					<div class="stat-value">${r.resolution_rate_pct || 0}%</div>
					<div class="stat-label">Resolution Rate</div>
				</div>
				<div class="stat-card">
					<div class="stat-value">${r.reports_this_week || 0}</div>
					<div class="stat-label">This Week</div>
				</div>
			</div>
			<div class="grid-2">
				<div class="stat-card">
					<div class="stat-value">${u.total_users || 0}</div>
					<div class="stat-label">Total Users</div>
				</div>
				<div class="stat-card">
					<div class="stat-value">${u.residents || 0}</div>
					<div class="stat-label">Residents</div>
				</div>
			</div>
		`;
	} catch (err) {
		el.innerHTML = '<p class="text-muted text-sm">Failed to load analytics.</p>';
	}
}

// ── Users management ──────────────────────────────────────────────────
async function loadUsers() {
	const el = document.getElementById('users-list');
	if (!el) return;
	try {
		const res = await fetch(`${API_BASE}/admin/users`, {
			headers: { 'Authorization': 'Bearer ' + token }
		});
		const data = await res.json();
		if (!data.users || data.users.length === 0) {
			el.innerHTML = '<p class="text-muted text-sm">No users found.</p>';
			return;
		}
		el.innerHTML = `
			<div class="table-wrap">
				<table>
					<thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Ward</th><th>Status</th><th>Action</th></tr></thead>
					<tbody>
						${data.users.map(u => `
							<tr>
								<td>${esc(u.full_name)}</td>
								<td>${esc(u.email)}</td>
								<td><span class="badge">${esc(u.role)}</span></td>
								<td>${esc(u.ward_name) || '—'}</td>
								<td>${u.is_active ? '✅ Active' : '🚫 Inactive'}</td>
								<td><button class="btn btn-sm ${u.is_active ? 'btn-danger' : 'btn-primary'}" onclick="toggleUser(${u.id})">${u.is_active ? 'Deactivate' : 'Activate'}</button></td>
							</tr>
						`).join('')}
					</tbody>
				</table>
			</div>
		`;
	} catch (err) {
		el.innerHTML = '<p class="text-muted text-sm">Failed to load users.</p>';
	}
}

async function toggleUser(id) {
	try {
		const res = await fetch(`${API_BASE}/admin/users/${id}/toggle`, {
			method: 'PATCH',
			headers: { 'Authorization': 'Bearer ' + token }
		});
		if (res.ok) loadUsers();
	} catch (_) {}
}

// ── Wards management ──────────────────────────────────────────────────
async function loadWards() {
	const el = document.getElementById('wards-list');
	if (!el) return;
	try {
		const res = await fetch(`${API_BASE}/wards`);
		const data = await res.json();
		if (!data.wards || data.wards.length === 0) {
			el.innerHTML = '<p class="text-muted text-sm">No wards found.</p>';
			return;
		}
		el.innerHTML = `
			<div class="table-wrap">
				<table>
					<thead><tr><th>Ward</th><th>Sub-county</th></tr></thead>
					<tbody>
						${data.wards.map(w => `
							<tr>
								<td>${esc(w.name)}</td>
								<td>${esc(w.subcounty)}</td>
							</tr>
						`).join('')}
					</tbody>
				</table>
			</div>
		`;
	} catch (err) {
		el.innerHTML = '<p class="text-muted text-sm">Failed to load wards.</p>';
	}
}

// Init
loadAnalytics();
