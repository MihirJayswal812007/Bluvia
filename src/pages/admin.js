/**
 * BLUVIA — Admin Panel (Admin-only protected)
 * Uses local database instead of Supabase.
 */

import { getAllOrders, getOrderItems, updateOrderStatus, getProducts, getInventory, updateInventory, getAllUsers, getStats } from '../db.js';
import { formatPrice, formatDate } from '../utils/format.js';
import { showToast } from '../utils/toast.js';

let _activeTab = 'orders';

const GLASS_STYLE = 'background:rgba(255,255,255,0.03);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.1);';
const GLOW_STYLE = GLASS_STYLE + 'box-shadow:0 0 15px rgba(0,229,255,0.2);';

export function render() {
  return `
  <div class="stitch-page admin-page">
    <div class="flex flex-col min-h-screen">
      <header class="glass-panel border-b border-white/10 px-6 py-4" style="${GLASS_STYLE}border-bottom:1px solid rgba(255,255,255,0.1);">
        <div class="max-w-[1440px] mx-auto flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="bg-primary/20 p-2 rounded-lg">
              <span class="material-symbols-outlined text-primary text-3xl">water_drop</span>
            </div>
            <h1 class="font-heading text-2xl font-bold tracking-tight text-white">Bluvia<span class="text-primary">.</span></h1>
          </div>
          <div class="flex items-center gap-4 border-l border-white/10 pl-6">
            <div class="text-right hidden sm:block">
              <p class="text-xs font-semibold text-amber-400 uppercase tracking-wider">Admin</p>
              <p class="text-sm font-medium">Admin User</p>
            </div>
            <div class="relative">
              <div class="w-10 h-10 rounded-full bg-slate-800 border border-white/20 flex items-center justify-center overflow-hidden font-bold text-primary">AU</div>
              <span class="absolute -top-1 -right-1 bg-amber-400 text-[10px] font-bold text-background-dark px-1.5 py-0.5 rounded-full border-2 border-background-dark">ADMIN</span>
            </div>
          </div>
        </div>
      </header>

      <main class="flex-1 max-w-[1440px] mx-auto w-full p-6 space-y-8">
        <nav class="flex border-b border-white/5 gap-8" id="admin-tabs">
          <button class="pb-4 border-b-2 border-primary text-primary font-semibold flex items-center gap-2 admin-tab active" data-section="orders">
            <span class="material-symbols-outlined text-[20px]">shopping_cart</span> Orders
          </button>
          <button class="pb-4 border-b-2 border-transparent text-slate-400 hover:text-white transition-colors flex items-center gap-2 admin-tab" data-section="inventory">
            <span class="material-symbols-outlined text-[20px]">inventory_2</span> Products
          </button>
          <button class="pb-4 border-b-2 border-transparent text-slate-400 hover:text-white transition-colors flex items-center gap-2 admin-tab" data-section="users">
            <span class="material-symbols-outlined text-[20px]">group</span> Users
          </button>
          <button class="pb-4 border-b-2 border-transparent text-slate-400 hover:text-white transition-colors flex items-center gap-2 admin-tab" data-section="dashboard">
            <span class="material-symbols-outlined text-[20px]">bar_chart</span> Analytics
          </button>
        </nav>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="admin-stats"></div>
        <div id="admin-content">
          <div class="flex items-center justify-center py-16 text-slate-400 gap-3">
            <div class="spinner" aria-hidden="true"></div> Loading...
          </div>
        </div>
      </main>

      <footer class="border-t border-white/5 py-8 px-6 mt-12 bg-white/[0.02]">
        <div class="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-xl">water_drop</span>
            <span class="text-sm font-bold text-white">Bluvia Control Panel</span>
          </div>
          <div class="text-xs text-slate-500">&copy; 2024 Bluvia Premium Water Systems.</div>
          <span class="text-[10px] font-bold text-slate-600 bg-white/5 px-2 py-1 rounded">V2.4.1-STABLE</span>
        </div>
      </footer>
    </div>
  </div>`;
}

