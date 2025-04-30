import { ICountry } from './country.interface';
import Country from './country.schema';

const CreateCountryIntoDB = async (payload: ICountry) => {
  const result = await Country.create(payload);
  return result;
};

export const countryService = {
  CreateCountryIntoDB,
};
