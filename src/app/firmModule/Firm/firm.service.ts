import mongoose, { Types } from 'mongoose';
import { IFirmProfile } from './firm.interface';
import { FirmProfile } from './firm.model';
import { Firm_USER_ROLE } from '../FirmAuth/frimAuth.constant';
import { AppError } from '../../errors/error';
import { HTTP_STATUS } from '../../constant/httpStatus';
import FirmUser from '../FirmAuth/frimAuth.model';
import { sendNotFoundResponse } from '../../errors/custom.error';
import UserProfile from '../../module/User/user.model';
import Transaction from '../../module/CreditPayment/transaction.model';
import CreditTransaction from '../../module/CreditPayment/creditTransaction.model';

//  Create
// helper: normalize date
const normalizeValidUntil = (date: string | Date) => {
  return new Date(date);
};

// ✅ Create Firm with transaction (FirmUser + FirmProfile)
export const createFirm = async (payload: any) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      email,
      password,
      firmName,
      role = Firm_USER_ROLE.ADMIN,
      registrationNumber,
      yearEstablished,
      contactInfo,
      licenseDetails, // required
    } = payload;

    // 🔹 Guard for required license details
    if (
      !licenseDetails?.licenseType ||
      !licenseDetails?.licenseNumber ||
      !licenseDetails?.issuedBy ||
      !licenseDetails?.validUntil
    ) {
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        'License details are required (licenseType, licenseNumber, issuedBy, validUntil).',
      );
    }

    // 🔹 Ensure email not already taken
    const existingUser = await FirmUser.isUserExistsByEmail(email);
    if (existingUser) {
      throw new AppError(
        HTTP_STATUS.CONFLICT,
        'Account already exists with this email. Please login or use a new email.',
      );
    }

    // 🔹 Create FirmUser
    const [newUser] = await FirmUser.create(
      [
        {
          email,
          password,
          role,
        },
      ],
      { session },
    );

    // 🔹 Create FirmProfile
    const [newProfile] = await FirmProfile.create(
      [
        {
          userId: newUser._id,
          firmName,
          registrationNumber,
          yearEstablished,
          contactInfo: {
            officeAddress: contactInfo?.officeAddress,
            country: contactInfo?.country,
            city: contactInfo?.city,
            phone: contactInfo?.phone,
            email: contactInfo?.email ?? email,
            officialWebsite: contactInfo?.officialWebsite,
          },

          licenseDetails: {
            licenseType: licenseDetails.licenseType,
            licenseNumber: licenseDetails.licenseNumber,
            issuedBy: licenseDetails.issuedBy,
            validUntil: normalizeValidUntil(licenseDetails.validUntil),
          },

          createdBy: newUser._id,
        },
      ],
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    return {
      user: newUser,
      profile: newProfile,
    };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

//  List
const listFirms = async () => {
  return await FirmProfile.find().populate('createdBy updatedBy');
};

//  Get by ID
const getFirmById = async (id: string) => {
  return await FirmProfile.findById(id).populate(
    'createdBy updatedBy',
  );
};

//  Update
const updateFirm = async (id: string, data: Partial<IFirmProfile>) => {
  return await FirmProfile.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

//  Delete Firm (and associated FirmUser) transactionally
export const deleteFirm = async (id: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1️ Find the firm profile
    const firm = await FirmProfile.findById(id).session(session);
    if (!firm) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'Firm not found');
    }

    // 3️ Delete the FirmProfile
    await FirmProfile.findByIdAndDelete(id, { session });

    await session.commitTransaction();
    session.endSession();

    return { message: 'Firm and associated user deleted successfully' };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};




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






export const firmService = {
  createFirm,
  listFirms,
  getFirmById,
  updateFirm,
  deleteFirm,
  getFirmInfoFromDB,
  updateFirmInfoIntoDB,
  getFirmDasboardStats
};
