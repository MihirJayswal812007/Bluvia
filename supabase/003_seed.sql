-- ============================================================
-- BLUVIA — Seed Data
-- Migration: 003_seed
-- Run AFTER 001_schema.sql and 002_rls.sql
-- ============================================================

-- ── 3 Products ────────────────────────────────────────────
INSERT INTO public.products (id, name, price_paise, volume_ml, description, specs, image_url) VALUES
(
    'a1b2c3d4-0001-4000-8000-000000000001',
    'Essential 200ml',
    500,
    200,
    'Pure, refreshing water in a compact 200ml bottle. Perfect for on-the-go hydration.',
    '{"material": "PET", "cap": "Screw-on", "weight": "210g", "shelf_life": "6 months"}',
    '/assets/bottle-200ml.png'
),
(
    'a1b2c3d4-0002-4000-8000-000000000002',
    'Classic 500ml',
    1000,
    500,
    'Our bestselling 500ml bottle. Balanced minerals for the perfect taste, every time.',
    '{"material": "PET", "cap": "Sports cap", "weight": "520g", "shelf_life": "12 months"}',
    '/assets/bottle-500ml.png'
),
(
    'a1b2c3d4-0003-4000-8000-000000000003',
    'Premium 1 Litre',
    2000,
    1000,
    'Premium purified water in a generous 1 litre bottle. Ideal for home and office.',
    '{"material": "BPA-free PET", "cap": "Wide-mouth", "weight": "1050g", "shelf_life": "12 months"}',
    '/assets/bottle-1l.png'
);

-- ── Inventory for each product ────────────────────────────
INSERT INTO public.inventory (product_id, stock_quantity, reorder_threshold) VALUES
('a1b2c3d4-0001-4000-8000-000000000001', 500, 50),
('a1b2c3d4-0002-4000-8000-000000000002', 300, 30),
('a1b2c3d4-0003-4000-8000-000000000003', 200, 20);

-- ════════════════════════════════════════════════════════════
-- ADMIN USER
-- ════════════════════════════════════════════════════════════
-- NOTE: Create admin user through Supabase Auth (Dashboard or API):
--   Email: admin@bluvia.com
--   Password: (set your own secure password)
-- Then run:
--   UPDATE public.profiles SET role = 'admin' WHERE id = '<admin-user-uuid>';
-- 
-- Alternatively, after creating the user, run:
--   UPDATE public.profiles 
--   SET role = 'admin' 
--   WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@bluvia.com');
-- ════════════════════════════════════════════════════════════
