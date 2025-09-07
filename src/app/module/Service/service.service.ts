import { HTTP_STATUS } from '../../constant/httpStatus';
import { AppError } from '../../errors/error';
import { IService } from './service.interface';
import Service from './service.model';

const CreateServiceIntoDB = async (payload: IService) => {
  const result = await Service.create(payload);
  return result;
};

const getAllServiceFromDB = async () => {
  const result = await Service.find({ deletedAt: null });
  return result;
};

const getSingleServiceFromDB = async (id: string) => {
  const service = await Service.isServiceExists(id);
  if (!service) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, 'This Service is not found !');
  }
  const result = await Service.findOne({ _id: service._id, deletedAt: null });
  return result;
};

const updateServiceIntoDB = async (id: string, payload: Partial<IService>) => {
  const service = await Service.isServiceExists(id);
  if (!service) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, 'This Service is not found !');
  }

  const result = await Service.findOneAndUpdate(
    { _id: service._id, deletedAt: null },
    payload,
    {
      new: true,
    },
  );
  return result;
};

const deleteServiceFromDB = async (id: string) => {
  const deletedAt = new Date().toISOString();
  const service = await Service.isServiceExists(id);
  if (!service) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, 'This Service is not found !');
  }

  const result = await Service.findByIdAndUpdate(
    id,
    { deletedAt: deletedAt },
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
