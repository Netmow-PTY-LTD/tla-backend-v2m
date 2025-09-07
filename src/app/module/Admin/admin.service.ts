import User from "../Auth/auth.model";
import CreditPackage from "../CreditPayment/models/creditPackage.model";
import CreditTransaction from "../CreditPayment/models/creditTransaction.model";
import Transaction from "../CreditPayment/models/transaction.model";
import Lead from "../Lead/lead.model";
import LeadResponse from "../LeadResponse/models/response.model";
import Service from "../Service/models/service.model";
import UserProfile from "../User/models/user.model";
import { AdminDashboardStats, ChartDataItem, DashboardQuery } from "./admin.interface";





//  all client history stats table data
const getAllClientsDashboard = async (query: DashboardQuery) => {
    const page = Math.max(Number(query.page) || 1, 1); // Ensure page is at least 1
    const limit = Math.max(Number(query.limit) || 10, 1); // Ensure limit is at least 1
    const skip = (page - 1) * limit;
    const search = query.search || "";
    const sortBy = query.sortBy || "totalLeads";
    const sortOrder = query.sortOrder === "desc" ? -1 : 1;

    // Aggregation pipeline
    const pipeline: any[] = [
        {
            $match: { regUserType: "client" },
        },
        {
            $lookup: {
                from: "userprofiles", // collection name
                localField: "profile",
                foreignField: "_id",
                as: "profile",
            },
        },
        { $unwind: "$profile" },
        {
            $match: {
                $or: [
                    { "profile.name": { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } },
                ],
            },
        },
        // Lookup leads
        {
            $lookup: {
                from: "leads",
                localField: "profile._id",
                foreignField: "userProfileId",
                as: "leads",
            },
        },


        {
            $lookup: {
                from: "leadresponses",
                let: { leadIds: "$leads._id" }, // all leads of the client
                pipeline: [
                    {
                        $match: {
                            $expr: { $in: ["$leadId", "$$leadIds"] } // match response to leads
                        }
                    },
                    {
                        $lookup: {
                            from: "userprofiles",       // join with userprofiles to get lawyer details
                            localField: "responseBy",   // this field exists in leadresponses
                            foreignField: "_id",
                            as: "responseBy"
                        }
                    },
                    {
                        $unwind: { path: "$responseBy", preserveNullAndEmptyArrays: true }
                    }
                ],
                as: "responses"
            }
        },



        // Add computed fields
        {
            $addFields: {
                totalLeads: { $size: "$leads" },
                totalHired: {
                    $size: {
                        $filter: {
                            input: "$leads",
                            as: "lead",
                            cond: { $or: [{ $eq: ["$$lead.status", "hired"] }, { $eq: ["$$lead.hireStatus", "hired"] }] },
                        },
                    },
                },
                totalResponses: { $size: "$responses" },
                hiredLeads: {
                    $filter: {
                        input: "$leads",
                        as: "lead",
                        cond: { $or: [{ $eq: ["$$lead.status", "hired"] }, { $eq: ["$$lead.hireStatus", "hired"] }] },
                    },
                },
            },
        },
        // Project only needed fields
        {
            $project: {
                _id: 1,
                name: "$profile.name",
                email: 1,
                profilePicture: "$profile.profilePicture",
                totalLeads: 1,
                listLeads: "$leads",
                totalHired: 1,
                hiredLeads: 1,
                totalResponses: 1,
                responseList: "$responses",
            },
        },
        { $sort: { [sortBy]: sortOrder } },
        { $skip: skip },
        { $limit: limit },
    ];

    const clientDashboards = await User.aggregate(pipeline);


    const totalClientsPipeline = [
        { $match: { regUserType: "client" } },
        {
            $lookup: {
                from: "userprofiles",
                localField: "profile",
                foreignField: "_id",
                as: "profile",
            },
        },
        { $unwind: "$profile" },
        {
            $match: {
                $or: [
                    { "profile.name": { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } },
                ],
            },
        },
        { $count: "total" }
    ];

    const totalResult = await User.aggregate(totalClientsPipeline);
    const totalClients = totalResult[0]?.total || 0;






    const totalPage = Math.ceil(totalClients / limit);
    const meta = {
        total: totalClients,
        page,
        limit,
        totalPage
    }

    return {
        pagination: meta,
        data: clientDashboards,
    };
};

