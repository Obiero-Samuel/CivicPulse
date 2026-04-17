/* ═══════════════════════════════════════════════════════════
   CivicPulse — Toast Notification System
   Usage:  toast.success('Report submitted!')
           toast.error('Something went wrong.')
           toast.info('Your report was forwarded.')
           toast.warning('This action is irreversible.')
   ═══════════════════════════════════════════════════════════ */

const toast = (() => {
	let container = null;

	function getContainer() {
		if (!container) {
			container = document.createElement('div');
			container.className = 'toast-container';
			container.id = 'toast-container';
			document.body.appendChild(container);
		}
		return container;
	}

	const ICONS = {
		success: '✅',
		error:   '❌',
		info:    'ℹ️',
		warning: '⚠️',
	};

	function show(type, message, duration = 4000) {
		const el = document.createElement('div');
		el.className = `toast toast-${type}`;
		el.innerHTML = `
			<span class="toast-icon">${ICONS[type] || ''}</span>
			<span class="toast-msg">${message}</span>
			<span class="toast-close" onclick="this.parentElement.remove()">✕</span>
			<div class="toast-progress"></div>
		`;

		// Set progress animation duration
		const progress = el.querySelector('.toast-progress');
		if (progress) progress.style.animationDuration = `${duration}ms`;

		const c = getContainer();
		c.appendChild(el);

		// Click to dismiss
		el.addEventListener('click', (e) => {
			if (e.target.classList.contains('toast-close')) return;
			dismissToast(el);
		});

		// Auto-dismiss
		setTimeout(() => dismissToast(el), duration);

		return el;
	}

	function dismissToast(el) {
		if (!el || !el.parentNode) return;
		el.classList.add('hiding');
		setTimeout(() => { if (el.parentNode) el.remove(); }, 300);
	}

	return {
		success: (msg, dur) => show('success', msg, dur),
		error:   (msg, dur) => show('error', msg, dur),
		info:    (msg, dur) => show('info', msg, dur),
		warning: (msg, dur) => show('warning', msg, dur),
	};
})();
