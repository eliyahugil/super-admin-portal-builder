-- Add document_type column to employee_files table
ALTER TABLE public.employee_files 
ADD COLUMN IF NOT EXISTS document_type TEXT DEFAULT 'other';

-- Add index for better performance when querying by document type
CREATE INDEX IF NOT EXISTS idx_employee_files_document_type 
ON public.employee_files(document_type);