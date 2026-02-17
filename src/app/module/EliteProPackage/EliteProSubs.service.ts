// services/eliteProSubscription.service.ts

import Stripe from "stripe";
import QueryBuilder from "../../builder/QueryBuilder";
import EliteProPackageModel, { IEliteProPackage } from "./EliteProSubs.model";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
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
    unit_amount: (payload.price?.amount) * 100, // amount in cents
    currency: payload.price.currency.toLowerCase(),
    recurring: interval ? { interval } : undefined, // only for recurring plans
    tax_behavior: "exclusive",
  });

  // 4️ Save subscription in DB with stripePriceId
  const elipropackage = await EliteProPackageModel.create({
    ...payload,
    stripePriceId: stripePrice.id,
    stripeProductId: stripeProduct.id,
  });




  return elipropackage;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getAllEliteProSubscriptionsFromDB = async (query: Record<string, any>) => {

  const pageQuery = new QueryBuilder(EliteProPackageModel.find().populate('country'), query).search([
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
      unit_amount: (payload.price?.amount ?? existing.price.amount) * 100,  // amount in cents
      currency: (payload.price?.currency || existing.price.currency).toLowerCase(),
      recurring: interval ? { interval } : undefined,
      tax_behavior: "exclusive",
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
  if (!id) throw new Error("Elite pro ID is required");

  // 1️ Find existing package
  const existing = await EliteProPackageModel.findById(id);
  if (!existing) throw new Error("Elite pro not found");

  // 2️ Deactivate on Stripe (Product + Prices)
  try {
    if (existing.stripeProductId) {
      // Get all related Stripe prices
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

      // Archive the product on Stripe
      await stripe.products.update(existing.stripeProductId, { active: false });
    }
  } catch (err) {
    console.error("Error archiving Stripe product:", err);
    throw new Error("Failed to archive subscription on Stripe");
  }

  // 3️ Soft delete in MongoDB (mark inactive)
  existing.isActive = false;
  existing.deletedAt = new Date();
  await existing.save();

  return {
    success: true,
    message: "Elite Pro archived successfully",
    data: existing,
  };
};


export const eliteProSubscriptionService = {
  createEliteProSubscriptionIntoDB,
  getAllEliteProSubscriptionsFromDB,
  getEliteProSubscriptionByIdFromDB,
  updateEliteProSubscriptionIntoDB,
  deleteEliteProSubscriptionFromDB,
};
