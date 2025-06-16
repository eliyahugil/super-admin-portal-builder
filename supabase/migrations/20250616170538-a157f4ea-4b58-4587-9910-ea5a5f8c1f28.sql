
-- Add signed_document_url column to employee_documents table
ALTER TABLE public.employee_documents 
ADD COLUMN signed_document_url TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN public.employee_documents.signed_document_url IS 'URL to the signed document with embedded signature, name and timestamp';
