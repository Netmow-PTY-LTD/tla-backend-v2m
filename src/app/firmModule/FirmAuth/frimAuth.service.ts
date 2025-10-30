

import mongoose, { Types } from "mongoose";
import { AppError } from "../../errors/error";
import config from "../../config";
import { createToken, verifyToken } from "../../module/Auth/auth.utils";
import { Firm_USER_ROLE, FIRM_USER_STATUS } from "./frimAuth.constant";
import { FirmUser } from "./frimAuth.model";
import { StringValue } from "ms";
import { HTTP_STATUS } from "../../constant/httpStatus";
import { FirmProfile } from "../Firm/firm.model";
import { sendEmail } from "../../emails/email.service";
import { validateObjectId } from "../../utils/validateObjectId";
import { generateOtpForFrim } from "./auth.utils";
import bcrypt from 'bcryptjs';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { IFirmLoginUser } from "./frimAuth.interface";
import { FirmLicense } from "../FirmWiseCertLicense/cirtificateLicese.model";
import { sendNotFoundResponse } from "../../errors/custom.error";
import AdminProfile from "../Admin/admin.model";
import StaffProfile from "../Staff/staff.model";
import { TUploadedFile } from "../../interface/file.interface";
import { deleteFromSpace, uploadToSpaces } from "../../config/upload";
import { FOLDERS } from "../../constant";
import User from "../../module/Auth/auth.model";
import { USER_STATUS } from "../../module/Auth/auth.constant";
import { SsoToken } from "./SsoToken.model";



/* 


------------------------------------------------------------
FIRM REGISTER API

-------------------------------------------


*/


/** Step 1: Firm-specific data */
interface FirmDataPayload {
    firmName: string;
    registrationNumber?: string;
    yearEstablished?: number;
    contactInfo?: {
        zipCode?: string;
        country?: string;
        city?: string;
        phone?: string;
        email?: string; // optional, fallback to user email
        officialWebsite?: string;
    };
}

/** Step 2: User-specific data */
interface UserDataPayload {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: string; // optional, defaults to ADMIN
}

/** Step 3: License-specific data */
interface LicenseDataPayload {
    certificationId: string; // reference to LawFirmCertification _id
    licenseNumber: string;    // e.g. "ABC1234567"
    issuedBy: string;         // e.g. "Queensland Law Society"
    validUntil: string | Date; // mm/dd/yyyy or Date
    type?: string;             // e.g. "mandatory"
    additionalNote?: string;   // optional note about license
}

/** Full payload for registration (matches slice structure) */
interface LawFirmRegistrationPayload {
    firmData: FirmDataPayload;
    userData: UserDataPayload;
    licenseData: LicenseDataPayload;
}


const normalizeValidUntil = (value: string | Date): Date => {
    if (value instanceof Date) return value;
    // Expecting mm/dd/yyyy from UI — fall back to Date parse
    // You can replace this with a stricter parser if needed.
    const d = new Date(value);
    if (isNaN(d.getTime())) {
        throw new AppError(HTTP_STATUS.BAD_REQUEST, "Invalid license expiry date.");
    }
    return d;
};

