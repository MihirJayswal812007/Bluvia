import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

/**
 * BLUVIA — razorpay-webhook Edge Function
 * Async payment confirmation from Razorpay.
 * No JWT required — uses webhook secret for verification.
 *
 * Required secrets:
 *   RAZORPAY_WEBHOOK_SECRET
 */

const WEBHOOK_SECRET = Deno.env.get("RAZORPAY_WEBHOOK_SECRET")!;

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
    // Only accept POST
    if (req.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
    }

    try {
        // 1. Get raw body for signature verification
        const rawBody = await req.text();
        const receivedSignature = req.headers.get("x-razorpay-signature");

        if (!receivedSignature) {
            console.error("[webhook] Missing x-razorpay-signature header");
            return new Response("Missing signature", { status: 400 });
        }

        // 2. Verify webhook signature
        const expectedSignature = await hmacSHA256(WEBHOOK_SECRET, rawBody);

        if (expectedSignature !== receivedSignature) {
            console.error("[webhook] Signature verification failed");
            return new Response("Invalid signature", { status: 400 });
        }

        // 3. Parse event
        const event = JSON.parse(rawBody);
        const eventType = event.event;

        console.log(`[webhook] Received event: ${eventType}`);

        // 4. Handle payment events
        const adminClient = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        switch (eventType) {
            case "payment.captured": {
                const payment = event.payload?.payment?.entity;
                if (!payment) break;

                const razorpayOrderId = payment.order_id;

                // Update payment status
                await adminClient
                    .from("payments")
                    .update({ status: "captured", method: payment.method })
                    .eq("razorpay_order_id", razorpayOrderId);

                // Update order status
                await adminClient
                    .from("orders")
                    .update({ status: "confirmed" })
                    .eq("razorpay_order_id", razorpayOrderId);

                console.log(`[webhook] Payment captured for order: ${razorpayOrderId}`);
                break;
            }

            case "payment.failed": {
                const payment = event.payload?.payment?.entity;
                if (!payment) break;

                const razorpayOrderId = payment.order_id;

                // Update payment status
                await adminClient
                    .from("payments")
                    .update({ status: "failed" })
                    .eq("razorpay_order_id", razorpayOrderId);

                // Update order status
                await adminClient
                    .from("orders")
                    .update({ status: "cancelled" })
                    .eq("razorpay_order_id", razorpayOrderId);

                console.log(`[webhook] Payment failed for order: ${razorpayOrderId}`);
                break;
            }

            case "refund.created":
            case "refund.processed": {
                const refund = event.payload?.refund?.entity;
                if (!refund) break;

                const paymentId = refund.payment_id;

                // Update payment status to refunded
                await adminClient
                    .from("payments")
                    .update({ status: "refunded" })
                    .eq("razorpay_payment_id", paymentId);

                console.log(`[webhook] Refund processed for payment: ${paymentId}`);
                break;
            }

            default:
                console.log(`[webhook] Unhandled event type: ${eventType}`);
        }

        // Always return 200 to Razorpay (they retry on non-2xx)
        return new Response(JSON.stringify({ status: "ok" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        console.error("[webhook] Unhandled error:", err);
        // Still return 200 to prevent retries for parse errors
        return new Response(JSON.stringify({ status: "error", message: "Processing failed" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    }
});
