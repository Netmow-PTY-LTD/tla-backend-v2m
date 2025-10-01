// services/subscription.service.ts

import QueryBuilder from "../../builder/QueryBuilder";
import SubscriptionModel, { ISubscription } from "./subscription.model";


const createSubscriptionIntoDB = async (payload: Partial<ISubscription>) => {
  const subscription = await SubscriptionModel.create(payload);
  return subscription;
};

const getAllSubscriptionsFromDB = async (query: Record<string, any>) => {
  const pageQuery = new QueryBuilder(SubscriptionModel.find({}), query).search([
    "name",
    "slug",
    "features",
    "description"
  ]).filter().sort().paginate().fields();
  const data = await pageQuery.modelQuery;
  const pagination = await pageQuery.countTotal();
  return { data, pagination };
};




const getSubscriptionByIdFromDB = async (id: string) => {
  return SubscriptionModel.findById(id);
};

const updateSubscriptionIntoDB = async (id: string, payload: Partial<ISubscription>) => {
  return SubscriptionModel.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
};

const deleteSubscriptionFromDB = async (id: string) => {
  return SubscriptionModel.findByIdAndDelete(id);
};

export const subscriptionService = {
  createSubscriptionIntoDB,
  getAllSubscriptionsFromDB,
  getSubscriptionByIdFromDB,
  updateSubscriptionIntoDB,
  deleteSubscriptionFromDB,
};
