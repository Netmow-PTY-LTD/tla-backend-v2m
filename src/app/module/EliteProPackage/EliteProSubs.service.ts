/* eslint-disable @typescript-eslint/no-explicit-any */
// services/eliteProSubscription.service.ts

import { stripe, stripeTest, stripeLive, getCurrentEnvironment } from "../../config/stripe.config";
import QueryBuilder from "../../builder/QueryBuilder";
import EliteProPackageModel, { IEliteProPackage } from "./EliteProSubs.model";
import Country from "../Country/country.model";



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
  const stripeObjects: {
    test?: { productId: string; priceId: string };
    live?: { productId: string; priceId: string };
  } = {};

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

    // Helper to create Stripe resources
    const createStripeResources = async (stripeInstance: any) => {
      const product = await stripeInstance.products.create({
        name: payload.name,
        description: payload.description || `${payload.name} elite pro plan`,
      });

      const intervalMap: Record<string, "week" | "month" | "year"> = {
        weekly: "week",
        monthly: "month",
        yearly: "year",
      };
      const interval = intervalMap[payload.billingCycle!];

      const price = await stripeInstance.prices.create({
        product: product.id,
        unit_amount: payload.price!.amount * 100,
        currency: currency.toLowerCase(),
        recurring: interval ? { interval } : undefined,
        tax_behavior: "exclusive",
      });

      return { productId: product.id, priceId: price.id };
    };

    // 3️ Create resources on Test Stripe if available
    if (stripeTest) {
      stripeObjects.test = await createStripeResources(stripeTest);
    }

    // 4️ Create resources on Live Stripe if available
    if (stripeLive) {
      stripeObjects.live = await createStripeResources(stripeLive);
    }

    const currentEnv = getCurrentEnvironment();
    const activeStripe = currentEnv === 'live' ? stripeObjects.live : stripeObjects.test;

    //  5️ Save in DB
    const eliteProPackage = await EliteProPackageModel.create({
      ...payload,
      price: {
        amount: payload.price.amount,
        currency,
      },
      // Legacy / Current Env fields
      stripeProductId: activeStripe?.productId,
      stripePriceId: activeStripe?.priceId,

      // Environment-specific fields
      stripeProductIdTest: stripeObjects.test?.productId,
      stripePriceIdTest: stripeObjects.test?.priceId,
      stripeProductIdLive: stripeObjects.live?.productId,
      stripePriceIdLive: stripeObjects.live?.priceId,

      status: "active",
    });

    return eliteProPackage;

  } catch (error) {
    //  Cleanup Stripe if DB fails
    const cleanup = async (stripeInstance: any, ids?: { productId: string; priceId: string }) => {
      if (!stripeInstance || !ids) return;
      try {
        await stripeInstance.prices.update(ids.priceId, { active: false });
        await stripeInstance.products.update(ids.productId, { active: false });
      } catch (cleanupError) {
        console.error("Stripe cleanup failed:", cleanupError);
      }
    };

    if (stripeObjects.test) await cleanup(stripeTest, stripeObjects.test);
    if (stripeObjects.live) await cleanup(stripeLive, stripeObjects.live);

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
  let testPrice: any = null;
  let livePrice: any = null;

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

    if (shouldCreateNewPrice) {
      const intervalMap: Record<string, "week" | "month" | "year"> = {
        weekly: "week",
        monthly: "month",
        yearly: "year",
      };

      const interval = intervalMap[finalBillingCycle];

      // Helper to create new price in a specific environment
      const createPriceInEnv = async (stripeInstance: any, productId: string) => {
        if (!stripeInstance || !productId) return null;
        return await stripeInstance.prices.create({
          product: productId,
          unit_amount: finalAmount * 100,
          currency: finalCurrency.toLowerCase(),
          recurring: interval ? { interval } : undefined,
          tax_behavior: "exclusive",
        });
      };

      // Create update in both environments if IDs exist
      const prices = await Promise.all([
        existing.stripeProductIdTest ? createPriceInEnv(stripeTest, existing.stripeProductIdTest) : Promise.resolve(null),
        existing.stripeProductIdLive ? createPriceInEnv(stripeLive, existing.stripeProductIdLive) : Promise.resolve(null)
      ]);

      testPrice = prices[0];
      livePrice = prices[1];

      const currentEnv = getCurrentEnvironment();
      const activePrice = currentEnv === 'live' ? livePrice : testPrice;
      newStripePriceId = activePrice?.id || null;

      // Prepare environment-specific updates
      const stripeUpdates: any = {};
      if (testPrice) stripeUpdates.stripePriceIdTest = testPrice.id;
      if (livePrice) stripeUpdates.stripePriceIdLive = livePrice.id;
      if (newStripePriceId) stripeUpdates.stripePriceId = newStripePriceId;

      //  Update DB
      const updated = await EliteProPackageModel.findByIdAndUpdate(
        id,
        {
          ...payload,
          price: {
            amount: finalAmount,
            currency: finalCurrency,
          },
          ...stripeUpdates,
        },
        { new: true }
      );

      //  Deactivate old Stripe prices AFTER DB success
      const deactivateOldPrice = async (stripeInstance: any, oldPriceId: string) => {
        if (!stripeInstance || !oldPriceId) return;
        try {
          await stripeInstance.prices.update(oldPriceId, { active: false });
        } catch (err) {
          console.error("Failed to deactivate old Elite Pro price:", err);
        }
      };

      await Promise.all([
        existing.stripePriceIdTest ? deactivateOldPrice(stripeTest, existing.stripePriceIdTest) : Promise.resolve(),
        existing.stripePriceIdLive ? deactivateOldPrice(stripeLive, existing.stripePriceIdLive) : Promise.resolve()
      ]);

      return updated;
    }

    // If no price change, just update basic fields
    return await EliteProPackageModel.findByIdAndUpdate(
      id,
      {
        ...payload,
        price: {
          amount: finalAmount,
          currency: finalCurrency,
        },
      },
      { new: true }
    );

  } catch (error) {
    //  Cleanup if Stripe price created but DB update failed
    if (testPrice?.id && stripeTest) {
      try {
        await stripeTest.prices.update(testPrice.id, { active: false });
      } catch (cleanupError) {
        console.error("Stripe Test cleanup failed:", cleanupError);
      }
    }
    if (livePrice?.id && stripeLive) {
      try {
        await stripeLive.prices.update(livePrice.id, { active: false });
      } catch (cleanupError) {
        console.error("Stripe Live cleanup failed:", cleanupError);
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

  // 2️ Deactivate (archive) from Stripe (both environments)
  const archiveInEnv = async (stripeInstance: any, productId: string) => {
    if (!stripeInstance || !productId) return;
    try {
      // List all related prices for this product
      const prices = await stripeInstance.prices.list({
        product: productId,
        limit: 100,
      });

      // Deactivate all active prices
      for (const price of prices.data) {
        if (price.active) {
          await stripeInstance.prices.update(price.id, { active: false });
        }
      }

      // Archive the Stripe product
      await stripeInstance.products.update(productId, { active: false });
    } catch (err) {
      console.error(`Error archiving Elite Pro product on Stripe (${stripeInstance === stripeTest ? 'test' : 'live'}):`, err);
    }
  };

  await Promise.all([
    existing.stripeProductIdTest ? archiveInEnv(stripeTest, existing.stripeProductIdTest) : Promise.resolve(),
    existing.stripeProductIdLive ? archiveInEnv(stripeLive, existing.stripeProductIdLive) : Promise.resolve(),
    // Fallback for legacy fields
    (existing.stripeProductId && existing.stripeProductId !== existing.stripeProductIdTest && existing.stripeProductId !== existing.stripeProductIdLive)
      ? archiveInEnv(stripe, existing.stripeProductId)
      : Promise.resolve()
  ]);

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
