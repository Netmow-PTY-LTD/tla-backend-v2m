
import QueryBuilder from '../../builder/QueryBuilder';
import PageModel, { IPage } from './page.model';

const createPage = async (data: Partial<IPage>) => {
    return PageModel.create(data);
};

const getPages = async (query: Record<string, any>) => {
    const pageQuery = new QueryBuilder(PageModel.find({}), query).search(['title',"slug", 'description']).filter().sort().paginate().fields();
    const data = await pageQuery.modelQuery;
    const pagination = await pageQuery.countTotal();
    return { data, pagination };
};

const getPageById = async (id: string) => {
    return PageModel.findById(id);
};

const updatePage = async (id: string, data: Partial<IPage>) => {
    return PageModel.findByIdAndUpdate(id, data, { new: true });
};

const deletePage = async (id: string) => {
    return PageModel.findByIdAndDelete(id);
};

export const pageService = {
    createPage,
    getPages,
    getPageById,
    updatePage,
    deletePage,
};

