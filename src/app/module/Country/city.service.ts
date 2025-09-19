import { validateObjectId } from "../../utils/validateObjectId";
import { City } from "./city.model";




const getAllCityFromDB = async (query: { countryId?: string; search?: string; page?: number; limit?: number }) => {
    const { countryId, search, page = 1, limit = 10 } = query;

    const filter: Record<string, any> = {};

    if (countryId) {
        validateObjectId(countryId, "Country");
        filter.countryId = countryId;
    }

    // Base query
    let cityQuery = City.find(filter).populate("countryId");

    if (search && search.trim()) {
        const trimmedSearch = search.trim();

        // Exact match on name first
        const exactMatch = await City.find({
            ...filter,
            name: { $regex: `^${trimmedSearch}$`, $options: "i" },
        }).populate("countryId");

        if (exactMatch.length > 0) {
            return {
                data: exactMatch,
                meta: {
                    total: exactMatch.length,
                    page: 1,
                    limit: exactMatch.length,
                    totalPage: 1,
                },
            };
        }

        // Partial match on name or region
        cityQuery = City.find({
            ...filter,
            $or: [
                { name: { $regex: trimmedSearch, $options: "i" } },
                { region: { $regex: trimmedSearch, $options: "i" } },
            ],
        }).populate("countryId");
    }

    // Count total documents for pagination
    const total = await City.countDocuments(
        search && search.trim()
            ? {
                ...filter,
                $or: [
                    { name: { $regex: search.trim(), $options: "i" } },
                    { region: { $regex: search.trim(), $options: "i" } },
                ],
            }
            : filter
    );

    // Apply pagination
    const skip = (page - 1) * limit;
    const cities = await cityQuery.skip(skip).limit(limit).exec();

    return {
        data: cities,
        meta: {
            total,
            page,
            limit,
            totalPage: Math.ceil(total / limit),
        },
    };
};



export const cityService = {
    getAllCityFromDB
}