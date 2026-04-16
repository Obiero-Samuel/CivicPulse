// admin.js — admin panel logic with Chart.js visualisations
// Depends on: auth.js (API_BASE, getToken, getUser, logout, esc, clearSession)

const token = getToken();
const user  = getUser();

// ── Session + role guard ──────────────────────────────────────────────
if (!token || !user) window.location.href = 'index.html';
if (user && user.role !== 'admin') window.location.href = 'index.html';

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
	if (pageId === 'performance-page') loadPerformance();
	if (pageId === 'weekly-page') loadWeeklyReport();
	if (pageId === 'manage-users-page') loadUsers();
	if (pageId === 'manage-wards-page') loadWards();
}

// ── Dark mode ─────────────────────────────────────────────────────────
function setTheme(theme) {
	document.documentElement.setAttribute('data-theme', theme);
	document.body.classList.toggle('dark', theme === 'dark');
	localStorage.setItem('cp_theme', theme);
	const btn = document.getElementById('theme-toggle');
	if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}
function toggleTheme() {
	const current = localStorage.getItem('cp_theme') || 'dark';
	setTheme(current === 'dark' ? 'light' : 'dark');
}
document.getElementById('theme-toggle').onclick = toggleTheme;
(function() {
	const saved = localStorage.getItem('cp_theme') || 'dark';
	setTheme(saved);
})();

// ── Chart instances (for cleanup) ─────────────────────────────────────
let statusChart = null;
let categoryChart = null;

// ── Analytics ─────────────────────────────────────────────────────────
async function loadAnalytics() {
	const el = document.getElementById('analytics-content');
	if (!el) return;
	try {
		const [summaryRes, catRes] = await Promise.all([
			fetch(`${API_BASE}/analytics/summary`, { headers: { 'Authorization': 'Bearer ' + token } }),
			fetch(`${API_BASE}/analytics/categories`, { headers: { 'Authorization': 'Bearer ' + token } }),
		]);
		const summaryData = await summaryRes.json();
		const catData = await catRes.json();

		const r = summaryData.reports || {};
		const u = summaryData.users || {};
		const cats = catData.categories || [];

		el.innerHTML = `
			<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;">
				<div class="stat-card">
					<div class="stat-icon blue">📋</div>
					<div class="stat-info">
						<div class="stat-number">${r.total_reports || 0}</div>
						<div class="stat-label">Total Reports</div>
					</div>
				</div>
				<div class="stat-card">
					<div class="stat-icon orange">🔓</div>
					<div class="stat-info">
						<div class="stat-number">${r.open_reports || 0}</div>
						<div class="stat-label">Open</div>
					</div>
				</div>
				<div class="stat-card">
					<div class="stat-icon green">✅</div>
					<div class="stat-info">
						<div class="stat-number">${r.resolved_reports || 0}</div>
						<div class="stat-label">Resolved</div>
					</div>
				</div>
				<div class="stat-card">
					<div class="stat-icon red">🚨</div>
					<div class="stat-info">
						<div class="stat-number">${r.escalated_reports || 0}</div>
						<div class="stat-label">Escalated</div>
					</div>
				</div>
			</div>
			<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px;">
				<div class="stat-card">
					<div class="stat-info">
						<div class="stat-number" style="color:var(--neon-cyan,#00e5ff);">${r.resolution_rate_pct || 0}%</div>
						<div class="stat-label">Resolution Rate</div>
					</div>
				</div>
				<div class="stat-card">
					<div class="stat-info">
						<div class="stat-number">${r.reports_this_week || 0}</div>
						<div class="stat-label">This Week</div>
					</div>
				</div>
				<div class="stat-card">
					<div class="stat-info">
						<div class="stat-number">${u.total_users || 0}</div>
						<div class="stat-label">Total Users (${u.residents || 0} residents, ${u.officers || 0} officers)</div>
					</div>
				</div>
			</div>
			<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
				<div class="card">
					<h3 style="font-size:0.95rem;margin-bottom:16px;">📊 Status Distribution</h3>
					<div style="max-height:300px;display:flex;justify-content:center;">
						<canvas id="status-chart"></canvas>
					</div>
				</div>
				<div class="card">
					<h3 style="font-size:0.95rem;margin-bottom:16px;">📂 Top Categories</h3>
					<div style="max-height:300px;">
						<canvas id="category-chart"></canvas>
					</div>
				</div>
			</div>
		`;

		// Render status doughnut
		if (statusChart) statusChart.destroy();
		const statusCtx = document.getElementById('status-chart');
		if (statusCtx) {
			statusChart = new Chart(statusCtx, {
				type: 'doughnut',
				data: {
					labels: ['Open', 'In Progress', 'Resolved', 'Escalated', 'Rejected'],
					datasets: [{
						data: [
							parseInt(r.open_reports) || 0,
							parseInt(r.in_progress_reports) || 0,
							parseInt(r.resolved_reports) || 0,
							parseInt(r.escalated_reports) || 0,
							parseInt(r.rejected_reports) || 0
						],
						backgroundColor: ['#F59E0B', '#3B82F6', '#10B981', '#EF4444', '#6B7280'],
						borderWidth: 0,
						hoverOffset: 8,
					}]
				},
				options: {
					responsive: true,
					maintainAspectRatio: true,
					cutout: '65%',
					plugins: {
						legend: {
							position: 'bottom',
							labels: { color: getComputedStyle(document.body).getPropertyValue('--text-secondary') || '#aaa', padding: 16, usePointStyle: true, pointStyleWidth: 8 }
						}
					}
				}
			});
		}

		// Render category bar chart
		if (categoryChart) categoryChart.destroy();
		const catCtx = document.getElementById('category-chart');
		if (catCtx && cats.length) {
			const topCats = cats.filter(c => parseInt(c.report_count) > 0).slice(0, 8);
			categoryChart = new Chart(catCtx, {
				type: 'bar',
				data: {
					labels: topCats.map(c => c.category),
					datasets: [{
						label: 'Reports',
						data: topCats.map(c => parseInt(c.report_count)),
						backgroundColor: 'rgba(99, 102, 241, 0.7)',
						borderRadius: 6,
						borderSkipped: false,
					}]
				},
				options: {
					responsive: true,
					maintainAspectRatio: true,
					indexAxis: 'y',
					plugins: {
						legend: { display: false },
					},
					scales: {
						x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#888' } },
						y: { grid: { display: false }, ticks: { color: '#aaa', font: { size: 11 } } }
					}
				}
			});
		}

	} catch (err) {
		el.innerHTML = '<p class="text-muted text-sm">Failed to load analytics.</p>';
		console.error('Analytics error:', err);
	}
}

