import express from 'express';
import { z } from 'zod';
import { db } from '../storage';
import { subscriptions, users, plans } from '../schema';
import { eq } from 'drizzle-orm';
import { stripeClient } from '../services/stripe';

const router = express.Router();

// Schema for subscription request
const subscribeSchema = z.object({
  planId: z.string(),
  paymentMethodId: z.string().optional(),
  returnUrl: z.string().optional(),
});

// Get subscription status
router.get('/status', async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = (req.user as any).id;

    // Get subscription from database
    const subscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.userId, userId),
    });

    if (!subscription) {
      // Check if user is in trial period
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (user && user.trialEndsAt) {
        const trialEndsAt = new Date(user.trialEndsAt);
        const now = new Date();
        
        if (trialEndsAt > now) {
          const trialDaysLeft = Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          return res.json({ 
            isSubscribed: false,
            trialDaysLeft
          });
        }
      }

      return res.json({ isSubscribed: false });
    }

    // Get plan details
    const plan = await db.query.plans.findFirst({
      where: eq(plans.id, subscription.planId),
    });

    return res.json({
      isSubscribed: true,
      plan,
      expiresAt: subscription.expiresAt,
    });
  } catch (error) {
    console.error('Error getting subscription status:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Subscribe to a plan
router.post('/subscribe', async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = (req.user as any).id;

    // Validate request body
    const { planId, paymentMethodId, returnUrl } = subscribeSchema.parse(req.body);

    // Get the plan details
    const plan = await db.query.plans.findFirst({
      where: eq(plans.id, planId),
    });

    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    // Get user details for Stripe
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user || !user.email) {
      return res.status(400).json({ error: 'User email not found' });
    }

    try {
      // Create or get Stripe customer
      let stripeCustomerId = user.stripeCustomerId;

      if (!stripeCustomerId) {
        const customer = await stripeClient.customers.create({
          email: user.email,
          name: user.name || undefined,
        });

        stripeCustomerId = customer.id;

        // Update user with Stripe customer ID
        await db.update(users)
          .set({ stripeCustomerId })
          .where(eq(users.id, userId));
      }

      // If direct payment method is provided
      if (paymentMethodId) {
        // Attach payment method to customer
        await stripeClient.paymentMethods.attach(paymentMethodId, {
          customer: stripeCustomerId,
        });

        // Set as default payment method
        await stripeClient.customers.update(stripeCustomerId, {
          invoice_settings: {
            default_payment_method: paymentMethodId,
          },
        });

        // Create subscription
        const subscription = await stripeClient.subscriptions.create({
          customer: stripeCustomerId,
          items: [{ price: plan.stripePriceId }],
          expand: ['latest_invoice.payment_intent'],
        });

        // Store subscription in database
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + subscription.current_period_end);

        // Check if user already has a subscription
        const existingSubscription = await db.query.subscriptions.findFirst({
          where: eq(subscriptions.userId, userId),
        });

        if (existingSubscription) {
          // Update existing subscription
          await db.update(subscriptions)
            .set({
              planId,
              stripeSubscriptionId: subscription.id,
              status: subscription.status,
              updatedAt: new Date(),
              expiresAt,
            })
            .where(eq(subscriptions.userId, userId));
        } else {
          // Create new subscription
          await db.insert(subscriptions).values({
            userId,
            planId,
            stripeSubscriptionId: subscription.id,
            status: subscription.status,
            expiresAt,
          });
        }

        return res.json({
          success: true,
          subscription
        });
      }
      // Create checkout session for redirect flow
      else if (returnUrl) {
        const session = await stripeClient.checkout.sessions.create({
          customer: stripeCustomerId,
          payment_method_types: ['card'],
          line_items: [
            {
              price: plan.stripePriceId,
              quantity: 1,
            },
          ],
          mode: 'subscription',
          success_url: `${returnUrl}?success=true&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${returnUrl}?canceled=true`,
        });

        return res.json({
          success: true,
          sessionId: session.id,
          sessionUrl: session.url
        });
      } else {
        return res.status(400).json({
          error: 'Either paymentMethodId or returnUrl must be provided'
        });
      }
    } catch (stripeError: any) {
      console.error('Stripe error:', stripeError);
      return res.status(400).json({
        error: stripeError.message || 'Payment processing failed'
      });
    }
  } catch (error) {
    console.error('Error subscribing to plan:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel subscription
router.post('/cancel', async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = (req.user as any).id;

    // Get subscription from database
    const subscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.userId, userId),
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    // Check if we have a Stripe subscription ID
    if (subscription.stripeSubscriptionId) {
      try {
        // Cancel the subscription with Stripe
        await stripeClient.subscriptions.cancel(subscription.stripeSubscriptionId);
      } catch (stripeError: any) {
        console.error('Stripe cancellation error:', stripeError);
        // Continue with local cancellation even if Stripe fails
        // This handles cases where the subscription might exist in our DB but not in Stripe
      }
    }

    // Update the subscription status in the database
    await db.update(subscriptions)
      .set({
        status: 'canceled',
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.userId, userId));

    return res.json({ success: true });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Start a trial
router.post('/trial', async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = (req.user as any).id;

    // Check if user already had a trial
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (user && user.trialEndsAt) {
      return res.status(400).json({ error: 'Trial already used' });
    }

    // Set trial end date to 14 days from now
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    // Update user with trial end date
    await db.update(users)
      .set({
        trialEndsAt,
      })
      .where(eq(users.id, userId));

    return res.json({ 
      success: true,
      trialDaysLeft: 14
    });
  } catch (error) {
    console.error('Error starting trial:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Stripe webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['stripe-signature'] as string;

  if (!signature) {
    return res.status(400).json({ error: 'Missing Stripe signature' });
  }

  try {
    // Verify the event came from Stripe
    const event = stripeClient.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );

    // Handle specific events
    switch (event.type) {
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;

        // Find the subscription in our database
        const dbSubscription = await db.query.subscriptions.findFirst({
          where: eq(subscriptions.stripeSubscriptionId, subscription.id),
        });

        if (dbSubscription) {
          // Update our database with the latest status
          await db.update(subscriptions)
            .set({
              status: subscription.status,
              updatedAt: new Date(),
              expiresAt: new Date(subscription.current_period_end * 1000),
            })
            .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any;

        // If this is a subscription invoice
        if (invoice.subscription) {
          // Find the subscription in our database
          const dbSubscription = await db.query.subscriptions.findFirst({
            where: eq(subscriptions.stripeSubscriptionId, invoice.subscription),
          });

          if (dbSubscription) {
            // Update the expiration date
            await db.update(subscriptions)
              .set({
                status: 'active',
                updatedAt: new Date(),
                expiresAt: new Date(invoice.lines.data[0].period.end * 1000),
              })
              .where(eq(subscriptions.stripeSubscriptionId, invoice.subscription));
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;

        // If this is a subscription invoice
        if (invoice.subscription) {
          // Find the subscription in our database
          const dbSubscription = await db.query.subscriptions.findFirst({
            where: eq(subscriptions.stripeSubscriptionId, invoice.subscription),
          });

          if (dbSubscription) {
            // Update the status to past_due
            await db.update(subscriptions)
              .set({
                status: 'past_due',
                updatedAt: new Date(),
              })
              .where(eq(subscriptions.stripeSubscriptionId, invoice.subscription));
          }
        }
        break;
      }
    }

    return res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(400).json({ error: 'Webhook error' });
  }
});

export default router;