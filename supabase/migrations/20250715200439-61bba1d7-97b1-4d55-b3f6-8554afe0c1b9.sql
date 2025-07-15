-- Add visibility control for employee files
ALTER TABLE employee_files 
ADD COLUMN is_visible_to_employee BOOLEAN NOT NULL DEFAULT true;

-- Add a comment to explain the column
COMMENT ON COLUMN employee_files.is_visible_to_employee IS 'Controls whether the file is visible to the employee (true) or only to business admin/manager (false)';

-- Create index for better query performance
CREATE INDEX idx_employee_files_visibility ON employee_files(employee_id, is_visible_to_employee);