export async function init() {
  document.getElementById('admin-tabs')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-section]');
    if (!btn) return;
    document.querySelectorAll('.admin-tab').forEach(n => {
      n.classList.remove('active', 'border-primary', 'text-primary');
      n.classList.add('border-transparent', 'text-slate-400');
    });
    btn.classList.add('active', 'border-primary', 'text-primary');
    btn.classList.remove('border-transparent', 'text-slate-400');
    _activeTab = btn.dataset.section;
    _renderSection(_activeTab);
  });
  _renderSection('orders');
}

function _renderSection(section) {
  const content = document.getElementById('admin-content');
  const statsEl = document.getElementById('admin-stats');
  if (!content) return;
  content.innerHTML = '<div class="flex items-center justify-center py-16 text-slate-400 gap-3"><div class="spinner"></div> Loading...</div>';

  _renderStats(statsEl);

  if (section === 'dashboard') _renderDashboard(content);
  else if (section === 'orders') _renderOrders(content);
  else if (section === 'inventory') _renderInventory(content);
  else if (section === 'users') _renderUsers(content);
}

function _renderStats(el) {
  if (!el) return;
  const stats = getStats();
  const orders = getAllOrders();
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length;

  el.innerHTML = ''
    + '<div class="glass-panel p-6 rounded-xl" style="' + GLOW_STYLE + '">'
    + '<div class="flex items-center justify-between mb-4">'
    + '<span class="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">list_alt</span>'
    + '<span class="text-primary text-xs font-bold flex items-center gap-1"><span class="material-symbols-outlined text-sm">trending_up</span> ' + stats.totalOrders + '</span>'
    + '</div>'
    + '<p class="text-slate-400 text-sm font-medium">Total Orders</p>'
    + '<h3 class="font-heading text-3xl font-bold mt-1 text-white">' + stats.totalOrders.toLocaleString() + '</h3>'
    + '</div>'
    + '<div class="glass-panel p-6 rounded-xl" style="' + GLASS_STYLE + '">'
    + '<div class="flex items-center justify-between mb-4"><span class="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">payments</span></div>'
    + '<p class="text-slate-400 text-sm font-medium">Revenue</p>'
    + '<h3 class="font-heading text-3xl font-bold mt-1 text-white">' + formatPrice(stats.totalRevenue) + '</h3>'
    + '</div>'
    + '<div class="glass-panel p-6 rounded-xl" style="' + GLASS_STYLE + '">'
    + '<div class="flex items-center justify-between mb-4"><span class="material-symbols-outlined text-orange-400 bg-orange-400/10 p-2 rounded-lg">pending_actions</span></div>'
    + '<p class="text-slate-400 text-sm font-medium">Pending Orders</p>'
    + '<h3 class="font-heading text-3xl font-bold mt-1 text-white">' + stats.pendingOrders + '</h3>'
    + '</div>'
    + '<div class="glass-panel p-6 rounded-xl" style="' + GLASS_STYLE + '">'
    + '<div class="flex items-center justify-between mb-4"><span class="material-symbols-outlined text-green-400 bg-green-400/10 p-2 rounded-lg">check_circle</span></div>'
    + '<p class="text-slate-400 text-sm font-medium">Delivered</p>'
    + '<h3 class="font-heading text-3xl font-bold mt-1 text-white">' + deliveredOrders + '</h3>'
    + '</div>';
}

