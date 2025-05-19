import { HTTP_STATUS } from '../../../../constant/httpStatus';
import { AppError } from '../../../../errors/error';
import { ICountryWiseService } from '../interfaces/countryWiseService.interface';
import CountryWiseService from '../models/countryWiseService.model';

const CreateCountryWiseServiceIntoDB = async (payload: ICountryWiseService) => {
  const result = await CountryWiseService.create(payload);
  return result;
};

const getAllCountryWiseServiceFromDB = async () => {
  const result = await CountryWiseService.find({ deletedAt: null });
  return result;
};

const getSingleCountryWiseServiceFromDB = async (id: string) => {
  const countryWiseService =
    await CountryWiseService.isCountryWiseServiceExists(id);
  if (!countryWiseService) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      'This Country Wise Service is not found !',
    );
  }
  const result = await CountryWiseService.findOne({
    _id: countryWiseService._id,
    deletedAt: null,
  });
  return result;
};

const updateCountryWiseServiceIntoDB = async (
  id: string,
  payload: Partial<ICountryWiseService>,
) => {
  const countryWiseService =
    await CountryWiseService.isCountryWiseServiceExists(id);
  if (!countryWiseService) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      'This Country Wise Service is not found !',
    );
  }

  const result = await CountryWiseService.findOneAndUpdate(
    { _id: countryWiseService._id, deletedAt: null },
    payload,
    {
      new: true,
    },
  );
  return result;
};

const deleteCountryWiseServiceFromDB = async (id: string) => {
  const deletedAt = new Date().toISOString();
  const countryWiseService =
    await CountryWiseService.isCountryWiseServiceExists(id);
  if (!countryWiseService) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      'This Country Wise Service is not found !',
    );
  }

  const result = await CountryWiseService.findByIdAndUpdate(
    id,
    { deletedAt: deletedAt },
    {
      new: true,
    },
  );
  return result;
};

export const countryWiseServiceService = {
  CreateCountryWiseServiceIntoDB,
  getAllCountryWiseServiceFromDB,
  getSingleCountryWiseServiceFromDB,
  updateCountryWiseServiceIntoDB,
  deleteCountryWiseServiceFromDB,
};
