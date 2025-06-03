import { IServiceWiseQuestion } from '../../Service/Question/interfaces/ServiceWiseQuestion.interface';
import ServiceWiseQuestion from '../../Service/Question/models/ServiceWiseQuestion.model';
import { ILeadService } from '../interfaces/leadService.interface';
import LeadService from '../models/leadService.model';

// Create a new lead service
const createLeadService = async (
  userId: string,
  payload: ILeadService,
): Promise<ILeadService> => {
  const exists = await LeadService.findOne({
    userId,
    serviceId: payload.serviceId,
  });
  if (exists) throw new Error('Service already exists');

  return await LeadService.create({ ...payload, userId });
};

// Get all services with their questions
const getLeadServicesWithQuestions = async (
  userId: string,
): Promise<(ILeadService & { questions: IServiceWiseQuestion[] })[]> => {
  const services = await LeadService.find({ userId }).lean();
  const serviceIds = services.map((s) => s.serviceId);
  const questions = await ServiceWiseQuestion.find({
    serviceId: { $in: serviceIds },
    deletedAt: null,
  }).lean();

  return services.map((service) => ({
    ...service,
    questions: questions.filter(
      (q) => q.serviceId.toString() === service.serviceId.toString(),
    ),
  }));
};

// Update service locations
const updateLocations = async (
  serviceId: string,
  locations: string[],
): Promise<ILeadService | null> => {
  return await LeadService.findByIdAndUpdate(
    serviceId,
    { locations },
    { new: true },
  );
};

// Toggle online status
const toggleOnlineEnabled = async (
  serviceId: string,
  onlineEnabled: boolean,
): Promise<ILeadService | null> => {
  return await LeadService.findByIdAndUpdate(
    serviceId,
    { onlineEnabled },
    { new: true },
  );
};

// Delete service and soft-delete its questions
const deleteLeadService = async (
  serviceId: string,
): Promise<{ message: string }> => {
  await LeadService.findByIdAndDelete(serviceId);
  await ServiceWiseQuestion.updateMany(
    { serviceId },
    { $set: { deletedAt: new Date() } },
  );
  return { message: 'Service and its questions removed' };
};

export const LeadServiceService = {
  createLeadService,
  getLeadServicesWithQuestions,
  updateLocations,
  toggleOnlineEnabled,
  deleteLeadService,
};
