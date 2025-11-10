import { HeaderFooterCode } from './headerFooterCode.model';

import { HTTP_STATUS } from '../../constant/httpStatus';
import QueryBuilder from '../../builder/QueryBuilder';
import { AppError } from '../../errors/error';

const createCode = async (data: Record<string, any>) => {
  const created = await HeaderFooterCode.create(data);
  return created;
};

const getCodes = async (query: Record<string, any> = {}) => {
  const queryBuilder = new QueryBuilder(HeaderFooterCode.find(), query)
    .filter()
    .search(['title', 'position', 'notes'])
    .sort()
    .paginate()
    .fields();

  const codes = await queryBuilder.modelQuery;
  const count = await queryBuilder.countTotal();

  return {
    data: codes,
    meta: count,
  };
};

const getCodeById = async (id: string) => {
  const code = await HeaderFooterCode.findById(id);
  if (!code) throw new AppError(HTTP_STATUS.NOT_FOUND, 'Header/Footer code not found');
  return code;
};

const updateCode = async (id: string, data: Record<string, any>) => {
  const updated = await HeaderFooterCode.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!updated) throw new AppError(HTTP_STATUS.NOT_FOUND, 'Header/Footer code not found');
  return updated;
};

const deleteCode = async (id: string) => {
  const deleted = await HeaderFooterCode.findByIdAndDelete(id);
  if (!deleted) throw new AppError(HTTP_STATUS.NOT_FOUND, 'Header/Footer code not found');
  return deleted;
};




const getAllCodes = async () => {
  return await HeaderFooterCode.find({}).lean(); // fetch all codes without pagination
};

export const headerFooterCodeService = {
  createCode,
  getCodes,
  getCodeById,
  updateCode,
  deleteCode,
  getAllCodes
};
