-- Allow shift templates to be created without a specific branch (general templates)
ALTER TABLE public.shift_templates 
ALTER COLUMN branch_id DROP NOT NULL;