const firmRegisterUserIntoDB = async (payload: LawFirmRegistrationPayload) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const {
            firmData,
            userData,
            licenseData,
        } = payload;

        // Basic guard for required license details (schema requires it)
        if (

            !licenseData?.licenseNumber ||
            // !licenseData?.issuedBy ||
            !licenseData?.validUntil
        ) {
            throw new AppError(
                HTTP_STATUS.BAD_REQUEST,
                "License details are required (licenseType, licenseNumber,  validUntil)."
            );
        }

        // 1) ensure user not exists
        const existingUser = await FirmUser.isUserExistsByEmail(userData.email);
        if (existingUser) {
            throw new AppError(
                HTTP_STATUS.CONFLICT,
                "Account already exists with this email. Please login or use a new email."
            );
        }

        // 2) create FirmUser
        const [newUser] = await FirmUser.create(
            [
                {
                    name: userData.name,
                    email: userData.email,
                    password: userData.password,
                    role: Firm_USER_ROLE.ADMIN,
                    phone: userData.phone ?? ''

                },
            ],
            { session }
        );

        const [newAdmin] = await AdminProfile.create(
            [
                {
                    userId: newUser._id,
                    firmProfileId: new mongoose.Types.ObjectId(), // temporary, will update after FirmProfile creation
                    fullName: userData.name,
                    designation: 'Admin',
                    phone: userData.phone ?? '',
                    createdBy: newUser._id


                },
            ],
            { session }
        );

        // 3) create FirmProfile (matches your schema)
        const [newProfile] = await FirmProfile.create(
            [
                {
                    // Firm details
                    firmName: firmData.firmName,
                    registrationNumber: firmData.registrationNumber,
                    yearEstablished: firmData.yearEstablished,
                    // Contact info (nested)
                    contactInfo: {
                        zipCode: firmData?.contactInfo?.zipCode,
                        country: firmData?.contactInfo?.country,
                        city: firmData?.contactInfo?.city,
                        phone: firmData?.contactInfo?.phone,
                        email: firmData?.contactInfo?.email ?? userData.email, // default to account email if not provided
                        officialWebsite: firmData?.contactInfo?.officialWebsite,
                    },
                    // Permissions
                    createdBy: newUser._id,
                },
            ],
            { session }
        );

        //  Assign profileId correctly (ObjectId)
        newUser.firmProfileId = newProfile._id as Types.ObjectId
        newUser.profile = newAdmin._id as Types.ObjectId
        await newUser.save({ session });



        // 4️ Create FirmLicense linked to FirmProfile
        const newLicense = await FirmLicense.create(
            [
                {
                    firmProfileId: newProfile._id,
                    certificationId: licenseData?.certificationId,
                    licenseNumber: licenseData?.licenseNumber,
                    // issuedBy: licenseData?.issuedBy,
                    type: licenseData?.type,
                    additionalNote: licenseData?.additionalNote ?? "",
                    validUntil: normalizeValidUntil(licenseData?.validUntil),
                },
            ],
            { session }
        );



        // 4) tokens
        const jwtPayload = {
            userId: newUser._id,
            email: newUser.email,
            role: newUser.role,
            accountStatus: newUser.accountStatus,
            firmProfileId: newUser.firmProfileId,
        };

        const firm_accessToken = createToken(
            jwtPayload,
            config.jwt_access_secret as StringValue,
            config.jwt_access_expires_in as StringValue
        );

        const firm_refreshToken = createToken(
            jwtPayload,
            config.jwt_refresh_secret as StringValue,
            config.jwt_refresh_expires_in as StringValue
        );

        // 5) store verify token for email verification flow
        newUser.verifyToken = firm_accessToken;
        await newUser.save({ session });

        // 6) commit
        await session.commitTransaction();
        session.endSession();

        return {
            firm_accessToken,
            firm_refreshToken,
            userData: newUser,
            profileData: newProfile,
        };
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};



//  AUTH RELATED API



