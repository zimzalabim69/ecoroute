import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function isPlaceholder(val: string | undefined): boolean {
  if (!val) return true;
  const lower = val.toLowerCase();
  return lower.includes("your") || lower.includes("placeholder") || lower === "test";
}

export async function POST(req: NextRequest) {
  if (
    isPlaceholder(STRIPE_SECRET) ||
    isPlaceholder(WEBHOOK_SECRET) ||
    isPlaceholder(SUPABASE_URL) ||
    isPlaceholder(SUPABASE_SERVICE_KEY)
  ) {
    return NextResponse.json(
      { error: "Stripe or Supabase is not fully configured. Webhooks are disabled." },
      { status: 503 }
    );
  }

  const stripe = new Stripe(STRIPE_SECRET!, { apiVersion: "2026-05-27.dahlia" });
  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!);

  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature!, WEBHOOK_SECRET!);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const customerId = session.customer as string;
    const paymentIntentId = session.payment_intent as string;

    if (!userId) {
      console.error("Stripe webhook: missing userId in session metadata");
      return NextResponse.json(
        { error: "Missing userId in metadata" },
        { status: 400 }
      );
    }

    if (paymentIntentId) {
      const { data: existing } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("stripe_payment_intent_id", paymentIntentId)
        .maybeSingle();

      if (existing) {
        return NextResponse.json({ received: true, idempotent: true });
      }

      await supabase
        .from("subscriptions")
        .upsert(
          {
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_payment_intent_id: paymentIntentId,
            status: "completed",
          },
          { onConflict: "user_id" }
        );

      await supabase
        .from("profiles")
        .update({ subscription_tier: "boost" })
        .eq("id", userId);
    }
  }

  return NextResponse.json({ received: true });
}
