export interface ICrmLead {
  created_at?: string;
  name?: string;
  email?: string;
  country_code?: string;
  mobile_without_country_code?: string;
  company?: string;
  city?: string;
  state?: string;
  country?: string;
  lead_owner?: string;
  crm_status?: string;
  crm_note?: string;
  data_source?: string;
  possession_time?: string;
  description?: string;
}
// result interface
export interface IExtractionResult {
  leads: ICrmLead[];
  skippedCount: number;
  successCount: number;
}
