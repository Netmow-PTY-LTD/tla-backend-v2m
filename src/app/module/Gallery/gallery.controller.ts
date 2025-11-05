import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';
import { HTTP_STATUS } from '../../constant/httpStatus';
import { galleryService } from './gallery.service';


const createGallery = catchAsync(async (req, res) => {
	const payload = req.body;
	const file = req.file as any;
	const result = await galleryService.createGallery(payload, file);
	sendResponse(res, {
		statusCode: HTTP_STATUS.CREATED,
		success: true,
		message: 'Gallery item created successfully.',
		data: result,
	});
});

const getGalleries = catchAsync(async (req, res) => {
	const result = await galleryService.getGalleries(req.query);
	sendResponse(res, {
		statusCode: HTTP_STATUS.OK,
		success: true,
		message: 'Gallery items retrieved successfully.',
		data: result,
	});
});

const getGalleryById = catchAsync(async (req, res) => {
	const { galleryId } = req.params;
	const result = await galleryService.getGalleryById(galleryId);
	sendResponse(res, {
		statusCode: HTTP_STATUS.OK,
		success: true,
		message: 'Gallery item retrieved successfully.',
		data: result,
	});
});


const updateGallery = catchAsync(async (req, res) => {
	const { galleryId } = req.params;
	const payload = req.body;
	const file = req.file as any;
	const result = await galleryService.updateGallery(galleryId, payload, file);
	sendResponse(res, {
		statusCode: HTTP_STATUS.OK,
		success: true,
		message: 'Gallery item updated successfully.',
		data: result,
	});
});

const deleteGallery = catchAsync(async (req, res) => {
	const { galleryId } = req.params;
	const result = await galleryService.deleteGallery(galleryId);
	sendResponse(res, {
		statusCode: HTTP_STATUS.OK,
		success: true,
		message: 'Gallery item deleted successfully.',
		data: result,
	});
});

export const galleryController = {
	createGallery,
	getGalleries,
	getGalleryById,
	updateGallery,
	deleteGallery,
};