function _orderRow(o) {
  return '<tr class="hover:bg-white/5 transition-colors">'
    + '<td class="px-6 py-4 font-mono text-sm text-primary">#' + o.id.substring(0, 12).toUpperCase() + '</td>'
    + '<td class="px-6 py-4 text-sm">' + formatPrice(o.total_paise) + '</td>'
    + '<td class="px-6 py-4"><span class="text-xs font-semibold px-2 py-1 rounded-lg bg-white/5 ' + _statusColor(o.status) + '">' + o.status + '</span></td>'
    + '<td class="px-6 py-4 text-sm text-slate-400">' + formatDate(o.created_at) + '</td>'
    + '<td class="px-6 py-4 text-right"><button class="text-slate-400 hover:text-primary transition-colors" data-order-id="' + o.id + '" data-action="update-status"><span class="material-symbols-outlined text-[20px]">edit</span></button></td>'
    + '</tr>';
}

function _renderDashboard(el) {
  const orders = getAllOrders().slice(0, 10);
  const rows = orders.map(o => _orderRow(o)).join('');

  el.innerHTML = ''
    + '<div class="glass-panel rounded-xl overflow-hidden" style="' + GLASS_STYLE + '">'
    + '<div class="p-6 border-b border-white/5 flex items-center justify-between bg-white/5"><h2 class="font-heading text-xl font-bold text-white">Recent Orders</h2></div>'
    + '<div class="overflow-x-auto"><table class="w-full text-left"><thead><tr class="bg-white/5 text-slate-400 text-xs font-bold uppercase tracking-wider">'
    + '<th class="px-6 py-4">Order ID</th><th class="px-6 py-4">Amount</th><th class="px-6 py-4">Status</th><th class="px-6 py-4">Date</th><th class="px-6 py-4 text-right">Action</th>'
    + '</tr></thead><tbody class="divide-y divide-white/5">'
    + (rows || '<tr><td colspan="5" class="px-6 py-8 text-center text-slate-500">No orders yet</td></tr>')
    + '</tbody></table></div></div>';

  el.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action="update-status"]');
    if (btn) _handleUpdateStatus(btn.dataset.orderId);
  });
}

function _orderManagementRow(o) {
  return '<tr class="hover:bg-white/5 transition-colors">'
    + '<td class="px-6 py-4 font-mono text-sm text-primary">#' + o.id.substring(0, 12).toUpperCase() + '</td>'
    + '<td class="px-6 py-4 text-sm">' + formatPrice(o.total_paise) + '</td>'
    + '<td class="px-6 py-4">'
    + '<select class="bg-white/5 border-none text-xs font-semibold rounded-lg px-2 py-1 focus:ring-1 focus:ring-primary ' + _statusColor(o.status) + ' cursor-pointer" data-order-id="' + o.id + '" data-action="status-select">'
    + '<option value="pending"' + (o.status === 'pending' ? ' selected' : '') + '>Pending</option>'
    + '<option value="confirmed"' + (o.status === 'confirmed' ? ' selected' : '') + '>Confirmed</option>'
    + '<option value="processing"' + (o.status === 'processing' ? ' selected' : '') + '>Processing</option>'
    + '<option value="shipped"' + (o.status === 'shipped' ? ' selected' : '') + '>Shipped</option>'
    + '<option value="delivered"' + (o.status === 'delivered' ? ' selected' : '') + '>Delivered</option>'
    + '<option value="cancelled"' + (o.status === 'cancelled' ? ' selected' : '') + '>Cancelled</option>'
    + '</select></td>'
    + '<td class="px-6 py-4 text-sm text-slate-400" style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + (o.shipping_address || 'N/A') + '</td>'
    + '<td class="px-6 py-4 text-sm text-slate-400">' + formatDate(o.created_at) + '</td>'
    + '<td class="px-6 py-4 text-right"><button class="text-slate-400 hover:text-primary transition-colors" data-order-id="' + o.id + '" data-action="update-status"><span class="material-symbols-outlined text-[20px]">edit</span></button></td>'
    + '</tr>';
}

