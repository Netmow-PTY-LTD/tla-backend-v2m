

import mongoose from "mongoose";
import { AppError } from "../../errors/error";
import config from "../../config";
import { createToken, verifyToken } from "../../module/Auth/auth.utils";
import { Firm_USER_ROLE, FIRM_USER_STATUS } from "./frimAuth.constant";
import { FirmUser } from "./frimAuth.model";

import { StringValue } from "ms";
import { HTTP_STATUS } from "../../constant/httpStatus";
import { StaffProfile } from "../Staff/staff.model";
import { FirmProfile } from "../Firm/firm.model";
import { sendEmail } from "../../emails/email.service";
import { validateObjectId } from "../../utils/validateObjectId";
import { generateOtpForFrim } from "./auth.utils";

import bcrypt from 'bcryptjs';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { IFirmLoginUser } from "./frimAuth.interface";


/* 


------------------------------------------------------------
ALL REGISTER SERVICE HERE

-------------------------------------------


*/



export interface StaffRegisterPayload {
    email: string;
    password: string;
    fullName: string;
    role?: string; // optional, default to STAFF
}

export const staffRegisterUserIntoDB = async (payload: StaffRegisterPayload) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { email, password, fullName, role = Firm_USER_ROLE.STAFF } = payload;

        // 1️⃣ Check if user already exists
        const existingUser = await FirmUser.isUserExistsByEmail(email);
        if (existingUser) {
            throw new AppError(
                HTTP_STATUS.CONFLICT,
                "Account already exists with this email. Please login or use a new email."
            );
        }

        // 2️⃣ Create new FirmUser
        const [newUser] = await FirmUser.create(
            [
                {
                    email,
                    password,
                    role,
                    regUserType: "staff",
                },
            ],
            { session }
        );

        // 3️⃣ Create corresponding StaffProfile linked to FirmUser
        const [newProfile] = await StaffProfile.create(
            [
                {
                    fullName,
                    createdBy: newUser._id, // link creator
                },
            ],
            { session }
        );

        // Optionally link StaffProfile back to FirmUser if needed
        // newUser.profileId = newProfile._id;
        // await newUser.save({ session });

        // 4️⃣ Generate JWTs
        const jwtPayload = {
            userId: newUser._id,
            email: newUser.email,
            role: newUser.role,
            accountStatus: newUser.accountStatus,
        };

        const accessToken = createToken(
            jwtPayload,
            config.jwt_access_secret as StringValue,
            config.jwt_access_expires_in as StringValue
        );

        const refreshToken = createToken(
            jwtPayload,
            config.jwt_refresh_secret as StringValue,
            config.jwt_refresh_expires_in as StringValue
        );

        // 5️⃣ Save access token for verification
        newUser.verifyToken = accessToken;
        await newUser.save({ session });

        // 6️⃣ Commit transaction
        await session.commitTransaction();
        session.endSession();

        return {
            accessToken,
            refreshToken,
            userData: newUser,
            profileData: newProfile,
        };
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};








/* 


------------------------------------------------------------
FIRM REGISTER API

-------------------------------------------


*/



export interface FirmLicenseDetailsPayload {
    licenseType: string;       // e.g. "Law Firm License"
    licenseNumber: string;     // e.g. "ABC1234567"
    issuedBy: string;          // e.g. "Queensland Law Society"
    validUntil: string | Date; // mm/dd/yyyy from UI or Date
}

export interface FirmContactInfoPayload {
    officeAddress?: string;    // Address / Zip
    country?: string;          // Country select
    city?: string;             // City select
    phone?: string;            // +1 (123) 456-7890
    email?: string;            // firm email (can be same as user, optional)
    officialWebsite?: string;  // https://example.com
}

/** Full payload for registration + profile creation */
export interface FirmRegisterPayload {
    email: string;                 // login email for FirmUser
    password: string;
    firmName: string;              // Law Firm Name
    role?: string;                 // defaults to ADMIN