// ── Authority Performance ─────────────────────────────────────────────
async function loadPerformance() {
	const el = document.getElementById('performance-content');
	if (!el) return;
	try {
		const res = await fetch(`${API_BASE}/analytics/authority-performance`, {
			headers: { 'Authorization': 'Bearer ' + token }
		});
		const data = await res.json();
		const perf = data.performance || [];

		if (!perf.length) {
			el.innerHTML = '<p class="text-muted text-sm">No performance data yet.</p>';
			return;
		}

		el.innerHTML = `
			<div class="table-wrap">
				<table>
					<thead>
						<tr>
							<th>Authority</th>
							<th>Total Assigned</th>
							<th>Resolved</th>
							<th>Unresolved</th>
							<th>Resolution Rate</th>
						</tr>
					</thead>
					<tbody>
						${perf.map(p => `
							<tr>
								<td><strong>${esc(p.authority)}</strong></td>
								<td>${p.total_assigned || 0}</td>
								<td style="color:var(--success,#10B981);">${p.resolved || 0}</td>
								<td style="color:var(--danger,#EF4444);">${p.unresolved || 0}</td>
								<td>
									<div style="display:flex;align-items:center;gap:8px;">
										<div style="flex:1;height:6px;background:var(--border,#333);border-radius:3px;overflow:hidden;">
											<div style="height:100%;width:${p.resolution_rate_pct || 0}%;background:linear-gradient(90deg,#6366f1,#10B981);border-radius:3px;"></div>
										</div>
										<span style="font-weight:600;font-size:13px;">${p.resolution_rate_pct || 0}%</span>
									</div>
								</td>
							</tr>
						`).join('')}
					</tbody>
				</table>
			</div>
		`;
	} catch (err) {
		el.innerHTML = '<p class="text-muted text-sm">Failed to load performance data.</p>';
	}
}

