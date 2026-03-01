import { getCart, clearCart } from '../utils/cart.js';
import { formatPrice } from '../utils/format.js';
import { createOrder } from '../db.js';
import { getUser } from '../auth.js';
import { showToast } from '../utils/toast.js';
import { navigate } from '../router.js';

const DELIVERY_FEE = 500; // 500 paise = ₹5

export function render() {
  const items = getCart();
  const subtotal = items.reduce((acc, i) => acc + i.price_paise * i.quantity, 0);
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + DELIVERY_FEE + gst;

  if (items.length === 0) {
    return `<div class="stitch-page checkout-page">
      <div class="max-w-7xl mx-auto px-6 py-24 text-center">
        <div class="glass-card rounded-2xl p-12 max-w-lg mx-auto" style="background:rgba(255,255,255,0.03);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.1);">
          <span class="material-symbols-outlined text-primary text-6xl mb-6 block">shopping_cart</span>
          <h2 class="text-2xl font-display font-bold mb-4">Your cart is empty</h2>
          <p class="text-slate-400 mb-8">Add some products before checking out.</p>
          <a href="/products" class="px-8 py-3 bg-primary text-background-dark font-bold rounded-xl inline-block hover:opacity-90 transition-opacity" style="text-decoration:none;">Browse Products</a>
        </div>
      </div>
    </div>`;
  }

  const itemsHTML = items.map(i => `
    <div class="glass p-6 rounded-2xl flex items-center gap-6 group hover:border-primary/30 transition-colors" style="background:rgba(255,255,255,0.03);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.1);">
      <div class="size-24 rounded-xl bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
        <span class="material-symbols-outlined text-primary text-4xl">water_drop</span>
      </div>
      <div class="flex-1">
        <div class="flex justify-between items-start mb-1">
          <h4 class="text-lg font-bold text-slate-100">${i.name}</h4>
        </div>
        <p class="text-sm text-slate-400 mb-4">Qty: ${i.quantity}</p>
        <div class="flex items-center justify-between">
          <p class="text-xl font-bold text-primary">${formatPrice(i.price_paise * i.quantity)}</p>
        </div>
      </div>
    </div>
  `).join('');

  return `
  <div class="stitch-page checkout-page">
    <div class="max-w-7xl mx-auto px-6 py-12">
      <div class="mb-10">
        <h2 class="text-4xl font-display font-extrabold text-slate-100 mb-2">Checkout</h2>
        <p class="text-slate-400 flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-sm">lock</span>
          Secure checkout for your premium hydration order
        </p>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div class="lg:col-span-7 space-y-6">
          <h3 class="text-xl font-display font-semibold text-slate-200 px-2">Your Selection (${items.length} item${items.length > 1 ? 's' : ''})</h3>
          ${itemsHTML}
          <div class="pt-6">
            <h3 class="text-xl font-display font-semibold text-slate-200 px-2 mb-4">Shipping Method</h3>
            <div class="p-4 rounded-2xl border-primary/50 bg-primary/5 flex items-center justify-between" style="background:rgba(255,255,255,0.03);backdrop-filter:blur(12px);border:1px solid rgba(6,224,249,0.3);">
              <div class="flex items-center gap-4">
                <div class="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <span class="material-symbols-outlined">local_shipping</span>
                </div>
                <div>
                  <p class="font-bold text-slate-100">Premium Express Delivery</p>
                  <p class="text-xs text-slate-400">Estimated delivery: Tomorrow, 10 AM - 2 PM</p>
                </div>
              </div>
              <span class="text-primary font-bold">${formatPrice(DELIVERY_FEE)}</span>
            </div>
          </div>
        </div>
        <div class="lg:col-span-5 space-y-6">
          <div class="sticky top-28 space-y-6">
            <div class="glass-dark p-8 rounded-2xl" style="background:rgba(6,224,249,0.05);backdrop-filter:blur(16px);border:1px solid rgba(6,224,249,0.1);">
              <h3 class="text-xl font-display font-bold text-slate-100 mb-6">Order Summary</h3>
              <div class="space-y-4 mb-6">
                <div class="flex justify-between text-slate-400"><span>Subtotal</span><span class="text-slate-200 font-medium">${formatPrice(subtotal)}</span></div>
                <div class="flex justify-between text-slate-400"><span>Delivery Fee</span><span class="text-slate-200 font-medium">${formatPrice(DELIVERY_FEE)}</span></div>
                <div class="flex justify-between text-slate-400"><span>GST (18%)</span><span class="text-slate-200 font-medium">${formatPrice(gst)}</span></div>
                <div class="pt-4 border-t border-slate-800 flex justify-between items-end">
                  <span class="text-lg font-bold text-slate-100">Total Amount</span>
                  <span class="text-3xl font-display font-black text-primary tracking-tight">${formatPrice(total)}</span>
                </div>
              </div>
              <div class="space-y-4">
                <h4 class="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">Delivery Information</h4>
                <form id="address-form" novalidate>
                  <div class="space-y-4">
                    <div>
                      <label class="block text-xs font-semibold text-slate-400 mb-1.5 ml-1">Full Name</label>
                      <input id="d-name" class="w-full bg-slate-900/50 border-slate-700 rounded-xl px-4 py-3 text-slate-100 cyan-glow focus:ring-0 transition-all outline-none" placeholder="John Doe" type="text" required autocomplete="name"/>
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-slate-400 mb-1.5 ml-1">Shipping Address</label>
                      <input id="d-addr1" class="w-full bg-slate-900/50 border-slate-700 rounded-xl px-4 py-3 text-slate-100 cyan-glow focus:ring-0 transition-all outline-none" placeholder="Apartment, Street, Area" type="text" required autocomplete="address-line1"/>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="block text-xs font-semibold text-slate-400 mb-1.5 ml-1">City</label>
                        <input id="d-city" class="w-full bg-slate-900/50 border-slate-700 rounded-xl px-4 py-3 text-slate-100 cyan-glow focus:ring-0 transition-all outline-none" placeholder="Mumbai" type="text" required autocomplete="address-level2"/>
                      </div>
                      <div>
                        <label class="block text-xs font-semibold text-slate-400 mb-1.5 ml-1">Pincode</label>
                        <input id="d-pin" class="w-full bg-slate-900/50 border-slate-700 rounded-xl px-4 py-3 text-slate-100 cyan-glow focus:ring-0 transition-all outline-none" placeholder="400001" type="text" maxlength="6" required autocomplete="postal-code"/>
                      </div>
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-slate-400 mb-1.5 ml-1">Phone Number</label>
                      <div class="relative">
                        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">+91</span>
                        <input id="d-phone" class="w-full bg-slate-900/50 border-slate-700 rounded-xl pl-12 pr-4 py-3 text-slate-100 cyan-glow focus:ring-0 transition-all outline-none" placeholder="98765 43210" type="tel" required autocomplete="tel"/>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              <button id="pay-now-btn" class="w-full mt-8 bg-gradient-to-r from-primary to-[#00b4d8] text-background-dark font-display font-black text-lg py-5 rounded-2xl shadow-[0_10px_30px_-10px_rgba(6,224,249,0.5)] hover:scale-[1.02] transition-transform active:scale-95 flex flex-col items-center justify-center gap-1">
                <span id="pay-btn-text">PLACE ORDER</span>
                <span class="text-[10px] opacity-70 font-sans font-bold flex items-center gap-1 tracking-wider uppercase">
                  <span class="material-symbols-outlined text-[12px]">verified_user</span> Demo Mode — No Payment
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

export async function init() {
  const items = getCart();
  if (!items.length) return;
  document.getElementById('pay-now-btn')?.addEventListener('click', _handlePayment);
}

async function _handlePayment() {
  const form = document.getElementById('address-form');
  if (!form?.checkValidity()) { form?.reportValidity(); return; }

  const btn = document.getElementById('pay-now-btn');
  const btnText = document.getElementById('pay-btn-text');
  btn.disabled = true;
  btnText.textContent = 'Processing…';

  try {
    const user = await getUser();
    if (!user) { navigate('/login'); return; }

    const items = getCart();
    const subtotal = items.reduce((acc, i) => acc + i.price_paise * i.quantity, 0);
    const gst = Math.round(subtotal * 0.18);
    const totalPaise = subtotal + DELIVERY_FEE + gst;

    const addr = [
      document.getElementById('d-addr1')?.value,
      document.getElementById('d-city')?.value,
      document.getElementById('d-pin')?.value,
    ].filter(Boolean).join(', ');

    // Create order directly in local database
    const order = createOrder(user.id, items.map(i => ({
      productId: i.id,
      quantity: i.quantity,
      price_paise: i.price_paise,
    })), totalPaise, addr);

    clearCart();
    window.dispatchEvent(new Event('bluvia:cart-updated'));
    showToast('Order placed successfully! ID: ' + order.id, 'success');

    // Small delay for UX
    setTimeout(() => navigate('/orders'), 500);
  } catch (err) {
    console.error('Checkout error:', err);
    showToast('Something went wrong. Please try again.', 'error');
  } finally {
    btn.disabled = false;
    btnText.textContent = 'PLACE ORDER';
  }
}