const loginUserIntoDB = async (payload: IFirmLoginUser) => {
    // Checking if the user exists by email

    const user = await FirmUser.isUserExistsByEmail(payload?.email);
    if (!user) {
        throw new AppError(HTTP_STATUS.NOT_FOUND, 'This user is not found !');
    }

    // Checking if the user is deleted
    const deletedAt = user?.deletedAt;
    if (deletedAt) {
        throw new AppError(HTTP_STATUS.FORBIDDEN, 'This user is deleted !');
    }

    // Checking if the user is blocked
    const userStatus = user?.accountStatus;
    if (
        userStatus === FIRM_USER_STATUS.PENDING ||
        userStatus === FIRM_USER_STATUS.INACTIVE
    ) {
        throw new AppError(HTTP_STATUS.FORBIDDEN, `This user is ${userStatus} !`);
    }

    // Verifying if the password matches the one in the database
    if (!(await FirmUser.isPasswordMatched(payload?.password, user?.password)))
        throw new AppError(HTTP_STATUS.FORBIDDEN, 'Password do not matched');

    // Create JWT tokens (access and refresh) and return them with user data
    const jwtPayload = {
        userId: user?._id,
        email: user?.email,
        // country: (user?.profile as any)?.country.slug, //  Fix TS error
        role: user?.role,
        accountStatus: user.accountStatus,
        firmProfileId: user.firmProfileId,
    };


    // Generate access token
    const firm_accessToken = createToken(
        jwtPayload,
        config.jwt_access_secret as StringValue,
        config.jwt_access_expires_in as StringValue,
    );

    // Generate refresh token
    const firm_refreshToken = createToken(
        jwtPayload,
        config.jwt_refresh_secret as StringValue,
        config.jwt_refresh_expires_in as StringValue,
    );

    // Fetch user data
    const userData = await FirmUser.findOne({ email: payload.email }).populate({ path: "permissions", populate: { path: "pageId", model: "Page" } });
    // Return tokens and user data
    return {
        firm_accessToken,
        firm_refreshToken,
        userData,
    };
};




const refreshToken = async (token: string) => {
    // checking if the given token is valid

    let decoded;
    try {
        decoded = verifyToken(token, config.jwt_refresh_secret as StringValue);
        // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    } catch (err) {
        throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'Invalid Refresh Token');
    }

    const { email } = decoded;

    // checking if the user is exist
    // const user = await User.findOne({ email }).populate('profile');
    const user = await FirmUser.isUserExistsByEmail(email);

    if (!user) {
        throw new AppError(HTTP_STATUS.NOT_FOUND, 'This user is not found !');
    }

    const jwtPayload = {
        userId: user._id,
        email: user.email,
        role: user.role,
        // country: (user?.profile as any)?.country.slug, //  Fix TS error
        accountStatus: user.accountStatus,
    };

    const firm_accessToken = createToken(
        jwtPayload,
        config.jwt_access_secret as StringValue,
        config.jwt_access_expires_in as StringValue,
    );

    return {
        firm_accessToken,
    };
};




const changePasswordIntoDB = async (
    userData: JwtPayload,
    payload: { oldPassword: string; newPassword: string },
) => {
    // checking if the user is exist
    const user = await FirmUser.isUserExistsByEmail(userData.email);

    if (!user) {
        throw new AppError(HTTP_STATUS.NOT_FOUND, 'This user is not found !');
    }
    // checking if the user is already deleted

    const deletedAt = user?.deletedAt;

    if (deletedAt) {
        throw new AppError(HTTP_STATUS.FORBIDDEN, 'This user is deleted !');
    }

    // Checking if the user is blocked
    const userStatus = user?.accountStatus;
    if (
        userStatus === FIRM_USER_STATUS.PENDING ||
        userStatus === FIRM_USER_STATUS.INACTIVE
    ) {
        throw new AppError(HTTP_STATUS.FORBIDDEN, `This user is ${userStatus} !`);
    }

    //checking if the password is correct

    if (!(await FirmUser.isPasswordMatched(payload.oldPassword, user?.password)))
        throw new AppError(HTTP_STATUS.FORBIDDEN, 'Password do not matched');

    //hash new password
    const newHashedPassword = await bcrypt.hash(
        payload.newPassword,
        Number(config.bcrypt_salt_rounds),
    );

    await FirmUser.findOneAndUpdate(
        {
            email: userData?.email,
            role: userData?.role,
        },
        {
            password: newHashedPassword,
            needsPasswordChange: false,
            passwordChangedAt: new Date(),
        },
    );

    return null;
};


