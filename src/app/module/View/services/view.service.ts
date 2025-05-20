import { validateObjectId } from '../../../utils/validateObjectId';
import ServiceWiseQuestion from '../../Service/Question/models/ServiceWiseQuestion.model';

const getSingleServiceWiseQuestionFromDB = async (
  serviceId: string,
  countryId: string,
) => {
  validateObjectId(serviceId, 'Service');
  validateObjectId(countryId, 'Country');
  const result = await ServiceWiseQuestion.find({
    serviceId: serviceId,
    countryId: countryId,
    deletedAt: null,
  }).populate('serviceId countryId');

  return result;
};
export const viewService = {
  getSingleServiceWiseQuestionFromDB,
};