// ── Weekly Report ─────────────────────────────────────────────────────
async function loadWeeklyReport() {
	const el = document.getElementById('weekly-content');
	if (!el) return;
	try {
		const res = await fetch(`${API_BASE}/analytics/weekly-report`, {
			headers: { 'Authorization': 'Bearer ' + token }
		});
		const data = await res.json();

		const newR = data.new_reports || { count: 0, data: [] };
		const resolved = data.resolved || { count: 0, data: [] };
		const overdue = data.overdue || { count: 0, data: [] };
		const topWards = data.top_wards || [];

		el.innerHTML = `
			<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;">
				<div class="stat-card">
					<div class="stat-icon blue">📥</div>
					<div class="stat-info">
						<div class="stat-number">${newR.count}</div>
						<div class="stat-label">New This Week</div>
					</div>
				</div>
				<div class="stat-card">
					<div class="stat-icon green">✅</div>
					<div class="stat-info">
						<div class="stat-number">${resolved.count}</div>
						<div class="stat-label">Resolved This Week</div>
					</div>
				</div>
				<div class="stat-card">
					<div class="stat-icon red">⏰</div>
					<div class="stat-info">
						<div class="stat-number">${overdue.count}</div>
						<div class="stat-label">Overdue (&gt;7 days)</div>
					</div>
				</div>
				<div class="stat-card">
					<div class="stat-icon orange">🏘</div>
					<div class="stat-info">
						<div class="stat-number">${topWards.length}</div>
						<div class="stat-label">Active Wards</div>
					</div>
				</div>
			</div>

			${topWards.length > 0 ? `
			<div class="card" style="margin-bottom:20px;">
				<h3 style="font-size:0.95rem;margin-bottom:12px;">🔥 Top Wards This Week</h3>
				<div style="display:flex;gap:12px;flex-wrap:wrap;">
					${topWards.map((w, i) => `
						<div style="background:var(--accent-subtle,rgba(99,102,241,0.08));border:1px solid var(--border);border-radius:10px;padding:12px 18px;display:flex;align-items:center;gap:10px;">
							<span style="font-size:1.3rem;font-weight:800;color:${i===0?'#F59E0B':i===1?'#C0C0C0':'#CD7F32'};">#${i+1}</span>
							<div>
								<div style="font-weight:600;color:var(--text-primary);font-size:14px;">${esc(w.ward)}</div>
								<div style="font-size:12px;color:var(--text-muted);">${w.report_count} reports</div>
							</div>
						</div>
					`).join('')}
				</div>
			</div>` : ''}

			${overdue.count > 0 ? `
			<div class="card" style="margin-bottom:20px;">
				<h3 style="font-size:0.95rem;margin-bottom:12px;color:var(--danger,#EF4444);">⚠️ Overdue Reports</h3>
				<div class="table-wrap">
					<table>
						<thead><tr><th>Title</th><th>Ward</th><th>Authority</th><th>Days Open</th><th>Status</th></tr></thead>
						<tbody>
							${overdue.data.slice(0, 10).map(r => `
								<tr>
									<td>${esc(r.title)}</td>
									<td>${esc(r.ward) || '—'}</td>
									<td>${esc(r.authority) || 'Unassigned'}</td>
									<td style="color:var(--danger);font-weight:600;">${r.days_open}d</td>
									<td><span class="badge badge-${esc(r.status)}">${esc(r.status).replace('_',' ')}</span></td>
								</tr>
							`).join('')}
						</tbody>
					</table>
				</div>
			</div>` : ''}

			${newR.count > 0 ? `
			<div class="card">
				<h3 style="font-size:0.95rem;margin-bottom:12px;">📥 New Reports This Week</h3>
				<div class="table-wrap">
					<table>
						<thead><tr><th>Title</th><th>Category</th><th>Ward</th><th>Authority</th><th>Status</th></tr></thead>
						<tbody>
							${newR.data.slice(0, 15).map(r => `
								<tr>
									<td>${esc(r.title)}</td>
									<td>${esc(r.category) || '—'}</td>
									<td>${esc(r.ward) || '—'}</td>
									<td>${esc(r.authority) || 'Unassigned'}</td>
									<td><span class="badge badge-${esc(r.status)}">${esc(r.status).replace('_',' ')}</span></td>
								</tr>
							`).join('')}
						</tbody>
					</table>
				</div>
			</div>` : ''}
		`;
	} catch (err) {
		el.innerHTML = '<p class="text-muted text-sm">Failed to load weekly report.</p>';
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
					<thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Ward</th><th>Verified</th><th>Status</th><th>Action</th></tr></thead>
					<tbody>
						${data.users.map(u => `
							<tr>
								<td>${esc(u.full_name)}</td>
								<td>${esc(u.email)}</td>
								<td><span class="badge">${esc(u.role)}</span></td>
								<td>${esc(u.ward_name) || '—'}</td>
								<td>${u.is_verified ? '✅' : '❌'}</td>
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
					<thead><tr><th>Ward</th><th>Sub-county</th><th>Constituency</th></tr></thead>
					<tbody>
						${data.wards.map(w => `
							<tr>
								<td><strong>${esc(w.name)}</strong></td>
								<td>${esc(w.subcounty)}</td>
								<td>${esc(w.constituency) || '—'}</td>
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

// ── Init ──────────────────────────────────────────────────────────────
loadAnalytics();
