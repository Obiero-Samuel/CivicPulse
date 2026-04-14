const API = 'http://localhost:5000/api';
const token = localStorage.getItem('cp_token');
const user  = JSON.parse(localStorage.getItem('cp_user') || 'null');

if (!token || !user) {
  window.location.href = 'index.html';
}

if (user) {
  const initials = user.full_name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || '?';
  const el = document.getElementById('avatar-initials');
  if (el) el.textContent = initials;
  const nameEl = document.getElementById('sidebar-name');
  if (nameEl) nameEl.textContent = user.full_name || user.email;
  const navUser = document.getElementById('nav-user');
  if (navUser) navUser.textContent = user.full_name || '';
}

function showPage(pageId, navEl) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId)?.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  if (navEl) navEl.classList.add('active');
  if (pageId === 'assigned-page') loadAssignedReports();
  if (pageId === 'all-page') loadAllReports();
}

function logout() {
  localStorage.removeItem('cp_token');
  localStorage.removeItem('cp_user');
  window.location.href = 'index.html';
}


// Officer modal state
let officerModalReportId = null;

async function loadAssignedReports() {
  const el = document.getElementById('assigned-list');
  if (!el) return;
  try {
    const res = await fetch(`${API}/reports/assigned`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const data = await res.json();
    if (!data.reports || data.reports.length === 0) {
      el.innerHTML = '<p class="text-muted text-sm">No assigned reports.</p>';
      return;
    }
    el.innerHTML = data.reports.map(r => `
      <div class="report-item" onclick="openOfficerModal(${r.id}, '${r.title.replace(/'/g, "&#39;")}')">
        <div class="report-dot dot-${r.status}"></div>
        <div class="report-body">
          <div class="report-title">${r.title}</div>
          <div class="report-meta">${r.category_name || ''} &bull; ${r.ward_name || ''}</div>
        </div>
        <span class="badge badge-${r.status}">${r.status.replace('_',' ')}</span>
      </div>
    `).join('');
  } catch (err) {
    el.innerHTML = '<p class="text-muted text-sm">Failed to load assigned reports.</p>';
  }
}

// Officer modal for status update
function openOfficerModal(reportId, title) {
  officerModalReportId = reportId;
  let modal = document.getElementById('officer-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'officer-modal';
    modal.className = 'modal-overlay open';
    modal.innerHTML = `
      <div class="modal">
        <button class="modal-close" onclick="closeOfficerModal()">&times;</button>
        <h3 id="officer-modal-title"></h3>
        <form id="officer-status-form">
          <div class="form-group">
            <label for="officer-status">Update Status</label>
            <select id="officer-status" required>
              <option value="">— Select status —</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="escalated">Escalated</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div class="form-group">
            <label for="officer-note">Resolution Note</label>
            <textarea id="officer-note" placeholder="Describe your action or resolution..." required></textarea>
          </div>
          <button class="btn btn-primary btn-full" type="submit">Update</button>
        </form>
        <div id="officer-modal-msg" class="alert mt-2"></div>
      </div>
    `;
    document.body.appendChild(modal);
  } else {
    modal.classList.add('open');
  }
  document.getElementById('officer-modal-title').textContent = title;
  document.getElementById('officer-status-form').onsubmit = submitOfficerStatus;
}

function closeOfficerModal() {
  const modal = document.getElementById('officer-modal');
  if (modal) modal.classList.remove('open');
}

async function submitOfficerStatus(e) {
  e.preventDefault();
  const status = document.getElementById('officer-status').value;
  const note   = document.getElementById('officer-note').value.trim();
  const msgEl  = document.getElementById('officer-modal-msg');
  msgEl.className = 'alert';
  msgEl.textContent = '';
  if (!status || !note) {
    msgEl.classList.add('alert-error', 'show');
    msgEl.textContent = 'Status and note are required.';
    return;
  }
  try {
    const res = await fetch(`${API}/reports/${officerModalReportId}/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ newStatus: status, note })
    });
    if (res.ok) {
      msgEl.classList.add('alert-success', 'show');
      msgEl.textContent = 'Status updated!';
      setTimeout(() => {
        closeOfficerModal();
        loadAssignedReports();
      }, 1200);
    } else {
      const data = await res.json();
      msgEl.classList.add('alert-error', 'show');
      msgEl.textContent = data.error || 'Failed to update status.';
    }
  } catch (err) {
    msgEl.classList.add('alert-error', 'show');
    msgEl.textContent = 'Network error.';
  }
}

async function loadAllReports() {
  const el = document.getElementById('all-list');
  if (!el) return;
  try {
    const res = await fetch(`${API}/reports/all`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const data = await res.json();
    if (!data.reports || data.reports.length === 0) {
      el.innerHTML = '<p class="text-muted text-sm">No reports found.</p>';
      return;
    }
    el.innerHTML = data.reports.map(r => `
      <div class="report-item">
        <div class="report-dot dot-${r.status}"></div>
        <div class="report-body">
          <div class="report-title">${r.title}</div>
          <div class="report-meta">${r.category_name || ''} &bull; ${r.ward_name || ''}</div>
        </div>
        <span class="badge badge-${r.status}">${r.status.replace('_',' ')}</span>
      </div>
    `).join('');
  } catch (err) {
    el.innerHTML = '<p class="text-muted text-sm">Failed to load reports.</p>';
  }
}

// Init
loadAssignedReports();
