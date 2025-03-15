import Stripe from 'stripe';

// Initialize Stripe with your secret key
export const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_your_test_key', {
  apiVersion: '2023-10-16',
});

// Map our plan IDs to Stripe price IDs
export const STRIPE_PRICE_IDS: Record<string, string> = {
  'basic-monthly': 'price_basic_monthly',
  'basic-yearly': 'price_basic_yearly',
  'pro-monthly': 'price_pro_monthly',
  'pro-yearly': 'price_pro_yearly',
  'enterprise': 'price_enterprise',
};

// Create a checkout session
export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
): Promise<string> {
  const session = await stripeClient.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return session.url || '';
}

// Create or get a Stripe customer
export async function getOrCreateCustomer(
  userId: string,
  email: string,
  name?: string
): Promise<string> {
  // Check if customer already exists
  const customers = await stripeClient.customers.list({
    email,
    limit: 1,
  });

  if (customers.data.length > 0) {
    return customers.data[0].id;
  }

  // Create a new customer
  const customer = await stripeClient.customers.create({
    email,
    name,
    metadata: {
      userId,
    },
  });

  return customer.id;
}

// Cancel a subscription
export async function cancelSubscription(subscriptionId: string): Promise<void> {
  await stripeClient.subscriptions.cancel(subscriptionId);
}

// Handle webhook events
export async function handleWebhookEvent(event: Stripe.Event): Promise<void> {
  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        // Handle subscription updates
        const subscription = event.data.object as Stripe.Subscription;
        // Update subscription in your database
        console.log(`Processing subscription update: ${subscription.id}`);
        // Implementation would go here
        break;
      }

      case 'customer.subscription.deleted': {
        // Handle subscription cancellation
        const canceledSubscription = event.data.object as Stripe.Subscription;
        // Update subscription status in your database
        console.log(`Processing subscription cancellation: ${canceledSubscription.id}`);
        // Implementation would go here
        break;
      }

      case 'invoice.payment_succeeded': {
        // Handle successful payment
        const invoice = event.data.object as Stripe.Invoice;
        // Update subscription expiration date
        console.log(`Processing successful payment for invoice: ${invoice.id}`);
        // Implementation would go here
        break;
      }

      case 'invoice.payment_failed': {
        // Handle failed payment
        const failedInvoice = event.data.object as Stripe.Invoice;
        // Notify user of payment failure
        console.log(`Processing failed payment for invoice: ${failedInvoice.id}`);
        // Implementation would go here
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error(`Error processing webhook event ${event.type}:`, error);
    throw error; // Re-throw to allow proper error handling by the caller
  }
}