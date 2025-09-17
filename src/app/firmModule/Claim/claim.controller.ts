import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { HTTP_STATUS } from "../../constant/httpStatus";
import { claimService } from "./claim.service";




const createClaimRequest = catchAsync(async (req, res) => {
  // Validate body
  const payload = req.body;

  // Attach request metadata if you store it
  const meta = {
    requesterIp: req.ip,
    userAgent: req.get("user-agent") ?? undefined,
  };

  const claim = await claimService.createClaimIntoDB(payload, meta);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.CREATED,
    success: true,
    message: "Claim submitted successfully.",
    data: claim,
  });
});

// Optional list (for admin dashboards)
const listClaims = catchAsync(async (req, res) => {
  const claims = await claimService.listClaims({ status: req.query.status as any });
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "Claims fetched.",
    data: claims,
  });
});

// Optional status update (approve/reject/etc.)
const updateClaimStatus = catchAsync(async (req, res) => {
  const { claimId } = req.params;
  const { status, reviewerNote, matchedLawFirmId } = req.body;

  const updated = await claimService.updateClaimStatus(claimId, {
    status,
    reviewerNote,
    matchedLawFirmId,
  });

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "Claim updated.",
    data: updated,
  });
});





export const claimController = {
  createClaimRequest,
  listClaims,
  updateClaimStatus
}