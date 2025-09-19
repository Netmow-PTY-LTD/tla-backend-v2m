
import httpStatus from "http-status";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";
import { firmLicenseService } from "./cirtificateLicese.service";

// Create License
const createFirmLicense = catchAsync(async (req, res) => {
 const firmId = req.user.userId; // assuming user has firmProfileId
    const license = await firmLicenseService.createFirmLicenseInDB(firmId, req.body);

    return sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Firm license created successfully",
        data: license,
    });
});

// Get all licenses of firm
const getFirmLicenses = catchAsync(async (req, res) => {
    const firmId = req.user.userId; // assuming user has firmProfileId
    const licenses = await firmLicenseService.getFirmLicensesFromDB(firmId);
    return sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Firm licenses fetched successfully",
        data: licenses,
    });
});

// Get single license by ID
const getFirmLicense = catchAsync(async (req, res) => {
    const licenseId = req.params.licenseId;
    const license = await firmLicenseService.getFirmLicenseById(licenseId);
    return sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Firm license fetched successfully",
        data: license,
    });
});

// Update license by ID
const updateFirmLicense = catchAsync(async (req, res) => {
    const licenseId = req.params.licenseId;
    const updated = await firmLicenseService.updateFirmLicenseInDB(licenseId, req.body);
    return sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Firm license updated successfully",
        data: updated,
    });
});

// Delete license by ID
const deleteFirmLicense = catchAsync(async (req, res) => {
    const licenseId = req.params.licenseId;
    await firmLicenseService.deleteFirmLicenseFromDB(licenseId);
    return sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Firm license deleted successfully",
        data: null
    });
});


export const firmLicenseController = {
    createFirmLicense,
    getFirmLicenses,
    getFirmLicense,
    updateFirmLicense,
    deleteFirmLicense

}