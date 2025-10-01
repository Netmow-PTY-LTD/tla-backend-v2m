// services/subscription.service.ts

import SubscriptionModel, { ISubscription } from "./subscription.model";


const createSubscriptionIntoDB = async (payload: Partial<ISubscription>) => {
  const subscription = await SubscriptionModel.create(payload);
  return subscription;
};

const getAllSubscriptionsFromDB = async () => {
  return SubscriptionModel.find().sort({ createdAt: -1 });
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
