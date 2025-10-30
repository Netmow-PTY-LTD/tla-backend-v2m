
import crypto from 'crypto';

// Define reusable TTLs (Time To Live)  (in seconds)
export const TTL = {
    SHORT: 60,          // 1 minute
    SHORT_2M: 120,      // 2 minutes
    SHORT_5M: 300,      // 5 minutes
    MEDIUM_10M: 600,    // 10 minutes
    MEDIUM_20M: 1200,   // 20 minutes
    LONG_30M: 1800,     // 30 minutes
    LONG_1H: 3600,      // 1 hour
    EXTENDED_2H: 7200,  // 2 hours
    EXTENDED_12H: 43200,// 12 hours
    EXTENDED_1D: 86400, // 1 day
};



export const CacheKeys = {
    // ---------- USER ----------
    USER_PROFILE: (userId: string) => `user:${userId}:profile`,
    USER_ACTIVITY: (userId: string) => `user:${userId}:activity`,
    USER_LOCATION: (userId: string) => `user:${userId}:location`,
    USER_INFO: (userId: string) => `user_info:${userId}`,
    SINGLE_USER_PROFILE: (userId: string) => `single_user_profile:${userId}`,

    // ---------- LEAD ----------
    LEAD_DETAIL: (leadId: string) => `leads:${leadId}:detail`,
    ALL_LEADS: () => 'leads:*',
    // List by user with filters/options
    // LEAD_LIST_BY_USER_WITH_FILTERS: (userId: string, filters: object, options: object) => {
    //     // Convert objects to a consistent string
    //     const filtersKey = JSON.stringify(filters || {});
    //     const optionsKey = JSON.stringify(options || {});
    //     return `leads:user:${userId}:list:filters:${filtersKey}:options:${optionsKey}`;
    // },

    LEAD_LIST_BY_USER_WITH_FILTERS: (userId: string, filters: object = {}, options: object = {}) => {
        const dataString = JSON.stringify({ filters, options });

        // Create a short MD5 hash (or SHA256 if you prefer)
        const hash = crypto.createHash('md5').update(dataString).digest('hex');

        return `leads:user:${userId}:filters:${hash}`;
    },

    LEAD_LIST_BY_USER_PATTERN: (userId: string) => `leads:user:${userId}:filters:*`,


    // ---------- LOCATION ----------
    NEARBY_SERVICES: (city: string, serviceId: string) =>
        `nearby:city:${city}:service:${serviceId}`,
    GEO_PROVIDERS: () => `geo:providers`,

    // ---------- SYSTEM / GLOBAL ----------
    SYSTEM_STATS: () => `system:stats`,

    // ---------- COUNTRY ----------
    ALL_COUNTRIES: () => `all_countries`,
    PUBLIC_CATEGORIES: (countryQueryId: string) => `public_categories:${countryQueryId}`,

    // ---------- TESTIMONIALS ----------
    TESTIMONIALS: (page: number, limit: number, search?: string) =>
        `testimonials:page${page}:limit${limit}:search:${search || 'all'}`,

    // ---------- SERVICE QUESTIONS ----------
    SERVICE_WISE_QUESTION: (serviceId: string, countryId: string) =>
        `serviceWiseQuestion:${serviceId}:${countryId}`,

    // ---------- COUNTRY WISE MAP ----------
    COUNTRY_WISE_MAP: (countryId: string) => `countryWiseMap:${countryId}`,

    //  -------------- lead service questions --------------

    LEAD_SERVICES_QUESTIONS: (userId: string) => `lead_services_with_questions:${userId}`,



};








