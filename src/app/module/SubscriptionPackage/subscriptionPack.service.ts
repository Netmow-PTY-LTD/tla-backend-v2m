/* eslint-disable @typescript-eslint/no-explicit-any */
// services/subscription.service.ts

import { stripe } from "../../config/stripe.config";
import QueryBuilder from "../../builder/QueryBuilder";
import SubscriptionPackage, { ISubscription } from "./subscriptionPack.model";
import Country from "../Country/country.model";



const SUBSCRIPTION_FIELDS = {
  SEARCHABLE: ["name", "slug", "description"],
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SUBSCRIPTION_OPTIONS = {
  NEW: { new: true, runValidators: true },
};




// const createSubscriptionIntoDB = async (
//   payload: Partial<ISubscription>
// ) => {
//   // check if country exists and set currency
//   if (payload.country) {
//     const countryData = await Country.findById(payload.country);
//     if (countryData && countryData.currency) {
//       if (!payload.price) {
//         payload.price = { currency: countryData.currency } as any;
//       }
//       if (payload.price) {
//         payload.price.currency = countryData.currency;
//       }
//     }
//   }

//   if (!payload.name || !payload.price?.amount || !payload.price?.currency || !payload.billingCycle) {
//     throw new Error("Missing required subscription fields: name, price, currency, billingCycle");
//   }



//   //  Prevent duplicate
//   const existing = await SubscriptionPackage.findOne({
//     name: payload.name,
//     country: payload.country,
//     billingCycle: payload.billingCycle,
//     price: payload.price,
//   });

//   if (existing) {
//     throw new Error("Subscription Package already exists");
//   }







//   // 1️ Create Stripe Product
//   const stripeProduct = await stripe.products.create({
//     name: payload.name,
//     description: payload.description || `${payload.name} subscription plan`,
//   });

//   // 2️ Determine Stripe interval for recurring payment

//   // 2️ Determine Stripe interval for recurring payment
//   let interval: "week" | "month" | "year" | undefined = undefined;
//   switch (payload.billingCycle) {
//     case "weekly":
//       interval = "week";
//       break;
//     case "monthly":
//       interval = "month";
//       break;
//     case "yearly":
//       interval = "year";
//       break;
//   }

//   // 3️ Create Stripe Price
//   const stripePrice = await stripe.prices.create({
//     product: stripeProduct.id,
//     unit_amount: (payload.price?.amount) * 100,  // amount in cents
//     currency: payload.price.currency.toLowerCase(),
//     recurring: interval ? { interval } : undefined, // only for recurring plans
//     tax_behavior: "exclusive",
//   });

//   // 4️ Save subscription in DB with stripePriceId
//   const subscription = await SubscriptionPackage.create({
//     ...payload,
//     stripePriceId: stripePrice.id,
//     stripeProductId: stripeProduct.id,
//   });

//   return subscription;
// };



const createSubscriptionIntoDB = async (
  payload: Partial<ISubscription>
) => {
  let stripeProduct: any;
  let stripePrice: any;

  try {
    // 1️ Set currency from country
    if (payload.country) {
      const countryData = await Country.findById(payload.country);
      if (!countryData?.currency) {
        throw new Error("Invalid country");
      }

      payload.price = {
        ...payload.price,
        currency: countryData.currency,
      } as any;
    }

    if (
      !payload.name ||
      !payload.price?.amount ||
      !payload.price?.currency ||
      !payload.billingCycle
    ) {
      throw new Error("Missing required fields");
    }

    // 2️ Prevent duplicate
    const existing = await SubscriptionPackage.findOne({
      name: payload.name,
      country: payload.country,
      billingCycle: payload.billingCycle,
    });

    if (existing) {
      throw new Error("Subscription already exists");
    }

    // 3️ Create Stripe Product
    stripeProduct = await stripe.products.create({
      name: payload.name,
      description:
        payload.description || `${payload.name} subscription plan`,
    });

    // 4️ Determine interval
    const intervalMap: any = {
      weekly: "week",
      monthly: "month",
      yearly: "year",
    };

    const interval = intervalMap[payload.billingCycle];

    // 5️ Create Stripe Price
    stripePrice = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: payload.price.amount * 100,
      currency: payload.price.currency.toLowerCase(),
      recurring: interval ? { interval } : undefined,
      tax_behavior: "exclusive",
    });

    // 6️ Save to DB
    const subscription = await SubscriptionPackage.create({
      ...payload,
      stripeProductId: stripeProduct.id,
      stripePriceId: stripePrice.id,
      status: "active",
    });

    return subscription;

  } catch (error) {
    //  Cleanup Stripe if DB fails
    try {
      if (stripePrice?.id) {
        await stripe.prices.update(stripePrice.id, { active: false });
      }

      if (stripeProduct?.id) {
        await stripe.products.update(stripeProduct.id, { active: false });
      }
    } catch (cleanupError) {
      console.error("Stripe cleanup failed:", cleanupError);
    }

    throw error;
  }
};











