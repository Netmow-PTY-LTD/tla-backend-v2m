

// import Stripe from 'stripe';
// import { Request, Response } from 'express';
// import { SubscriptionType } from '../CreditPayment/paymentMethod.service';
// import EliteProUserSubscription from '../CreditPayment/EliteProUserSubscription';
// import UserSubscription from '../CreditPayment/subscriptions.model';
// import UserProfile from '../User/user.model';



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
//         const packageId = invoice.metadata?.packageId;
//         const type = invoice.metadata?.type as SubscriptionType;
//         const subscriptionId = (invoice as any).subscription as string;

//         if (!userId || !packageId || !subscriptionId || !type) break;

//         const userSub =
//           type === SubscriptionType.ELITE_PRO
//             ? await EliteProUserSubscription.findOne({ stripeSubscriptionId: subscriptionId })
//             : await UserSubscription.findOne({ stripeSubscriptionId: subscriptionId });

//         if (!userSub) break;

//         userSub.status = 'active';
//         userSub.subscriptionPeriodStart = new Date(invoice.lines.data[0].period.start * 1000);
//         userSub.subscriptionPeriodEnd = new Date(invoice.lines.data[0].period.end * 1000);
//         await userSub.save();

//         console.log(`User ${userId} ${type} subscription active`);

//         // Update user profile periods
//         const userProfile = await UserProfile.findOne({ user: userId });
//         if (userProfile) {
//           userProfile.subscriptionPeriodStart = userSub.subscriptionPeriodStart;
//           userProfile.subscriptionPeriodEnd = userSub.subscriptionPeriodEnd;
//           await userProfile.save();
//         }

//         break;
//       }

//       case 'customer.subscription.deleted': {
//         const subscription = event.data.object as Stripe.Subscription;
//         const type = subscription.metadata?.type as SubscriptionType;

//         if (!type) break;

//         const userSub =
//           type === SubscriptionType.ELITE_PRO
//             ? await EliteProUserSubscription.findOne({ stripeSubscriptionId: subscription.id })
//             : await UserSubscription.findOne({ stripeSubscriptionId: subscription.id });

//         if (!userSub) break;

//         userSub.status = 'canceled';
//         userSub.subscriptionPeriodStart = undefined;
//         userSub.subscriptionPeriodEnd = undefined;
//         await userSub.save();

//         // Update user profile
//         const userProfile = await UserProfile.findOne({ user: userSub.userId });
//         if (userProfile) {
//           if (type === SubscriptionType.ELITE_PRO) {
//             userProfile.isElitePro = false;
//             userProfile.eliteProSubscriptionId = null;
//           } else {
//             userProfile.subscriptionId = null;
//           }
//           userProfile.subscriptionPeriodStart = null;
//           userProfile.subscriptionPeriodEnd = null;
//           await userProfile.save();
//         }

//         console.log(`User ${userSub.userId} ${type} subscription canceled`);
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
import EliteProUserSubscription, { IEliteProUserSubscription } from '../CreditPayment/EliteProUserSubscription';
import UserSubscription, { IUserSubscription } from '../CreditPayment/subscriptions.model';
import UserProfile from '../User/user.model';
import mongoose, { mongo } from 'mongoose';
import { CacheKeys } from '../../config/cacheKeys';
import { deleteCache } from '../../utils/cacheManger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  // apiVersion: '2024-06-20',
});