const forgetPassword = async (userEmail: string) => {
    // Check if the user exists by email
    const user = await FirmUser.isUserExistsByEmail(userEmail);

    if (!user) {
        throw new AppError(HTTP_STATUS.NOT_FOUND, 'This user is not found !');
    }
    // const userProfile = await UserProfile.findOne({ user: user._id });

    // Check if the user is marked as deleted
    const deletedAt = user?.deletedAt;
    if (deletedAt) {
        throw new AppError(HTTP_STATUS.FORBIDDEN, 'This user is deleted !');
    }

    // Checking if the user is blocked
    const userStatus = user?.accountStatus;
    if (
        userStatus === FIRM_USER_STATUS.PENDING ||
        userStatus === FIRM_USER_STATUS.INACTIVE
    ) {
        throw new AppError(HTTP_STATUS.FORBIDDEN, `This user is ${userStatus} !`);
    }

    // Prepare the payload for the reset token
    const jwtPayload = {
        userId: user?._id,
        // username: user.username,
        email: user?.email,
        role: user?.role,
        // country: (user?.profile as any)?.country.slug, // ✅ Fix TS error
        accountStatus: user.accountStatus,
    };

    // Create a JWT reset token valid for 10 minutes
    const resetToken = createToken(
        jwtPayload,
        config.jwt_access_secret as string,
        '10m',  // for short time reset password
    );

    // Construct the reset password UI link containing the token
    const resetUILink = `${config.firm_client_url}/reset-password?email=${user.email}&token=${resetToken}`;

    // Prepare email content for password reset
    const restEmailData = {
        // name: userProfile?.name,
        name: 'user',
        resetUrl: resetUILink

    };



    await sendEmail({
        to: user.email,
        subject: 'Reset Your Password to Regain Access',
        data: restEmailData,
        emailTemplate: 'password_reset',
    });

};


const resetPassword = async (
    payload: { email: string; newPassword: string },
    token: string,
) => {
    // Check if the user exists by their email
    const user = await FirmUser.isUserExistsByEmail(payload?.email);



    if (!user) {
        throw new AppError(HTTP_STATUS.NOT_FOUND, 'This user is not found !');
    }

    // Check if the user has been deleted
    const deletedAt = user?.deletedAt;

    if (deletedAt) {
        throw new AppError(HTTP_STATUS.FORBIDDEN, 'This user is deleted !');
    }


    // Checking if the user is blocked
    const userStatus = user?.accountStatus;
    if (
        userStatus === FIRM_USER_STATUS.PENDING ||
        userStatus === FIRM_USER_STATUS.INACTIVE
    ) {
        throw new AppError(HTTP_STATUS.FORBIDDEN, `This user is ${userStatus} !`);
    }

    // Decode and verify the reset token
    const decoded = jwt.verify(
        token,
        config.jwt_access_secret as string,
    ) as JwtPayload;

    // Ensure that the email in the token matches the email in the payload
    if (payload.email !== decoded.email) {
        throw new AppError(HTTP_STATUS.FORBIDDEN, 'You are forbidden!');
    }

    // Hash the new password before saving it to the database
    const newHashedPassword = await bcrypt.hash(
        payload.newPassword,
        Number(config.bcrypt_salt_rounds),
    );

    // Update the user's password and reset related fields
    await FirmUser.findOneAndUpdate(
        {
            email: decoded.email,
            role: decoded.role,
        },
        {
            password: newHashedPassword,
            needsPasswordChange: false,
            passwordChangedAt: new Date(),
        },
    );
};

/**
 * @desc   Validates the provided refresh token, checks if the user exists, and returns a response indicating the validity of the user.
 * @param  {string} token - The refresh token to be validated.
 * @returns {Promise<{ validUser: boolean }>} Returns an object with the `validUser` flag indicating if the user is valid.
 * @throws {AppError} Throws an error if the token is invalid, expired, or if the user is not found.
 */
