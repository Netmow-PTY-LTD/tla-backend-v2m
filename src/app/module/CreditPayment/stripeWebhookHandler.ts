/* eslint-disable @typescript-eslint/no-explicit-any */

import { stripe, getStripeWebhookSecret } from '../../config/stripe.config';
import type Stripe from 'stripe';
import { Request, Response } from 'express';
import { SubscriptionType } from '../CreditPayment/paymentMethod.service';
import EliteProUserSubscription, { IEliteProUserSubscription } from '../CreditPayment/EliteProUserSubscription';
import UserSubscription, { IUserSubscription } from '../CreditPayment/subscriptions.model';
import UserProfile from '../User/user.model';
import mongoose from 'mongoose';
import { CacheKeys } from '../../config/cacheKeys';
import { deleteCache } from '../../utils/cacheManger';
// import CreditPackage from './creditPackage.model';
// import Transaction from './transaction.model';
// import config from '../../config';
// import { sendEmail } from '../../emails/email.service';
// import { IUser } from '../Auth/auth.interface';
// import { isVerifiedLawyer } from '../User/user.utils';
// import { USER_PROFILE } from '../User/user.constant';

export const stripeWebhookHandler = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature']!;



  let event: Stripe.Event;

  // 1️ Verify webhook signature
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      getStripeWebhookSecret()
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


      // case 'payment_intent.succeeded': {
      //   const paymentIntent = event.data.object as Stripe.PaymentIntent;
      //   const userId = paymentIntent.metadata.userId;
      //   const packageId = paymentIntent.metadata.creditPackageId;
      //   const couponCode = paymentIntent.metadata.couponCode;
      //   const taxAmount = parseFloat(paymentIntent.metadata.manualTaxAmount || '0');
      //   console.log('paymentIntent from webhook', paymentIntent);
      //   const creditPackage = await CreditPackage.findById(packageId).populate('country');
      //   if (!creditPackage) return res.status(400).send('Credit package not found');

      //   const session = await mongoose.startSession();
      //   session.startTransaction();

      //   try {
      //     // Prevent duplicate processing
      //     const existingTx = await Transaction.findOne({ stripePaymentIntentId: paymentIntent.id }).session(session);
      //     if (existingTx) {
      //       await session.abortTransaction();
      //       return res.json({ received: true });
      //     }

      //     // 1️ Fetch user profile for update & verification check
      //     const userProfile = await UserProfile.findOne({ user: userId }).session(session);
      //     if (!userProfile) throw new Error('User profile not found');

      //     // 2️ Update user credits
      //     userProfile.credits += creditPackage.credit;

      //     // 3 Check if lawyer should be upgraded to VERIFIED
      //     const isVerified = await isVerifiedLawyer(userId); // your existing helper
      //     let shouldSendEmail = false;
      //     if (!isVerified) {
      //       userProfile.profileType = USER_PROFILE.VERIFIED;
      //       shouldSendEmail = true;
      //     }

      //     await userProfile.save({ session });

      //     // 4️ Create transaction
      //     await Transaction.create([{
      //       userId,
      //       creditPackageId: packageId,
      //       credit: creditPackage.credit,
      //       subtotal: creditPackage.price,
      //       taxAmount: taxAmount,
      //       totalWithTax: creditPackage.price + taxAmount,
      //       amountPaid: creditPackage.price + taxAmount,
      //       currency: creditPackage.currency,
      //       status: 'completed',
      //       stripePaymentIntentId: paymentIntent.id,
      //       couponCode: couponCode || '',
      //     }], { session });

      //     // Commit transaction
      //     await session.commitTransaction();
      //     session.endSession();

      //     // Send verification email outside session (after commit)
      //     if (shouldSendEmail) {
      //       const roleLabel = 'Verified Lawyer';
      //       const emailData = {
      //         name: userProfile.name,
      //         role: roleLabel,
      //         dashboardUrl: `${config.client_url}/lawyer/dashboard`,
      //         appName: 'The Law App',
      //       };

      //       // async fire-and-forget
      //       setImmediate(async () => {
      //         try {
      //           await sendEmail({
      //             to: (userProfile.user as IUser)?.email,
      //             subject: `🎉 Congrats! Your profile has been upgraded to ${roleLabel}.`,
      //             data: emailData,
      //             emailTemplate: 'lawyerPromotion',
      //           });
      //         } catch (err) {
      //           console.error('Failed to send verified lawyer email:', err);
      //         }
      //       });
      //     }

      //     return res.json({ received: true });

      //   } catch (err) {
      //     await session.abortTransaction();
      //     session.endSession();
      //     console.error('Webhook transaction failed:', err);
      //     return res.status(500).send('Webhook processing failed');
      //   }
      // };





      // ================  invoice payment success ================
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
