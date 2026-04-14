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
    el.innerHTML = '<p class="text-muted text-sm">Failed to load assigned reports.</p>';
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
