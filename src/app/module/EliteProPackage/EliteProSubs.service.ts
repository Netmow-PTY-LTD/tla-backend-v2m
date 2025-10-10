// services/eliteProSubscription.service.ts

import Stripe from "stripe";
import QueryBuilder from "../../builder/QueryBuilder";
import EliteProPackageModel, { IEliteProPackage } from "./EliteProSubs.model";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  // apiVersion: '2023-10-16', // Use your Stripe API version
});



const createEliteProSubscriptionIntoDB = async (payload: Partial<IEliteProPackage>) => {

  if (!payload.name || !payload.price?.amount || !payload.price?.currency || !payload.billingCycle) {
    throw new Error("Missing required elite pro fields: name, price, currency, billingCycle");
  }

  // 1️ Create Stripe Product
  const stripeProduct = await stripe.products.create({
    name: payload.name,
    description: payload.description || `${payload.name} elite pro plan`,
  });



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
  const elipropackage = await EliteProPackageModel.create({
    ...payload,
    stripePriceId: stripePrice.id,
    stripeProductId: stripeProduct.id,
  });




  return elipropackage;
};

const getAllEliteProSubscriptionsFromDB = async (query: Record<string, any>) => {

  const pageQuery = new QueryBuilder(EliteProPackageModel.find({}), query).search([
    "name",
    "slug",
    "description"
  ]).filter().sort().paginate().fields();
  const data = await pageQuery.modelQuery;
  const pagination = await pageQuery.countTotal();

  return { data, pagination };
};

const getEliteProSubscriptionByIdFromDB = async (id: string) => {
  return EliteProPackageModel.findById(id);
};

const updateEliteProSubscriptionIntoDB = async (id: string, payload: Partial<IEliteProPackage>) => {

  if (!id) throw new Error("Subscription ID is required");

  const existing = await EliteProPackageModel.findById(id);
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
  const elipropackage = await EliteProPackageModel.findByIdAndUpdate(
    id,
    {
      ...payload,
      ...(stripePriceId ? { stripePriceId } : {}),
    },
    { new: true } // return updated document
  );

  return elipropackage;





};

const deleteEliteProSubscriptionFromDB = async (id: string) => {
  return EliteProPackageModel.findByIdAndDelete(id);
};

export const eliteProSubscriptionService = {
  createEliteProSubscriptionIntoDB,
  getAllEliteProSubscriptionsFromDB,
  getEliteProSubscriptionByIdFromDB,
  updateEliteProSubscriptionIntoDB,
  deleteEliteProSubscriptionFromDB,
};
