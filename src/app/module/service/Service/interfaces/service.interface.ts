import { Model } from 'mongoose';

export interface IService {
  _id?: string;
  name: string;
  slug: string;
  deletedAt?: Date;
}

export interface ServiceModel extends Model<IService> {
  // eslint-disable-next-line no-unused-vars
  isServiceExists(id: string): Promise<IService>;
}
