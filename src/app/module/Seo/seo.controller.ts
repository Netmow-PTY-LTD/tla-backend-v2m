import { HTTP_STATUS } from '../../constant/httpStatus';
import { TUploadedFile } from '../../interface/file.interface';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { seoService } from './seo.service';

const createSeo = catchAsync(async (req, res) => {
  const seoData = req.body;
  const metaImage = req.file;

  const result = await seoService.CreateSeoIntoDB(metaImage as TUploadedFile, seoData);
  sendResponse(res, {
    statusCode: HTTP_STATUS.CREATED,
    success: true,
    message: 'SEO entry created successfully.',
    data: result,
  });
});

const getSingleSeo = catchAsync(async (req, res) => {
  const { seoId } = req.params;
  const result = await seoService.getSingleSeoFromDB(seoId);
  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'SEO entry retrieved successfully.',
    data: result,
  });
});

const getAllSeo = catchAsync(async (req, res) => {
  const result = await seoService.getAllSeoFromDB(req.query);
  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'All SEO entries retrieved successfully.',
    data: result,
  });
});

const updateSeo = catchAsync(async (req, res) => {
  const { seoId } = req.params;
  const payload = req.body;
  const result = await seoService.updateSeoIntoDB(seoId, payload);
  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'SEO entry updated successfully.',
    data: result,
  });
});


const deleteSeo = catchAsync(async (req, res) => {
  const { seoId } = req.params;
  const result = await seoService.deleteSeoFromDB(seoId);
  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'SEO entry deleted successfully.',
    data: result,
  });
});



export const seoController = {
  createSeo,
  getSingleSeo,
  getAllSeo,
  updateSeo,
  deleteSeo,
};