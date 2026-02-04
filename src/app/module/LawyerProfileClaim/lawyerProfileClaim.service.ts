import QueryBuilder from "../../builder/QueryBuilder";
import { ILawyerProfileClaim } from "./lawyerProfileClaim.interface";
import { LawyerProfileClaim } from "./lawyerProfileClaim.model";

const createLawyerProfileClaimIntoDB = async (payload: ILawyerProfileClaim) => {
    const result = await LawyerProfileClaim.create(payload);
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
