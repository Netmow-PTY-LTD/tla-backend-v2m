

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

    // ---------- LEAD ----------
    LEAD_DETAIL: (leadId: string) => `lead:${leadId}:detail`,
    LEAD_LIST_BY_USER: (userId: string) => `leads:user:${userId}:list`,

    // ---------- LOCATION ----------
    NEARBY_SERVICES: (city: string, serviceId: string) =>
        `nearby:city:${city}:service:${serviceId}`,
    GEO_PROVIDERS: () => `geo:providers`,

    // ---------- SYSTEM / GLOBAL ----------
    SYSTEM_STATS: () => `system:stats`,
};



