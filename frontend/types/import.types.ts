
export interface Lead {
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

export interface SkippedRecord {
  row: Record<string, unknown>;
  reason: string;
}

export interface JobProgress {
  status: "processing" | "completed" | "failed";
  progress: number;
  completedBatches: number;
  totalBatches: number;
  totalImported: number;
  totalSkipped: number;
  failedBatches: number[];
  success?: Lead[];
  skipped?: SkippedRecord[];
}