    // --- FirmProfile fields from "List Your Law Firm" step ---
    registrationNumber?: string;   // e.g. 1234567890
    yearEstablished?: number;      // e.g. 2003
    contactInfo?: FirmContactInfoPayload;

    // --- FirmProfile fields from "License Details" step (REQUIRED by schema) ---
    licenseDetails: FirmLicenseDetailsPayload;
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

const firmRegisterUserIntoDB = async (payload: FirmRegisterPayload) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const {
            email,
            password,
            firmName,
            role = Firm_USER_ROLE.FIRM,
            registrationNumber,
            yearEstablished,
            contactInfo,
            licenseDetails, // required
        } = payload;

        // Basic guard for required license details (schema requires it)
        if (
            !licenseDetails?.licenseType ||
            !licenseDetails?.licenseNumber ||
            !licenseDetails?.issuedBy ||
            !licenseDetails?.validUntil
        ) {
            throw new AppError(
                HTTP_STATUS.BAD_REQUEST,
                "License details are required (licenseType, licenseNumber, issuedBy, validUntil)."
            );
        }

        // 1) ensure user not exists
        const existingUser = await FirmUser.isUserExistsByEmail(email);
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
                    email,
                    password,
                    role,
                    regUserType: "firm",
                },
            ],
            { session }
        );

        // 3) create FirmProfile (matches your schema)
        const [newProfile] = await FirmProfile.create(
            [
                {
                    // Firm details
                    firmName,
                    registrationNumber,
                    yearEstablished,
                    // Optional: if you collect VAT/GST later, map here:
                    // vatTaxId: payload.vatTaxId,
                    // legalFocusAreas: payload.legalFocusAreas ?? [],

                    // Contact info (nested)
                    contactInfo: {
                        officeAddress: contactInfo?.officeAddress,
                        country: contactInfo?.country,
                        city: contactInfo?.city,
                        phone: contactInfo?.phone,
                        email: contactInfo?.email ?? email, // default to account email if not provided
                        officialWebsite: contactInfo?.officialWebsite,
                    },

                    // License details (REQUIRED)
                    licenseDetails: {
                        licenseType: licenseDetails.licenseType,
                        licenseNumber: licenseDetails.licenseNumber,
                        issuedBy: licenseDetails.issuedBy,
                        validUntil: normalizeValidUntil(licenseDetails.validUntil),
                    },

                    // Permissions
                    createdBy: newUser._id,
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
        };

        const accessToken = createToken(
            jwtPayload,
            config.jwt_access_secret as StringValue,
            config.jwt_access_expires_in as StringValue
        );

        const refreshToken = createToken(
            jwtPayload,
            config.jwt_refresh_secret as StringValue,
            config.jwt_refresh_expires_in as StringValue
        );

        // 5) store verify token for email verification flow
        newUser.verifyToken = accessToken;
        await newUser.save({ session });

        // 6) commit
        await session.commitTransaction();
        session.endSession();

        return {
            accessToken,
            refreshToken,
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
        userStatus === FIRM_USER_STATUS.SUSPENDED ||
        userStatus === FIRM_USER_STATUS.ARCHIVED || userStatus === FIRM_USER_STATUS.REJECTED
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
        // country: (user?.profile as any)?.country.slug, // ✅ Fix TS error
        role: user?.role,
        regUserType: user?.regUserType,
        accountStatus: user.accountStatus,
    };

    // Generate access token
    const accessToken = createToken(
        jwtPayload,
        config.jwt_access_secret as StringValue,
        config.jwt_access_expires_in as StringValue,
    );

    // Generate refresh token
    const refreshToken = createToken(
        jwtPayload,
        config.jwt_refresh_secret as StringValue,
        config.jwt_refresh_expires_in as StringValue,
    );

    // Fetch user data
    const userData = await FirmUser.findOne({ email: payload.email });
    // Return tokens and user data
    return {
        accessToken,
        refreshToken,
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
        regUserType: user.regUserType,
        // country: (user?.profile as any)?.country.slug, // ✅ Fix TS error
        accountStatus: user.accountStatus,
    };

    const accessToken = createToken(
        jwtPayload,
        config.jwt_access_secret as StringValue,
        config.jwt_access_expires_in as StringValue,
    );

    return {
        accessToken,
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

    // checking if the user is Suspend or suspended spam

    const userStatus = user?.accountStatus;

    if (
        userStatus === FIRM_USER_STATUS.SUSPENDED ||
        userStatus === FIRM_USER_STATUS.ARCHIVED || userStatus === FIRM_USER_STATUS.REJECTED
    ) {
        throw new AppError(HTTP_STATUS.FORBIDDEN, `This user is ${userStatus} !!`);
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
    const userProfile = await UserProfile.findOne({ user: user._id });

    // Check if the user is marked as deleted
    const deletedAt = user?.deletedAt;
    if (deletedAt) {
        throw new AppError(HTTP_STATUS.FORBIDDEN, 'This user is deleted !');
    }

    // Check if the user’s account is blocked or suspended
    const userStatus = user?.accountStatus;
    if (
        userStatus === FIRM_USER_STATUS.SUSPENDED ||
        userStatus === FIRM_USER_STATUS.ARCHIVED || userStatus === FIRM_USER_STATUS.REJECTED
    ) {
        throw new AppError(HTTP_STATUS.FORBIDDEN, `This user is ${userStatus} !!`);
    }

    // Prepare the payload for the reset token
    const jwtPayload = {
        userId: user?._id,
        // username: user.username,
        email: user?.email,
        role: user?.role,
        regUserType: user?.regUserType,
        country: (user?.profile as any)?.country.slug, // ✅ Fix TS error
        accountStatus: user.accountStatus,
    };

    // Create a JWT reset token valid for 10 minutes
    const resetToken = createToken(
        jwtPayload,
        config.jwt_access_secret as string,
        '10m',  // for short time reset password
    );

    // Construct the reset password UI link containing the token
    const resetUILink = `${config.client_url}/reset-password?email=${user.email}&token=${resetToken}`;

    // Prepare email content for password reset
    const restEmailData = {
        name: userProfile?.name,
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

    // Check if the user’s account is blocked or suspended
    const userStatus = user?.accountStatus;
    if (
        userStatus === FIRM_USER_STATUS.SUSPENDED ||
        userStatus === FIRM_USER_STATUS.ARCHIVED || userStatus === FIRM_USER_STATUS.REJECTED
    ) {
        throw new AppError(HTTP_STATUS.FORBIDDEN, `This user is ${userStatus} !!`);
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
        .populate({
            path: 'profile',       // populate the profile
            populate: {
                path: 'country',     // populate country inside profile
                model: 'Country',    // replace with your actual Country model name
            },
        });
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
        regUserType: user.regUserType,
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
    const emailVerificationUrl = `${config.client_url}/verify-email?code=${accessToken}`;
    await sendEmail({
        to: user.email,
        subject: 'Verify your account – TheLawApp',
        data: {
            name: (user?.profile as any)?.name,
            verifyUrl: emailVerificationUrl,
            role: user.role,
        },
        emailTemplate: 'verify_email',
    });

    return { email: user.email, isVerified: user.isVerifiedAccount };
};





export const changeAccountStatus = async (
    userId: string,
    accountStatus: "pending" | "approved" | "suspended" | "rejected" | "archived",
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

    if (accountStatus === "approved") {
        await sendEmail({
            to: updatedUser.email,
            subject: "Your account is approved  by Admin",
            data: {
                name: "User",

            },
            emailTemplate: 'lawyer_approved',
        });

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

















// Export service
export const firmAuthService = {
    staffRegisterUserIntoDB,
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
    changeEmail
};