function _renderOrders(el) {
  const orders = getAllOrders();
  const rows = orders.map(o => _orderManagementRow(o)).join('');

  el.innerHTML = ''
    + '<div class="glass-panel rounded-xl overflow-hidden" style="' + GLASS_STYLE + '">'
    + '<div class="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">'
    + '<h2 class="font-heading text-xl font-bold text-white">Order Management</h2>'
    + '</div>'
    + '<div class="overflow-x-auto"><table class="w-full text-left"><thead><tr class="bg-white/5 text-slate-400 text-xs font-bold uppercase tracking-wider">'
    + '<th class="px-6 py-4">Order ID</th><th class="px-6 py-4">Amount</th><th class="px-6 py-4">Status</th><th class="px-6 py-4">Address</th><th class="px-6 py-4">Date</th><th class="px-6 py-4 text-right">Action</th>'
    + '</tr></thead><tbody class="divide-y divide-white/5">'
    + (rows || '<tr><td colspan="6" class="px-6 py-8 text-center text-slate-500">No orders</td></tr>')
    + '</tbody></table></div></div>';

  el.querySelectorAll('[data-action="status-select"]').forEach(select => {
    select.addEventListener('change', (e) => {
      const orderId = e.target.dataset.orderId;
      const newStatus = e.target.value;
      updateOrderStatus(orderId, newStatus);
      showToast('Order status updated!', 'success');
      _renderStats(document.getElementById('admin-stats'));
    });
  });

  el.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action="update-status"]');
    if (btn) _handleUpdateStatus(btn.dataset.orderId);
  });
}

function _renderInventory(el) {
  const products = getProducts();
  const inventory = getInventory();

  const inv = {};
  inventory.forEach(i => { inv[i.product_id] = i; });

  let stockBars = '';
  products.forEach(p => {
    const stock = inv[p.id]?.stock_quantity ?? 0;
    const maxStock = Math.max(stock, 2000);
    const pct = Math.round((stock / maxStock) * 100);
    const barColor = pct > 50 ? 'bg-primary' : pct > 20 ? 'bg-orange-400' : 'bg-red-400';
    stockBars += '<div>'
      + '<div class="flex justify-between text-sm mb-2"><span class="text-slate-300 font-medium">' + p.name + '</span><span class="text-primary font-bold">' + stock.toLocaleString() + ' units</span></div>'
      + '<div class="w-full bg-white/5 rounded-full h-2"><div class="' + barColor + ' h-2 rounded-full" style="width:' + pct + '%"></div></div>'
      + '<div class="mt-2"><button class="text-xs text-primary hover:underline" data-pid="' + p.id + '" data-action="add-stock">+ Add Stock</button></div>'
      + '</div>';
  });
  if (!stockBars) stockBars = '<p class="text-slate-500 text-center py-8">No products</p>';

  let alerts = '';
  const lowStock = inventory.filter(i => i.stock_quantity < 100);
  if (lowStock.length > 0) {
    lowStock.forEach(i => {
      const prod = products.find(p => p.id === i.product_id);
      alerts += '<div class="flex items-start gap-3 p-3 rounded-lg bg-orange-400/5 border border-orange-400/20">'
        + '<span class="material-symbols-outlined text-orange-400">warning</span>'
        + '<div><p class="text-sm font-semibold text-orange-400">Low Stock: ' + (prod?.name || 'Unknown') + '</p>'
        + '<p class="text-xs text-slate-400 mt-1">' + i.stock_quantity + ' units remaining.</p></div></div>';
    });
  } else {
    alerts = '<div class="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">'
      + '<span class="material-symbols-outlined text-primary">check_circle</span>'
      + '<div><p class="text-sm font-semibold text-primary">All Good</p>'
      + '<p class="text-xs text-slate-400 mt-1">No low stock alerts at the moment.</p></div></div>';
  }

  el.innerHTML = ''
    + '<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">'
    + '<div class="lg:col-span-2 glass-panel rounded-xl p-6" style="' + GLASS_STYLE + '">'
    + '<div class="flex items-center justify-between mb-6"><h2 class="font-heading text-lg font-bold text-white">Product Stock Tiers</h2>'
    + '<button id="refresh-inv" class="text-primary text-sm font-semibold hover:underline">Refresh</button></div>'
    + '<div class="space-y-6">' + stockBars + '</div></div>'
    + '<div class="glass-panel rounded-xl p-6 relative overflow-hidden" style="' + GLASS_STYLE + '">'
    + '<div class="relative z-10"><h2 class="font-heading text-lg font-bold text-white mb-4">Stock Alerts</h2>'
    + '<div class="space-y-4">' + alerts + '</div></div>'
    + '<div class="absolute -bottom-10 -right-10 opacity-5"><span class="material-symbols-outlined text-[120px] text-white">inventory</span></div>'
    + '</div></div>';

  el.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action="add-stock"]');
    if (btn) {
      const qty = parseInt(prompt('Add how many units?', '500') || '0', 10);
      if (!qty || qty <= 0) return;
      const inv = getInventory().find(i => i.product_id === btn.dataset.pid);
      if (inv) {
        updateInventory(btn.dataset.pid, inv.stock_quantity + qty);
        showToast('Added ' + qty + ' units.', 'success');
        _renderSection('inventory');
      }
    }
    if (e.target.id === 'refresh-inv' || e.target.closest('#refresh-inv')) _renderSection('inventory');
  });
}

