// services/eliteProSubscription.service.ts

import QueryBuilder from "../../builder/QueryBuilder";
import EliteProSubscriptionModel, { IEliteProSubscription } from "./EliteProSubs.model";


const createEliteProSubscriptionIntoDB = async (payload: Partial<IEliteProSubscription>) => {
  const subscription = await EliteProSubscriptionModel.create(payload);
  return subscription;
};

const getAllEliteProSubscriptionsFromDB = async (query: Record<string, any>) => {
  
  const pageQuery = new QueryBuilder(EliteProSubscriptionModel.find({}), query).search([
    "name",
    "slug",
    "description"
  ]).filter().sort().paginate().fields();
  const data = await pageQuery.modelQuery;
  const pagination = await pageQuery.countTotal();

  return { data, pagination };
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
