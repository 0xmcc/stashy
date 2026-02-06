import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  if (!stripe) {
    console.warn('Stripe webhook received but STRIPE_SECRET_KEY is not set.');
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.warn('Stripe webhook received but STRIPE_WEBHOOK_SECRET is not set.');
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header.' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('✅ Subscription activated:', {
        sessionId: session.id,
        customerId: session.customer,
        subscriptionId: session.subscription,
        customerEmail: session.customer_details?.email,
      });
      // TODO: Wire to Supabase user table
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      console.log('❌ Subscription cancelled:', {
        subscriptionId: subscription.id,
        customerId: subscription.customer,
      });
      // TODO: Wire to Supabase user table
      break;
    }

    default:
      console.log(`Unhandled Stripe event: ${event.type}`);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
