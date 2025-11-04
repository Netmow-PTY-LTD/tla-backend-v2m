import { uploadToSpaces } from '../../config/upload';
import { FOLDERS } from '../../constant';
import { TUploadedFile } from '../../interface/file.interface';
import { Seo } from './seo.model';
import { Document } from 'mongoose';

interface ISeo {
    pageKey: string;
    slug: string;
    metaTitle: string;
    metaDescription?: string;
    metaKeywords?: string[];
    metaImage?: string;
}

type SeoDocument = Document & ISeo;

const CreateSeoIntoDB = async (file: TUploadedFile, payload: ISeo) => {

    //  handle file upload if present
    if (file.buffer) {
        const fileBuffer = file.buffer;
        const originalName = file.originalname;

        // upload to Spaces and get public URL
        const metaImageUrl = await uploadToSpaces(fileBuffer, originalName, {
            folder: FOLDERS.METAIMAGES,
        });

        payload.metaImage = metaImageUrl;
    }

    const result = await Seo.create(payload);
    return result;

};




const getSingleSeoFromDB = async (id: string): Promise<SeoDocument | null> => {
    const result = await Seo.findById(id);
    return result;
};

const getAllSeoFromDB = async (query: Record<string, any>): Promise<SeoDocument[]> => {
    const result = await Seo.find(query);
    return result;
};



const updateSeoIntoDB = async (id: string, payload: Partial<ISeo>): Promise<SeoDocument | null> => {
    const result = await Seo.findByIdAndUpdate(id, payload, { new: true });
    return result;
};


const deleteSeoFromDB = async (id: string): Promise<SeoDocument | null> => {
    const result = await Seo.findByIdAndDelete(id);
    return result;
};


export const seoService = {
    CreateSeoIntoDB,
    getSingleSeoFromDB,
    getAllSeoFromDB,
    updateSeoIntoDB,
    deleteSeoFromDB,
};