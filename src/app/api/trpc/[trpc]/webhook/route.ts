import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { db } from "@/server/db"; // Ensure your db import is correct

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export async function POST(request: Request) {
  const body = await request.text();
  const signature = (await headers()).get('Stripe-Signature') as string;
  let event: Stripe.Event;

  // Construct event from Stripe webhook
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  console.log(event.type);

  // Handle checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const credits = Number(session.metadata?.['credits']);
    const userId = session.client_reference_id;

    if (!userId || !credits) {
      return NextResponse.json({ error: "Missing userId or Credits" }, { status: 400 });
    }

    // Update user credits and log the transaction
    try {
      await db.stripeTransaction.create({
        data: {
          userId,
          credits,
        },
      });

      await db.user.update({
        where: { id: userId },
        data: {
          credits: {
            increment: credits,
          },
        },
      });

      return NextResponse.json({ message: "Credits added successfully" }, { status: 200 });
    } catch (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to process payment and update credits' }, { status: 500 });
    }
  }

  // Handle other event types if necessary
  return NextResponse.json({ message: 'Event received' }, { status: 200 });
}
