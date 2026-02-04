import { z } from "zod";

const createLawyerProfileClaimZodSchema = z.object({
    body: z.object({
        profileId: z.string({
            required_error: "Profile ID is required",
        }),
        claimerName: z.string({
            required_error: "Claimer name is required",
        }),
        claimerEmail: z.string({
            required_error: "Claimer email is required",
        }).email("Invalid email address"),
        claimerPhone: z.string().optional(),
        additionalInfo: z.string().optional(),
        claimReason: z.string({
            required_error: "Claim reason is required",
        }),
    }),
});

const updateLawyerProfileClaimZodSchema = z.object({
    body: z.object({
        status: z.enum(["pending", "reviewed", "approved", "rejected"]).optional(),
        reviewerNote: z.string().optional(),
    }),
});

export const LawyerProfileClaimValidation = {
    createLawyerProfileClaimZodSchema,
    updateLawyerProfileClaimZodSchema,
};
