/**
 * BLUVIA — Local Database (localStorage)
 * Replaces Supabase. All data persisted in localStorage.
 */

const DB_KEY = 'bluvia_db';
const DB_VERSION = 2; // Bump this when seed data changes

// ── Default seed data ───────────────────────────────────
const DEFAULT_PRODUCTS = [
    {
        id: 'prod-001',
        name: 'Essential 200ml',
        price_paise: 500,
        volume_ml: 200,
        description: 'Pure, refreshing water in a compact 200ml bottle. Perfect for on-the-go hydration.',
        specs: ['PET', 'Screw-on cap', '210g', '6 months shelf life'],
        image_url: null,
        active: true,
        created_at: '2026-01-01T00:00:00Z',
    },
    {
        id: 'prod-002',
        name: 'Classic 500ml',
        price_paise: 1000,
        volume_ml: 500,
        description: 'Our bestselling 500ml bottle. Balanced minerals for the perfect taste, every time.',
        specs: ['PET', 'Sports cap', '520g', '12 months shelf life'],
        image_url: null,
        active: true,
        created_at: '2026-01-01T00:00:00Z',
    },
    {
        id: 'prod-003',
        name: 'Premium 1 Litre',
        price_paise: 2000,
        volume_ml: 1000,
        description: 'Premium purified water in a generous 1 litre bottle. Ideal for home and office.',
        specs: ['BPA-free PET', 'Wide-mouth cap', '1050g', '12 months shelf life'],
        image_url: null,
        active: true,
        created_at: '2026-01-01T00:00:00Z',
    },
];

const DEFAULT_INVENTORY = [
    { product_id: 'prod-001', stock_quantity: 500, reorder_threshold: 50 },
    { product_id: 'prod-002', stock_quantity: 300, reorder_threshold: 30 },
    { product_id: 'prod-003', stock_quantity: 200, reorder_threshold: 20 },
];

const DEFAULT_DB = {
    users: [
        { id: 'admin-001', email: 'admin@bluvia.com', full_name: 'Bluvia Admin', role: 'admin', created_at: '2026-01-01T00:00:00Z' },
    ],
    products: DEFAULT_PRODUCTS,
    inventory: DEFAULT_INVENTORY,
    orders: [],
    order_items: [],
    payments: [],
    deliveries: [],
};

// ── Load / Save ─────────────────────────────────────────
function loadDB() {
    try {
        const raw = localStorage.getItem(DB_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed._version === DB_VERSION) return parsed;
        }
    } catch { }
    // First run or version mismatch — seed fresh defaults
    const fresh = { ...DEFAULT_DB, _version: DB_VERSION };
    saveDB(fresh);
    return fresh;
}

function saveDB(db) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
}

// ── Public API ──────────────────────────────────────────

export function getProducts() {
    return loadDB().products.filter(p => p.active);
}

export function getAllProducts() {
    return loadDB().products;
}

export function getProductById(id) {
    return loadDB().products.find(p => p.id === id) || null;
}

export function updateProduct(id, updates) {
    const db = loadDB();
    const idx = db.products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    db.products[idx] = { ...db.products[idx], ...updates };
    saveDB(db);
    return db.products[idx];
}

export function getInventory() {
    const db = loadDB();
    return db.inventory.map(inv => ({
        ...inv,
        product: db.products.find(p => p.id === inv.product_id),
    }));
}

export function updateInventory(productId, stockQuantity) {
    const db = loadDB();
    const inv = db.inventory.find(i => i.product_id === productId);
    if (inv) {
        inv.stock_quantity = stockQuantity;
        saveDB(db);
    }
    return inv;
}

export function reduceInventory(productId, qty) {
    const db = loadDB();
    const inv = db.inventory.find(i => i.product_id === productId);
    if (inv) {
        inv.stock_quantity = Math.max(0, inv.stock_quantity - qty);
        saveDB(db);
    }
}

// ── Orders ──────────────────────────────────────────────
export function createOrder(userId, items, totalPaise, address = '') {
    const db = loadDB();
    const orderId = 'ord-' + Date.now();
    const order = {
        id: orderId,
        user_id: userId,
        status: 'confirmed',
        total_paise: totalPaise,
        shipping_address: address,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };
    db.orders.push(order);

    // Order items
    for (const item of items) {
        db.order_items.push({
            id: 'oi-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
            order_id: orderId,
            product_id: item.productId,
            quantity: item.quantity,
            unit_price_paise: item.price_paise,
        });
        // Reduce inventory
        reduceInventory(item.productId, item.quantity);
    }

    // Payment record
    db.payments.push({
        id: 'pay-' + Date.now(),
        order_id: orderId,
        amount_paise: totalPaise,
        status: 'captured',
        method: 'demo',
        created_at: new Date().toISOString(),
    });

    // Delivery record
    db.deliveries.push({
        id: 'del-' + Date.now(),
        order_id: orderId,
        status: 'pending',
        created_at: new Date().toISOString(),
    });

    saveDB(db);
    return order;
}

export function getOrdersByUser(userId) {
    const db = loadDB();
    return db.orders
        .filter(o => o.user_id === userId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export function getAllOrders() {
    const db = loadDB();
    return db.orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export function updateOrderStatus(orderId, status) {
    const db = loadDB();
    const order = db.orders.find(o => o.id === orderId);
    if (order) {
        order.status = status;
        order.updated_at = new Date().toISOString();
        saveDB(db);
    }
    return order;
}

export function getOrderItems(orderId) {
    const db = loadDB();
    return db.order_items
        .filter(oi => oi.order_id === orderId)
        .map(oi => ({
            ...oi,
            product: db.products.find(p => p.id === oi.product_id),
        }));
}

// ── Users (admin view) ──────────────────────────────────
export function getAllUsers() {
    return loadDB().users;
}

export function getUserById(id) {
    return loadDB().users.find(u => u.id === id) || null;
}

export function updateUserRole(userId, role) {
    const db = loadDB();
    const user = db.users.find(u => u.id === userId);
    if (user) {
        user.role = role;
        saveDB(db);
    }
    return user;
}

// ── Deliveries ──────────────────────────────────────────
export function getAllDeliveries() {
    const db = loadDB();
    return db.deliveries.map(d => ({
        ...d,
        order: db.orders.find(o => o.id === d.order_id),
    }));
}

export function updateDeliveryStatus(deliveryId, status) {
    const db = loadDB();
    const del = db.deliveries.find(d => d.id === deliveryId);
    if (del) {
        del.status = status;
        del.updated_at = new Date().toISOString();
        saveDB(db);
    }
    return del;
}

// ── Stats (admin dashboard) ─────────────────────────────
export function getStats() {
    const db = loadDB();
    const totalOrders = db.orders.length;
    const totalRevenue = db.orders.reduce((s, o) => s + o.total_paise, 0);
    const totalUsers = db.users.length;
    const pendingOrders = db.orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length;
    return { totalOrders, totalRevenue, totalUsers, pendingOrders };
}

// ── Reset DB (dev helper) ───────────────────────────────
export function resetDB() {
    localStorage.removeItem(DB_KEY);
    return loadDB();
}
