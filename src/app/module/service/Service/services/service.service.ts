import { IService } from '../interfaces/service.interface';
import Service from '../models/service.model';

const CreateServiceIntoDB = async (payload: IService) => {
  const result = await Service.create(payload);
  return result;
};

const getAllServiceFromDB = async () => {
  const result = await Service.find({});
  return result;
};

const getSingleServiceFromDB = async (id: string) => {
  const result = await Service.findById(id);
  return result;
};

const updateServiceIntoDB = async (id: string, payload: Partial<IService>) => {
  const result = await Service.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return result;
};

const deleteServiceFromDB = async (id: string) => {
  const result = await Service.findByIdAndUpdate(
    id,
    { isDeleted: true },
    {
      new: true,
    },
  );
  return result;
};

export const serviceService = {
  CreateServiceIntoDB,
  getSingleServiceFromDB,
  updateServiceIntoDB,
  deleteServiceFromDB,
  getAllServiceFromDB,
};
