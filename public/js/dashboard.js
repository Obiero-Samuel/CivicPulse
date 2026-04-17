
// Modal logic for submit report
function openReportModal() {
	const modal = document.getElementById('submit-modal');
	if (modal) modal.style.display = 'flex';
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