//  all lawyer history stats table data

const getAllLawyerDashboard = async (query: DashboardQuery) => {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.max(Number(query.limit) || 10, 1);
    const skip = (page - 1) * limit;
    const search = query.search || '';
    const sortBy = query.sortBy || 'totalResponses';
    const sortOrder = query.sortOrder === 'desc' ? -1 : 1;

    const pipeline: any[] = [
        { $match: { regUserType: 'lawyer' } },
        {
            $lookup: {
                from: 'userprofiles',
                localField: 'profile',
                foreignField: '_id',
                as: 'profile',
            },
        },
        { $unwind: '$profile' },
        {
            $match: {
                $or: [
                    { 'profile.name': { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                ],
            },
        },
        // Lookup lead responses by this lawyer
        {
            $lookup: {
                from: 'leadresponses',
                localField: 'profile._id',
                foreignField: 'responseBy',
                as: 'responses',
            },
        },
        // Lookup leads where lawyer was hired
        // Lookup hire requests by this lawyer
        {
            $lookup: {
                from: 'leadresponses',
                let: { lawyerId: '$profile._id' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$responseBy', '$$lawyerId'] },
                                    { $eq: ['$isHireRequested', true] },
                                ],
                            },
                        },
                    },
                ],
                as: 'hireRequests',
            },
        },
        // Lookup leads where lawyer was hired
        {
            $lookup: {
                from: 'leads',
                localField: 'profile._id',
                foreignField: 'hiredLawyerId',
                as: 'hiredLeads',
            },
        },
        // Lookup credit transactions
        {
            $lookup: {
                from: 'credittransactions',
                localField: 'profile._id',
                foreignField: 'userProfileId',
                as: 'credits',
            },
        },
        {
            $addFields: {
                totalResponses: { $size: '$responses' },
                totalHired: { $size: '$hiredLeads' },
                totalHireRequests: { $size: '$hireRequests' },
                totalCreditsPurchased: {
                    $sum: {
                        $map: {
                            input: '$credits',
                            as: 'c',
                            in: { $cond: [{ $eq: ['$$c.type', 'purchase'] }, '$$c.credit', 0] },
                        },
                    },
                },
                totalCreditsUsed: {
                    $sum: {
                        $map: {
                            input: '$credits',
                            as: 'c',
                            in: { $cond: [{ $eq: ['$$c.type', 'usage'] }, '$$c.credit', 0] },
                        },
                    },
                },
            },
        },
        {
            $addFields: {
                availableCredits: { $subtract: ['$totalCreditsPurchased', '$totalCreditsUsed'] },
            },
        },
        {
            $project: {
                _id: 1,
                email: 1,
                name: '$profile.name',
                profilePicture: '$profile.profilePicture',
                totalResponses: 1,
                responseList: '$responses',
                totalHired: 1,
                hiredLeads: 1,
                totalHireRequests: 1,
                hireRequestList: '$hireRequests',
                totalCreditsPurchased: 1,
                totalCreditsUsed: 1,
                availableCredits: 1,
            },
        },
        { $sort: { [sortBy]: sortOrder } },
        { $skip: skip },
        { $limit: limit },
    ];

    const lawyers = await User.aggregate(pipeline);

    // Get total count
    const totalPipeline = [
        { $match: { regUserType: 'lawyer' } },
        {
            $lookup: {
                from: 'userprofiles',
                localField: 'profile',
                foreignField: '_id',
                as: 'profile',
            },
        },
        { $unwind: '$profile' },
        {
            $match: {
                $or: [
                    { 'profile.name': { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                ],
            },
        },
        { $count: 'total' },
    ];

    const totalResult = await User.aggregate(totalPipeline);
    const totalLawyers = totalResult[0]?.total || 0;
    const totalPage = Math.ceil(totalLawyers / limit);

    return {
        pagination: { total: totalLawyers, page, limit, totalPage },
        data: lawyers,
    };
};






const formatDate = (date: Date) => date.toISOString().split("T")[0];

const getAdminDashboardChartFromDB = async (
    startDate?: string,
    endDate?: string
): Promise<ChartDataItem[]> => {
    const start = startDate ? new Date(startDate) : new Date("2024-01-01");
    const end = endDate ? new Date(endDate) : new Date();

    // 1️⃣ Users count per day
    const users = await User.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                count: { $sum: 1 },
            },
        },
    ]);

    // 2️⃣ Lawyer registrations per day
    const lawyerRegistrations = await User.aggregate([
        {
            $match: {
                regUserType: "lawyer",
                createdAt: { $gte: start, $lte: end },
            },
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                count: { $sum: 1 },
            },
        },
    ]);

    // 3️⃣ Successful payments per day
    const payments = await Transaction.aggregate([
        {
            $match: {
                type: "purchase",
                status: "completed",
                createdAt: { $gte: start, $lte: end },
            },
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                count: { $sum: 1 },
            },
        },
    ]);

    // 4️⃣ Total credits spent per day
    const creditsSpent = await CreditTransaction.aggregate([
        {
            $match: {
                type: "usage",
                createdAt: { $gte: start, $lte: end },
            },
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                totalCredits: { $sum: "$credit" },
            },
        },
    ]);

    // 5️⃣ Leads (case posts) per day
    const casePosts = await Lead.aggregate([
        {
            $match: { createdAt: { $gte: start, $lte: end } },
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                count: { $sum: 1 },
            },
        },
    ]);

    // 6️⃣ Hires per day
    const hires = await Lead.aggregate([
        {
            $match: {
                isHired: true,
                hiredAt: { $gte: start, $lte: end },
            },
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$hiredAt" } },
                count: { $sum: 1 },
            },
        },
    ]);

    // 📌 Merge results by date
    const allDates = new Set([
        ...users.map((u) => u._id),
        ...lawyerRegistrations.map((l) => l._id),
        ...payments.map((p) => p._id),
        ...creditsSpent.map((c) => c._id),
        ...casePosts.map((cp) => cp._id),
        ...hires.map((h) => h._id),
    ]);

    const chartData: ChartDataItem[] = Array.from(allDates)
        .sort()
        .map((date) => ({
            date,
            users: users.find((u) => u._id === date)?.count || 0,
            payments: payments.find((p) => p._id === date)?.count || 0,
            creditsSpent: creditsSpent.find((c) => c._id === date)?.totalCredits || 0,
            casePosts: casePosts.find((cp) => cp._id === date)?.count || 0,
            hires: hires.find((h) => h._id === date)?.count || 0,
            lawyerRegistrations: lawyerRegistrations.find((l) => l._id === date)?.count || 0,
        }));

    return chartData;
};






