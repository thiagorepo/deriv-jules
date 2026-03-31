import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@org/supabase';

// Minimal shapes for Stripe event objects used in this handler.
// Replace with `import Stripe from 'stripe'` and use Stripe.Checkout.Session,
// Stripe.Invoice, and Stripe.Subscription once the real Stripe SDK is wired up.
interface StripeCheckoutSession {
  id: string;
  customer: string | null;
}

interface StripeInvoice {
  id: string;
  amount_paid: number;
  currency: string;
  attempts_left?: number;
}

interface StripeSubscription {
  id: string;
  status: string;
  canceled_at?: number | null;
}

/**
 * Stripe webhook handler
 * Handles webhook events from Stripe
 */
export async function POST(req: NextRequest) {
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { success: false, error: { code: 'MISSING_SIGNATURE' } },
      { status: 400 },
    );
  }

  try {
    const body = await req.text();

    // Verify webhook signature
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json(
        { success: false, error: { code: 'MISSING_WEBHOOK_SECRET' } },
        { status: 500 },
      );
    }
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret,
    );

    // Handle different webhook events
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(
          event.data.object as StripeCheckoutSession,
        );
        break;

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as StripeInvoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as StripeInvoice);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(
          event.data.object as StripeSubscription,
        );
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(
          event.data.object as StripeSubscription,
        );
        break;

      default:
        // Log unhandled events
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    // Log the error
    console.error('Stripe webhook error:', error);

    // Return error to Stripe
    return NextResponse.json(
      { success: false, error: { code: 'WEBHOOK_ERROR' } },
      { status: 500 },
    );
  }
}

/**
 * Handle checkout.session.completed event
 */
async function handleCheckoutCompleted(session: StripeCheckoutSession) {
  console.log('Checkout completed:', session.id);

  // TODO: Implement checkout completion logic
  // - Create/update user subscription
  // - Update tenant membership
  // - Send confirmation email
  // - Update analytics

  return {
    event: 'checkout.completed',
    sessionId: session.id,
    customerId: session.customer,
  };
}

/**
 * Handle invoice.paid event
 */
async function handleInvoicePaid(invoice: StripeInvoice) {
  console.log('Invoice paid:', invoice.id);

  // TODO: Implement invoice payment logic
  // - Verify payment was successful
  // - Activate subscription
  // - Update subscription status
  // - Send invoice confirmation

  return {
    event: 'invoice.paid',
    invoiceId: invoice.id,
    amount: invoice.amount_paid,
    currency: invoice.currency,
  };
}

/**
 * Handle invoice.payment_failed event
 */
async function handleInvoicePaymentFailed(invoice: StripeInvoice) {
  console.log('Invoice payment failed:', invoice.id);

  // TODO: Implement payment failure logic
  // - Notify user
  // - Schedule retry
  // - Monitor payment attempts
  // - Lock account if multiple failures

  return {
    event: 'invoice.payment_failed',
    invoiceId: invoice.id,
    attempts: invoice.attempts_left,
  };
}

/**
 * Handle customer.subscription.updated event
 */
async function handleSubscriptionUpdated(subscription: StripeSubscription) {
  console.log('Subscription updated:', subscription.id);

  // TODO: Implement subscription update logic
  // - Update subscription details in database
  // - Handle plan changes
  // - Update pricing

  return {
    event: 'customer.subscription.updated',
    subscriptionId: subscription.id,
    status: subscription.status,
  };
}

/**
 * Handle customer.subscription.deleted event
 */
async function handleSubscriptionDeleted(subscription: StripeSubscription) {
  console.log('Subscription deleted:', subscription.id);

  // TODO: Implement subscription cancellation logic
  // - Cancel subscription in database
  // - Notify user
  // - Handle downgrading/freezing
  // - Clean up resources

  return {
    event: 'customer.subscription.deleted',
    subscriptionId: subscription.id,
    canceledAt: subscription.canceled_at,
  };
}
