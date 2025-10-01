// services/eliteProSubscription.service.ts

import EliteProSubscriptionModel, { IEliteProSubscription } from "./EliteProSubs.model";


const createEliteProSubscriptionIntoDB = async (payload: Partial<IEliteProSubscription>) => {
  const subscription = await EliteProSubscriptionModel.create(payload);
  return subscription;
};

const getAllEliteProSubscriptionsFromDB = async () => {
  return EliteProSubscriptionModel.find().sort({ createdAt: -1 });
};

const getEliteProSubscriptionByIdFromDB = async (id: string) => {
  return EliteProSubscriptionModel.findById(id);
};

const updateEliteProSubscriptionIntoDB = async (id: string, payload: Partial<IEliteProSubscription>) => {
  return EliteProSubscriptionModel.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
};

const deleteEliteProSubscriptionFromDB = async (id: string) => {
  return EliteProSubscriptionModel.findByIdAndDelete(id);
};

export const eliteProSubscriptionService = {
  createEliteProSubscriptionIntoDB,
  getAllEliteProSubscriptionsFromDB,
  getEliteProSubscriptionByIdFromDB,
  updateEliteProSubscriptionIntoDB,
  deleteEliteProSubscriptionFromDB,
};
