
-- הוספת שדה טוקן לחתימה דיגיטלית
ALTER TABLE employee_documents 
ADD COLUMN IF NOT EXISTS digital_signature_token text NULL;

-- הוספת אינדקס על הטוקן לחיפוש מהיר
CREATE INDEX IF NOT EXISTS idx_employee_documents_digital_signature_token 
ON employee_documents(digital_signature_token);

-- הוספת הערה לשדה החדש
COMMENT ON COLUMN employee_documents.digital_signature_token IS 'Unique token for digital signature access';
