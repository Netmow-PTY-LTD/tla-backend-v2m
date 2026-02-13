import QueryBuilder from "../../builder/QueryBuilder";
import { HTTP_STATUS } from "../../constant/httpStatus";
import { AppError } from "../../errors/error";
import { REGISTER_USER_TYPE } from "../Auth/auth.constant";
import User from "../Auth/auth.model";
import { ILawyerProfileClaim } from "./lawyerProfileClaim.interface";
import { LawyerProfileClaim } from "./lawyerProfileClaim.model";


export const createLawyerProfileClaimIntoDB = async (
    payload: ILawyerProfileClaim
) => {
    const { lawyerProfileEmail } = payload;

    // 1️ Check if lawyer profile exists
    const lawyerProfile = await User.findOne({
        email: lawyerProfileEmail,
        regUserType: REGISTER_USER_TYPE.LAWYER,
    });

    if (!lawyerProfile) {
        throw new AppError(
            HTTP_STATUS.NOT_FOUND,
            "This lawyer profile does not exist in our system"
        );
    }

    // 2️ Prevent duplicate active claims (important for admin flow)
    const existingClaim = await LawyerProfileClaim.findOne({
        lawyerProfileEmail,
        status: { $in: ["pending", "reviewed"] },
    });

    if (existingClaim) {
        throw new AppError(
            HTTP_STATUS.CONFLICT,
            "A claim request for this lawyer profile already exists"
        );
    }

    // 3️ Create claim
    const result = await LawyerProfileClaim.create({
        ...payload,
        status: "pending",
    });

    return result;
};




const getAllLawyerProfileClaimsFromDB = async (query: Record<string, unknown>) => {
    const lawyerProfileClaimQuery = new QueryBuilder(
        LawyerProfileClaim.find()
            .populate("reviewedBy"),
        query
    )
        .search(["claimReason", "additionalInfo", "claimerName", "claimerEmail", "claimerPhone", "lawyerProfileEmail"])
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await lawyerProfileClaimQuery.modelQuery;
    const meta = await lawyerProfileClaimQuery.countTotal();

    return { result, meta };
};

const getSingleLawyerProfileClaimFromDB = async (id: string) => {
    const result = await LawyerProfileClaim.findById(id)
        .populate("reviewedBy");
    return result;
};

const updateLawyerProfileClaimInDB = async (
    id: string,
    payload: Partial<ILawyerProfileClaim>
) => {
    const result = await LawyerProfileClaim.findByIdAndUpdate(id, payload, {
        new: true,
    });
    return result;
};

export const LawyerProfileClaimService = {
    createLawyerProfileClaimIntoDB,
    getAllLawyerProfileClaimsFromDB,
    getSingleLawyerProfileClaimFromDB,
    updateLawyerProfileClaimInDB,
};
