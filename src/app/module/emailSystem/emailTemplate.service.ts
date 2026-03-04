import { IEmailTemplate } from './emailTemplate.interface';
import { EmailTemplate } from './emailTemplate.model';

const createEmailTemplateIntoDB = async (payload: IEmailTemplate) => {
    const result = await EmailTemplate.create(payload);
    return result;
};

const getAllEmailTemplatesFromDB = async () => {
    const result = await EmailTemplate.find().populate('createdBy');
    return result;
};

const getSingleEmailTemplateFromDB = async (id: string) => {
    const result = await EmailTemplate.findById(id).populate('createdBy');
    return result;
};

const getEmailTemplateByTemplateKeyFromDB = async (templateKey: string) => {
    const result = await EmailTemplate.findOne({ templateKey }).populate('createdBy');
    return result;
};

const updateEmailTemplateIntoDB = async (id: string, payload: Partial<IEmailTemplate>) => {
    const result = await EmailTemplate.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
    return result;
};

const deleteEmailTemplateFromDB = async (id: string) => {
    const result = await EmailTemplate.findByIdAndDelete(id);
    return result;
};

export const EmailTemplateService = {
    createEmailTemplateIntoDB,
    getAllEmailTemplatesFromDB,
    getSingleEmailTemplateFromDB,
    getEmailTemplateByTemplateKeyFromDB,
    updateEmailTemplateIntoDB,
    deleteEmailTemplateFromDB,
};
