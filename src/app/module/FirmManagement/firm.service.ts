import mongoose, { Types } from 'mongoose';

import { AppError } from '../../errors/error';
import { HTTP_STATUS } from '../../constant/httpStatus';
import { Firm_USER_ROLE } from '../../firmModule/FirmAuth/frimAuth.constant';
import FirmUser from '../../firmModule/FirmAuth/frimAuth.model';
import { IFirmProfile } from '../../firmModule/Firm/firm.interface';
import { FirmProfile } from '../../firmModule/Firm/firm.model';
import QueryBuilder from '../../builder/QueryBuilder';


//  Create
// helper: normalize date
const normalizeValidUntil = (date: string | Date) => {
    return new Date(date);
};

//  Create Firm with transaction (FirmUser + FirmProfile)
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

const listFirms = async (query: Record<string, any> = {}) => {
    const firmQuery = new QueryBuilder(
        FirmProfile.find({})
            .populate({
                path: 'lawyers',
                populate: {
                    path: 'serviceIds',
                    model: 'Service',
                },
            })
            .populate('createdBy updatedBy')
            .populate('contactInfo.country')
            .populate('contactInfo.city')
            .populate('contactInfo.zipCode'),
        query
    )
        .search([
            'firmName',
            'registrationNumber',
            'vatTaxId',
            'legalFocusAreas',
            'contactInfo.email',
            'contactInfo.phone',
            'contactInfo.officialWebsite',
        ])
        .filter()
        .sort()
        .paginate()
        .fields();

    const data = await firmQuery.modelQuery;
    const meta = await firmQuery.countTotal();

    return { meta, data };
};


//  Get by ID
const getFirmById = async (id: string) => {
    return await FirmProfile.findById(id)
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











export const adminFirmService = {
    createFirm,
    listFirms,
    getFirmById,
    updateFirm,
    deleteFirm,


};
