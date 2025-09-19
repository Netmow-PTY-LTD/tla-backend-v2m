import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { firmService } from "./firm.service";

// ✅ Create Firm
const createFirm = catchAsync(async (req, res) => {
    const firmData = req.body;
    const newFirm = await firmService.createFirm(firmData);

    return sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Firm created successfully.",
        data: newFirm,
    });
});

// ✅ List Firms
const listFirms = catchAsync(async (req, res) => {
    const firms = await firmService.listFirms();

    return sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Firm list fetched successfully.",
        data: firms,
    });
});

// ✅ Get Firm by ID
const getFirmById = catchAsync(async (req, res) => {
    const { id } = req.params;
    const firm = await firmService.getFirmById(id);

    return sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Firm details fetched successfully.",
        data: firm,
    });
});

// ✅ Update Firm
const updateFirm = catchAsync(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    const updatedFirm = await firmService.updateFirm(id, updateData);

    return sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Firm updated successfully.",
        data: updatedFirm,
    });
});

// ✅ Delete Firm
const deleteFirm = catchAsync(async (req, res) => {
    const { id } = req.params;
    await firmService.deleteFirm(id);

    return sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Firm deleted successfully.",
        data: null
    });
});


// ✅ Get Firm by ID
const getFirmInfo = catchAsync(async (req, res) => {
    const firmUser=req.user.userId
    const firm = await firmService.getFirmInfoFromDB(firmUser);

    console.log('firm user  ===>',firmUser)
    return sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Firm details info fetched successfully.",
        data: firm,
    });
});




export const firmController = {
    deleteFirm,
    updateFirm,
    getFirmById,
    listFirms,
    createFirm,
    getFirmInfo

}