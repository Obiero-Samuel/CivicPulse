/* ============================================================
   CivicPulse — report.js  (enhanced)
   ============================================================ */
const API = 'http://localhost:5000/api';
const token = localStorage.getItem('cp_token');
const user = JSON.parse(localStorage.getItem('cp_user') || 'null');

if (!token || !user) window.location.href = 'index.html';

// ── Theme ─────────────────────────────────────────────────────
const applyTheme = (t) => {
	document.documentElement.setAttribute('data-theme', t);
	const btn = document.getElementById('themeToggle');
	if (btn) btn.textContent = t === 'dark' ? '☀️' : '🌙';
};
applyTheme(localStorage.getItem('cp_theme') || 'light');
document.getElementById('themeToggle')?.addEventListener('click', () => {
	const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
	applyTheme(next); localStorage.setItem('cp_theme', next);
});

// ── Nav user info ─────────────────────────────────────────────
if (user) {
	const initials = user.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
	const el = document.getElementById('avatar-initials');
	if (el) el.textContent = initials;
	const nameEl = document.getElementById('sidebar-name');
	if (nameEl) nameEl.textContent = user.full_name || user.email;
	const navUser = document.getElementById('nav-user');
	if (navUser) navUser.textContent = user.full_name || '';
}

// ── Page switching ────────────────────────────────────────────
function showPage(pageId, navEl) {
	document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
	document.getElementById(pageId)?.classList.add('active');
	document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
	if (navEl) navEl.classList.add('active');
	if (pageId === 'map-page') { initMap(); loadMyReportsList(); }
	if (pageId === 'my-reports-page') loadMyReportsList();
	if (pageId === 'submit-page') loadFormDropdowns();
}

function logout() {
	localStorage.removeItem('cp_token');
	localStorage.removeItem('cp_user');
	window.location.href = 'index.html';
}

// ── Load form dropdowns ───────────────────────────────────────
async function loadFormDropdowns() {
	try {
		const [catRes, wardRes] = await Promise.all([
			fetch(`${API}/categories`),
			fetch(`${API}/wards`),
		]);
		const catData = await catRes.json();
		const wardData = await wardRes.json();

		const catSel = document.getElementById('s-category');
		const wardSel = document.getElementById('s-ward');

		if (catSel && catData.categories) {
			catSel.innerHTML = '<option value="">— Select category —</option>';
			catData.categories.forEach(c => {
				const o = document.createElement('option');
				o.value = c.id;
				o.textContent = `${c.name} → ${c.authority}`;
				catSel.appendChild(o);
			});
		}

		if (wardSel && wardData.wards) {
			wardSel.innerHTML = '<option value="">— Select ward —</option>';
			wardData.wards.forEach(w => {
				const o = document.createElement('option');
				o.value = w.id;
				o.textContent = `${w.name} (${w.subcounty})`;
				wardSel.appendChild(o);
			});
			if (user?.ward_id) wardSel.value = user.ward_id;
		}
	} catch (err) {
		console.warn('Dropdown load failed:', err.message);
	}
}

// ── Submit form ───────────────────────────────────────────────
document.getElementById('submit-form')?.addEventListener('submit', async (e) => {
	e.preventDefault();
	const btn = document.getElementById('submit-btn');
	const errEl = document.getElementById('submit-error');
	const successEl = document.getElementById('submit-success');
	errEl.style.display = 'none';
	successEl.style.display = 'none';

	btn.disabled = true;
	btn.innerHTML = '<span class="spinner"></span> Submitting…';

	const body = {
		title: document.getElementById('s-title').value.trim(),
		description: document.getElementById('s-desc').value.trim(),
		category_id: parseInt(document.getElementById('s-category').value),
		ward_id: parseInt(document.getElementById('s-ward').value),
		address: document.getElementById('s-address').value.trim() || null,
		latitude: parseFloat(document.getElementById('s-lat').value) || null,
		longitude: parseFloat(document.getElementById('s-lng').value) || null,
	};

	try {
		const res = await fetch(`${API}/reports`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
			body: JSON.stringify(body),
		});
		const data = await res.json();

		if (!res.ok) {
			errEl.textContent = data.error || 'Submission failed.';
			errEl.style.display = 'block';
		} else {
			successEl.textContent = `✅ Report submitted! Tracking number: ${data.report?.tracking_number || '#' + data.report?.id}`;
			successEl.style.display = 'block';
			e.target.reset();
			setTimeout(() => showPage('map-page', document.querySelector('.nav-item')), 2200);
		}
	} catch {
		errEl.textContent = 'Network error. Is the server running?';
		errEl.style.display = 'block';
	} finally {
		btn.disabled = false;
		btn.innerHTML = 'Submit Report';
	}
});

// ── My Reports — with empty state ────────────────────────────
async function loadMyReportsList() {
	const el = document.getElementById('my-reports-list');
	if (!el) return;

	try {
		const res = await fetch(`${API}/reports/my`, { headers: { 'Authorization': 'Bearer ' + token } });
		const data = await res.json();

		if (!data.reports?.length) {
			el.innerHTML = `
        <div class="empty-state-box">
          <img src="../assets/empty-reports.svg" alt="No reports"/>
          <h4>No reports yet</h4>
          <p>You haven't submitted any civic issues. Spot a problem in your ward? Report it — it takes under a minute.</p>
          <button class="btn btn-primary btn-sm" style="margin-top:16px;" onclick="showPage('submit-page',null)">+ Submit your first report</button>
        </div>`;
			return;
		}

		el.innerHTML = data.reports.map(r => `
      <div class="report-item" onclick="viewReport(${r.id})">
        <div class="report-dot dot-${r.status}"></div>
        <div class="report-body">
          <div class="report-title">${r.title}</div>
          <div class="report-meta">${r.category_name || ''} &bull; ${new Date(r.created_at).toLocaleDateString('en-GB')}</div>
        </div>
        <div class="report-upvotes">
          <span class="upvote-count">${r.upvote_count || 0}</span>
          <span class="text-muted" style="font-size:10px;">votes</span>
        </div>
        <span class="badge badge-${r.status}" style="margin-left:8px;">${r.status.replace('_', ' ')}</span>
      </div>
    `).join('');

	} catch {
		el.innerHTML = `
      <div class="empty-state-box">
        <img src="../assets/empty-reports.svg" alt="Error"/>
        <h4>Could not load reports</h4>
        <p>Check your connection and try again.</p>
      </div>`;
	}
}

// ── Init ──────────────────────────────────────────────────────
initMap();
loadMyReportsList();
loadFormDropdowns();
