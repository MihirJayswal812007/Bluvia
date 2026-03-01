-- ============================================================
-- BLUVIA — Row Level Security Policies
-- Migration: 002_rls
-- Run AFTER 001_schema.sql
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;

-- ── Helper: check if current user is admin ──
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ════════════════════════════════════════════════════════════
-- PROFILES
-- ════════════════════════════════════════════════════════════
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id AND role = 'user');  -- cannot self-promote to admin

CREATE POLICY "Admins can update any profile"
    ON public.profiles FOR UPDATE
    USING (public.is_admin());

CREATE POLICY "Service role can insert profiles"
    ON public.profiles FOR INSERT
    WITH CHECK (true);  -- handled by trigger with SECURITY DEFINER

-- ════════════════════════════════════════════════════════════
-- PRODUCTS
-- ════════════════════════════════════════════════════════════
CREATE POLICY "Anyone can view active products"
    ON public.products FOR SELECT
    USING (active = true);

CREATE POLICY "Admins can view all products"
    ON public.products FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Admins can insert products"
    ON public.products FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update products"
    ON public.products FOR UPDATE
    USING (public.is_admin());

CREATE POLICY "Admins can delete products"
    ON public.products FOR DELETE
    USING (public.is_admin());

-- ════════════════════════════════════════════════════════════
-- ORDERS
-- ════════════════════════════════════════════════════════════
CREATE POLICY "Users can view own orders"
    ON public.orders FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
    ON public.orders FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Auth users can create orders"
    ON public.orders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update orders"
    ON public.orders FOR UPDATE
    USING (public.is_admin());

-- ════════════════════════════════════════════════════════════
-- ORDER ITEMS
-- ════════════════════════════════════════════════════════════
CREATE POLICY "Users can view own order items"
    ON public.order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all order items"
    ON public.order_items FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Auth users can insert order items"
    ON public.order_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
        )
    );

-- ════════════════════════════════════════════════════════════
-- PAYMENTS
-- ════════════════════════════════════════════════════════════
CREATE POLICY "Users can view own payments"
    ON public.payments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = payments.order_id AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all payments"
    ON public.payments FOR SELECT
    USING (public.is_admin());

-- INSERT restricted to service_role (Edge Functions) — no user policy needed.
-- Edge functions use service_role key which bypasses RLS.

-- ════════════════════════════════════════════════════════════
-- INVENTORY
-- ════════════════════════════════════════════════════════════
CREATE POLICY "Anyone can view inventory"
    ON public.inventory FOR SELECT
    USING (true);

CREATE POLICY "Admins can update inventory"
    ON public.inventory FOR UPDATE
    USING (public.is_admin());

CREATE POLICY "Admins can insert inventory"
    ON public.inventory FOR INSERT
    WITH CHECK (public.is_admin());

-- ════════════════════════════════════════════════════════════
-- DELIVERIES
-- ════════════════════════════════════════════════════════════
CREATE POLICY "Users can view own deliveries"
    ON public.deliveries FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = deliveries.order_id AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all deliveries"
    ON public.deliveries FOR ALL
    USING (public.is_admin());
