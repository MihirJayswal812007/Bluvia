/**
 * BLUVIA — Cart Manager (localStorage)
 * Cart items: [{ productId, name, price_paise, quantity }]
 */

const CART_KEY = 'bluvia_cart';

export function getCart() {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
        return [];
    }
}

export function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function addToCart(product, quantity = 1) {
    const cart = getCart();
    const existing = cart.find(i => i.productId === product.id);
    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({
            productId: product.id,
            name: product.name,
            price_paise: product.price_paise,
            quantity,
        });
    }
    saveCart(cart);
    dispatchCartUpdate();
}

export function updateCartQuantity(productId, quantity) {
    const cart = getCart();
    const item = cart.find(i => i.productId === productId);
    if (item) {
        item.quantity = Math.max(1, quantity);
        saveCart(cart);
        dispatchCartUpdate();
    }
}

export function removeFromCart(productId) {
    const cart = getCart().filter(i => i.productId !== productId);
    saveCart(cart);
    dispatchCartUpdate();
}

export function clearCart() {
    localStorage.removeItem(CART_KEY);
    dispatchCartUpdate();
}

export function getCartTotal() {
    return getCart().reduce((sum, item) => sum + item.price_paise * item.quantity, 0);
}

export function getCartCount() {
    return getCart().reduce((sum, item) => sum + item.quantity, 0);
}

function dispatchCartUpdate() {
    window.dispatchEvent(new CustomEvent('bluvia:cart-updated', { detail: getCart() }));
}