function _renderUsers(el) {
  const users = getAllUsers();

  let rows = '';
  users.forEach(u => {
    const initials = (u.full_name || u.email || '??').substring(0, 2).toUpperCase();
    const roleCls = u.role === 'admin' ? 'bg-blue-500/10 text-blue-400' : 'bg-green-500/10 text-green-400';
    rows += '<tr class="hover:bg-white/5 transition-colors">'
      + '<td class="px-6 py-4"><div class="flex items-center gap-3"><div class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold">' + initials + '</div><span class="text-sm font-medium text-white">' + (u.full_name || '—') + '</span></div></td>'
      + '<td class="px-6 py-4 text-sm text-slate-400">' + u.email + '</td>'
      + '<td class="px-6 py-4"><span class="text-xs font-semibold px-2 py-1 rounded-lg ' + roleCls + '">' + u.role + '</span></td>'
      + '<td class="px-6 py-4 text-sm text-slate-400">' + formatDate(u.created_at) + '</td>'
      + '</tr>';
  });
  if (!rows) rows = '<tr><td colspan="4" class="px-6 py-8 text-center text-slate-500">No users</td></tr>';

  el.innerHTML = ''
    + '<div class="glass-panel rounded-xl overflow-hidden" style="' + GLASS_STYLE + '">'
    + '<div class="p-6 border-b border-white/5 bg-white/5"><h2 class="font-heading text-xl font-bold text-white">User Management</h2></div>'
    + '<div class="overflow-x-auto"><table class="w-full text-left"><thead><tr class="bg-white/5 text-slate-400 text-xs font-bold uppercase tracking-wider">'
    + '<th class="px-6 py-4">Name</th><th class="px-6 py-4">Email</th><th class="px-6 py-4">Role</th><th class="px-6 py-4">Joined</th>'
    + '</tr></thead><tbody class="divide-y divide-white/5">' + rows + '</tbody></table></div></div>';
}

function _statusColor(status) {
  const map = { pending: 'text-orange-400', confirmed: 'text-blue-400', processing: 'text-blue-400', shipped: 'text-violet-400', delivered: 'text-green-400', cancelled: 'text-red-400' };
  return map[status] || 'text-slate-400';
}

function _handleUpdateStatus(orderId) {
  const newStatus = prompt('Enter new status: pending | confirmed | processing | shipped | delivered | cancelled');
  if (!newStatus) return;
  const valid = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!valid.includes(newStatus)) { showToast('Invalid status.', 'error'); return; }
  updateOrderStatus(orderId, newStatus);
  showToast('Order status updated!', 'success');
  _renderSection(_activeTab);
}
