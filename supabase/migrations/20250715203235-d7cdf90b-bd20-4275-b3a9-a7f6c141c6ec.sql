-- Create employee folders table for organizing files like Google Drive
CREATE TABLE public.employee_folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  business_id UUID NOT NULL,
  folder_name TEXT NOT NULL,
  parent_folder_id UUID NULL,
  folder_path TEXT NOT NULL, -- Full path like "/Documents/Contracts" 
  folder_color TEXT DEFAULT '#blue',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NULL,
  
  FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE,
  FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_folder_id) REFERENCES public.employee_folders(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.employee_folders ENABLE ROW LEVEL SECURITY;

-- Create policies for employee folders
CREATE POLICY "Business members can view employee folders" 
ON public.employee_folders 
FOR SELECT 
USING (
  business_id IN (
    SELECT b.id FROM businesses b WHERE b.owner_id = auth.uid()
  ) OR 
  business_id IN (
    SELECT p.business_id FROM profiles p WHERE p.id = auth.uid() AND p.business_id IS NOT NULL
  ) OR 
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'
  )
);

CREATE POLICY "Business members can create employee folders" 
ON public.employee_folders 
FOR INSERT 
WITH CHECK (
  business_id IN (
    SELECT b.id FROM businesses b WHERE b.owner_id = auth.uid()
  ) OR 
  business_id IN (
    SELECT p.business_id FROM profiles p WHERE p.id = auth.uid() AND p.business_id IS NOT NULL
  ) OR 
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'
  )
);

CREATE POLICY "Business members can update employee folders" 
ON public.employee_folders 
FOR UPDATE 
USING (
  business_id IN (
    SELECT b.id FROM businesses b WHERE b.owner_id = auth.uid()
  ) OR 
  business_id IN (
    SELECT p.business_id FROM profiles p WHERE p.id = auth.uid() AND p.business_id IS NOT NULL
  ) OR 
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'
  )
);

CREATE POLICY "Business members can delete employee folders" 
ON public.employee_folders 
FOR DELETE 
USING (
  business_id IN (
    SELECT b.id FROM businesses b WHERE b.owner_id = auth.uid()
  ) OR 
  business_id IN (
    SELECT p.business_id FROM profiles p WHERE p.id = auth.uid() AND p.business_id IS NOT NULL
  ) OR 
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'
  )
);

-- Add folder_id column to employee_files table
ALTER TABLE public.employee_files 
ADD COLUMN folder_id UUID NULL,
ADD FOREIGN KEY (folder_id) REFERENCES public.employee_folders(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX idx_employee_folders_employee_id ON public.employee_folders(employee_id);
CREATE INDEX idx_employee_folders_business_id ON public.employee_folders(business_id);
CREATE INDEX idx_employee_folders_parent_id ON public.employee_folders(parent_folder_id);
CREATE INDEX idx_employee_folders_path ON public.employee_folders(folder_path);
CREATE INDEX idx_employee_files_folder_id ON public.employee_files(folder_id);

-- Create trigger for updating timestamps
CREATE TRIGGER update_employee_folders_updated_at
BEFORE UPDATE ON public.employee_folders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create default folders for existing employees
INSERT INTO public.employee_folders (employee_id, business_id, folder_name, folder_path, created_by)
SELECT 
  e.id as employee_id,
  e.business_id,
  'מסמכים כלליים' as folder_name,
  '/מסמכים כלליים' as folder_path,
  NULL as created_by
FROM public.employees e
WHERE e.is_active = true
ON CONFLICT DO NOTHING;

INSERT INTO public.employee_folders (employee_id, business_id, folder_name, folder_path, created_by)
SELECT 
  e.id as employee_id,
  e.business_id,
  'חוזים וחתימות' as folder_name,
  '/חוזים וחתימות' as folder_path,
  NULL as created_by
FROM public.employees e
WHERE e.is_active = true
ON CONFLICT DO NOTHING;