import { Gallery } from './gallery.model';
import { uploadToSpaces, deleteFromSpace } from '../../config/upload';
import { FOLDERS } from '../../constant';
import mongoose from 'mongoose';
import { AppError } from '../../errors/error';
import { HTTP_STATUS } from '../../constant/httpStatus';
import { TUploadedFile } from '../../interface/file.interface';

const createGallery = async (data: any, file?: TUploadedFile) => {
	if (file?.buffer) {
		const imageUrl = await uploadToSpaces(file.buffer, file.originalname, {
			folder: FOLDERS.MEDIA,
			entityId: `gallery_${Date.now()}`,
		});
		data.image = imageUrl;
	}

	const gallery = new Gallery(data);
	return await gallery.save();
};

const getGalleries = async (query: any) => {
	const filter: any = {};
	if (query.title) filter.title = { $regex: query.title, $options: 'i' };
	return await Gallery.find(filter).sort({ createdAt: -1 });
};

const getGalleryById = async (id: string) => {
	return await Gallery.findById(id);
};

const updateGallery = async (id: string, data: any, file?: TUploadedFile) => {
	const session = await mongoose.startSession();
	session.startTransaction();

	let newFileUrl: string | null = null;

	try {
		const existing = await Gallery.findById(id).session(session);
		if (!existing) throw new AppError(HTTP_STATUS.NOT_FOUND, 'Gallery item not found');

		const oldImageUrl = existing.image;

		if (file?.buffer) {
			const uploadedUrl = await uploadToSpaces(file.buffer, file.originalname, {
				folder: FOLDERS.MEDIA,
				entityId: `gallery_${Date.now()}`,
			});
			data.image = uploadedUrl;
			newFileUrl = uploadedUrl;
		}

		const updated = await Gallery.findByIdAndUpdate(id, data, { new: true, session });
		if (!updated) throw new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to update gallery item');

		await session.commitTransaction();
		session.endSession();

		if (file?.buffer && oldImageUrl) {
			deleteFromSpace(oldImageUrl).catch((err) => console.error('Failed to delete old gallery image:', err));
		}

		return updated;
	} catch (err) {
		await session.abortTransaction();
		session.endSession();

		if (newFileUrl) {
			deleteFromSpace(newFileUrl).catch((cleanupErr) => console.error('Failed to rollback uploaded gallery image:', cleanupErr));
		}

		throw err;
	}
};

const deleteGallery = async (id: string) => {
	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		const existing = await Gallery.findById(id).session(session);
		if (!existing) throw new AppError(HTTP_STATUS.NOT_FOUND, 'Gallery item not found');

		const oldImageUrl = existing.image;

		await Gallery.findByIdAndDelete(id, { session });

		await session.commitTransaction();
		session.endSession();

		if (oldImageUrl) {
			deleteFromSpace(oldImageUrl).catch((err) => console.error('Failed to delete gallery image:', err));
		}

		return existing;
	} catch (err) {
		await session.abortTransaction();
		session.endSession();
		throw err;
	}
};

export const galleryService = {
	createGallery,
	getGalleries,
	getGalleryById,
	updateGallery,
	deleteGallery,
};
