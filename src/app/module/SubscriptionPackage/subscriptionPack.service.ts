/* eslint-disable @typescript-eslint/no-explicit-any */
import { stripe, stripeTest, stripeLive, getCurrentEnvironment } from "../../config/stripe.config";
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
  const stripeObjects: {
    test?: { productId: string; priceId: string };
    live?: { productId: string; priceId: string };
  } = {};

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

    // Helper to create Stripe resources
    const createStripeResources = async (stripeInstance: any) => {
      const product = await stripeInstance.products.create({
        name: payload.name,
        description: payload.description || `${payload.name} subscription plan`,
      });

      const intervalMap: any = {
        weekly: "week",
        monthly: "month",
        yearly: "year",
      };
      const interval = intervalMap[payload.billingCycle!];

      const price = await stripeInstance.prices.create({
        product: product.id,
        unit_amount: payload.price!.amount * 100,
        currency: payload.price!.currency.toLowerCase(),
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

    // 5️ Save to DB with all environment IDs
    const subscription = await SubscriptionPackage.create({
      ...payload,
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

    return subscription;

  } catch (error) {
    // Cleanup Stripe if DB fails (Best effort)
    const cleanup = async (stripeInstance: any, ids?: { productId: string; priceId: string }) => {
      if (!stripeInstance || !ids) return;
      try {
        await stripeInstance.prices.update(ids.priceId, { active: false });
        await stripeInstance.products.update(ids.productId, { active: false });
      } catch (err) {
        console.error("Stripe cleanup failed:", err);
      }
    };

    if (stripeObjects.test) await cleanup(stripeTest, stripeObjects.test);
    if (stripeObjects.live) await cleanup(stripeLive, stripeObjects.live);

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
  const createdStripePriceIds: {
    test?: string;
    live?: string;
  } = {};

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

    //  2️⃣ Detect actual changes
    const isBillingChanged =
      payload.billingCycle &&
      payload.billingCycle !== existing.billingCycle;

    const isAmountChanged =
      payload.price?.amount !== undefined &&
      payload.price.amount !== existing.price.amount;

    const isCurrencyChanged =
      finalCurrency !== existing.price.currency;

    //  Check if Stripe price needs update
    const isMissingTest = stripeTest && !existing.stripeProductIdTest;
    const isMissingLive = stripeLive && !existing.stripeProductIdLive;

    const shouldCreateNewPrice =
      isBillingChanged || isAmountChanged || isCurrencyChanged || isMissingTest || isMissingLive;

    if (shouldCreateNewPrice) {
      const intervalMap: any = {
        weekly: "week",
        monthly: "month",
        yearly: "year",
      };

      const interval = intervalMap[finalBillingCycle];

      // Helper to sync or create resources in a specific environment
      const syncResourcesInEnv = async (stripeInstance: any, env: 'test' | 'live') => {
        if (!stripeInstance) return null;

        let productId = env === 'test' ? existing.stripeProductIdTest : existing.stripeProductIdLive;

        // 1. Lazy-create Product if missing
        if (!productId) {
          const product = await stripeInstance.products.create({
            name: payload.name || existing.name,
            description: payload.description || existing.description || `${payload.name || existing.name} plan`,
          });
          productId = product.id;
        }

        // 2. Create new Price
        const price = await stripeInstance.prices.create({
          product: productId,
          unit_amount: finalAmount * 100,
          currency: finalCurrency.toLowerCase(),
          recurring: interval ? { interval } : undefined,
          tax_behavior: "exclusive",
        });

        // Track for cleanup
        if (env === 'test') createdStripePriceIds.test = price.id;
        else createdStripePriceIds.live = price.id;

        return { productId, priceId: price.id };
      };

      // Create/Sync in both environments
      const resources = await Promise.all([
        syncResourcesInEnv(stripeTest, 'test'),
        syncResourcesInEnv(stripeLive, 'live')
      ]);

      const testRes = resources[0];
      const liveRes = resources[1];

      const currentEnv = getCurrentEnvironment();
      const activePriceId = currentEnv === 'live' ? liveRes?.priceId : testRes?.priceId;
      newStripePriceId = activePriceId || null;

      // Prepare environment-specific updates
      const stripeUpdates: any = {};
      if (testRes) {
        stripeUpdates.stripeProductIdTest = testRes.productId;
        stripeUpdates.stripePriceIdTest = testRes.priceId;
      }
      if (liveRes) {
        stripeUpdates.stripeProductIdLive = liveRes.productId;
        stripeUpdates.stripePriceIdLive = liveRes.priceId;
      }
      // Set legacy field if applicable
      if (newStripePriceId) stripeUpdates.stripePriceId = newStripePriceId;

      //  Update DB
      const updatedSubscription = await SubscriptionPackage.findByIdAndUpdate(
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

      //  Deactivate old Stripe prices AFTER successful DB update
      const deactivateOldPrice = async (stripeInstance: any, oldPriceId: string) => {
        if (!stripeInstance || !oldPriceId) return;
        try {
          await stripeInstance.prices.update(oldPriceId, { active: false });
        } catch (err) {
          console.error("Failed to deactivate old price:", err);
        }
      };

      await Promise.all([
        (existing.stripePriceIdTest && testRes?.priceId !== existing.stripePriceIdTest) ? deactivateOldPrice(stripeTest, existing.stripePriceIdTest) : Promise.resolve(),
        (existing.stripePriceIdLive && liveRes?.priceId !== existing.stripePriceIdLive) ? deactivateOldPrice(stripeLive, existing.stripePriceIdLive) : Promise.resolve()
      ]);

      return updatedSubscription;
    }

    // If no price change, just update basic fields
    return await SubscriptionPackage.findByIdAndUpdate(
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
    //  Cleanup if Stripe price created but DB failed
    if (createdStripePriceIds.test && stripeTest) {
      try {
        await stripeTest.prices.update(createdStripePriceIds.test, { active: false });
      } catch (cleanupError) {
        console.error("Stripe Test cleanup failed:", cleanupError);
      }
    }
    if (createdStripePriceIds.live && stripeLive) {
      try {
        await stripeLive.prices.update(createdStripePriceIds.live, { active: false });
      } catch (cleanupError) {
        console.error("Stripe Live cleanup failed:", cleanupError);
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
      console.error(`Error archiving product on Stripe (${stripeInstance === stripeTest ? 'test' : 'live'}):`, err);
    }
  };

  await Promise.all([
    existing.stripeProductIdTest ? archiveInEnv(stripeTest, existing.stripeProductIdTest) : Promise.resolve(),
    existing.stripeProductIdLive ? archiveInEnv(stripeLive, existing.stripeProductIdLive) : Promise.resolve(),
    // Fallback for legacy fields if they don't match test/live
    (existing.stripeProductId && existing.stripeProductId !== existing.stripeProductIdTest && existing.stripeProductId !== existing.stripeProductIdLive)
      ? archiveInEnv(stripe, existing.stripeProductId)
      : Promise.resolve()
  ]);

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
