import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { adminFirmService } from './firm.service';
import { TUploadedFile } from '../../interface/file.interface';

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

    const file=req.file as TUploadedFile

    const updatedFirm = await adminFirmService.updateFirm(
        id,
        updateData,
        file
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



// Firm Status Update
const firmStatus = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected', 'suspended'].includes(status)) {
        return sendResponse(res, {
            statusCode: httpStatus.BAD_REQUEST,
            success: false,
            message: 'Status must be one of pending, approved, rejected, or suspended.',
            data: null,
        });
    }


    const updatedFirm = await adminFirmService.firmStatus(id, status);

    return sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Firm status updated successfully.',
        data: updatedFirm,
    });
});



export const adminFirmController = {
    deleteFirm,
    updateFirm,
    getFirmById,
    listFirms,
    createFirm,
    firmStatus

};