export const stripeWebhookHandler = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;

  // 1️ Verify webhook signature
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(' Webhook signature verification failed:', errorMessage);
    return res.status(400).send(`Webhook Error: ${errorMessage}`);
  }

  try {
    switch (event.type) {
      // ---------------------------------
      // Payment succeeded (subscription/invoice)
      // ---------------------------------
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const userId = invoice.metadata?.userId;
        const type = invoice.metadata?.type as SubscriptionType;
        const subscriptionId = (invoice as any).subscription as string;

        // console.log(' Invoice payment succeeded from web hook:', {
        //   userId,
        //   type,
        //   subscriptionId,
        // });
        if (!userId || !type || !subscriptionId) break;

        // Fetch the subscription record
        const subscriptionRecord =
          type === SubscriptionType.ELITE_PRO
            ? await EliteProUserSubscription.findOne({ stripeSubscriptionId: subscriptionId })
            : await UserSubscription.findOne({ stripeSubscriptionId: subscriptionId });

        if (!subscriptionRecord) break;

        const periodStart = invoice.lines.data[0].period.start * 1000;
        const periodEnd = invoice.lines.data[0].period.end * 1000;

        // Type narrowing
        if (type === SubscriptionType.ELITE_PRO) {
          const eliteSub = subscriptionRecord as IEliteProUserSubscription;
          eliteSub.status = 'active';
          eliteSub.eliteProPeriodStart = new Date(periodStart);
          eliteSub.eliteProPeriodEnd = new Date(periodEnd);
          await eliteSub.save();
        } else {
          const normalSub = subscriptionRecord as IUserSubscription;
          normalSub.status = 'active';
          normalSub.subscriptionPeriodStart = new Date(periodStart);
          normalSub.subscriptionPeriodEnd = new Date(periodEnd);
          await normalSub.save();
        }

        // Update user profile
        const userProfile = await UserProfile.findOne({ user: userId });
        if (userProfile) {
          if (type === SubscriptionType.ELITE_PRO) {
            userProfile.isElitePro = true;
            userProfile.eliteProSubscriptionId = subscriptionRecord._id as mongoose.Types.ObjectId;
            userProfile.eliteProPeriodStart = (subscriptionRecord as IEliteProUserSubscription).eliteProPeriodStart;
            userProfile.eliteProPeriodEnd = (subscriptionRecord as IEliteProUserSubscription).eliteProPeriodEnd;
          } else {
            userProfile.subscriptionId = subscriptionRecord._id as mongoose.Types.ObjectId;
            userProfile.subscriptionPeriodStart = (subscriptionRecord as IUserSubscription).subscriptionPeriodStart;
            userProfile.subscriptionPeriodEnd = (subscriptionRecord as IUserSubscription).subscriptionPeriodEnd;
          }
          await userProfile.save();
        }

          // --------------------  REVALIDATE REDIS CACHE -----------------------
          await deleteCache(CacheKeys.USER_INFO(userId));
  
        break;
      }


     // ---------------------------------
      // Payment failed
      // ---------------------------------
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const userId = invoice.metadata?.userId;
        const type = invoice.metadata?.type as SubscriptionType;
        const subscriptionId = (invoice as any).subscription as string;

        if (!userId || !type || !subscriptionId) break;

        const subscriptionRecord =
          type === SubscriptionType.ELITE_PRO
            ? await EliteProUserSubscription.findOne({ stripeSubscriptionId: subscriptionId })
            : await UserSubscription.findOne({ stripeSubscriptionId: subscriptionId });

        if (!subscriptionRecord) break;

        // Mark subscription as payment_failed
        if (type === SubscriptionType.ELITE_PRO) {
          const eliteSub = subscriptionRecord as IEliteProUserSubscription;
          eliteSub.status = 'payment_failed';
          await eliteSub.save();
        } else {
          const normalSub = subscriptionRecord as IUserSubscription;
          normalSub.status = 'payment_failed';
          await normalSub.save();
        }

        // Update user profile
        const userProfile = await UserProfile.findOne({ user: userId });
        if (userProfile) {
          if (type === SubscriptionType.ELITE_PRO) {
            userProfile.isElitePro = false;
          } else {
            userProfile.subscriptionId = subscriptionRecord._id as mongoose.Types.ObjectId; // optional: keep record but mark failed
          }
          await userProfile.save();
        }

        // console.log(` User ${userId} ${type} subscription payment failed`);
          // --------------------  REVALIDATE REDIS CACHE -----------------------
          await deleteCache(CacheKeys.USER_INFO(userId));
        break;
      }



      // ---------------------------------
      // Subscription canceled/deleted
      // ---------------------------------
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const type = subscription.metadata?.type as SubscriptionType;
        const userId = subscription.metadata?.userId;
        if (!type) break;

        const subscriptionRecord =
          type === SubscriptionType.ELITE_PRO
            ? await EliteProUserSubscription.findOne({ stripeSubscriptionId: subscription.id })
            : await UserSubscription.findOne({ stripeSubscriptionId: subscription.id });

        if (!subscriptionRecord) break;

        // Cancel subscription
        if (type === SubscriptionType.ELITE_PRO) {
          const eliteSub = subscriptionRecord as IEliteProUserSubscription;
          eliteSub.status = 'canceled';
          eliteSub.eliteProPeriodStart = undefined;
          eliteSub.eliteProPeriodEnd = undefined;
          await eliteSub.save();
        } else {
          const normalSub = subscriptionRecord as IUserSubscription;
          normalSub.status = 'canceled';
          normalSub.subscriptionPeriodStart = undefined;
          normalSub.subscriptionPeriodEnd = undefined;
          await normalSub.save();
        }

        // Update user profile
        const userProfile = await UserProfile.findOne({ user: subscriptionRecord.userId });
        if (userProfile) {
          if (type === SubscriptionType.ELITE_PRO) {
            userProfile.isElitePro = false;
            userProfile.eliteProSubscriptionId = null;
            userProfile.eliteProPeriodStart = null;
            userProfile.eliteProPeriodEnd = null;
          } else {
            userProfile.subscriptionId = null;
            userProfile.subscriptionPeriodStart = null;
            userProfile.subscriptionPeriodEnd = null;
          }
          await userProfile.save();
        }

        // console.log(` User ${subscriptionRecord.userId} ${type} subscription canceled`);
          // --------------------  REVALIDATE REDIS CACHE -----------------------
          await deleteCache(CacheKeys.USER_INFO(userId));
        break;
      }





      default:
        // console.log(` Unhandled event type: ${event.type}`);
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error(' Error processing webhook:', error);
    res.status(500).send('Webhook handler failed');
  }
};
