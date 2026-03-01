/**
 * BLUVIA — Utility Functions
 */

/**
 * Format paise (smallest Indian currency unit) to readable ₹ string.
 * Examples: 500 → "₹5", 1000 → "₹10", 99900 → "₹999"
 * @param {number} paise
 * @returns {string}
 */
export function formatPrice(paise) {
    if (typeof paise !== 'number' || isNaN(paise)) return '₹0';
    const rupees = paise / 100;
    // Show decimals only if fractional
    const formatted = rupees % 1 === 0 ? rupees.toFixed(0) : rupees.toFixed(2);
    return `₹${formatted}`;
}

/**
 * Debounce a function.
 */
export function debounce(fn, delay = 200) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

/**
 * Clamp a number between min and max.
 */
export function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
}

/**
 * Linear interpolation.
 */
export function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * Detect if device is mobile.
 */
export const isMobile = () => window.matchMedia('(max-width: 768px)').matches;

/**
 * Format a date string (ISO) to readable Indian format.
 * Example: "2026-02-26T12:00:00Z" → "26 Feb 2026"
 */
export function formatDate(isoString) {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

/**
 * Generate a short random ID (for temp keys etc.)
 */
export function shortId() {
    return Math.random().toString(36).slice(2, 9);
}
