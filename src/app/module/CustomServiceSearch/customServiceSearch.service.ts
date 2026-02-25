/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';
import CustomServiceSearch from './customServiceSearch.model';
import { ClientRegistrationDraft } from '../Auth/clientRegistrationDraft.model';

// ─────────────────────────────────────────────────────────────────
// 1. Log a new custom service search entry
// ─────────────────────────────────────────────────────────────────
const logCustomServiceSearchInDB = async (payload: {
    searchTerm: string;
    source?: 'lead' | 'draft' | 'anonymous';
    countryId?: string;
    serviceId?: string;
    leadId?: string;
    draftId?: string;
    sessionId?: string;
}) => {
    const data: Record<string, any> = {
        searchTerm: payload.searchTerm.trim(),
        source: payload.source || 'anonymous',
    };

    if (payload.countryId && mongoose.Types.ObjectId.isValid(payload.countryId)) {
        data.countryId = new mongoose.Types.ObjectId(payload.countryId);
    }
    if (payload.serviceId && mongoose.Types.ObjectId.isValid(payload.serviceId)) {
        data.serviceId = new mongoose.Types.ObjectId(payload.serviceId);
    }
    if (payload.leadId && mongoose.Types.ObjectId.isValid(payload.leadId)) {
        data.leadId = new mongoose.Types.ObjectId(payload.leadId);
    }
    if (payload.draftId && mongoose.Types.ObjectId.isValid(payload.draftId)) {
        data.draftId = new mongoose.Types.ObjectId(payload.draftId);
    }
    if (payload.sessionId) {
        data.sessionId = payload.sessionId;
    }

    const result = await CustomServiceSearch.create(data);
    return result;
};

// ─────────────────────────────────────────────────────────────────
// 2. Admin: get all custom service searches (paginated)
// ─────────────────────────────────────────────────────────────────
const getCustomServiceSearchesFromDB = async (query: {
    search?: string;
    source?: string;
    countryId?: string;
    page?: string | number;
    limit?: string | number;
    sortOrder?: string;
    startDate?: string;
    endDate?: string;
}) => {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.max(Number(query.limit) || 20, 1);
    const skip = (page - 1) * limit;
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;

    const filter: Record<string, any> = {};

    // Text search on searchTerm
    if (query.search) {
        filter.searchTerm = { $regex: query.search, $options: 'i' };
    }

    // Source filter
    if (query.source && ['lead', 'draft', 'anonymous'].includes(query.source)) {
        filter.source = query.source;
    }

    // Country filter
    if (query.countryId && mongoose.Types.ObjectId.isValid(query.countryId)) {
        filter.countryId = new mongoose.Types.ObjectId(query.countryId);
    }

    // Date range filter
    if (query.startDate || query.endDate) {
        filter.createdAt = {};
        if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
        if (query.endDate) {
            const end = new Date(query.endDate);
            end.setHours(23, 59, 59, 999);
            filter.createdAt.$lte = end;
        }
    }

    const [data, total] = await Promise.all([
        CustomServiceSearch.find(filter)
            .populate('countryId', 'name slug')
            .populate('serviceId', 'name slug')
            .populate('leadId', 'status createdAt')
            .sort({ createdAt: sortOrder })
            .skip(skip)
            .limit(limit)
            .lean(),
        CustomServiceSearch.countDocuments(filter),
    ]);

    // Aggregation: top searched terms
    const topSearchTerms = await CustomServiceSearch.aggregate([
        { $match: filter },
        {
            $group: {
                _id: { $toLower: '$searchTerm' },
                count: { $sum: 1 },
                sources: { $addToSet: '$source' },
            },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
        {
            $project: {
                _id: 0,
                searchTerm: '$_id',
                count: 1,
                sources: 1,
            },
        },
    ]);

    const totalPage = Math.ceil(total / limit);

    return {
        pagination: { total, page, limit, totalPage },
        topSearchTerms,
        data,
    };
};

// ─────────────────────────────────────────────────────────────────
// 3. Admin: get client registration drafts that have a customService field
// ─────────────────────────────────────────────────────────────────
const getCustomServiceDraftsFromDB = async (query: {
    search?: string;
    page?: string | number;
    limit?: string | number;
    sortOrder?: string;
}) => {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.max(Number(query.limit) || 20, 1);
    const skip = (page - 1) * limit;
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;

    const filter: Record<string, any> = {
        'leadDetails.customService': { $exists: true, $nin: ['', null] },
    };

    if (query.search) {
        filter.$or = [
            { 'leadDetails.customService': { $regex: query.search, $options: 'i' } },
            { 'leadDetails.name': { $regex: query.search, $options: 'i' } },
            { 'leadDetails.email': { $regex: query.search, $options: 'i' } },
        ];
    }

    const [data, total] = await Promise.all([
        ClientRegistrationDraft.find(filter)
            .populate('countryId', 'name slug')
            .populate('serviceId', 'name slug')
            .select(
                'leadDetails.name leadDetails.email leadDetails.customService leadDetails.phone countryId serviceId verification createdAt',
            )
            .sort({ createdAt: sortOrder })
            .skip(skip)
            .limit(limit)
            .lean(),
        ClientRegistrationDraft.countDocuments(filter),
    ]);

    const totalPage = Math.ceil(total / limit);

    return {
        pagination: { total, page, limit, totalPage },
        data,
    };
};

export const customServiceSearchService = {
    logCustomServiceSearchInDB,
    getCustomServiceSearchesFromDB,
    getCustomServiceDraftsFromDB,
};
