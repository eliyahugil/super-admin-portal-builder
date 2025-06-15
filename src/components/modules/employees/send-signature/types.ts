
export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  employee_id: string;
  email?: string;
  phone?: string;
}

export interface ExistingSignature {
  id: string;
  employee_id: string;
  status: string;
  signed_at?: string | null;
  digital_signature_data?: any;
  sent_at: string;
  created_at: string;
  updated_at: string;
  employee?: Employee;
}

export interface SendToSignatureResult {
  successCount: number;
  errorCount: number;
  signatureUrls: { [employeeId: string]: string };
}
