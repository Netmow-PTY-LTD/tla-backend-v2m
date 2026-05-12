import mongoose from "mongoose";

export interface IWebsiteFaqPayload {
  question: string;
  answer: string;
  category: "client" | "lawyer" | "general";
  order?: number;
  isActive?: boolean;
}

export interface IWebsiteFaqFilters {
  category?: string;
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}
