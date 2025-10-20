import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { uploadToSpaces } from '../../config/upload';
import { adminFirmService } from './firm.service';
import { FOLDERS } from '../../constant';

//  Create Firm
const createFirm = catchAsync(async (req, res) => {
    const firmData = req.body;
    const newFirm = await adminFirmService.createFirm(firmData);

    return sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Firm created successfully.',
        data: newFirm,
    });
});


const listFirms = catchAsync(async (req, res) => {
    const firms = await adminFirmService.listFirms(req.query);
    return sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Firm list fetched successfully.',
        pagination: firms.meta,
        data: firms.data,
    });
});

//  Get Firm by ID
const getFirmById = catchAsync(async (req, res) => {
    const { id } = req.params;
    const firm = await adminFirmService.getFirmById(id);

    return sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Firm details fetched successfully.',
        data: firm,
    });
});



//  Delete Firm
const deleteFirm = catchAsync(async (req, res) => {
    const { id } = req.params;
    await adminFirmService.deleteFirm(id);

    return sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Firm deleted successfully.',
        data: null,
    });
});



const updateFirm = catchAsync(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    //  handle file upload if present
    if (req.file) {
        const fileBuffer = req.file.buffer;
        const originalName = req.file.originalname;

        // upload to Spaces and get public URL
        const logoUrl = await uploadToSpaces(fileBuffer, originalName, 'admin', FOLDERS.FIRMS);
        updateData.logo = logoUrl;
    }

    const updatedFirm = await adminFirmService.updateFirm(
        id,
        updateData,
    );

    // Determine the response message
    let message = 'Firm info updated successfully.';

    // Check if only billingInfo was updated
    if (
        updateData.billingInfo &&
        Object.keys(updateData.billingInfo).length > 0
    ) {
        // If other firm fields also updated, mention both
        const otherFields = { ...updateData };
        delete otherFields.billingInfo;
        if (Object.keys(otherFields).length > 0) {
            message = 'Firm info and billing info updated successfully.';
        } else {
            message = 'Billing info updated successfully.';
        }
    }

    return sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: message,
        data: updatedFirm,
    });
});

export const adminFirmController = {
    deleteFirm,
    updateFirm,
    getFirmById,
    listFirms,
    createFirm,

};
