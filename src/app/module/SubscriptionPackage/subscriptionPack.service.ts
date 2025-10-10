// services/subscription.service.ts

import Stripe from "stripe";
import QueryBuilder from "../../builder/QueryBuilder";
import SubscriptionPackage, { ISubscription } from "./subscriptionPack.model";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  // apiVersion: '2023-10-16', // Use your Stripe API version
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

    // 2️⃣ Determine Stripe interval for recurring payment
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
    unit_amount: payload.price.amount, // amount in cents
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
  const pageQuery = new QueryBuilder(SubscriptionPackage.find({}), query)
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
      unit_amount: payload.price?.amount || existing.price.amount,
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
  return SubscriptionPackage.findByIdAndDelete(id);
};


export const subscriptionPackageService = {
  createSubscriptionIntoDB,
  getAllSubscriptionsFromDB,
  getSubscriptionByIdFromDB,
  updateSubscriptionIntoDB,
  deleteSubscriptionFromDB,
};
