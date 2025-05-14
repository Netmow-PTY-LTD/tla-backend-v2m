import { IServiceWiseStep } from '../interfaces/ServiceWiseStep.interface';
import ServiceWiseStep from '../models/ServiceWiseStep.model';

const CreateServiceWiseStepIntoDB = async (payload: IServiceWiseStep) => {
  const result = await ServiceWiseStep.create(payload);
  return result;
};

const getAllServiceWiseStepFromDB = async () => {
  const result = await ServiceWiseStep.find({});
  return result;
};

const getSingleServiceWiseStepFromDB = async (id: string) => {
  const result = await ServiceWiseStep.findById(id);
  return result;
};

const updateServiceWiseStepIntoDB = async (
  id: string,
  payload: Partial<IServiceWiseStep>,
) => {
  const result = await ServiceWiseStep.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return result;
};

const deleteServiceWiseStepFromDB = async (id: string) => {
  const result = await ServiceWiseStep.findByIdAndUpdate(
    id,
    { isDeleted: true },
    {
      new: true,
    },
  );
  return result;
};

export const ServiceWiseStepService = {
  CreateServiceWiseStepIntoDB,
  getAllServiceWiseStepFromDB,
  getSingleServiceWiseStepFromDB,
  deleteServiceWiseStepFromDB,
  updateServiceWiseStepIntoDB,
};
