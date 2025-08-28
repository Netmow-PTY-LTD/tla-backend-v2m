import User from "../../Auth/models/auth.model";
import CreditTransaction from "../../CreditPayment/models/creditTransaction.model";
import Lead from "../../Lead/models/lead.model";
import LeadResponse from "../../LeadResponse/models/response.model";
import UserProfile from "../../User/models/user.model";






interface DashboardQuery {
    page?: number;
    limit?: number;
    search?: string;       // search by client name or email
    sortBy?: string;       // e.g., "totalLeads", "totalHired"
    sortOrder?: "asc" | "desc";
}

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
                let: { leadIds: "$leads._id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $in: ["$leadId", "$$leadIds"] // ✅ No need to convert to ObjectId
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: "userprofiles", // or "users" if responseBy refers to users
                            localField: "responseBy",
                            foreignField: "_id",
                            as: "responseBy",
                        },
                    },
                    {
                        $unwind: {
                            path: "$responseBy",
                            preserveNullAndEmptyArrays: true
                        }
                    }
                ],
                as: "responses",
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











// ✅ Client Dashboard Service
const getClientDashboard = async (clientId: string) => {
    const userProfile = await UserProfile.findOne({ user: clientId })
    // Fetch all client leads
    const leads = await Lead.find({ userProfileId: userProfile?._id })
        .populate("hiredLawyerId", "name email")
        .lean();

    const totalLead = leads.length;

    // Hired leads
    const hiredCases = leads.filter((c) => c.status === "hired");
    const totalHired = hiredCases.length;

    // Get responses for client leads
    const leadIds = leads.map((c) => c._id);
    const responses = await LeadResponse.find({ leadId: { $in: leadIds } })
        .populate("lawyerId", "name email")
        .populate("leadId", "title description status")
        .lean();

    const totalResponses = responses.length;

    return {
        totalLead,
        totalHired,
        totalResponses,
        listCases: leads,
        hiredCases,
        responseList: responses,
    };
}








// ✅ Lawyer Dashboard Service
const getLawyerDashboard = async (lawyerId: string) => {
    // Lawyer's responses
    const lawyerResponses = await LeadResponse.find({ responseBy: lawyerId })
        .populate("leadId", "title description status userProfileId")
        .lean();
    const totalResponses = lawyerResponses.length;

    // Response case list
    const responseCaseList = lawyerResponses.map((resp) => resp.leadId);

    // Request leads (leads lawyer responded to)
    const requestCases = await Lead.find({
        _id: { $in: responseCaseList.map((c: any) => c._id) },
    })
        .populate("userProfileId", "name email")
        .lean();
    const totalRequests = requestCases.length;

    // Hired leads
    const hiredCases = await Lead.find({ hiredLawyerId: lawyerId })
        .populate("userProfileId", "name email")
        .lean();
    const totalHired = hiredCases.length;

    // Credit purchase stats
    const totalCreditPurchase = await CreditTransaction.aggregate([
        { $match: { lawyerId: lawyerId, type: "PURCHASE" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // Credit expense stats
    const totalCreditExpense = await CreditTransaction.aggregate([
        { $match: { lawyerId: lawyerId, type: "SPENT" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    return {
        totalResponses,
        totalRequests,
        totalHired,
        responseCaseList,
        requestCaseList: requestCases,
        hiredCases,
        totalCreditPurchase: totalCreditPurchase[0]?.total || 0,
        totalCreditExpense: totalCreditExpense[0]?.total || 0,
    };
}









export const adminService = {
    getAllClientsDashboard,
    getClientDashboard,
    getLawyerDashboard,
};