export const logOutToken = async (
    token: string,
): Promise<{ validUser: boolean }> => {
    let decoded;

    try {
        // Verify and decode the provided refresh token
        decoded = verifyToken(token, config.jwt_refresh_secret as StringValue);
        // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    } catch (err) {
        // If token verification fails, throw an error indicating the token is invalid or expired
        throw new AppError(
            HTTP_STATUS.UNAUTHORIZED,
            'Invalid or expired refresh token',
        );
    }

    // Check if the decoded token contains a valid email
    if (!decoded?.email) {
        throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'Invalid token payload');
    }

    // Find the user associated with the decoded email
    const user = await FirmUser.findOne({ email: decoded.email });

    // If user not found, throw an error
    if (!user) {
        throw new AppError(HTTP_STATUS.NOT_FOUND, 'User not found');
    }

    // Return a response indicating the user is valid
    return {
        validUser: true,
    };
};




const verifyEmailService = async (code: string): Promise<string> => {

    if (!code) throw new AppError(400, 'Missing code');
    const decoded = jwt.verify(code, config.jwt_access_secret as StringValue) as JwtPayload;

    const user = await FirmUser.findById(decoded.userId);
    if (!user) throw new AppError(404, 'User not found');

    if (user.isVerifiedAccount) {
        return 'Already verified';
    }
    user.isVerifiedAccount = true;
    user.verifyToken = ''; // Optional cleanup
    await user.save();

    return 'Email verified successfully';
};



const resendVerificationEmail = async (email: string) => {
    if (!email) {
        throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Email is required');
    }

    const user = await FirmUser.findOne({ email })
    // .populate({
    //     path: 'profile',       // populate the profile
    //     populate: {
    //         path: 'country',     // populate country inside profile
    //         model: 'Country',    // replace with your actual Country model name
    //     },
    // });

    if (!user) {
        throw new AppError(HTTP_STATUS.NOT_FOUND, 'User not found');
    }

    if (user.isVerifiedAccount) {
        throw new AppError(HTTP_STATUS.CONFLICT, 'Email is already verified');
    }

    // Clear existing code
    user.verifyToken = '';
    await user.save();

    // Generate new code
    const jwtPayload = {
        userId: user._id,
        email: user.email,
        role: user.role,
        accountStatus: user.accountStatus,
    };

    const accessToken = createToken(
        jwtPayload,
        config.jwt_access_secret as StringValue,
        config.jwt_access_expires_in as StringValue,
    );

    // Save code for verification
    user.verifyToken = accessToken;
    await user.save();

    // Prepare email
    const emailVerificationUrl = `${config.firm_client_url}/verify-email?code=${accessToken}`;
    await sendEmail({
        to: user.email,
        subject: 'Verify your account – TheLawApp',
        data: {
            // name: (user?.profile as any)?.name,
            name: 'User',
            verifyUrl: emailVerificationUrl,
            role: user.role,
        },
        emailTemplate: 'verify_email',
    });

    return { email: user.email, isVerified: user.isVerifiedAccount };
};





export const changeAccountStatus = async (
    userId: string,
    accountStatus: "pending" | "active" | "inactive",
) => {

    validateObjectId(userId, 'User')

    if (!Object.values(FIRM_USER_STATUS).includes(accountStatus)) {
        throw new Error('Invalid account status value');
    }
    const updatedUser = await FirmUser.findOneAndUpdate(
        { _id: userId, deletedAt: null },
        { accountStatus },
        { new: true },
    );

    if (!updatedUser) {
        throw new Error('User not found or deleted');
    }


    return updatedUser;
};




interface SendOtpParams {
    email: string;
    username: string;
    expiresInMinutes?: number; // optional
}




// let otpStore: Record<string, string> = {}; // Temporary in-memory { email: otp }
let otpStore: Record<
    string,
    { otp: string; expiresAt: Date }
