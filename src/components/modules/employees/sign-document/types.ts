
// Types for digital signature functionality
export interface DigitalSignatureData {
  signature_text: string;
  signed_by: string;
  signed_at: string;
  ip_address?: string;
  user_agent?: string;
}

// Type guard to check if data is a valid signature object
export const isValidSignatureData = (data: any): data is DigitalSignatureData => {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.signature_text === 'string' &&
    typeof data.signed_by === 'string' &&
    typeof data.signed_at === 'string'
  );
};
