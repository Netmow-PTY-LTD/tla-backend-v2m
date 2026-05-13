import mongoose from "mongoose";

export interface IWebsiteFaqPayload {
  question: string;
  answer: string;
  category: "client" | "lawyer" | "general";
  websiteType: "tla_main" | "company";
  order?: number;
  isActive?: boolean;
}

export interface IWebsiteFaqFilters {
  category?: string;
  websiteType?: "tla_main" | "company";
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}
