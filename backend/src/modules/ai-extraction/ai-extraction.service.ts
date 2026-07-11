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

            console.log(`[AIExtractionService] Calling OpenAI chat.completions.create with ${rawRows.length} rows...`);
            const startTime = Date.now();
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
            console.log(`[AIExtractionService] OpenAI responded in ${((Date.now() - startTime) / 1000).toFixed(2)}s`);

            console.log("[AIExtractionService] Raw LLM response content:", response.choices[0].message.content);

            const rawJson = JSON.parse(response.choices[0].message.content || "{}");

            let leadsArray: any[] = [];

            if (Array.isArray(rawJson)) {
                leadsArray = rawJson;
            }
            else if (rawJson.leads && Array.isArray(rawJson.leads)) {
                leadsArray = rawJson.leads;
            }
            else {
                const foundArray = Object.values(rawJson).find(val => Array.isArray(val));

                if (foundArray) {
                    leadsArray = foundArray as any[];
                } else if (rawJson && typeof rawJson === "object" && (rawJson.name !== undefined || rawJson.email !== undefined)) {
                    leadsArray = [rawJson];
                } else {
                    leadsArray = [];
                }
            }

            const success: ICrmLead[] = [];
            const skipped: { row: any; reason: string }[] = [];
            const processedIndices = new Set<number>();

            leadsArray.forEach((lead: any) => {
                const originalIndex = typeof lead.__row_index === "number" ? lead.__row_index : undefined;
                if (originalIndex === undefined || originalIndex >= rawRows.length) {
                    return;
                }
                processedIndices.add(originalIndex);
                const originalRow = rawRows[originalIndex];

                const email = lead.email ? String(lead.email).trim() : "";
                const mobile = lead.mobile_without_country_code ? String(lead.mobile_without_country_code).trim() : "";

                if (lead.__skip === true || (!email && !mobile)) {
                    skipped.push({ row: originalRow, reason: "Skipped: Lead contains neither email nor mobile number." });
                    return;
                }


                const cleanedLead: any = { ...lead };
                delete cleanedLead.__row_index; 
                Object.keys(cleanedLead).forEach((key) => {
                    if (cleanedLead[key] === "") delete cleanedLead[key];
                });

                const parsed = crmLeadSchema.safeParse(cleanedLead);
                if (parsed.success) {
                    success.push(parsed.data);
                } else {
                    const errorMsg = parsed.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join(", ");
                    skipped.push({ row: originalRow, reason: `Validation failed: ${errorMsg}` });
                }
            });

            rawRows.forEach((row, index) => {
                if (!processedIndices.has(index)) {
                    skipped.push({
                        row,
                        reason: "AI failed to process this record (omitted or malformed in AI response)."
                    });
                }
            });

            return { success, skipped };

        } catch (error) {
            console.error("Error in AI Extraction", error);
            throw error;
        }
    }
}