> = {}; // store otp + expiration


const sendOtp = async ({
    email,
    username = 'user',
    expiresInMinutes = 3, // default to 3 minutes
}: SendOtpParams): Promise<boolean> => {
    const otp = generateOtpForFrim();
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

    // store OTP + expiration
    otpStore[email] = { otp, expiresAt };


    console.log({
        email,
        username: 'user',
        expiresInMinutes: 3, // default to 3 minutes
    })

    await sendEmail({
        to: email,
        subject: "Your OTP Code",
        data: {
            otp,
            username,
            expiresAt: expiresAt.toLocaleTimeString(), // format as needed
        },
        emailTemplate: 'otp_email',
    });


    return true;
};




const verifyOtp = (email: string, otp: string): boolean => {
    const cleanOtp = otp.replace(/\s+/g, ""); // remove spaces
    const record = otpStore[email];

    if (!record) return false; // no OTP found for this email

    // Check expiration
    if (record.expiresAt < new Date()) {
        delete otpStore[email]; // remove expired OTP
        return false;
    }

    // Compare OTP
    if (record.otp === cleanOtp) {
        delete otpStore[email]; // clear OTP after successful verification
        return true;
    }

    return false;
};





// Step 3: Change email to new email
const changeEmail = async (userId: string, newEmail: string) => {
    // Check if newEmail already exists
    const existingUser = await FirmUser.findOne({ email: newEmail });
    if (existingUser) {
        throw new Error("Email already in use");
    }

    // Find the current user
    const user = await FirmUser.findById(userId);
    if (!user) throw new Error("User not found");

    // Update email
    user.email = newEmail;
    await user.save();

    return user;
};



const getUserInfoFromDB = async (userId: string) => {
    validateObjectId(userId, 'User');

    // 1️ Fetch user with profile populated
    const user = await FirmUser.findById(userId)
        .select('+password +profileModel -name -phone')
        .populate({
            path: "profile",
            select: "-_id -createdAt -updatedAt", // select only needed profile fields
        })
        .populate({
            path: 'firmProfileId',
            model: 'FirmProfile',
            populate: [
                {
                    path: 'contactInfo.country',
                    model: 'Country',
                    select: 'name isoCode', // select only required fields
                },
                {
                    path: 'contactInfo.city',
                    model: 'City',
                    select: 'name',
                },
                {
                    path: 'contactInfo.zipCode',
                    model: 'ZipCode',
                    select: 'code',
                },
            ],
        })
        .populate({ path: "permissions", populate: { path: "pageId", model: "Page" } })
        .lean();

    if (!user) {
        return sendNotFoundResponse('User not found');
    }

    // 2️ Remove sensitive fields
    delete (user as any).password;
    // 3️ Merge profile fields into top-level user object
    if (user.profile && typeof user.profile === "object" && !Array.isArray(user.profile)) {
        const profileData = user.profile as Record<string, any>; // ✅ tell TS it's an object

        // Merge only non-conflicting fields
        Object.keys(profileData).forEach((key) => {
            if (!(key in user)) {
                (user as any)[key] = profileData[key];
            }
        });

        // Keep firmProfileId reference intact
        delete (user as any).profile;
    }

    return user;

};



const profileModelMap: Record<string, any> = {
    AdminProfile,
    StaffProfile,
    // Add more roles here
};


