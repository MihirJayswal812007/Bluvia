import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

/**
 * BLUVIA — create-order Edge Function
 * Validates cart items → creates a Razorpay order via Razorpay API.
 * Returns the Razorpay order object to the frontend.
 *
 * Required secrets:
 *   RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
 */

const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID")!;
const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET")!;

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // 1. Authenticate user
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
                status: 401,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const supabase = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_ANON_KEY")!,
            { global: { headers: { Authorization: authHeader } } }
        );

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // 2. Parse & validate cart
        const { items, total_paise } = await req.json();

        if (!items || !Array.isArray(items) || items.length === 0) {
            return new Response(JSON.stringify({ error: "Cart is empty" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        if (!total_paise || typeof total_paise !== "number" || total_paise <= 0) {
            return new Response(JSON.stringify({ error: "Invalid total" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // 3. Verify prices against DB (prevent tampering)
        const adminClient = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        const productIds = items.map((i: any) => i.productId);
        const { data: products, error: prodError } = await adminClient
            .from("products")
            .select("id, price_paise, name")
            .in("id", productIds);

        if (prodError || !products) {
            return new Response(JSON.stringify({ error: "Failed to verify products" }), {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // Calculate server-side total
        let verifiedTotal = 0;
        for (const item of items) {
            const product = products.find((p: any) => p.id === item.productId);
            if (!product) {
                return new Response(JSON.stringify({ error: `Product ${item.productId} not found` }), {
                    status: 400,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                });
            }
            verifiedTotal += product.price_paise * (item.quantity || 1);
        }

        if (verifiedTotal !== total_paise) {
            return new Response(JSON.stringify({ error: "Price mismatch — cart may be stale" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // 4. Create Razorpay order
        const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Basic " + btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`),
            },
            body: JSON.stringify({
                amount: total_paise,
                currency: "INR",
                receipt: `bluvia_${Date.now()}`,
                notes: {
                    user_id: user.id,
                    user_email: user.email,
                },
            }),
        });

        if (!razorpayResponse.ok) {
            const errBody = await razorpayResponse.text();
            console.error("[create-order] Razorpay error:", errBody);
            return new Response(JSON.stringify({ error: "Failed to create Razorpay order" }), {
                status: 502,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const razorpayOrder = await razorpayResponse.json();

        return new Response(JSON.stringify(razorpayOrder), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (err) {
        console.error("[create-order] Unhandled error:", err);
        return new Response(JSON.stringify({ error: "Internal server error" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
