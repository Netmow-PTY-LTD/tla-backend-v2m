import { CacheKeys } from '../../config/cacheKeys';
import { redisClient } from '../../config/redis.config';
import { validateObjectId } from '../../utils/validateObjectId';
import { IOption } from './option.interface';
import Option from './option.model';

const CreateOptionIntoDB = async (payload: IOption) => {
  const result = await Option.create(payload);


    const serviceId = payload.serviceId.toString();
    const countryId = payload.countryId.toString();

  await redisClient.del(CacheKeys.SERVICE_WISE_QUESTION(serviceId, countryId))



  return result;
};

const getAllOptionFromDB = async () => {
  const result = await Option.find({});

  

  return result;
};

const getSingleOptionFromDB = async (id: string) => {
  validateObjectId(id, 'Option');

  const result = await Option.findById(id);
  return result;
};

const updateOptionIntoDB = async (id: string, payload: Partial<IOption>) => {
  validateObjectId(id, 'Option');

  const result = await Option.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });


  
   if (result) {
      const serviceId = result.serviceId.toString();
      const countryId = result.countryId.toString();
      await redisClient.del(
        CacheKeys.SERVICE_WISE_QUESTION(serviceId, countryId),
      );
    }
  


  return result;
};

const deleteOptionFromDB = async (id: string) => {
  validateObjectId(id, 'Option');
  const result = await Option.findByIdAndDelete(id);

  
   if (result) {
      const serviceId = result.serviceId.toString();
      const countryId = result.countryId.toString();
      await redisClient.del(
        CacheKeys.SERVICE_WISE_QUESTION(serviceId, countryId),
      );
    }
  


  return result;
};

export const optionService = {
  CreateOptionIntoDB,
  getAllOptionFromDB,
  getSingleOptionFromDB,
  updateOptionIntoDB,
  deleteOptionFromDB,
};