export const updateCurrentUser = async (
    userId: string,
    payload: any,
    file?: TUploadedFile
) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    let newFileUrl: string | null = null;

    try {
        // 1️ Fetch user
        const user = await FirmUser.findById(userId).select("+password +profileModel").session(session);
        if (!user) throw new AppError(HTTP_STATUS.NOT_FOUND, "User not found");

        // 2️ Update core FirmUser fields
        if (payload.name) user.name = payload.fullName;
        if (payload.phone) user.phone = payload.phone;
        if (payload.email) user.email = payload.email;
        if (payload.password) {
            user.password = payload.password; // pre-save hook hashes it
            user.needsPasswordChange = true;
            user.passwordChangedAt = new Date();
        }
        if (payload.status) user.accountStatus = payload.status;

        await user.save({ session });

        // 3️ Update role-specific profile
        const Model = profileModelMap[user.profileModel];
        if (!Model) throw new AppError(HTTP_STATUS.BAD_REQUEST, "Profile model not found");

        const profile = await Model.findById(user.profile).session(session);
        if (!profile) throw new AppError(HTTP_STATUS.NOT_FOUND, "Profile not found");


        // Keep reference to old image
        const oldImageUrl = profile.image;



        // Handle profile image update
        if (file?.buffer) {
            // Delete previous image if exists
            if (profile.image) {
                try {
                    await deleteFromSpace(profile.image);
                } catch (err) {
                    console.warn(`Failed to delete previous profile image: ${err}`);
                }
            }

            // Upload new image
            // const logoUrl = await uploadToSpaces(file.buffer, file.originalname, userId, FOLDERS.PROFILES);

            const logoUrl = await uploadToSpaces(file?.buffer, file.originalname, {
                folder: FOLDERS.FIRMS,
                subFolder: FOLDERS.PROFILES,
                entityId: `${user.role}-${user._id}`,
            });
            payload.image = logoUrl;
            newFileUrl = logoUrl;
        }




        // Remove user-only fields from profile payload
        const { email, password, status, ...profilePayload } = payload;

        // Update profile
        const updatedProfile = await Model.findByIdAndUpdate(
            user.profile,
            {
                $set: {
                    ...profilePayload,
                    updatedBy: new Types.ObjectId(userId),
                },
            },
            { new: true, session }
        );

        if (!updatedProfile) throw new AppError(HTTP_STATUS.NOT_FOUND, "Profile not found");

        // 4️ Commit transaction
        await session.commitTransaction();
        session.endSession();



        // 7️ After commit — delete old profile image asynchronously
        if (file?.buffer && oldImageUrl) {
            deleteFromSpace(oldImageUrl).catch((err) =>
                console.error(" Failed to delete old profile image:", err)
            );
        }


        return {
            user,
            profile: updatedProfile,
        };
    } catch (error) {
        // Rollback transaction on any error
        await session.abortTransaction();
        session.endSession();


        // Rollback newly uploaded file if transaction failed
        if (newFileUrl) {
            deleteFromSpace(newFileUrl).catch((cleanupErr) =>
                console.error("Failed to rollback uploaded profile image:", cleanupErr)
            );
        }



        throw error; // propagate error to caller
    }
};








//  lawyer access request

// const requestLawyerAccess = async (userId: string, lawyerId?: string) => {
//     console.log("Requesting lawyer access for user:", userId);

//     // 1️ Load the firm user with permission data
//     const user = await FirmUser.findById(userId).populate({
//         path: 'permissions',
//         populate: { path: 'pageId', model: 'Page' }
//     });

//     if (!user) {
//         throw new AppError(HTTP_STATUS.NOT_FOUND, 'User not found');
//     }

//     // 2️ Check if user is admin (auto access)
//     let hasAccess = false;
//     if (user.role === Firm_USER_ROLE.ADMIN) {
//         console.log('Admin user can request lawyer access', user);
//         hasAccess = true;
//     } else {
//         // 3️ Check if permission exists
//         const lawyerAccessPermission = user.permissions?.find((perm: any) => {
//             return perm.pageId?.slug === 'you-are-permitted-to-log-in-to-the-lawyer-panel';  // very specific slug
//         });

//         if (lawyerAccessPermission?.permission) {
//             hasAccess = true;
//         }
//     }

//     if (!hasAccess) {
//         console.log('Access denied for lawyer login');
//         throw new AppError(
//             HTTP_STATUS.FORBIDDEN,
//             'You do not have permission to access the lawyer panel.'
//         );
//     }

