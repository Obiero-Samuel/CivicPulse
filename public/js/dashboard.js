
// Modal logic for submit report
function openReportModal() {
	const modal = document.getElementById('submit-modal');
	if (modal) modal.style.display = 'flex';
	// Optionally reset form fields here
}

function closeReportModal() {
	const modal = document.getElementById('submit-modal');
	if (modal) modal.style.display = 'none';
}

// Close modal on overlay click
document.addEventListener('click', function(e) {
	const modal = document.getElementById('submit-modal');
	if (modal && e.target === modal) {
		closeReportModal();
	}
});
>>>>>>> 55b639ed3c8692fbad2221d1df05c4e84487516f


// Socket.IO client setup for real-time updates
const socket = io();

// Notification system
function showNotification(message, type = 'info') {
	let notif = document.getElementById('dashboard-notification');
	if (!notif) {
		notif = document.createElement('div');
		notif.id = 'dashboard-notification';
		notif.className = 'dashboard-notification';
		document.body.appendChild(notif);
	}
	notif.textContent = message;
	notif.className = 'dashboard-notification ' + type;
	notif.style.display = 'block';
	setTimeout(() => {
		notif.style.display = 'none';
	}, 3500);
}

// Listen for new report events
socket.on('newReport', (data) => {
	showNotification('A new report was submitted: ' + (data.title || 'New Report'), 'info');
	// Optionally refresh report list or analytics here
});
