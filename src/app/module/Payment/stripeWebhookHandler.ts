

// import Stripe from 'stripe';
// import { Request, Response } from 'express';
// import UserSubscription from '../CreditPayment/subscriptions.model';

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
//   // apiVersion: '2024-06-20',
// });

// export const stripeWebhookHandler = async (req: Request, res: Response) => {
//   const sig = req.headers['stripe-signature'] as string;

//   let event: Stripe.Event;

//   try {
//     event = stripe.webhooks.constructEvent(
//       req.body,
//       sig,
//       process.env.STRIPE_WEBHOOK_SECRET!
//     );
//   } catch (err) {
//     const errorMessage = err instanceof Error ? err.message : String(err);
//     console.error('❌ Webhook signature verification failed:', errorMessage);
//     return res.status(400).send(`Webhook Error: ${errorMessage}`);
//   }

//   try {
//     switch (event.type) {
//       /**
//        * 🔹 PAYMENT INTENT SUCCESS (One-time payments / credits)
//        * You already handle this elsewhere, so just leave it.
//        */
//       case 'invoice.payment_succeeded': {
//         const invoice = event.data.object as Stripe.Invoice;
//         const userId = invoice.metadata?.userId;
//         const subscriptionPackageId = invoice.metadata?.subscriptionPackageId;
//         const subscriptionId = (invoice as any).subscription as string;

//         if (!userId || !subscriptionPackageId || !subscriptionId) break;

//         const userSub = await UserSubscription.findOne({ stripeSubscriptionId: subscriptionId });
//         if (!userSub) return;

//         userSub.status = 'active';
//         userSub.subscriptionPeriodStart = new Date(invoice.lines.data[0].period.start * 1000);
//         userSub.subscriptionPeriodEnd = new Date(invoice.lines.data[0].period.end * 1000);
//         await userSub.save();
//         console.log(`User ${userId} subscription active`);
//         break;
//       }

//       case 'customer.subscription.deleted': {
//         const subscription = event.data.object as Stripe.Subscription;
//         const userSub = await UserSubscription.findOne({ stripeSubscriptionId: subscription.id });
//         if (!userSub) break;

//         userSub.status = 'canceled';
//         userSub.subscriptionPeriodStart = undefined;
//         userSub.subscriptionPeriodEnd = undefined;
//         await userSub.save();

//         console.log(`User ${userSub.userId} subscription canceled`);
//         break;
//       }


//       default:
//         console.log(`⚙️ Unhandled event type: ${event.type}`);
//     }

//     res.status(200).send('OK');
//   } catch (error) {
//     console.error('🚨 Error processing webhook:', error);
//     res.status(500).send('Webhook handler failed');
//   }
// };




import Stripe from 'stripe';
import { Request, Response } from 'express';
import { SubscriptionType } from '../CreditPayment/paymentMethod.service';
import EliteProUserSubscription from '../CreditPayment/EliteProUserSubscription';
import UserSubscription from '../CreditPayment/subscriptions.model';
import UserProfile from '../User/user.model';



const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  // apiVersion: '2024-06-20',
});

export const stripeWebhookHandler = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('❌ Webhook signature verification failed:', errorMessage);
    return res.status(400).send(`Webhook Error: ${errorMessage}`);
  }

  try {
    switch (event.type) {

      /**
       * 🔹 PAYMENT INTENT SUCCESS (One-time payments / credits)
       * You already handle this elsewhere, so just leave it.
       */
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const userId = invoice.metadata?.userId;
        const packageId = invoice.metadata?.packageId;
        const type = invoice.metadata?.type as SubscriptionType;
        const subscriptionId = (invoice as any).subscription as string;

        if (!userId || !packageId || !subscriptionId || !type) break;

        const userSub =
          type === SubscriptionType.ELITE_PRO
            ? await EliteProUserSubscription.findOne({ stripeSubscriptionId: subscriptionId })
            : await UserSubscription.findOne({ stripeSubscriptionId: subscriptionId });

        if (!userSub) break;

        userSub.status = 'active';
        userSub.subscriptionPeriodStart = new Date(invoice.lines.data[0].period.start * 1000);
        userSub.subscriptionPeriodEnd = new Date(invoice.lines.data[0].period.end * 1000);
        await userSub.save();

        console.log(`User ${userId} ${type} subscription active`);

        // Update user profile periods
        const userProfile = await UserProfile.findOne({ user: userId });
        if (userProfile) {
          userProfile.subscriptionPeriodStart = userSub.subscriptionPeriodStart;
          userProfile.subscriptionPeriodEnd = userSub.subscriptionPeriodEnd;
          await userProfile.save();
        }

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const type = subscription.metadata?.type as SubscriptionType;

        if (!type) break;

        const userSub =
          type === SubscriptionType.ELITE_PRO
            ? await EliteProUserSubscription.findOne({ stripeSubscriptionId: subscription.id })
            : await UserSubscription.findOne({ stripeSubscriptionId: subscription.id });

        if (!userSub) break;

        userSub.status = 'canceled';
        userSub.subscriptionPeriodStart = undefined;
        userSub.subscriptionPeriodEnd = undefined;
        await userSub.save();

        // Update user profile
        const userProfile = await UserProfile.findOne({ user: userSub.userId });
        if (userProfile) {
          if (type === SubscriptionType.ELITE_PRO) {
            userProfile.isElitePro = false;
            userProfile.eliteProSubscriptionId = null;
          } else {
            userProfile.subscriptionId = null;
          }
          userProfile.subscriptionPeriodStart = null;
          userProfile.subscriptionPeriodEnd = null;
          await userProfile.save();
        }

        console.log(`User ${userSub.userId} ${type} subscription canceled`);
        break;
      }

      default:
        console.log(`⚙️ Unhandled event type: ${event.type}`);
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('🚨 Error processing webhook:', error);
    res.status(500).send('Webhook handler failed');
  }
};
