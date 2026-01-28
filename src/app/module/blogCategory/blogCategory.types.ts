import { Types } from 'mongoose';

export interface IBlogCategory {
  name: string;
  slug?: string;
  description?: string;
  parentCategory?: Types.ObjectId | null;
  isActive?: boolean;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  deletedBy?: Types.ObjectId;
  deletedAt?: Date;
}

export interface IBlogCategoryCreate {
  name: string;
  description?: string;
  parentCategory?: Types.ObjectId | null;
}

export interface IBlogCategoryUpdate {
  name?: string;
  description?: string;
  parentCategory?: Types.ObjectId | null;
  isActive?: boolean;
}