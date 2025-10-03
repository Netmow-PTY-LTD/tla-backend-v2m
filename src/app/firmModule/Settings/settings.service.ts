import { HTTP_STATUS } from "../../constant/httpStatus";
import { AppError } from "../../errors/error";
//  page model geting from module
import PageModel from "../../module/Pages/page.model";
import FirmUser from "../FirmAuth/frimAuth.model";

const updateUserPermissionsInDB = async (
  userId: string,
  permissions: { pageId: string; permission: boolean }[]
) => {
  if (!permissions || !Array.isArray(permissions)) {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      "Invalid permissions payload. Must be an array."
    );
  }

  // validate pages exist
  const pageIds = permissions.map((p) => p.pageId);
  const validPages = await PageModel.find({ _id: { $in: pageIds } });
  if (validPages.length !== pageIds.length) {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      "One or more pageIds are invalid."
    );
  }

  const updatedUser = await FirmUser.findByIdAndUpdate(
    userId,
    { permissions },
    { new: true }
  ).populate("permissions.pageId", "title slug");

  if (!updatedUser) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Firm user not found");
  }

  return updatedUser.permissions;
};

export const FirmUserService = {
  updateUserPermissionsInDB,
};
