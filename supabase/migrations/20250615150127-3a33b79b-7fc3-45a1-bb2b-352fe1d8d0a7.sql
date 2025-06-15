
-- Create a new table to track document recipients and their signature status
CREATE TABLE employee_document_signatures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES employee_documents(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  digital_signature_token UUID NOT NULL DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'pending',
  signed_at TIMESTAMP WITH TIME ZONE NULL,
  digital_signature_data JSONB NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure one signature record per document-employee pair
  UNIQUE(document_id, employee_id)
);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_employee_document_signatures_document_id 
ON employee_document_signatures(document_id);

CREATE INDEX IF NOT EXISTS idx_employee_document_signatures_employee_id 
ON employee_document_signatures(employee_id);

CREATE INDEX IF NOT EXISTS idx_employee_document_signatures_token 
ON employee_document_signatures(digital_signature_token);

-- Enable RLS
ALTER TABLE employee_document_signatures ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow all operations on employee_document_signatures" 
ON employee_document_signatures 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Add a recipients_count column to employee_documents for easy tracking
ALTER TABLE employee_documents 
ADD COLUMN recipients_count INTEGER DEFAULT 0,
ADD COLUMN signed_count INTEGER DEFAULT 0;

-- Create a function to update recipient counts
CREATE OR REPLACE FUNCTION update_document_recipient_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE employee_documents 
    SET recipients_count = recipients_count + 1
    WHERE id = NEW.document_id;
    
    IF NEW.status = 'signed' THEN
      UPDATE employee_documents 
      SET signed_count = signed_count + 1
      WHERE id = NEW.document_id;
    END IF;
    
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- If status changed from not signed to signed
    IF OLD.status != 'signed' AND NEW.status = 'signed' THEN
      UPDATE employee_documents 
      SET signed_count = signed_count + 1
      WHERE id = NEW.document_id;
    -- If status changed from signed to not signed
    ELSIF OLD.status = 'signed' AND NEW.status != 'signed' THEN
      UPDATE employee_documents 
      SET signed_count = signed_count - 1
      WHERE id = NEW.document_id;
    END IF;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE employee_documents 
    SET recipients_count = recipients_count - 1
    WHERE id = OLD.document_id;
    
    IF OLD.status = 'signed' THEN
      UPDATE employee_documents 
      SET signed_count = signed_count - 1
      WHERE id = OLD.document_id;
    END IF;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for the count updates
CREATE TRIGGER trigger_update_document_recipient_counts
  AFTER INSERT OR UPDATE OR DELETE ON employee_document_signatures
  FOR EACH ROW EXECUTE FUNCTION update_document_recipient_counts();
