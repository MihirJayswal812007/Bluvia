/**
 * BLUVIA — Orders Page (Protected)
 * Fetches orders from local database.
 */

import { getOrdersByUser, getOrderItems } from '../db.js';
import { getUser } from '../auth.js';
import { formatPrice, formatDate } from '../utils/format.js';
import { navigate } from '../router.js';

const STATUS_CONFIG = {
  pending: { label: 'Pending', cls: 'bg-amber-500/10 text-amber-400 border border-amber-500/20', step: 1 },
  confirmed: { label: 'Confirmed', cls: 'bg-blue-500/10 text-blue-400 border border-blue-500/20', step: 2 },
  processing: { label: 'Processing', cls: 'bg-blue-500/10 text-blue-400 border border-blue-500/20', step: 2 },
  shipped: { label: 'Shipped', cls: 'bg-violet-500/10 text-violet-400 border border-violet-500/20', step: 3 },
  delivered: { label: 'Delivered', cls: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20', step: 4 },
  cancelled: { label: 'Cancelled', cls: 'bg-red-500/10 text-red-400 border border-red-500/20', step: 0 },
};

let _orders = [];
let _filter = 'all';
let _search = '';

export function render() {
  return `
  <div class="stitch-page orders-page">
    <div class="max-w-5xl mx-auto px-6 py-12">
      <div class="mb-10">
        <nav class="flex items-center gap-2 text-sm text-slate-500 mb-4">
          <a class="hover:text-primary transition-colors" href="/">Home</a>
          <span class="material-symbols-outlined text-xs">chevron_right</span>
          <span class="text-primary font-medium">My Orders</span>
        </nav>
        <h1 class="text-5xl font-black font-outfit text-white tracking-tight">My Orders</h1>
        <p class="text-slate-400 mt-2 text-lg">Manage and track your premium hydration orders.</p>
      </div>
      <div class="glass rounded-xl p-2 mb-8 flex flex-col md:flex-row items-center justify-between gap-4" style="background:rgba(33,70,74,0.2);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.1);">
        <div class="flex items-center p-1 bg-background-dark/50 rounded-lg w-full md:w-auto" id="filter-tabs" role="tablist" aria-label="Order filter">
          <button class="px-6 py-2 rounded-md text-sm font-bold bg-primary text-background-dark transition-all filter-tab active" data-filter="all" role="tab" aria-selected="true">All</button>
          <button class="px-6 py-2 rounded-md text-sm font-bold text-slate-400 hover:text-white transition-all filter-tab" data-filter="pending" role="tab" aria-selected="false">Pending</button>
          <button class="px-6 py-2 rounded-md text-sm font-bold text-slate-400 hover:text-white transition-all filter-tab" data-filter="delivered" role="tab" aria-selected="false">Delivered</button>
          <button class="px-6 py-2 rounded-md text-sm font-bold text-slate-400 hover:text-white transition-all filter-tab" data-filter="cancelled" role="tab" aria-selected="false">Cancelled</button>
        </div>
        <div class="relative w-full md:w-72">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">search</span>
          <input id="order-search" class="w-full bg-background-dark/50 border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary text-white" placeholder="Search by order ID..." type="text" aria-label="Search orders"/>
        </div>
      </div>
      <div id="orders-list" class="space-y-4 mb-16" aria-live="polite" aria-label="Orders list">
        <div class="flex flex-col items-center justify-center py-16 text-center">
          <div class="spinner mb-4" aria-hidden="true"></div>
          <span class="text-slate-400">Loading your orders…</span>
        </div>
      </div>
    </div>
  </div>
  `;
}

export async function init() {
  await _loadOrders();
  _bindFilters();
}

async function _loadOrders() {
  try {
    const user = await getUser();
    if (!user) {
      navigate('/login');
      return;
    }

    _orders = getOrdersByUser(user.id);

    // Enrich with order items
    _orders = _orders.map(o => {
      const items = getOrderItems(o.id);
      return {
        ...o,
        order_items: items.map(oi => ({
          quantity: oi.quantity,
          unit_price: oi.unit_price_paise,
          products: oi.product || { name: 'Item' },
        })),
        total_amount: o.total_paise,
      };
    });

    _renderList();
  } catch (err) {
    console.error('Orders fetch error:', err);
    document.getElementById('orders-list').innerHTML =
      '<div class="glass-card rounded-xl p-8 text-center"><p class="text-red-400">Failed to load orders.</p></div>';
  }
}

function _renderList() {
  const container = document.getElementById('orders-list');
  if (!container) return;

  let filtered = _orders;
  if (_filter !== 'all') filtered = filtered.filter(o => o.status === _filter);
  if (_search.trim()) {
    const q = _search.toLowerCase();
    filtered = filtered.filter(o => o.id.toLowerCase().includes(q));
  }

  if (filtered.length === 0) {
    const msg = _filter === 'all'
      ? "Looks like you haven't placed any orders yet. Start your premium hydration journey today."
      : 'No ' + _filter + ' orders.';
    container.innerHTML = '<div class="flex flex-col items-center justify-center py-24 glass rounded-3xl text-center" style="background:rgba(33,70,74,0.2);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.1);">'
      + '<div class="size-24 bg-primary/10 rounded-full flex items-center justify-center mb-6"><span class="material-symbols-outlined text-primary text-5xl">shopping_bag</span></div>'
      + '<h3 class="text-2xl font-bold text-white font-outfit">No orders found</h3>'
      + '<p class="text-slate-500 max-w-xs mx-auto mt-2">' + msg + '</p>'
      + '<a href="/products" class="mt-8 px-8 py-3 bg-primary text-background-dark rounded-full font-bold hover:shadow-lg transition-all inline-block" style="text-decoration:none;">Shop Now</a>'
      + '</div>';
    return;
  }

  container.innerHTML = filtered.map(order => _orderCard(order)).join('');
}

function _orderCard(order) {
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const shortId = '#BLV-' + order.id.substring(0, 8).toUpperCase();
  const itemsStr = (order.order_items || [])
    .map(i => i.quantity + 'x ' + (i.products?.name || 'Item'))
    .join(', ') || 'N/A';
  const dateStr = formatDate(order.created_at);
  const total = formatPrice(order.total_amount);

  return '<div class="rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-300" style="background:rgba(33,70,74,0.2);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.1);">'
    + '<div class="p-6">'
    + '<div class="flex flex-wrap justify-between items-start gap-4 mb-6">'
    + '<div class="flex flex-col gap-1">'
    + '<span class="text-xs uppercase tracking-widest text-slate-500 font-bold">Order ID</span>'
    + '<span class="text-lg font-bold text-white font-outfit">' + shortId + '</span>'
    + '</div>'
    + '<div class="flex flex-col gap-1 md:items-center">'
    + '<span class="text-xs uppercase tracking-widest text-slate-500 font-bold">Date</span>'
    + '<span class="text-sm font-medium">' + dateStr + '</span>'
    + '</div>'
    + '<div class="flex flex-col gap-1 md:items-end">'
    + '<span class="text-xs uppercase tracking-widest text-slate-500 font-bold mb-1">Status</span>'
    + '<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ' + cfg.cls + '">'
    + '<span class="size-1.5 rounded-full bg-current mr-2"></span>'
    + cfg.label
    + '</span>'
    + '</div>'
    + '</div>'
    + '<div class="flex flex-col md:flex-row md:items-center justify-between gap-6 py-6 border-y border-slate-800/50">'
    + '<div class="flex items-center gap-4">'
    + '<div class="size-16 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">'
    + '<span class="material-symbols-outlined text-primary text-3xl">water_drop</span>'
    + '</div>'
    + '<div>'
    + '<h4 class="font-bold text-white">' + itemsStr + '</h4>'
    + '<p class="text-sm text-slate-500">Premium Water Bottles</p>'
    + '</div>'
    + '</div>'
    + '<div class="text-left md:text-right">'
    + '<span class="text-xs text-slate-500 block uppercase tracking-widest font-bold">Total Amount</span>'
    + '<span class="text-2xl font-black text-white font-outfit">' + total + '</span>'
    + '</div>'
    + '</div>'
    + '<div class="mt-6 flex flex-wrap justify-end gap-3">'
    + '<button class="px-5 py-2 rounded-lg text-sm font-bold text-slate-300 border border-slate-700 hover:bg-slate-800 transition-all" onclick="alert(\'Detail view coming soon\')">View Details</button>'
    + '<button class="px-5 py-2 rounded-lg text-sm font-bold bg-primary text-background-dark hover:shadow-[0_0_15px_rgba(6,224,249,0.4)] transition-all" onclick="window.location.href=\'/products\'">Reorder</button>'
    + '</div>'
    + '</div>'
    + '</div>';
}

function _bindFilters() {
  const tabs = document.getElementById('filter-tabs');
  const search = document.getElementById('order-search');

  tabs?.addEventListener('click', (e) => {
    const tab = e.target.closest('[data-filter]');
    if (!tab) return;
    _filter = tab.dataset.filter;
    tabs.querySelectorAll('.filter-tab').forEach(t => {
      const isActive = t === tab;
      t.classList.toggle('active', isActive);
      t.classList.toggle('bg-primary', isActive);
      t.classList.toggle('text-background-dark', isActive);
      t.classList.toggle('text-slate-400', !isActive);
      t.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    _renderList();
  });

  search?.addEventListener('input', (e) => {
    _search = e.target.value;
    _renderList();
  });
}
