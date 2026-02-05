import { Request, Response } from "express";
import { HTTP_STATUS } from "../../constant/httpStatus";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { LawyerProfileClaimService } from "./lawyerProfileClaim.service";

const createLawyerProfileClaim = catchAsync(async (req: Request, res: Response) => {
    const payload = {
        ...req.body,
        status: "pending",
    };

    const result = await LawyerProfileClaimService.createLawyerProfileClaimIntoDB(payload);

    sendResponse(res, {
        statusCode: HTTP_STATUS.CREATED,
        success: true,
        message: "Lawyer profile claim submitted successfully",
        data: result,
    });
});

const getAllLawyerProfileClaims = catchAsync(async (req: Request, res: Response) => {
    const result = await LawyerProfileClaimService.getAllLawyerProfileClaimsFromDB(req.query);

    sendResponse(res, {
        statusCode: HTTP_STATUS.OK,
        success: true,
        message: "Lawyer profile claims retrieved successfully",
        pagination: result.meta,
        data: result.result,
    });
});

const getSingleLawyerProfileClaim = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await LawyerProfileClaimService.getSingleLawyerProfileClaimFromDB(id);

    sendResponse(res, {
        statusCode: HTTP_STATUS.OK,
        success: true,
        message: "Lawyer profile claim retrieved successfully",
        data: result,
    });
});

const updateLawyerProfileClaim = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const adminId = req.user.userId;
    const payload = {
        ...req.body,
        reviewedBy: adminId,
    };

    const result = await LawyerProfileClaimService.updateLawyerProfileClaimInDB(id, payload);

    sendResponse(res, {
        statusCode: HTTP_STATUS.OK,
        success: true,
        message: "Lawyer profile claim updated successfully",
        data: result,
    });
});

export const LawyerProfileClaimController = {
    createLawyerProfileClaim,
    getAllLawyerProfileClaims,
    getSingleLawyerProfileClaim,
    updateLawyerProfileClaim,
};
