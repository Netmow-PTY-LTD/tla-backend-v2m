export interface AdminDashboardStats {
    totalUsers: number;
    totalServices: number;
    totalPackages: number;
    totalTransactions: number;
}


export interface ChartDataItem {
    date: string;
    users: number;
    payments: number;
    creditsSpent: number;
    casePosts: number;
    hires: number;
    lawyerRegistrations: number;
}


export interface DashboardQuery {
    page?: number;
    limit?: number;
    search?: string;       // search by client name or email
    sortBy?: string;       // e.g., "totalLeads", "totalHired"
    sortOrder?: "asc" | "desc";
}
