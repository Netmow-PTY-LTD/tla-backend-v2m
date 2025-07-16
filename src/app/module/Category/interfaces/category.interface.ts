import { Model, Types } from 'mongoose';

export interface ICategory {
  _id?: string;
  name: string;
  slug: string;
  image:string;
  serviceIds:Types.ObjectId[]
  deletedAt?: Date;
}

export interface CategoryModel extends Model<ICategory> {
  // eslint-disable-next-line no-unused-vars
  isCategoryExists(id: string): Promise<ICategory>;
}
