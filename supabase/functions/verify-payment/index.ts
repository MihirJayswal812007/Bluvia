import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

/**
 * BLUVIA — verify-payment Edge Function
 * Verifies Razorpay signature (HMAC-SHA256) → creates order + payment records → reduces inventory.
 *
 * Required secrets:
 *   RAZORPAY_KEY_SECRET, SUPABASE_SERVICE_ROLE_KEY (auto-available)
 */

const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET")!;

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function hmacSHA256(key: string, message: string): Promise<string> {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(key);
    const msgData = encoder.encode(message);

    const cryptoKey = await crypto.subtle.importKey(
        "raw",
        keyData,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );

    const signature = await crypto.subtle.sign("HMAC", cryptoKey, msgData);
    return Array.from(new Uint8Array(signature))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // 1. Authenticate user
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const userClient = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_ANON_KEY")!,
            { global: { headers: { Authorization: authHeader } } }
        );

        const { data: { user }, error: authError } = await userClient.auth.getUser();
        if (authError || !user) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // 2. Parse body
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, items } = await req.json();

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return new Response(JSON.stringify({ error: "Missing payment fields" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // 3. Verify HMAC-SHA256 signature
        const expectedSignature = await hmacSHA256(
            RAZORPAY_KEY_SECRET,
            `${razorpay_order_id}|${razorpay_payment_id}`
        );

        if (expectedSignature !== razorpay_signature) {
            console.error("[verify-payment] Signature mismatch");
            return new Response(JSON.stringify({ error: "Invalid payment signature" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // 4. Use service role for DB writes
        const adminClient = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        // Calculate total from items
        let totalPaise = 0;
        if (items && Array.isArray(items)) {
            for (const item of items) {
                totalPaise += (item.price_paise || 0) * (item.quantity || 1);
            }
        }

        // 5. Create order record
        const { data: order, error: orderError } = await adminClient
            .from("orders")
            .insert({
                user_id: user.id,
                status: "confirmed",
                total_paise: totalPaise,
                razorpay_order_id,
            })
            .select()
            .single();

        if (orderError || !order) {
            console.error("[verify-payment] Order insert failed:", orderError);
            return new Response(JSON.stringify({ error: "Failed to create order" }), {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // 6. Create order items
        if (items && Array.isArray(items)) {
            const orderItems = items.map((item: any) => ({
                order_id: order.id,
                product_id: item.productId,
                quantity: item.quantity || 1,
                unit_price_paise: item.price_paise,
            }));

            const { error: itemsError } = await adminClient
                .from("order_items")
                .insert(orderItems);

            if (itemsError) {
                console.error("[verify-payment] Order items insert failed:", itemsError);
            }
        }

        // 7. Create payment record
        const { error: paymentError } = await adminClient
            .from("payments")
            .insert({
                order_id: order.id,
                razorpay_payment_id,
                razorpay_order_id,
                razorpay_signature,
                amount_paise: totalPaise,
                status: "captured",
            });

        if (paymentError) {
            console.error("[verify-payment] Payment insert failed:", paymentError);
        }

        // 8. Reduce inventory
        if (items && Array.isArray(items)) {
            for (const item of items) {
                // Direct update since RPC not available
                const { data: inv } = await adminClient
                    .from("inventory")
                    .select("stock_quantity")
                    .eq("product_id", item.productId)
                    .single();

                if (inv) {
                    const newQty = Math.max(0, inv.stock_quantity - (item.quantity || 1));
                    await adminClient
                        .from("inventory")
                        .update({ stock_quantity: newQty })
                        .eq("product_id", item.productId);
                }
            }
        }

        // 9. Create delivery record
        await adminClient
            .from("deliveries")
            .insert({
                order_id: order.id,
                status: "pending",
            });

        return new Response(JSON.stringify({ order_id: order.id, status: "confirmed" }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (err) {
        console.error("[verify-payment] Unhandled error:", err);
        return new Response(JSON.stringify({ error: "Internal server error" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
