/**
 * BLUVIA — Toast Notification System
 * Usage: showToast('Message', 'success' | 'error' | 'info')
 */

let toastQueue = [];
let toastTimer = null;

export function showToast(message, type = 'info', duration = 4000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
    <span class="toast-icon">${_icon(type)}</span>
    <span class="toast-msg">${message}</span>
    <button class="toast-close" aria-label="Close" onclick="this.parentElement.remove()">✕</button>
  `;

    container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => toast.classList.add('toast-show'));

    // Auto dismiss
    setTimeout(() => {
        toast.classList.remove('toast-show');
        toast.classList.add('toast-hide');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

function _icon(type) {
    return { success: '✓', error: '✕', info: 'ℹ' }[type] || 'ℹ';
}
