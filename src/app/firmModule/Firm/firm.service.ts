
import { IFirmProfile } from './firm.interface';
import { FirmProfile } from './firm.model';
import FirmUser from '../FirmAuth/frimAuth.model';
import { sendNotFoundResponse } from '../../errors/custom.error';
import UserProfile from '../../module/User/user.model';
import Transaction from '../../module/CreditPayment/transaction.model';
import CreditTransaction from '../../module/CreditPayment/creditTransaction.model';
import Lead from '../../module/Lead/lead.model';
import { TUploadedFile } from '../../interface/file.interface';
import { FOLDERS } from '../../constant';
import { deleteFromSpace, uploadToSpaces } from '../../config/upload';
import mongoose from 'mongoose';







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




// const updateFirmInfoIntoDB = async (userId: string, data: Partial<IFirmProfile>, file: TUploadedFile) => {

//   const user = await FirmUser.findById(userId).select('firmProfileId')

//   if (!user) {
//     return sendNotFoundResponse("User not found");
//   }


//   //  handle file upload if present
//   if (file.buffer) {
//     const fileBuffer = file.buffer;
//     const originalName = file.originalname;
//     const firmLogoUrl = await uploadToSpaces(fileBuffer, originalName, {
//       folder: FOLDERS.FIRMS,
//       entityId: `firm-${user.firmProfileId}`,
//       subFolder: FOLDERS.LOGOS
//     });

//     data.logo = firmLogoUrl;


//   }


//   const updateFirmInfo = await FirmProfile.findByIdAndUpdate(user?.firmProfileId, data, {
//     new: true,
//     runValidators: true,
//   });

//   return updateFirmInfo
// };




const updateFirmInfoIntoDB = async (
  userId: string,
  data: Partial<IFirmProfile>,
  file?: TUploadedFile
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  let newFileUrl: string | null = null;

  try {
    // Step 1: Find user
    const user = await FirmUser.findById(userId).select("firmProfileId").session(session);
    if (!user) return sendNotFoundResponse("User not found");

    // Step 2: Fetch existing firm profile to keep old logo reference
    const existingFirm = await FirmProfile.findById(user.firmProfileId).session(session);
    if (!existingFirm) {
      return sendNotFoundResponse("Firm profile not found");
    }
    const oldLogoUrl = existingFirm.logo;

    // Step 3: Handle file upload if present
    if (file?.buffer) {
      const fileBuffer = file.buffer;
      const originalName = file.originalname;

      const firmLogoUrl = await uploadToSpaces(fileBuffer, originalName, {
        folder: FOLDERS.FIRMS,
        subFolder: FOLDERS.LOGOS,
        entityId: `firm-${user.firmProfileId}`,
      });

      data.logo = firmLogoUrl;
      newFileUrl = firmLogoUrl;
    }

    // Step 4: Update firm profile in DB
    const updatedFirmInfo = await FirmProfile.findByIdAndUpdate(
      user.firmProfileId,
      data,
      {
        new: true,
        runValidators: true,
        session,
      }
    );

    if (!updatedFirmInfo) throw new Error("Failed to update firm profile");

    // Step 5: Commit transaction
    await session.commitTransaction();
    session.endSession();

    // Step 6: Delete old logo after successful commit
    if (file?.buffer && oldLogoUrl) {
      deleteFromSpace(oldLogoUrl).catch((err) =>
        console.error(" Failed to delete old firm logo:", err)
      );
    }

    return updatedFirmInfo;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    // Rollback newly uploaded logo if transaction fails
    if (newFileUrl) {
      deleteFromSpace(newFileUrl).catch((cleanupErr) =>
        console.error(" Failed to rollback uploaded firm logo:", cleanupErr)
      );
    }

    throw err;
  }
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
    { $match: { userProfileId: { $in: lawyerIds } } },
    {
      $group: {
        _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
        totalLeads: { $sum: 1 },
        totalHired: { $sum: { $cond: [{ $eq: ['$isHired', true] }, 1, 0] } },
        totalUnhired: { $sum: { $cond: [{ $eq: ['$isHired', false] }, 1, 0] } },
      }
    },
    {
      $project: {
        _id: 0,
        date: '$_id',
        totalLeads: 1,
        totalHired: 1,
        totalUnhired: 1
      }
    },
    { $sort: { date: 1 } } // Sort by date ascending
  ]);

  return stats;
};






export const firmService = {
  getFirmInfoFromDB,
  updateFirmInfoIntoDB,
  getFirmDasboardStats,
  getFirmLawyerLeadStatsByDate
};
