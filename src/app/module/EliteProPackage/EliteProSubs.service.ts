// services/eliteProSubscription.service.ts

import QueryBuilder from "../../builder/QueryBuilder";
import EliteProPackageModel, { IEliteProPackage } from "./EliteProSubs.model";


const createEliteProSubscriptionIntoDB = async (payload: Partial<IEliteProPackage>) => {
  const subscription = await EliteProPackageModel.create(payload);
  return subscription;
};

const getAllEliteProSubscriptionsFromDB = async (query: Record<string, any>) => {

  const pageQuery = new QueryBuilder(EliteProPackageModel.find({}), query).search([
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
  return EliteProPackageModel.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
};

const deleteEliteProSubscriptionFromDB = async (id: string) => {
  return EliteProPackageModel.findByIdAndDelete(id);
};

export const eliteProSubscriptionService = {
  createEliteProSubscriptionIntoDB,
  getAllEliteProSubscriptionsFromDB,
  getEliteProSubscriptionByIdFromDB,
  updateEliteProSubscriptionIntoDB,
  deleteEliteProSubscriptionFromDB,
};
