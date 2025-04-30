import { IService } from './service.interface';
import Service from './service.schema';

const CreateServiceIntoDB = async (payload: IService) => {
  const result = await Service.create(payload);
  return result;
};

export const serviceService = {
  CreateServiceIntoDB,
};
