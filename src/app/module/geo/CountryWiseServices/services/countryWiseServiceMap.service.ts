import { ICountryWiseService } from '../interfaces/countryWiseService.interface';
import CountryWiseService from '../models/countryWiseService.model';

const CreateCountryWiseServiceIntoDB = async (payload: ICountryWiseService) => {
  const result = await CountryWiseService.create(payload);
  return result;
};

const getAllCountryWiseServiceFromDB = async () => {
  const result = await CountryWiseService.find({});
  return result;
};

const getSingleCountryWiseServiceFromDB = async (id: string) => {
  const result = await CountryWiseService.findById(id);
  return result;
};

const updateCountryWiseServiceIntoDB = async (
  id: string,
  payload: Partial<ICountryWiseService>,
) => {
  const result = await CountryWiseService.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return result;
};

const deleteCountryWiseServiceFromDB = async (id: string) => {
  const result = await CountryWiseService.findByIdAndUpdate(
    id,
    { isDeleted: true },
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
