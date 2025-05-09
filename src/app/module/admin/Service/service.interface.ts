export interface IService {
  _id?: string;
  slug: string;
  respondAt?: string;
  reviewedAt?: string;
  completedAt?: string;
  isDeleted: boolean;
  deletedAt: Date;
}
