import { Model } from 'mongoose';

export interface ICategory {
  _id?: string;
  name: string;
  slug: string;
  deletedAt?: Date;
}

export interface CategoryModel extends Model<ICategory> {
  // eslint-disable-next-line no-unused-vars
  isCategoryExists(id: string): Promise<ICategory>;
}
