// services/subscription.service.ts

import Stripe from "stripe";
import QueryBuilder from "../../builder/QueryBuilder";
import SubscriptionPackage, { ISubscription } from "./subscriptionPack.model";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
 apiVersion: '2025-05-28.basil',
});



const SUBSCRIPTION_FIELDS = {
  SEARCHABLE: ["name", "slug", "description"],
};

const SUBSCRIPTION_OPTIONS = {
  NEW: { new: true, runValidators: true },
};




const createSubscriptionIntoDB = async (
  payload: Partial<ISubscription>
) => {
  if (!payload.name || !payload.price?.amount || !payload.price?.currency || !payload.billingCycle) {
    throw new Error("Missing required subscription fields: name, price, currency, billingCycle");
  }

  // 1️ Create Stripe Product
  const stripeProduct = await stripe.products.create({
    name: payload.name,
    description: payload.description || `${payload.name} subscription plan`,
  });

  // // 2️ Determine Stripe interval for recurring payment
  // let interval: "month" | "year" | undefined = undefined;
  // if (payload.billingCycle === "monthly") interval = "month";
  // else if (payload.billingCycle === "yearly") interval = "year";

  // 2️ Determine Stripe interval for recurring payment
  let interval: "week" | "month" | "year" | undefined = undefined;
  switch (payload.billingCycle) {
    case "weekly":
      interval = "week";
      break;
    case "monthly":
      interval = "month";
      break;
    case "yearly":
      interval = "year";
      break;
  }

  // 3️ Create Stripe Price
  const stripePrice = await stripe.prices.create({
    product: stripeProduct.id,
    unit_amount: (payload.price?.amount) * 100,  // amount in cents
    currency: payload.price.currency.toLowerCase(),
    recurring: interval ? { interval } : undefined, // only for recurring plans
  });

  // 4️ Save subscription in DB with stripePriceId
  const subscription = await SubscriptionPackage.create({
    ...payload,
    stripePriceId: stripePrice.id,
    stripeProductId: stripeProduct.id,
  });

  return subscription;
};




const getAllSubscriptionsFromDB = async (query: Record<string, any>) => {
  const pageQuery = new QueryBuilder(SubscriptionPackage.find({ isActive: true }), query)
    .search(SUBSCRIPTION_FIELDS.SEARCHABLE)
    .filter()
    .sort()
    .paginate()
    .fields();
  const data = await pageQuery.modelQuery;
  const pagination = await pageQuery.countTotal();
  return { data, pagination };
};

const getSubscriptionByIdFromDB = async (id: string) => {
  return SubscriptionPackage.findById(id);
};


// const updateSubscriptionIntoDB = async (id: string, payload: Partial<ISubscription>) => {
//   return SubscriptionPackage.findByIdAndUpdate(id, payload, SUBSCRIPTION_OPTIONS.NEW);
// };


const updateSubscriptionIntoDB = async (
  id: string,
  payload: Partial<ISubscription>
) => {
  if (!id) throw new Error("Subscription ID is required");

  const existing = await SubscriptionPackage.findById(id);
  if (!existing) throw new Error("Subscription not found");

  let stripePriceId: string | undefined;

  // Only create new Stripe Price if billingCycle, amount, or currency changed
  if (
    payload.billingCycle ||
    payload.price?.amount !== undefined ||
    payload.price?.currency
  ) {
    let interval: "week" | "month" | "year" | undefined;

    switch (payload.billingCycle || existing.billingCycle) {
      case "weekly":
        interval = "week";
        break;
      case "monthly":
        interval = "month";
        break;
      case "yearly":
        interval = "year";
        break;
    }

    // Create a new Stripe Price for the existing product
    const stripePrice = await stripe.prices.create({
      product: existing.stripeProductId, // use existing product
      unit_amount: (payload.price?.amount ?? existing.price.amount) * 100,  // amount in cents
      currency: (payload.price?.currency || existing.price.currency).toLowerCase(),
      recurring: interval ? { interval } : undefined,
    });

    stripePriceId = stripePrice.id;
  }

  // Update subscription package in DB
  const updatedSubscription = await SubscriptionPackage.findByIdAndUpdate(
    id,
    {
      ...payload,
      ...(stripePriceId ? { stripePriceId } : {}),
    },
    { new: true } // return updated document
  );

  return updatedSubscription;
};



const deleteSubscriptionFromDB = async (id: string) => {
  if (!id) throw new Error("Subscription ID is required");

  // 1️ Find the existing subscription package
  const existing = await SubscriptionPackage.findById(id);
  if (!existing) throw new Error("Subscription package not found");

  // 2️ Deactivate (archive) from Stripe
  try {
    if (existing.stripeProductId) {
      // List all related prices for this product
      const prices = await stripe.prices.list({
        product: existing.stripeProductId,
        limit: 100,
      });

      // Deactivate all active prices
      for (const price of prices.data) {
        if (price.active) {
          await stripe.prices.update(price.id, { active: false });
        }
      }

      // Archive the Stripe product
      await stripe.products.update(existing.stripeProductId, { active: false });
    }
  } catch (err) {
    console.error("Error archiving product on Stripe:", err);
    throw new Error("Failed to archive subscription package on Stripe");
  }

  // 3️ Soft delete in MongoDB
  existing.isActive = false;
  existing.deletedAt = new Date();
  await existing.save();

  return {
    success: true,
    message: "Subscription package archived successfully",
    data: existing,
  };
};


export const subscriptionPackageService = {
  createSubscriptionIntoDB,
  getAllSubscriptionsFromDB,
  getSubscriptionByIdFromDB,
  updateSubscriptionIntoDB,
  deleteSubscriptionFromDB,
};
