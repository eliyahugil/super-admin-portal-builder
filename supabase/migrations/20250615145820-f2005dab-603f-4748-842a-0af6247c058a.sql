
-- Add digital_signature_token column to employee_documents table
ALTER TABLE employee_documents 
ADD COLUMN digital_signature_token UUID;

-- Add index for better performance when looking up documents by token
CREATE INDEX IF NOT EXISTS idx_employee_documents_digital_signature_token 
ON employee_documents(digital_signature_token);
