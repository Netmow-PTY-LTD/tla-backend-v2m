/* eslint-disable @typescript-eslint/no-explicit-any */

import { deleteFromSpace, uploadToSpaces } from '../../config/upload';
import { FOLDERS } from '../../constant';
import { TUploadedFile } from '../../interface/file.interface';
import { Seo } from './seo.model';
import mongoose, { Document, Types } from 'mongoose';

interface ISeo {
    pageKey: string;
    slug: string;
    metaTitle: string;
    metaKeywords?: string[];
    metaImage?: string;
    createdBy?: Types.ObjectId;
    updatedBy?: Types.ObjectId;
}

type SeoDocument = Document & ISeo;

const CreateSeoIntoDB = async (userId: string, file: TUploadedFile, payload: ISeo) => {

    //  handle file upload if present
    if (file?.buffer) {
        const fileBuffer = file.buffer;
        const originalName = file.originalname;

        // upload to Spaces and get public URL
        const metaImageUrl = await uploadToSpaces(fileBuffer, originalName, {
            folder: FOLDERS.SEO,
            entityId: FOLDERS.METAIMAGES,
            customFileName: `${payload.slug}-${Date.now()}`
        });

        payload.metaImage = metaImageUrl;
    }

    const result = await Seo.create({
        ...payload,
        createdBy: new Types.ObjectId(userId)
    });
    return result;

};




const getSingleSeoFromDB = async (id: string): Promise<SeoDocument | null> => {
    const result = await Seo.findById(id);
    return result;
};

const getSeoBySlugFromDB = async (slug: string): Promise<SeoDocument | null> => {
    const result = await Seo.findOne({ slug });
    return result;
};

const getAllSeoFromDB = async (query: Record<string, any>): Promise<SeoDocument[]> => {
    const result = await Seo.find(query);
    return result;
};



const updateSeoIntoDB = async (
    userId: string,
    id: string,
    payload: Partial<ISeo>,
    // eslint-disable-next-line no-undef
    file?: Express.Multer.File,
) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    let newFileUrl: string | null = null;

    try {
        const existingSeo = await Seo.findById(id).session(session);
        if (!existingSeo) throw new Error('SEO record not found');

        // Step 1: Handle file upload if new file provided
        if (file) {
            const fileBuffer = file.buffer;
            const originalName = file.originalname;

            newFileUrl = await uploadToSpaces(fileBuffer, originalName, {
                folder: FOLDERS.SEO,
                entityId: FOLDERS.METAIMAGES,
                customFileName: `${payload.slug}-${Date.now()}`

            });

            payload.metaImage = newFileUrl;
        }



        // Step 2: Update SEO record
        const updatedSeo = await Seo.findByIdAndUpdate(
            id,
            {
                ...payload,
                updatedBy: new Types.ObjectId(userId)
            },
            {
                new: true,
                session,
            }
        );

        if (!updatedSeo) throw new Error('Failed to update SEO');

        await session.commitTransaction();
        session.endSession();

        // Step 3: Delete old file from Space (non-blocking)
        if (file && existingSeo.metaImage) {
            deleteFromSpace(existingSeo.metaImage).catch((err) =>
                console.error('Failed to delete old file from Space:', err),
            );
        }

        return updatedSeo;
    } catch (err) {
        await session.abortTransaction();
        session.endSession();

        if (newFileUrl) {
            deleteFromSpace(newFileUrl).catch((cleanupErr) =>
                console.error('Failed to rollback uploaded file:', cleanupErr),
            );
        }

        throw err;
    }
};

const deleteSeoFromDB = async (id: string) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const seo = await Seo.findByIdAndDelete(id, { session });
        if (!seo) throw new Error('SEO record not found');

        // Delete file from Space if exists
        if (seo.metaImage) {
            await deleteFromSpace(seo.metaImage);
        }

        await session.commitTransaction();
        session.endSession();

        return seo;
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        throw err;
    }
};


export const seoService = {
    CreateSeoIntoDB,
    getSingleSeoFromDB,
    getSeoBySlugFromDB,
    getAllSeoFromDB,
    updateSeoIntoDB,
    deleteSeoFromDB,
};