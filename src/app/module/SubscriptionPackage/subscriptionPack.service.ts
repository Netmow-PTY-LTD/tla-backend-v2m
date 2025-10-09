// services/subscription.service.ts

import QueryBuilder from "../../builder/QueryBuilder";
import SubscriptionPackage, { ISubscription } from "./subscriptionPack.model";


const SUBSCRIPTION_FIELDS = {
  SEARCHABLE: ["name", "slug", "description"],
};

const SUBSCRIPTION_OPTIONS = {
  NEW: { new: true, runValidators: true },
};

const createSubscriptionIntoDB = async (payload: Partial<ISubscription>) => {
  const subscription = await SubscriptionPackage.create(payload);
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

const updateSubscriptionIntoDB = async (id: string, payload: Partial<ISubscription>) => {
  return SubscriptionPackage.findByIdAndUpdate(id, payload, SUBSCRIPTION_OPTIONS.NEW);
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
