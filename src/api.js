/**
 * BLUVIA — Frontend API Client
 * All data calls go to PHP backend (http://localhost:8000/api)
 */

import { getAuthHeader } from './auth.js';

const BASE = 'http://localhost:8000/api';

async function _call(path, options = {}) {
    const res = await fetch(`${BASE}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
            ...(options.headers || {}),
        },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `API error ${res.status}`);
    return data;
}

// ── Products ─────────────────────────────────────────────
export const getProducts = () => _call('/products');
export const getProductById = (id) => _call(`/products/${id}`);
export const updateProduct = (id, body) => _call(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
export const updateStock = (id, qty) => _call(`/products/${id}/stock`, { method: 'PATCH', body: JSON.stringify({ stock_quantity: qty }) });

// ── Orders ───────────────────────────────────────────────
export const placeOrder = (items, shipping_address) => _call('/orders', { method: 'POST', body: JSON.stringify({ items, shipping_address }) });
export const getMyOrders = () => _call('/orders');
export const getAllOrders = () => _call('/orders/all');
export const updateOrderStatus = (id, status) => _call(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });

// ── Admin ────────────────────────────────────────────────
export const getAdminStats = () => _call('/admin/stats');
export const getAllUsers = () => _call('/admin/users');
export const getInventory = () => _call('/admin/inventory');
export const updateUserRole = (id, role) => _call(`/admin/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) });

// ── Health ───────────────────────────────────────────────
export const checkHealth = () => _call('/health');
