-- Create table for required employee documents
CREATE TABLE public.employee_required_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  
  -- Document types
  id_document_url TEXT NULL, -- צילום תעודת זהות
  id_document_uploaded_at TIMESTAMP WITH TIME ZONE NULL,
  
  form_101_url TEXT NULL, -- טופס 101 חתום
  form_101_uploaded_at TIMESTAMP WITH TIME ZONE NULL,
  
  employment_agreement_signature_url TEXT NULL, -- חתימה על אישור העסקה
  employment_agreement_uploaded_at TIMESTAMP WITH TIME ZONE NULL,
  
  medical_certificate_url TEXT NULL, -- אישור רפואי
  medical_certificate_uploaded_at TIMESTAMP WITH TIME ZONE NULL,
  medical_certificate_required BOOLEAN NOT NULL DEFAULT false, -- האם נדרש לפי גיל
  
  -- Status tracking
  all_documents_complete BOOLEAN NOT NULL DEFAULT false,
  completion_percentage INTEGER NOT NULL DEFAULT 0,
  last_reminder_sent_at TIMESTAMP WITH TIME ZONE NULL,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.employee_required_documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Business users can manage employee required documents"
ON public.employee_required_documents
FOR ALL
USING (business_id = ANY (get_user_business_ids()))
WITH CHECK (business_id = ANY (get_user_business_ids()));

-- Create indexes for better performance
CREATE INDEX idx_employee_required_docs_employee_id ON public.employee_required_documents(employee_id);
CREATE INDEX idx_employee_required_docs_business_id ON public.employee_required_documents(business_id);
CREATE INDEX idx_employee_required_docs_incomplete ON public.employee_required_documents(business_id, all_documents_complete) WHERE all_documents_complete = false;

-- Create function to calculate document completion
CREATE OR REPLACE FUNCTION public.calculate_document_completion(emp_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  doc_record RECORD;
  total_required INTEGER := 3; -- ID, Form 101, Employment Agreement (base requirements)
  completed INTEGER := 0;
BEGIN
  -- Get document record
  SELECT * INTO doc_record
  FROM public.employee_required_documents
  WHERE employee_id = emp_id;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Add medical certificate to total if required
  IF doc_record.medical_certificate_required THEN
    total_required := total_required + 1;
  END IF;
  
  -- Count completed documents
  IF doc_record.id_document_url IS NOT NULL THEN
    completed := completed + 1;
  END IF;
  
  IF doc_record.form_101_url IS NOT NULL THEN
    completed := completed + 1;
  END IF;
  
  IF doc_record.employment_agreement_signature_url IS NOT NULL THEN
    completed := completed + 1;
  END IF;
  
  IF doc_record.medical_certificate_required AND doc_record.medical_certificate_url IS NOT NULL THEN
    completed := completed + 1;
  END IF;
  
  -- Return percentage
  RETURN (completed * 100 / total_required);
END;
$$;

-- Create function to check if medical certificate is required based on age
CREATE OR REPLACE FUNCTION public.is_medical_certificate_required(birth_date DATE)
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT EXTRACT(YEAR FROM AGE(birth_date)) < 18;
$$;

-- Create trigger to update completion status
CREATE OR REPLACE FUNCTION public.update_document_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  completion_pct INTEGER;
  is_complete BOOLEAN;
BEGIN
  -- Calculate completion percentage
  completion_pct := calculate_document_completion(NEW.employee_id);
  
  -- Update the record
  NEW.completion_percentage := completion_pct;
  NEW.all_documents_complete := (completion_pct = 100);
  NEW.updated_at := now();
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_employee_document_completion
  BEFORE UPDATE ON public.employee_required_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_document_completion();

-- Create function to initialize required documents for new employee
CREATE OR REPLACE FUNCTION public.initialize_employee_documents(emp_id UUID, emp_business_id UUID, emp_birth_date DATE DEFAULT NULL)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  doc_id UUID;
  medical_required BOOLEAN := false;
BEGIN
  -- Check if medical certificate is required
  IF emp_birth_date IS NOT NULL THEN
    medical_required := is_medical_certificate_required(emp_birth_date);
  END IF;
  
  -- Insert new document record
  INSERT INTO public.employee_required_documents (
    employee_id,
    business_id,
    medical_certificate_required
  ) VALUES (
    emp_id,
    emp_business_id,
    medical_required
  ) RETURNING id INTO doc_id;
  
  RETURN doc_id;
END;
$$;

-- Create table for document reminders/notifications
CREATE TABLE public.employee_document_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('missing_documents', 'incomplete_profile')),
  missing_documents TEXT[] NOT NULL DEFAULT '{}',
  
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for reminders
ALTER TABLE public.employee_document_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business users can view employee document reminders"
ON public.employee_document_reminders
FOR ALL
USING (business_id = ANY (get_user_business_ids()))
WITH CHECK (business_id = ANY (get_user_business_ids()));

-- Create function to get missing documents for an employee
CREATE OR REPLACE FUNCTION public.get_missing_documents(emp_id UUID)
RETURNS TEXT[]
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  doc_record RECORD;
  missing_docs TEXT[] := '{}';
BEGIN
  -- Get document record
  SELECT * INTO doc_record
  FROM public.employee_required_documents
  WHERE employee_id = emp_id;
  
  IF NOT FOUND THEN
    RETURN ARRAY['id_document', 'form_101', 'employment_agreement'];
  END IF;
  
  -- Check each required document
  IF doc_record.id_document_url IS NULL THEN
    missing_docs := array_append(missing_docs, 'id_document');
  END IF;
  
  IF doc_record.form_101_url IS NULL THEN
    missing_docs := array_append(missing_docs, 'form_101');
  END IF;
  
  IF doc_record.employment_agreement_signature_url IS NULL THEN
    missing_docs := array_append(missing_docs, 'employment_agreement');
  END IF;
  
  IF doc_record.medical_certificate_required AND doc_record.medical_certificate_url IS NULL THEN
    missing_docs := array_append(missing_docs, 'medical_certificate');
  END IF;
  
  RETURN missing_docs;
END;
$$;