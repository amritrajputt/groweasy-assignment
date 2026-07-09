import dotenv from "dotenv";
dotenv.config()
import OpenAI from "openai";
import { buildSystemPrompt } from "./ai-extraction.prompt.js";
import { crmLeadSchema } from "../../common/schemas/crm.schema.js";
import { ICrmLead } from "../../common/types/crm.types.js";

export interface ExtractionResult {
    success: ICrmLead[];
    skipped: { row: unknown; reason: string }[];
}

export const AIExtractionService = {
    async extractLeads(rawRows: Record<string, any>[]): Promise<ExtractionResult> {
        try {
            const openai = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY
            });

            const systemPrompt = buildSystemPrompt();

            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: systemPrompt },
                    {
                        role: "user",
                        content: JSON.stringify(rawRows),
                    }
                ],
                temperature: 0.1,
                response_format: { type: "json_object" },
            });

            const rawJson = JSON.parse(response.choices[0].message.content || "{}");
            const leadsArray = rawJson.leads || Object.values(rawJson)[0] || [];

            const success: ICrmLead[] = [];
            const skipped: { row: any; reason: string }[] = [];

            leadsArray.forEach((lead: any, index: number) => {
                const originalRow = rawRows[index] || lead;

                const email = lead.email ? String(lead.email).trim() : "";
                const mobile = lead.mobile_without_country_code ? String(lead.mobile_without_country_code).trim() : "";

                if (lead.__skip === true || (!email && !mobile)) {
                    skipped.push({
                        row: originalRow,
                        reason: "Skipped: Lead contains neither email nor mobile number."
                    });
                    return;
                }


                const cleanedLead: any = { ...lead };
                Object.keys(cleanedLead).forEach((key) => {
                    if (cleanedLead[key] === "") {
                        delete cleanedLead[key];
                    }
                });

                const parsed = crmLeadSchema.safeParse(cleanedLead);
                if (parsed.success) {
                    success.push(parsed.data);
                } else {
                    const errorMsg = parsed.error.issues
                        .map(issue => `${issue.path.join(".")}: ${issue.message}`)
                        .join(", ");
                    skipped.push({
                        row: originalRow,
                        reason: `Validation failed: ${errorMsg}`
                    });
                }
            });

            return { success, skipped }; // success length will give total imported and skipped len will give skipped records

        } catch (error) {
            console.error("Error in AI Extraction", error);
            throw error;
        }
    }
}
