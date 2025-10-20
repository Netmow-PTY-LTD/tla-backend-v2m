
import { IFirmProfile } from './firm.interface';
import { FirmProfile } from './firm.model';
import FirmUser from '../FirmAuth/frimAuth.model';
import { sendNotFoundResponse } from '../../errors/custom.error';
import UserProfile from '../../module/User/user.model';
import Transaction from '../../module/CreditPayment/transaction.model';
import CreditTransaction from '../../module/CreditPayment/creditTransaction.model';
import Lead from '../../module/Lead/lead.model';







//  Get by ID
const getFirmInfoFromDB = async (userId: string) => {

  const user = await FirmUser.findById(userId).select('firmProfileId')

  if (!user) {
    return sendNotFoundResponse("User not found");
  }




  return await FirmProfile.findById(user.firmProfileId)
    .populate({
      path: 'lawyers',
      populate: {
        path: 'serviceIds',
        model: 'Service', // or whatever your actual model name is
      }
    }) // user refs
    .populate('createdBy updatedBy') // user refs
    .populate('contactInfo.country') // country ref
    .populate('contactInfo.city') // city ref
    .populate('contactInfo.zipCode'); // zip code ref
};




const updateFirmInfoIntoDB = async (userId: string, data: Partial<IFirmProfile>) => {

  const user = await FirmUser.findById(userId).select('firmProfileId')

  if (!user) {
    return sendNotFoundResponse("User not found");
  }

  const updateFirmInfo = await FirmProfile.findByIdAndUpdate(user?.firmProfileId, data, {
    new: true,
    runValidators: true,
  });

  return updateFirmInfo
};





const getFirmDasboardStats = async (userId: string) => {

  const user = await FirmUser.findById(userId).select('firmProfileId')

  if (!user) {
    return sendNotFoundResponse("User not found");
  }

  // Get total lawyers and their IDs

  const totalLawyers = await UserProfile.countDocuments({ firmProfileId: user.firmProfileId });
  const lawyers = await UserProfile.find({ firmProfileId: user.firmProfileId });



  const lawyersUserIds = lawyers.map(lawyer => lawyer.user);
  const lawyersProfileIds = lawyers.map(lawyer => lawyer._id);

  const [purchases, usages] = await Promise.all([
    Transaction.aggregate([
      {
        $match: { userId: { $in: lawyersUserIds }, type: 'purchase', status: 'completed' },
      },
      { $group: { _id: null, total: { $sum: '$credit' } } },
    ]),
    CreditTransaction.aggregate([
      { $match: { userProfileId: { $in: lawyersProfileIds }, type: 'usage' } },
      { $group: { _id: null, total: { $sum: { $abs: '$credit' } } } },
    ]),
  ]);

  // Sum of current credits across all firm lawyers
  const currentCredits = lawyers.reduce((sum, lawyer) => sum + (lawyer.credits || 0), 0);
  // Total credits purchased by all firm lawyers
  const totalPurchasedCredits = purchases.length
    ? purchases.reduce((sum, p) => sum + (p.total || 0), 0)
    : 0;
  // Total credits used by all firm lawyers
  const totalUsedCredits = usages.length
    ? usages.reduce((sum, u) => sum + (u.total || 0), 0)
    : 0;

  const lawyerCreditStats = {
    currentCredits,
    totalPurchasedCredits,
    totalUsedCredits,
  };

  return {
    lawyerCreditStats,
    totalLawyers
  }


};




//   firm lawyer case stats
const getFirmLawyerLeadStatsByDate = async (
  userId: string,
  interval: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'daily'
) => {
  // 1️ Get firm user
  const user = await FirmUser.findById(userId).select('firmProfileId');
  if (!user) return sendNotFoundResponse("User not found");

  // 2️ Get all lawyers under this firm
  const lawyers = await UserProfile.find({ firmProfileId: user.firmProfileId }).select('_id');
  const lawyerIds = lawyers.map(lawyer => lawyer._id);

  // 3️ Determine date format for grouping
  let dateFormat: string;
  switch (interval) {
    case 'daily':
      dateFormat = '%Y-%m-%d';
      break;
    case 'weekly':
      dateFormat = '%Y-%U'; // Week number of year
      break;
    case 'monthly':
      dateFormat = '%Y-%m';
      break;
    case 'yearly':
      dateFormat = '%Y';
      break;
    default:
      dateFormat = '%Y-%m-%d';
  }

  // 4️ Aggregate leads
  const stats = await Lead.aggregate([
    { $match: {  userProfileId: { $in: lawyerIds } } },
    {
      $group: {
        _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
        totalLeads: { $sum: 1 },
        totalHired: { $sum: { $cond: [{ $eq: ['$isHired', true] }, 1, 0] } },
        totalUnhired: { $sum: { $cond: [{ $eq: ['$isHired', false] }, 1, 0] } },
      }
    },
    { $sort: { _id: 1 } } // Sort by date ascending
  ]);

  return stats;
};






export const firmService = {
  getFirmInfoFromDB,
  updateFirmInfoIntoDB,
  getFirmDasboardStats,
  getFirmLawyerLeadStatsByDate
};