//  const getAdminDashboardBarChartFromDB = async (
//     year: number
// ): Promise<ChartDataItem[]> => {
//     // 🗓️ Define start and end dates manually
//     const start = new Date(year, 0, 1);  // January 1st of given year
//     const end = new Date(year, 11, 31, 23, 59, 59, 999); // December 31st of given year

//     const dateFormat = "%Y-%m";

//     // 1️⃣ Users per month
//     const users = await User.aggregate([
//         { $match: { createdAt: { $gte: start, $lte: end } } },
//         {
//             $group: {
//                 _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
//                 count: { $sum: 1 },
//             },
//         },
//     ]);

//     // 2️⃣ Lawyer registrations per month
//     const lawyerRegistrations = await User.aggregate([
//         {
//             $match: {
//                 regUserType: "lawyer",
//                 createdAt: { $gte: start, $lte: end },
//             },
//         },
//         {
//             $group: {
//                 _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
//                 count: { $sum: 1 },
//             },
//         },
//     ]);

//     // 3️⃣ Successful payments per month
//     const payments = await Transaction.aggregate([
//         {
//             $match: {
//                 type: "purchase",
//                 status: "completed",
//                 createdAt: { $gte: start, $lte: end },
//             },
//         },
//         {
//             $group: {
//                 _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
//                 count: { $sum: 1 },
//             },
//         },
//     ]);

//     // 4️⃣ Credits spent per month
//     const creditsSpent = await CreditTransaction.aggregate([
//         {
//             $match: {
//                 type: "usage",
//                 createdAt: { $gte: start, $lte: end },
//             },
//         },
//         {
//             $group: {
//                 _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
//                 totalCredits: { $sum: "$credit" },
//             },
//         },
//     ]);

