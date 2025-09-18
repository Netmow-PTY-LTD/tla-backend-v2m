import { HTTP_STATUS } from "../../constant/httpStatus";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { cityService } from "./city.service";




const getAllCity = catchAsync(async (req, res) => {
  const query = req.query;

  const result = await cityService.getAllCityFromDB(query);

  if (!result.data?.length) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: false,
      message: "No cities found.",
      data: [],
      pagination: result.meta || null,
    });
  }

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "Cities retrieved successfully.",
    data: result.data,
    pagination: result.meta,
  });
});


export const cityController={
    getAllCity
}