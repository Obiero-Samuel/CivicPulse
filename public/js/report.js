const API = 'http://localhost:5000/api';

// ── Session guard ─────────────────────────────────────────────────────
const token = localStorage.getItem('cp_token');
const user  = JSON.parse(localStorage.getItem('cp_user') || 'null');

if (!token || !user) {
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

	if (pageId === 'map-page')        { initMap(); loadMyReportsList(); }
	if (pageId === 'my-reports-page') { loadMyReportsList(); }
	if (pageId === 'submit-page')     { loadFormDropdowns(); }
}

function logout() {
	localStorage.removeItem('cp_token');
	localStorage.removeItem('cp_user');
	window.location.href = 'index.html';
}

// ── Load form dropdowns ───────────────────────────────────────────────
async function loadFormDropdowns() {
	try {
		const [catRes, wardRes] = await Promise.all([
			fetch(`${API}/reports/map`),
			fetch(`${API}/wards`),
		]);

		const wardData = await wardRes.json();
		const wardSel  = document.getElementById('s-ward');
		if (wardSel && wardSel.options.length <= 1) {
			wardData.wards.forEach(w => {
				const o = document.createElement('option');
				o.value = w.id; o.textContent = `${w.name} (${w.subcounty})`;
				wardSel.appendChild(o);
			});
		}

		// Load categories
		const catRes2 = await fetch(`${API}/wards`);
		// Use a direct admin endpoint for categories — fetch wards first as fallback
		const cRes    = await fetch(`${API}/reports/map`);
		// Categories come from seed — load via a simple endpoint
		const catFetch = await fetch(`${API}/wards`);
	} catch (_) {}

	// Load categories separately
	try {
		const res  = await fetch(`${API}/wards`);
		const data = await res.json();
	} catch (_) {}
}

// Better: load categories from dedicated endpoint
(async function loadCategories() {
	try {
		const res  = await fetch(`${API}/wards`);
		// Temporary: hardcode while we add /api/categories endpoint
		const cats = [
			{ id:1, name:'Flooding & Drainage' },{ id:2, name:'Road Damage / Potholes' },
			{ id:3, name:'Illegal Construction' },{ id:4, name:'Garbage & Waste' },
			{ id:5, name:'Burst Sewer' },         { id:6, name:'Street Lighting' },
			{ id:7, name:'Water Supply' },         { id:8, name:'Public Safety' },
		];
		const sel = document.getElementById('s-category');
		if (sel) {
			cats.forEach(c => {
				const o = document.createElement('option');
				o.value = c.id; o.textContent = c.name;
				sel.appendChild(o);
			});
		}
	} catch (_) {}

	try {
		const res      = await fetch(`${API}/wards`);
		const wardData = await res.json();
		const wardSel  = document.getElementById('s-ward');
		if (wardSel && wardData.wards) {
			wardSel.innerHTML = '<option value="">— Select ward —</option>';
			wardData.wards.forEach(w => {
				const o = document.createElement('option');
				o.value = w.id; o.textContent = `${w.name} (${w.subcounty})`;
				wardSel.appendChild(o);
			});
			// Pre-select user's ward
			if (user?.ward_id) wardSel.value = user.ward_id;
		}
	} catch (_) {}
})();

// ── Submit form ───────────────────────────────────────────────────────
document.getElementById('submit-form')?.addEventListener('submit', async (e) => {
	e.preventDefault();
	const btn = document.getElementById('submit-btn');
	btn.disabled = true;
	btn.innerHTML = '<span class="spinner"></span> Submitting...';

	const body = {
		title:       document.getElementById('s-title').value.trim(),
		description: document.getElementById('s-desc').value.trim(),
		category_id: parseInt(document.getElementById('s-category').value),
		ward_id:     parseInt(document.getElementById('s-ward').value),
		address:     document.getElementById('s-address').value.trim() || null,
		latitude:    parseFloat(document.getElementById('s-lat').value) || null,
		longitude:   parseFloat(document.getElementById('s-lng').value) || null,
	};

	try {
		const res  = await fetch(`${API}/reports`, {
			method:  'POST',
			headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
			body:    JSON.stringify(body),
		});
		const data = await res.json();

		if (!res.ok) {
			document.getElementById('submit-error').textContent = data.error || 'Submission failed.';
			document.getElementById('submit-error').classList.add('show');
			btn.disabled = false;
			btn.innerHTML = 'Submit Report';
			return;
		}

		document.getElementById('submit-success').textContent = `Report submitted! Ticket #${data.report.id}`;
		document.getElementById('submit-success').classList.add('show');
		e.target.reset();
		btn.disabled = false;
		btn.innerHTML = 'Submit Report';
		setTimeout(() => showPage('map-page', document.querySelector('.nav-item')), 2000);

	} catch (err) {
		document.getElementById('submit-error').textContent = 'Network error. Is the server running?';
		document.getElementById('submit-error').classList.add('show');
		btn.disabled = false;
		btn.innerHTML = 'Submit Report';
	}
});

// ── My reports list ───────────────────────────────────────────────────
async function loadMyReportsList() {
	const el = document.getElementById('my-reports-list');
	if (!el) return;

	try {
		const res  = await fetch(`${API}/reports/my`, {
			headers: { 'Authorization': 'Bearer ' + token }
		});
		const data = await res.json();

		if (!data.reports || data.reports.length === 0) {
			el.innerHTML = '<p class="text-muted text-sm">You haven\'t submitted any reports yet.</p>';
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
					<span class="text-muted" style="font-size:10px">votes</span>
				</div>
				<span class="badge badge-${r.status}" style="margin-left:8px">${r.status.replace('_',' ')}</span>
			</div>
		`).join('');

	} catch (err) {
		el.innerHTML = '<p class="text-muted text-sm">Failed to load reports.</p>';
	}
}

// Init
initMap();
loadMyReportsList();
