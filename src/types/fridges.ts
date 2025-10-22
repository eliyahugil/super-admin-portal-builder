export type FridgeType = 'מקרר' | 'מקפיא';

export type Fridge = {
  id: string;
  business_id: string;
  name: string;
  location?: string | null;
  type: FridgeType;
  min_temp: number;
  max_temp: number;
  is_active: boolean;
  notes?: string | null;
  created_at: string;
  updated_at: string;
};

export type FridgeTemperatureLog = {
  id: string;
  business_id: string;
  fridge_id: string;
  measured_at: string;
  temperature: number;
  method: 'ידני' | 'חיישן';
  probe_id?: string | null;
  probe_calibrated?: boolean | null;
  measured_by?: string | null;
  note?: string | null;
  created_at: string;
};

export type FridgeAlert = {
  id: string;
  business_id: string;
  fridge_id: string;
  temp_log_id?: string | null;
  alert_type: 'חריגה-גבוהה' | 'חריגה-נמוכה' | 'חזרה-לטווח';
  threshold?: string | null;
  actual_temp?: number | null;
  occurred_at: string;
  resolved_at?: string | null;
  status: 'פתוחה' | 'סגורה';
  details?: string | null;
};

export type CorrectiveAction = {
  id: string;
  business_id: string;
  fridge_id: string;
  alert_id?: string | null;
  action_time: string;
  action_taken: string;
  taken_by?: string | null;
  verification_note?: string | null;
  closed: boolean;
  created_at: string;
};
