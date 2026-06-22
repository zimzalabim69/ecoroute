import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;
const isPlaceholder = !STRIPE_SECRET ||
  STRIPE_SECRET.toLowerCase().includes("your") ||
  STRIPE_SECRET.toLowerCase().includes("placeholder") ||
  STRIPE_SECRET === "test";
const stripe = STRIPE_SECRET && !isPlaceholder
  ? new Stripe(STRIPE_SECRET, { apiVersion: "2026-05-27.dahlia" })
  : null;

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured. Payments are disabled." },
      { status: 503 }
    );
  }

  try {
    const { email, userId, returnUrl } = (await req.json()) as {
      email?: string;
      userId?: string;
      returnUrl?: string;
    };

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    if (!userId || typeof userId !== "string" || userId.length === 0) {
      return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
    }
    if (!returnUrl || !/^https?:\/\//.test(returnUrl)) {
      return NextResponse.json({ error: "Invalid returnUrl" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "EcoRoute Boost",
              description:
                "One-time premium route planner + carbon report unlock",
            },
            unit_amount: 299,
          },
          quantity: 1,
        },
      ],
      success_url: `${returnUrl}?boost=success`,
      cancel_url: `${returnUrl}?boost=cancel`,
      metadata: { userId },
      customer_email: email,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