//     // 5️⃣ Case posts (leads) per month
//     const casePosts = await Lead.aggregate([
//         {
//             $match: { createdAt: { $gte: start, $lte: end } },
//         },
//         {
//             $group: {
//                 _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
//                 count: { $sum: 1 },
//             },
//         },
//     ]);

//     // 6️⃣ Hires per month
//     const hires = await Lead.aggregate([
//         {
//             $match: {
//                 isHired: true,
//                 hiredAt: { $gte: start, $lte: end },
//             },
//         },
//         {
//             $group: {
//                 _id: { $dateToString: { format: dateFormat, date: "$hiredAt" } },
//                 count: { $sum: 1 },
//             },
//         },
//     ]);

//     // 📌 Generate all 12 months for the requested year
//     const allMonths = Array.from({ length: 12 }, (_, i) => {
//         const month = (i + 1).toString().padStart(2, "0");
//         return `${year}-${month}`;
//     });

//     // 📌 Merge data with 0 for missing months
//     const chartData: ChartDataItem[] = allMonths.map((month) => ({
//         date: month,
//         users: users.find((u) => u._id === month)?.count || 0,
//         payments: payments.find((p) => p._id === month)?.count || 0,
//         creditsSpent: creditsSpent.find((c) => c._id === month)?.totalCredits || 0,
//         casePosts: casePosts.find((cp) => cp._id === month)?.count || 0,
//         hires: hires.find((h) => h._id === month)?.count || 0,
//         lawyerRegistrations:
//             lawyerRegistrations.find((l) => l._id === month)?.count || 0,
//     }));

//     return chartData;
// };




















// ✅ Fetch stats for the admin dashboard




//  const getAdminDashboardBarChartFromDB = async (
//     year: number,
//     month?: number // optional
// ): Promise<ChartDataItem[]> => {
//     // 🗓 Define start and end dates
//     let start: Date;
//     let end: Date;

//     if (month && month >= 1 && month <= 12) {
//         // specific month
//         start = new Date(year, month - 1, 1);
//         end = new Date(year, month - 1, new Date(year, month, 0).getDate(), 23, 59, 59, 999);
//     } else {
//         // whole year
//         start = new Date(year, 0, 1);
//         end = new Date(year, 11, 31, 23, 59, 59, 999);
//     }

//     const dateFormat = "%Y-%m";

//     // 1️⃣ Users per month
//     const users = await User.aggregate([
//         { $match: { createdAt: { $gte: start, $lte: end } } },
//         {
//             $group: {
//                 _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
//                 count: { $sum: 1 },
//             },
//         },
//     ]);

//     // 2️⃣ Lawyer registrations per month
//     const lawyerRegistrations = await User.aggregate([
//         {
//             $match: {
//                 regUserType: "lawyer",
//                 createdAt: { $gte: start, $lte: end },
//             },
//         },
//         {
//             $group: {
//                 _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
//                 count: { $sum: 1 },
//             },
//         },
//     ]);

//     // 3️⃣ Successful payments per month
//     const payments = await Transaction.aggregate([
//         {
//             $match: {
//                 type: "purchase",
//                 status: "completed",
//                 createdAt: { $gte: start, $lte: end },
//             },
//         },
//         {
//             $group: {
//                 _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
//                 count: { $sum: 1 },
//             },
//         },
//     ]);

//     // 4️⃣ Credits spent per month
//     const creditsSpent = await CreditTransaction.aggregate([
//         {
//             $match: {
//                 type: "usage",
//                 createdAt: { $gte: start, $lte: end },
//             },
//         },
//         {
//             $group: {
//                 _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
//                 totalCredits: { $sum: "$credit" },
//             },
//         },
//     ]);

//     // 5️⃣ Case posts (leads) per month
//     const casePosts = await Lead.aggregate([
//         {
//             $match: { createdAt: { $gte: start, $lte: end } },
//         },
//         {
//             $group: {
//                 _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
//                 count: { $sum: 1 },
//             },
//         },
//     ]);

//     // 6️⃣ Hires per month
//     const hires = await Lead.aggregate([
//         {
//             $match: {
//                 isHired: true,
//                 hiredAt: { $gte: start, $lte: end },
//             },
//         },
//         {
//             $group: {
//                 _id: { $dateToString: { format: dateFormat, date: "$hiredAt" } },
//                 count: { $sum: 1 },
//             },
//         },
//     ]);

