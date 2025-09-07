import { z } from "zod";


//  ------------- lead status ------------------
export const LEAD_STATUS = ['pending', 'approved', 'rejected', 'archive','closed'] as const;
export type LeadStatus = (typeof LEAD_STATUS)[number];
export const LEAD_STATUS_ENUM = [...LEAD_STATUS];
export const leadStatusSchema = z.enum(LEAD_STATUS);

//  ------------------ leadPriority ---------------

export const PRIORITY_OPTIONS = [
    'urgent',
    'within_a_week',
    'this_month',
    'not_sure',
] as const;

export type PriorityOption = (typeof PRIORITY_OPTIONS)[number];

export const leadPrioritySchema = z.enum(PRIORITY_OPTIONS);