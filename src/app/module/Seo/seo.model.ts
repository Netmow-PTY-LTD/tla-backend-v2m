import mongoose, { Schema, model } from 'mongoose';

const seoSchema = new Schema(
    {
        // Page or route identifier (e.g., "home", "service-detail", "lawyer-profile")
        pageKey: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },

        // Actual route or slug (e.g., "/", "/services", "/lawyer/:slug")
        slug: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },

        // Basic SEO meta
        metaTitle: {
            type: String,
            required: true,
            trim: true,
            maxlength: 70, // recommended SEO length
        },
        metaDescription: {
            type: String,
            trim: true,
            maxlength: 160,
        },
        metaKeywords: {
            type: [String], // e.g., ["lawyer", "legal advice", "Dhaka"]
            default: [],
        },
        metaImage: {
            type: String, // URLs to images
            default: '',
        },


    },
    {
        timestamps: true,
    }
);

export const Seo = mongoose.models.Seo || model('Seo', seoSchema);
