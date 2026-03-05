import { IEmailTemplate, IEmailTemplateCategory } from './emailTemplate.interface';
import { EmailTemplate, EmailTemplateCategory } from './emailTemplate.model';

const createEmailTemplateIntoDB = async (payload: IEmailTemplate) => {
    const result = await EmailTemplate.create(payload);
    return result;
};

const getAllEmailTemplatesFromDB = async () => {
    const result = await EmailTemplate.find().populate('createdBy').populate('categoryId');
    return result;
};

const getSingleEmailTemplateFromDB = async (id: string) => {
    const result = await EmailTemplate.findById(id).populate('createdBy').populate('categoryId');
    return result;
};

const getEmailTemplateByTemplateKeyFromDB = async (templateKey: string) => {
    const result = await EmailTemplate.findOne({ templateKey }).populate('createdBy').populate('categoryId');
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

// Category Services
const createEmailTemplateCategoryIntoDB = async (payload: IEmailTemplateCategory) => {
    const result = await EmailTemplateCategory.create(payload);
    return result;
};

const getAllEmailTemplateCategoriesFromDB = async () => {
    const result = await EmailTemplateCategory.find().populate('createdBy');
    return result;
};

const getSingleEmailTemplateCategoryFromDB = async (id: string) => {
    const result = await EmailTemplateCategory.findById(id).populate('createdBy');
    return result;
};

const updateEmailTemplateCategoryIntoDB = async (id: string, payload: Partial<IEmailTemplateCategory>) => {
    const result = await EmailTemplateCategory.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
    return result;
};

const deleteEmailTemplateCategoryFromDB = async (id: string) => {
    const result = await EmailTemplateCategory.findByIdAndDelete(id);
    return result;
};

export const EmailTemplateService = {
    createEmailTemplateIntoDB,
    getAllEmailTemplatesFromDB,
    getSingleEmailTemplateFromDB,
    getEmailTemplateByTemplateKeyFromDB,
    updateEmailTemplateIntoDB,
    deleteEmailTemplateFromDB,
    // Category exports
    createEmailTemplateCategoryIntoDB,
    getAllEmailTemplateCategoriesFromDB,
    getSingleEmailTemplateCategoryFromDB,
    updateEmailTemplateCategoryIntoDB,
    deleteEmailTemplateCategoryFromDB,
};
