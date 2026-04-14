const API = 'http://localhost:5000/api';
let leafletMap   = null;
let markerLayer  = null;

const STATUS_COLORS = {
	open:        '#F59E0B',
	in_progress: '#3B82F6',
	resolved:    '#10B981',
	escalated:   '#EF4444',
	rejected:    '#6B7280',
};

function initMap() {
	if (leafletMap) return;
	leafletMap  = L.map('map').setView([-1.3028, 36.8219], 13);
	markerLayer = L.layerGroup().addTo(leafletMap);

	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '© OpenStreetMap contributors',
		maxZoom: 18,
	}).addTo(leafletMap);

	loadMap();
}

async function loadMap() {
	if (!leafletMap) return;
	const status = document.getElementById('map-filter-status')?.value || '';
	const url    = `${API}/reports/map${status ? '?status=' + status : ''}`;

	try {
		const res  = await fetch(url);
		const data = await res.json();
		markerLayer.clearLayers();

		data.reports.forEach(r => {
			if (!r.latitude || !r.longitude) return;

			const color  = STATUS_COLORS[r.status] || '#888';
			const marker = L.circleMarker([r.latitude, r.longitude], {
				radius:      8,
				fillColor:   color,
				color:       '#fff',
				weight:      2,
				opacity:     1,
				fillOpacity: 0.85,
			});

			marker.bindPopup(`
				<div style="min-width:200px;font-family:system-ui">
					<strong style="font-size:14px">${r.title}</strong>
					<div style="font-size:12px;color:#666;margin:4px 0">
						${r.category_name || ''} &bull; ${r.ward_name || ''}
					</div>
					<span style="font-size:11px;background:${color}22;color:${color};padding:2px 8px;border-radius:20px;font-weight:600">
						${r.status.replace('_',' ').toUpperCase()}
					</span>
					<br/><button onclick="viewReport(${r.id})"
						style="margin-top:8px;padding:5px 12px;background:#1C7293;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:12px">
						View details
					</button>
				</div>
			`);
			markerLayer.addLayer(marker);
		});

		loadRecentList(data.reports);

	} catch (err) {
		console.error('Map load error:', err);
	}
}

function loadRecentList(reports) {
	const el = document.getElementById('recent-list');
	if (!el) return;

	if (!reports || reports.length === 0) {
		el.innerHTML = '<p class="text-muted text-sm">No reports found.</p>';
		return;
	}

	el.innerHTML = reports.slice(0, 10).map(r => `
		<div class="report-item" onclick="viewReport(${r.id})">
			<div class="report-dot dot-${r.status}"></div>
			<div class="report-body">
				<div class="report-title">${r.title}</div>
				<div class="report-meta">${r.category_name || ''} &bull; ${r.ward_name || ''}</div>
			</div>
			<span class="badge badge-${r.status}">${r.status.replace('_',' ')}</span>
		</div>
	`).join('');
}

async function viewReport(id) {
	try {
		const token = localStorage.getItem('cp_token');
		const res   = await fetch(`${API}/reports/${id}`, {
			headers: { 'Authorization': 'Bearer ' + token }
		});
		const data  = await res.json();
		if (!res.ok) return;

		const r = data.report;
		const h = data.history || [];

		document.getElementById('modal-title').textContent = r.title;
		document.getElementById('modal-body').innerHTML = `
			<div class="flex gap-2 items-center mb-2">
				<span class="badge badge-${r.status}">${r.status.replace('_',' ')}</span>
				<span class="text-muted text-sm">${r.category_name || ''}</span>
			</div>
			<p style="font-size:14px;margin-bottom:12px">${r.description}</p>
			<div class="grid-2 mb-2">
				<div><span class="text-muted text-sm">Ward</span><br/><strong>${r.ward_name || '—'}</strong></div>
				<div><span class="text-muted text-sm">Authority</span><br/><strong>${r.authority_name || 'Unassigned'}</strong></div>
				<div><span class="text-muted text-sm">Submitted by</span><br/><strong>${r.submitted_by || '—'}</strong></div>
				<div><span class="text-muted text-sm">Reported on</span><br/><strong>${new Date(r.created_at).toLocaleDateString('en-GB')}</strong></div>
			</div>
			${r.address ? `<p class="text-sm text-muted mb-2">📍 ${r.address}</p>` : ''}
			<div style="margin-top:16px">
				<p style="font-size:13px;font-weight:600;color:var(--muted);margin-bottom:8px">STATUS HISTORY</p>
				${h.length === 0 ? '<p class="text-muted text-sm">No history yet.</p>' :
					h.map(e => `
						<div style="font-size:13px;padding:6px 0;border-bottom:1px solid var(--border)">
							<strong>${e.new_status?.replace('_',' ').toUpperCase() || ''}</strong>
							<span class="text-muted"> — ${e.changed_by_name || 'System'}</span>
							<span class="text-muted"> — ${new Date(e.changed_at).toLocaleString('en-GB')}</span>
							${e.note ? `<div style="color:var(--muted);margin-top:2px">${e.note}</div>` : ''}
						</div>
					`).join('')
				}
			</div>
			<div style="margin-top:16px">
				<button class="btn btn-primary btn-sm" onclick="upvoteReport(${r.id})">
					▲ Upvote (${r.upvote_count || 0})
				</button>
			</div>
		`;
		document.getElementById('report-modal').classList.add('open');

	} catch (err) {
		console.error('View report error:', err);
	}
}

async function upvoteReport(id) {
	const token = localStorage.getItem('cp_token');
	try {
		const res  = await fetch(`${API}/reports/${id}/upvote`, {
			method: 'POST',
			headers: { 'Authorization': 'Bearer ' + token }
		});
		const data = await res.json();
		alert(res.ok ? '✅ Upvote recorded!' : data.error || 'Could not upvote.');
		if (res.ok) viewReport(id);
	} catch (err) {
		alert('Network error.');
	}
}

function closeModal() {
	document.getElementById('report-modal').classList.remove('open');
}

// Close modal on overlay click
document.getElementById('report-modal')?.addEventListener('click', function(e) {
	if (e.target === this) closeModal();
});
