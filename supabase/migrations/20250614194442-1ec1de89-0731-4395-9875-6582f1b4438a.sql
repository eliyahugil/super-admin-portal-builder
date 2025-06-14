
-- הוספת אינדקס על status לשאילות מהירות יותר
CREATE INDEX IF NOT EXISTS idx_employee_documents_status 
ON employee_documents(status);

-- הוספת אינדקס על assignee_id לשאילות מהירות יותר
CREATE INDEX IF NOT EXISTS idx_employee_documents_assignee_id 
ON employee_documents(assignee_id);

-- הוספת שדה signed_at לתיעוד מתי המסמך נחתם
ALTER TABLE employee_documents 
ADD COLUMN IF NOT EXISTS signed_at timestamp with time zone NULL;

-- עדכון רמת האבטחה אם צריך
COMMENT ON COLUMN employee_documents.signed_at IS 'Timestamp when the document was signed by the assignee';
