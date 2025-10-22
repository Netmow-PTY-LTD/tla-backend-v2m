import { uploadToSpaces } from "../../config/upload";
import { FOLDERS } from "../../constant";
import { HTTP_STATUS } from "../../constant/httpStatus";
import { TUploadedFile } from "../../interface/file.interface";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { adminService } from "./admin.service";


// --- ADMIN CONTROLLER CRUD ---
const createAdmin = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const adminData = req.body;
  if (req.file) {
    const fileBuffer = req.file.buffer;
    const originalName = req.file.originalname;
    // const logoUrl = await uploadToSpaces(fileBuffer, originalName, userId);

    const adminProUrl = await uploadToSpaces(fileBuffer, originalName, {
      folder: FOLDERS.FIRMS,
      entityId: `admin-${userId}`,
      subFolder: FOLDERS.PROFILES
    });

    adminData.image = adminProUrl;
  }




  const newAdmin = await adminService.createAdminUserIntoDB(userId, adminData);
  return sendResponse(res, {
    statusCode: HTTP_STATUS.CREATED,
    success: true,
    message: 'Admin created successfully.',
    data: newAdmin,
  });
});

const listAdmins = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const adminList = await adminService.getAdminList(userId);
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Admin list fetched successfully.',
    data: adminList,
  });
});

const getAdminById = catchAsync(async (req, res) => {
  const { adminUserId } = req.params;
  const admin = await adminService.getAdminById(adminUserId);
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Admin fetched successfully.',
    data: admin,
  });
});

const updateAdmin = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const { adminUserId } = req.params;
  const payload = req.body;
  const file = req.file as TUploadedFile;

  const updated = await adminService.updateAdmin(userId, adminUserId, payload ,file);
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Admin updated successfully.',
    data: updated,
  });
});

const deleteAdmin = catchAsync(async (req, res) => {
  const { adminUserId } = req.params;
  await adminService.deleteAdmin(adminUserId);
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Admin deleted successfully.',
    data: null,
  });
});



export const adminController = {
  listAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  createAdmin,
};
