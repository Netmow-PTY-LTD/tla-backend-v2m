
// import Stripe from 'stripe';
// import { Request, Response } from 'express';
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
//       case 'payment_intent.succeeded': {
//         console.log('✅ Payment Intent succeeded');
//         break;
//       }

//       /**
//        * 🔹 SUBSCRIPTION PAYMENT SUCCESS
//        * This event is fired when a subscription invoice is successfully paid.
//        */
//       case 'invoice.payment_succeeded': {
//         const invoice = event.data.object as Stripe.Invoice;
//         const subscriptionId = (invoice as any).subscription as string | undefined;
//         const userId = invoice.metadata?.userId;

//         console.log(`💰 Subscription Payment Success for User: ${userId}`);

//         if (userId && subscriptionId) {
//           const userProfile = await UserProfile.findOne({ user: userId });

//           if (userProfile) {
//             userProfile.isElitePro = true;
//             userProfile.subscriptionId = subscriptionId;

//             // Optional: Store subscription start/end
//             if (invoice.lines?.data?.[0]?.period) {
//               userProfile.subscriptionPeriodStart = new Date(
//                 invoice.lines.data[0].period.start * 1000
//               );
//               userProfile.subscriptionPeriodEnd = new Date(
//                 invoice.lines.data[0].period.end * 1000
//               );
//             }

//             await userProfile.save();
//             console.log(`✅ User ${userId} upgraded to Elite Pro`);
//           }
//         }
//         break;
//       }

//       /**
//        * 🔹 SUBSCRIPTION CANCELLED / EXPIRED / DELETED
//        * This event is fired when a user cancels or Stripe cancels a subscription.
//        */
//       case 'customer.subscription.deleted': {
//         const subscription = event.data.object as Stripe.Subscription;
//         console.log(`❌ Subscription Cancelled: ${subscription.id}`);

//         const subUser = await UserProfile.findOne({
//           subscriptionId: subscription.id,
//         });

//         if (subUser) {
//           subUser.isElitePro = false;
//           subUser.subscriptionId = null;
//           subUser.subscriptionPeriodStart = null;
//           subUser.subscriptionPeriodEnd = null;
//           await subUser.save();

//           console.log(`🔻 User ${subUser.user} downgraded from Elite Pro`);
//         }
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
import UserProfile from '../User/user.model';
import UserSubscription from '../CreditPayment/subscriptions.model';

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
        const subscriptionPackageId = invoice.metadata?.subscriptionPackageId;
        const subscriptionId = (invoice as any).subscription as string;

        if (!userId || !subscriptionPackageId || !subscriptionId) break;

        const userSub = await UserSubscription.findOne({ stripeSubscriptionId: subscriptionId });
        if (!userSub) return;

        userSub.status = 'active';
        userSub.subscriptionPeriodStart = new Date(invoice.lines.data[0].period.start * 1000);
        userSub.subscriptionPeriodEnd = new Date(invoice.lines.data[0].period.end * 1000);
        await userSub.save();
        console.log(`User ${userId} subscription active`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userSub = await UserSubscription.findOne({ stripeSubscriptionId: subscription.id });
        if (!userSub) break;

        userSub.status = 'canceled';
        userSub.subscriptionPeriodStart = undefined;
        userSub.subscriptionPeriodEnd = undefined;
        await userSub.save();

        console.log(`User ${userSub.userId} subscription canceled`);
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


