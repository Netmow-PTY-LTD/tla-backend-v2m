import Stripe from 'stripe';


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {});

import { Request, Response } from 'express';

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
    return res.status(400).send(`Webhook Error: ${(err as Error).message}`);
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      // Your existing purchaseCredits logic handles this
      break;

    case 'invoice.payment_succeeded':
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = (invoice as any).subscription as string | undefined;
      const userId = invoice.metadata?.userId;


//   there logic is invoice payment success then update user profile isElitePro to true

    //   if (userId) {
    //     const userProfile = await UserProfile.findOne({ user: userId });
    //     if (userProfile) {
    //       userProfile.isElitePro = true;
    //       userProfile.subscriptionId = subscriptionId;
    //       await userProfile.save();
    //     }
    //   }



      break;

    case 'customer.subscription.deleted':
      const subscription = event.data.object as Stripe.Subscription;


    //    there logic if subscription is deleted then update user profile isElitePro to false



    //   const subUser = await UserProfile.findOne({ subscriptionId: subscription.id });
    //   if (subUser) {
    //     subUser.isElitePro = false;
    //     subUser.subscriptionId = null;
    //     await subUser.save();
    //   }



      break;

    default:
      console.log('Unhandled event', event.type);
  }

  res.status(200).send('OK');
};
