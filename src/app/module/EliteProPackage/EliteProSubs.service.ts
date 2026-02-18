/* eslint-disable @typescript-eslint/no-explicit-any */
// services/eliteProSubscription.service.ts

import Stripe from "stripe";
import QueryBuilder from "../../builder/QueryBuilder";
import EliteProPackageModel, { IEliteProPackage } from "./EliteProSubs.model";
import Country from "../Country/country.model";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});



// const createEliteProSubscriptionIntoDB = async (payload: Partial<IEliteProPackage>) => {


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
//     throw new Error("Missing required elite pro fields: name, price, currency, billingCycle");
//   }

//   // 1️ Create Stripe Product
//   const stripeProduct = await stripe.products.create({
//     name: payload.name,
//     description: payload.description || `${payload.name} elite pro plan`,
//   });



//   // 2️⃣ Determine Stripe interval for recurring payment
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
//     unit_amount: (payload.price?.amount) * 100, // amount in cents
//     currency: payload.price.currency.toLowerCase(),
//     recurring: interval ? { interval } : undefined, // only for recurring plans
//     tax_behavior: "exclusive",
//   });

//   // 4️ Save subscription in DB with stripePriceId
//   const elipropackage = await EliteProPackageModel.create({
//     ...payload,
//     stripePriceId: stripePrice.id,
//     stripeProductId: stripeProduct.id,
//   });




//   return elipropackage;
// };

// eslint-disable-next-line @typescript-eslint/no-explicit-any


const createEliteProSubscriptionIntoDB = async (
  payload: Partial<IEliteProPackage>
) => {
  let stripeProduct: any;
  let stripePrice: any;

  try {
    //  1️ Validate & resolve currency
    if (!payload.country) {
      throw new Error("Country is required");
    }

    const countryData = await Country.findById(payload.country);
    if (!countryData?.currency) {
      throw new Error("Invalid country or missing currency");
    }

    const currency = countryData.currency;

    if (!payload.name || !payload.price?.amount || !payload.billingCycle) {
      throw new Error(
        "Missing required elite pro fields: name, price.amount, billingCycle"
      );
    }

    //  2️ Prevent duplicate package
    const existing = await EliteProPackageModel.findOne({
      name: payload.name,
      country: payload.country,
      billingCycle: payload.billingCycle,
      price: payload.price,
    });

    if (existing) {
      throw new Error("Elite Pro package already exists");
    }

    //  3️ Create Stripe Product
    stripeProduct = await stripe.products.create({
      name: payload.name,
      description:
        payload.description || `${payload.name} elite pro plan`,
    });

    //  4️ Determine Stripe interval
    const intervalMap: Record<string, "week" | "month" | "year"> = {
      weekly: "week",
      monthly: "month",
      yearly: "year",
    };

    const interval = intervalMap[payload.billingCycle];

    //  5️ Create Stripe Price
    stripePrice = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: payload.price.amount * 100,
      currency: currency.toLowerCase(),
      recurring: interval ? { interval } : undefined,
      tax_behavior: "exclusive",
    });

    //  6️ Save in DB
    const eliteProPackage = await EliteProPackageModel.create({
      ...payload,
      price: {
        amount: payload.price.amount,
        currency,
      },
      stripeProductId: stripeProduct.id,
      stripePriceId: stripePrice.id,
      status: "active",
    });

    return eliteProPackage;

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

// const updateEliteProSubscriptionIntoDB = async (id: string, payload: Partial<IEliteProPackage>) => {

//   if (!id) throw new Error("Subscription ID is required");

//   const existing = await EliteProPackageModel.findById(id);
//   if (!existing) throw new Error("Subscription not found");

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
//   const elipropackage = await EliteProPackageModel.findByIdAndUpdate(
//     id,
//     {
//       ...payload,
//       ...(stripePriceId ? { stripePriceId } : {}),
//     },
//     { new: true } // return updated document
//   );

//   return elipropackage;



// };




const updateEliteProSubscriptionIntoDB = async (
  id: string,
  payload: Partial<IEliteProPackage>
) => {
  if (!id) throw new Error("Subscription ID is required");

  const existing = await EliteProPackageModel.findById(id);
  if (!existing) throw new Error("Subscription not found");

  let newStripePriceId: string | null = null;
  let createdStripePrice: any = null;

  try {
    //  1️ Resolve final values
    const finalBillingCycle =
      payload.billingCycle || existing.billingCycle;

    let finalCurrency = existing.price.currency;

    if (payload.country) {
      const countryData = await Country.findById(payload.country);
      if (countryData?.currency) {
        finalCurrency = countryData.currency;
      }
    }

    const finalAmount =
      payload.price?.amount !== undefined
        ? payload.price.amount
        : existing.price.amount;

    //  2️ Detect actual changes
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

    //  3️ Create new Stripe price if needed
    if (shouldCreateNewPrice) {
      const intervalMap: Record<string, "week" | "month" | "year"> = {
        weekly: "week",
        monthly: "month",
        yearly: "year",
      };

      const interval = intervalMap[finalBillingCycle];

      createdStripePrice = await stripe.prices.create({
        product: existing.stripeProductId,
        unit_amount: finalAmount * 100,
        currency: finalCurrency.toLowerCase(),
        recurring: interval ? { interval } : undefined,
        tax_behavior: "exclusive",
      });

      newStripePriceId = createdStripePrice.id;
    }

    //  4️ Update DB
    const updated = await EliteProPackageModel.findByIdAndUpdate(
      id,
      {
        ...payload,
        price: {
          amount: finalAmount,
          currency: finalCurrency,
        },
        ...(newStripePriceId && { stripePriceId: newStripePriceId }),
      },
      { new: true }
    );

    //  5️ Deactivate old Stripe price AFTER DB success
    if (newStripePriceId) {
      await stripe.prices.update(existing.stripePriceId, {
        active: false,
      });
    }

    return updated;

  } catch (error) {
    //  Cleanup if Stripe price created but DB update failed
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