//     // 📌 Generate months to fill chart
//     const allMonths = month
//         ? [`${year}-${month.toString().padStart(2, "0")}`]
//         : Array.from({ length: 12 }, (_, i) => `${year}-${(i + 1).toString().padStart(2, "0")}`);

//     // 📌 Merge data with 0 for missing months
//     const chartData: ChartDataItem[] = allMonths.map((m) => ({
//         date: m,
//         users: users.find((u) => u._id === m)?.count || 0,
//         payments: payments.find((p) => p._id === m)?.count || 0,
//         creditsSpent: creditsSpent.find((c) => c._id === m)?.totalCredits || 0,
//         casePosts: casePosts.find((cp) => cp._id === m)?.count || 0,
//         hires: hires.find((h) => h._id === m)?.count || 0,
//         lawyerRegistrations: lawyerRegistrations.find((l) => l._id === m)?.count || 0,
//     }));

//     return chartData;
// };


const getAdminDashboardBarChartFromDB = async (
    year: number,
    month?: number
): Promise<ChartDataItem[]> => {
    let start: Date;
    let end: Date;
    let dateFormat: string;

    if (month && month >= 1 && month <= 12) {
        // ✅ Specific month → group by DAY
        start = new Date(year, month - 1, 1);
        end = new Date(year, month, 0, 23, 59, 59, 999);
        dateFormat = "%Y-%m-%d"; // ✅ Daily format
    } else {
        // ✅ Whole year → group by MONTH
        start = new Date(year, 0, 1);
        end = new Date(year, 11, 31, 23, 59, 59, 999);
        dateFormat = "%Y-%m"; // ✅ Monthly format
    }

    // 1️⃣ Users
    const users = await User.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        {
            $group: {
                _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
                count: { $sum: 1 },
            },
        },
    ]);

    // 2️⃣ Lawyer registrations
    const lawyerRegistrations = await User.aggregate([
        {
            $match: {
                regUserType: "lawyer",
                createdAt: { $gte: start, $lte: end },
            },
        },
        {
            $group: {
                _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
                count: { $sum: 1 },
            },
        },
    ]);

    // 3️⃣ Payments
    const payments = await Transaction.aggregate([
        {
            $match: {
                type: "purchase",
                status: "completed",
                createdAt: { $gte: start, $lte: end },
            },
        },
        {
            $group: {
                _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
                count: { $sum: 1 },
            },
        },
    ]);

    // 4️⃣ Credits spent
    const creditsSpent = await CreditTransaction.aggregate([
        {
            $match: {
                type: "usage",
                createdAt: { $gte: start, $lte: end },
            },
        },
        {
            $group: {
                _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
                totalCredits: { $sum: "$credit" },
            },
        },
    ]);

    // 5️⃣ Case posts (leads)
    const casePosts = await Lead.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        {
            $group: {
                _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
                count: { $sum: 1 },
            },
        },
    ]);

    // 6️⃣ Hires
    const hires = await Lead.aggregate([
        {
            $match: {
                isHired: true,
                hiredAt: { $gte: start, $lte: end },
            },
        },
        {
            $group: {
                _id: { $dateToString: { format: dateFormat, date: "$hiredAt" } },
                count: { $sum: 1 },
            },
        },
    ]);

    // 📌 Prepare date labels
    let allDates: string[];

    if (month && month >= 1 && month <= 12) {
        // ✅ Daily data for the given month
        const daysInMonth = new Date(year, month, 0).getDate();
        allDates = Array.from(
            { length: daysInMonth },
            (_, i) => `${year}-${month.toString().padStart(2, "0")}-${(i + 1)
                .toString()
                .padStart(2, "0")}`
        );
    } else {
        // ✅ Monthly data for the given year
        allDates = Array.from(
            { length: 12 },
            (_, i) => `${year}-${(i + 1).toString().padStart(2, "0")}`
        );
    }

    // 📌 Merge data with defaults
    const chartData: ChartDataItem[] = allDates.map((date) => ({
        date,
        users: users.find((u) => u._id === date)?.count || 0,
        payments: payments.find((p) => p._id === date)?.count || 0,
        // creditsSpent: creditsSpent.find((c) => c._id === date)?.totalCredits || 0,
        creditsSpent: Math.abs(
            creditsSpent.find((c) => c._id === date)?.totalCredits || 0
        ),
        casePosts: casePosts.find((cp) => cp._id === date)?.count || 0,
        hires: hires.find((h) => h._id === date)?.count || 0,
        lawyerRegistrations:
            lawyerRegistrations.find((l) => l._id === date)?.count || 0,
    }));

    return chartData;
};