const getAllSubscriptionsFromDB = async (query: Record<string, any>) => {


  const pageQuery = new QueryBuilder(SubscriptionPackage.find().populate('country'), query)
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



// const updateSubscriptionIntoDB = async (
//   id: string,
//   payload: Partial<ISubscription>
// ) => {
//   if (!id) throw new Error("Subscription ID is required");

//   const existing = await SubscriptionPackage.findById(id);
//   if (!existing) throw new Error("Subscription package not found");

//   let stripePriceId: string | undefined;

//   // Determine currency to use (from payload country, payload price, or existing)
//   let currencyToUse = existing.price.currency;
//   if (payload.country) {
//     const countryData = await Country.findById(payload.country);
//     if (countryData?.currency) {
//       currencyToUse = countryData.currency;
//     }
//   } else if (payload.price?.currency) {
//     currencyToUse = payload.price.currency;
//   }

//   // Only create new Stripe Price if billingCycle, amount, or currency changed
//   if (
//     payload.billingCycle ||
//     payload.country || // Check if country changed
//     payload.price?.amount !== undefined ||
//     payload.price?.currency
//   ) {
//     let interval: "week" | "month" | "year" | undefined;

//     switch (payload.billingCycle || existing.billingCycle) {
//       case "weekly":
//         interval = "week";
//         break;
//       case "monthly":
//         interval = "month";
//         break;
//       case "yearly":
//         interval = "year";
//         break;
//     }

//     // Create a new Stripe Price for the existing product
//     const stripePrice = await stripe.prices.create({
//       product: existing.stripeProductId, // use existing product
//       unit_amount: (payload.price?.amount ?? existing.price.amount) * 100,  // amount in cents
//       currency: currencyToUse.toLowerCase(),
//       recurring: interval ? { interval } : undefined,
//       tax_behavior: "exclusive",
//     });

//     stripePriceId = stripePrice.id;
//   }

//   // Update subscription package in DB
//   const updatedSubscription = await SubscriptionPackage.findByIdAndUpdate(
//     id,
//     {
//       ...payload,
//       ...(stripePriceId ? { stripePriceId } : {}),
//     },
//     { new: true } // return updated document
//   );

//   return updatedSubscription;
// };


const updateSubscriptionIntoDB = async (
  id: string,
  payload: Partial<ISubscription>
) => {
  if (!id) throw new Error("Subscription ID is required");

  const existing = await SubscriptionPackage.findById(id);
  if (!existing) throw new Error("Subscription package not found");

  let newStripePriceId: string | null = null;
  let createdStripePrice: any = null;

  try {
    //  Determine final values after update
    const finalBillingCycle = payload.billingCycle || existing.billingCycle;

    let finalCurrency = existing.price.currency;

    if (payload.country) {
      const countryData = await Country.findById(payload.country);
      if (countryData?.currency) {
        finalCurrency = countryData.currency;
      }
    } else if (payload.price?.currency) {
      finalCurrency = payload.price.currency;
    }

    const finalAmount =
      payload.price?.amount !== undefined
        ? payload.price.amount
        : existing.price.amount;

    //  Check if Stripe price needs update
    const isBillingChanged =
      payload.billingCycle &&
      payload.billingCycle !== existing.billingCycle;

    const isAmountChanged =
      payload.price?.amount !== undefined &&
      payload.price.amount !== existing.price.amount;

    const isCurrencyChanged =
      finalCurrency !== existing.price.currency;

    const shouldCreateNewPrice =
      isBillingChanged || isAmountChanged || isCurrencyChanged;

    if (shouldCreateNewPrice) {
      // Determine interval
      const intervalMap: any = {
        weekly: "week",
        monthly: "month",
        yearly: "year",
      };

      const interval = intervalMap[finalBillingCycle];

      //  Create new Stripe price
      createdStripePrice = await stripe.prices.create({
        product: existing.stripeProductId,
        unit_amount: finalAmount * 100,
        currency: finalCurrency.toLowerCase(),
        recurring: interval ? { interval } : undefined,
        tax_behavior: "exclusive",
      });

      newStripePriceId = createdStripePrice.id;
    }

    //  Update DB
    const updatedSubscription = await SubscriptionPackage.findByIdAndUpdate(
      id,
      {
        ...payload,
        price: {
          amount: finalAmount,
          currency: finalCurrency,
        },
        ...(newStripePriceId ? { stripePriceId: newStripePriceId } : {}),
      },
      { new: true }
    );

    //  Deactivate old Stripe price AFTER successful DB update
    if (newStripePriceId) {
      await stripe.prices.update(existing.stripePriceId, {
        active: false,
      });
    }

    return updatedSubscription;

  } catch (error) {
    //  Cleanup if Stripe price created but DB failed
    if (createdStripePrice?.id) {
      try {
        await stripe.prices.update(createdStripePrice.id, {
          active: false,
        });
      } catch (cleanupError) {
        console.error("Stripe cleanup failed:", cleanupError);
      }
    }

    throw error;
  }
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
