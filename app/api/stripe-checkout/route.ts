import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-05-27.dahlia",
});

export async function POST(req: NextRequest) {
  try {
    const { email, userId, returnUrl } = await req.json();

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
