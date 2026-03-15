/**
 * BLUVIA — Dashboard Page (Protected)
 * Shows data from local database with animated counters, chart, orders table, stock meters.
 */

import { getAllOrders, getInventory, getAllUsers } from '../api.js';
import { formatPrice, formatDate } from '../utils/format.js';

export function render() {
  return `
    <section id="dashboard" aria-labelledby="dashboard-title">
      <div class="section-header">
        <div class="section-label">Dashboard</div>
        <h1 class="section-title" id="dashboard-title">Your Business,<br>At a Glance.</h1>
      </div>
      <div class="dashboard-frame" id="dashboard-frame">
        <div class="db-titlebar" aria-hidden="true">
          <div class="db-dot"></div><div class="db-dot"></div><div class="db-dot"></div>
          <div class="db-url-bar">bluvia.app/dashboard</div>
        </div>
        <div class="db-body">
          <aside class="db-sidebar">
            <div class="db-logo">BLUVIA</div>
            <nav>
              <div class="db-nav-item active"><span class="db-nav-icon">📊</span> Overview</div>
              <div class="db-nav-item" onclick="window.location='/orders'"><span class="db-nav-icon">📦</span> Orders</div>
              <div class="db-nav-item" onclick="window.location='/checkout'"><span class="db-nav-icon">🛒</span> Checkout</div>
              <div class="db-nav-item" onclick="window.location='/admin'"><span class="db-nav-icon">⚙️</span> Admin</div>
            </nav>
          </aside>
          <main class="db-main">
            <div class="db-stats" id="db-stats">
              ${_statSkel()} ${_statSkel()} ${_statSkel()} ${_statSkel()}
            </div>
            <div class="db-chart-title">Weekly Sales (Bottles)</div>
            <div class="db-chart" id="db-chart" aria-label="Weekly sales chart">
              ${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => `<div class="chart-bar" data-label="${d}" style="background:linear-gradient(180deg,var(--c-accent),rgba(0,188,212,.35))"></div>`).join('')}
            </div>
            <div class="db-table-title">Recent Orders</div>
            <table class="db-table" id="db-orders-table" aria-label="Recent orders">
              <thead><tr><th>Order ID</th><th>Product</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
              <tbody id="db-orders-body"><tr><td colspan="5" style="text-align:center;padding:2rem;"><div class="spinner"></div></td></tr></tbody>
            </table>
            <div class="stock-meter" id="db-stock"></div>
          </main>
        </div>
      </div>
    </section>
  `;
}

export async function init() {
  _loadDashboardData();
  _initDashboardAnimations();
}

async function _loadDashboardData() {
  try {
    const [ordersRes, inventoryRes, usersRes] = await Promise.all([
      getAllOrders(),
      getInventory(),
      getAllUsers()
    ]);

    const orders = ordersRes.orders || [];
    const inventory = inventoryRes.inventory || [];
    const users = usersRes.users || [];

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((s, o) => s + (o.total_paise || 0), 0);
    const delivered = orders.filter(o => o.status === 'delivered').length;

    _renderStats(totalOrders, totalRevenue, users.length, delivered);
    _renderOrdersTable(orders.slice(0, 10));
    _renderStockMeters(inventory);
  } catch (err) {
    console.error('[Dashboard] Load error:', err);
  }
}

function _renderStats(orders, revenue, customers, delivered) {
  const stats = document.getElementById('db-stats');
  if (!stats) return;
  stats.innerHTML = [
    { label: 'Total Orders', value: orders, prefix: '', change: '↑ Real-time' },
    { label: 'Revenue', value: Math.round(revenue / 100), prefix: '₹', change: '↑ From orders' },
    { label: 'Customers', value: customers, prefix: '', change: '↑ Active users' },
    { label: 'Delivered', value: delivered, prefix: '', change: '↑ Completed' },
  ].map(s => `
    <div class="stat-card">
      <div class="stat-label">${s.label}</div>
      <div class="stat-value">${s.prefix}<span data-counter="${s.value}">0</span></div>
      <div class="stat-change">${s.change}</div>
    </div>
  `).join('');
}

function _renderOrdersTable(orders) {
  const tbody = document.getElementById('db-orders-body');
  if (!tbody) return;
  if (!orders.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--c-muted);padding:2rem;">No orders yet. Place your first order!</td></tr>`;
    return;
  }
  tbody.innerHTML = orders.map(o => {
    const statusClass = { delivered: 'delivered', pending: 'pending', shipped: 'transit', cancelled: 'cancelled' }[o.status] || 'pending';
    return `
      <tr>
        <td>${String(o.id).slice(0, 12).toUpperCase() || '—'}</td>
        <td>Order</td>
        <td>${formatPrice(o.total_paise)}</td>
        <td><span class="status-dot ${statusClass}"></span>${o.status || 'pending'}</td>
        <td>${formatDate(o.created_at)}</td>
      </tr>
    `;
  }).join('');
}

 function _renderStockMeters(inventory) {
  const el = document.getElementById('db-stock');
  if (!el || !inventory.length) return;
  const colors = ['linear-gradient(90deg,var(--c-teal),var(--c-accent))', 'linear-gradient(90deg,var(--c-accent),var(--c-glow))', 'linear-gradient(90deg,#ffc107,#ff9800)'];
  el.innerHTML = inventory.map((inv, i) => {
    const name = inv.product_name || 'Product';
    const pct = Math.min(100, Math.round((inv.stock_quantity / Math.max(inv.reorder_threshold * 10, 1)) * 100));
    return `
      <div class="stock-label"><span>${name} Stock</span><span>${pct}%</span></div>
      <div class="stock-bar"><div class="stock-fill" data-w="${pct}%" style="background:${colors[i] || colors[0]}"></div></div>
    `;
  }).join('');
}

function _initDashboardAnimations() {
  const frame = document.getElementById('dashboard-frame');
  if (frame && typeof gsap !== 'undefined') {
    gsap.fromTo(frame, { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: 'power3.out' });
  } else if (frame) {
    frame.style.opacity = '1';
  }

  document.querySelectorAll('[data-counter]').forEach(el => {
    const target = +el.dataset.counter;
    let current = 0;
    const step = target / 60;
    const tick = () => {
      current += step;
      if (current >= target) { el.textContent = target.toLocaleString('en-IN'); return; }
      el.textContent = Math.floor(current).toLocaleString('en-IN');
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  const heights = ['55%', '72%', '48%', '90%', '65%', '83%', '58%'];
  document.querySelectorAll('.chart-bar').forEach((bar, i) => {
    setTimeout(() => { bar.style.height = heights[i] || '60%'; }, i * 80);
  });

  document.querySelectorAll('.stock-fill').forEach(el => {
    setTimeout(() => { el.style.width = el.dataset.w || '75%'; }, 400);
  });
}

function _statSkel() {
  return `<div class="stat-card"><div class="skeleton" style="height:12px;width:60%;margin-bottom:.5rem;"></div><div class="skeleton" style="height:28px;width:80%;margin-bottom:.25rem;"></div><div class="skeleton" style="height:10px;width:50%;"></div></div>`;
}
