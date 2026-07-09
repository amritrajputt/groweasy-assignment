import { z } from "zod";
import { ALLOWED_CRM_STATUSES, ALLOWED_DATA_SOURCES } from "../constants/crm.constants.js";

export const crmLeadSchema = z.object({
    created_at: z.string().optional(),
    name: z.string().optional(),
    email: z.string().email().optional(),
    country_code: z.string().optional(),
    mobile_without_country_code: z.string().optional(),
    company: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    lead_owner: z.string().optional(),
    crm_status: z.enum(ALLOWED_CRM_STATUSES).optional(),
    crm_note: z.string().optional(),
    data_source: z.enum(ALLOWED_DATA_SOURCES).optional(),
    possession_time: z.string().optional(),
    description: z.string().optional(),
});

export const extractionResultSchema = z.object({
    leads: z.array(crmLeadSchema),
    skippedCount: z.number(),
    successCount: z.number(),
});