const getAdminDashboardStatsFromDB = async (): Promise<AdminDashboardStats> => {

    // ✅ Fetch counts in parallel for better performance
    const [totalUsers, totalServices, totalPackages, totalTransactions] = await Promise.all([
        User.countDocuments(),          // 👤 Total registered users
        Service.countDocuments(),      // 🛠️ Total available services
        CreditPackage.countDocuments(), // 🎁 Total credit packages
        Transaction.countDocuments(),   // 💳 Total transactions
    ]);

    return {
        totalUsers,
        totalServices,
        totalPackages,
        totalTransactions,
    };

};









// // ✅ Client Dashboard Service
// const getClientDashboard = async (clientId: string) => {
//     const userProfile = await UserProfile.findOne({ user: clientId })
//     // Fetch all client leads
//     const leads = await Lead.find({ userProfileId: userProfile?._id })
//         .populate("hiredLawyerId", "name email")
//         .lean();

//     const totalLead = leads.length;

//     // Hired leads
//     const hiredCases = leads.filter((c) => c.status === "hired");
//     const totalHired = hiredCases.length;

//     // Get responses for client leads
//     const leadIds = leads.map((c) => c._id);
//     const responses = await LeadResponse.find({ leadId: { $in: leadIds } })
//         .populate("lawyerId", "name email")
//         .populate("leadId", "title description status")
//         .lean();

//     const totalResponses = responses.length;

//     return {
//         totalLead,
//         totalHired,
//         totalResponses,
//         listCases: leads,
//         hiredCases,
//         responseList: responses,
//     };
// }


// // ✅ Lawyer Dashboard Service
// const getLawyerDashboard = async (lawyerId: string) => {
//     // Lawyer's responses
//     const lawyerResponses = await LeadResponse.find({ responseBy: lawyerId })
//         .populate("leadId", "title description status userProfileId")
//         .lean();
//     const totalResponses = lawyerResponses.length;

//     // Response case list
//     const responseCaseList = lawyerResponses.map((resp) => resp.leadId);

//     // Request leads (leads lawyer responded to)
//     const requestCases = await Lead.find({
//         _id: { $in: responseCaseList.map((c: any) => c._id) },
//     })
//         .populate("userProfileId", "name email")
//         .lean();
//     const totalRequests = requestCases.length;

//     // Hired leads
//     const hiredCases = await Lead.find({ hiredLawyerId: lawyerId })
//         .populate("userProfileId", "name email")
//         .lean();
//     const totalHired = hiredCases.length;

//     // Credit purchase stats
//     const totalCreditPurchase = await CreditTransaction.aggregate([
//         { $match: { lawyerId: lawyerId, type: "PURCHASE" } },
//         { $group: { _id: null, total: { $sum: "$amount" } } },
//     ]);

//     // Credit expense stats
//     const totalCreditExpense = await CreditTransaction.aggregate([
//         { $match: { lawyerId: lawyerId, type: "SPENT" } },
//         { $group: { _id: null, total: { $sum: "$amount" } } },
//     ]);

//     return {
//         totalResponses,
//         totalRequests,
//         totalHired,
//         responseCaseList,
//         requestCaseList: requestCases,
//         hiredCases,
//         totalCreditPurchase: totalCreditPurchase[0]?.total || 0,
//         totalCreditExpense: totalCreditExpense[0]?.total || 0,
//     };
// }









export const adminService = {
    getAllClientsDashboard,
    getAllLawyerDashboard,
    getAdminDashboardChartFromDB,
    getAdminDashboardStatsFromDB,
    getAdminDashboardBarChartFromDB
    // getClientDashboard,
    // getLawyerDashboard,
};
