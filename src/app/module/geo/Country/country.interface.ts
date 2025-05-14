export interface ICountry {
  _id?: string;
  name: string;
  slug: string;
  deletedAt?: Date | null;
  isDeleted: boolean;
}
