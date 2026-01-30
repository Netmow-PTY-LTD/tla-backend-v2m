/* eslint-disable @typescript-eslint/no-explicit-any */
import  { Document, Types } from 'mongoose';

/* ================= IMAGE META TYPE ================= */
export interface ImageMeta {
  url: string;
  alt: string;
  title?: string;
  description?: string;
}

/* ================= SEO TYPE ================= */
export interface BlogSEO {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  metaImage?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  schemaType?: string;
}




/* ================= BLOG TYPE ================= */
export interface BlogDocument extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;

  authors: string[];

  featuredImage: ImageMeta;

  category: Types.ObjectId[];
  tags: string[];

  status: 'draft' | 'published' | 'archived';
  isFeatured: boolean;

  publishedAt?: Date;
  viewCount: number;

  readingTime?: number;
  wordCount?: number;

  seo?: BlogSEO;
  seoSchema?: Record<string, any> | null;

  deletedAt?: Date | null;

  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  deletedBy?: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}