//     // 4️ Ensure we know which lawyer dashboard to log in to
//     if (!lawyerId) {
//         throw new AppError(
//             HTTP_STATUS.BAD_REQUEST,
//             'Missing lawyerId. Staff must select which lawyer to log in as.'
//         );
//     }

//     // 5️ Generate short-lived SSO token (JWT)
//     const tokenPayload = {
//         staffId: user._id,
//         lawyerId,
//     };

//     const token = jwt.sign(tokenPayload, process.env.SSO_SECRET as string, {
//         expiresIn: '30s', // short lifetime for security
//     });

//     // 6️ Build redirect URL to TLA system
//     const redirectUrl = `${process.env.TLA_URL}/auth/sso-login?token=${token}`;

//     console.log('Redirecting to lawyer dashboard:', redirectUrl);

//     return {
//         userId,
//         lawyerId,
//         redirectUrl,
//         status: 'granted',
//     };
// };


/**
 * Generate one-time SSO token for staff to log in as a lawyer
 */
const requestLawyerAccess = async (userId: string, lawyerId?: string) => {
    const firmUser = await FirmUser.findById(userId).populate({
        path: 'permissions',
        populate: { path: 'pageId', model: 'Page' }
    });

    if (!firmUser) throw new AppError(HTTP_STATUS.NOT_FOUND, 'Firm user not found');

    // Check admin or permission
    const hasAccess = firmUser.role === Firm_USER_ROLE.ADMIN || firmUser.permissions?.some(
        (p: any) => p.pageId?.slug === 'you-are-permitted-to-log-in-to-the-lawyer-panel' && p.permission
    );

    if (!hasAccess) throw new AppError(HTTP_STATUS.FORBIDDEN, 'No permission');

    if (!lawyerId) throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Missing lawyerId');

    const lawyer = await User.findOne({ profile: lawyerId }).populate({
        path: 'profile',
        model: 'UserProfile', // Replace with your actual lawyer profile model name
    });
    if (!lawyer) throw new AppError(HTTP_STATUS.NOT_FOUND, 'Lawyer not found');

    if ([lawyer.deletedAt, 'SUSPENDED', 'ARCHIVED', 'REJECTED'].includes(lawyer.accountStatus)) {
        throw new AppError(HTTP_STATUS.FORBIDDEN, 'Lawyer not accessible');
    }

    // Ensure lawyer.profile is populated and has isAccessibleByOtherUsers property
    if (!lawyer.profile || !(lawyer.profile as any).isAccessibleByOtherUsers) {
        throw new AppError(HTTP_STATUS.FORBIDDEN, 'Lawyer not accessible');
    }

    // Generate random token
    const tokenValue = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 18)}`;


    // Save token in DB with short expiry (2 minutes)
    await SsoToken.create({
        token: tokenValue,
        lawyerId: lawyer._id,
        adminId: firmUser.role === Firm_USER_ROLE.ADMIN ? firmUser._id : undefined, // <-- add admin reference if admin
        staffId: firmUser.role === Firm_USER_ROLE.STAFF ? firmUser._id : undefined,
        expiresAt: new Date(Date.now() + 2 * 60 * 1000), // 2 minutes
        used: false
    });

    // Build redirect URL
    const redirectUrl = `${config.client_url}/sso-login?token=${tokenValue}`;

    return { status: 'granted', redirectUrl, expiresIn: 120 };
};



export const firmAuthService = {
    firmRegisterUserIntoDB,
    loginUserIntoDB,
    refreshToken,
    changePasswordIntoDB,
    forgetPassword,
    resetPassword,
    logOutToken,
    changeAccountStatus,
    verifyEmailService,
    resendVerificationEmail,
    sendOtp,
    verifyOtp,
    changeEmail,
    getUserInfoFromDB,
    updateCurrentUser,
    requestLawyerAccess,
};
