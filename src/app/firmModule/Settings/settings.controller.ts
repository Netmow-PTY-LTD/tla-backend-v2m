import { HTTP_STATUS } from "../../constant/httpStatus";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { FirmUserService } from "./settings.service";


const updateUserPermissions = catchAsync(async (req, res) => {
    const id = req.user.userId;
  const { permissions } = req.body;

  const updatedPermissions = await FirmUserService.updateUserPermissionsInDB(
    id,
    permissions
  );

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "Permissions updated successfully.",
    data: updatedPermissions,
  });
});

export const FirmUserController = {
  updateUserPermissions,
};
