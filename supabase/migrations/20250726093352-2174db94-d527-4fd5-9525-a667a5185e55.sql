-- Update Hatam Molo's branch assignments to include all shift types
UPDATE employee_branch_assignments 
SET shift_types = ARRAY['morning', 'afternoon', 'evening']
WHERE employee_id = '2887c04f-5099-4490-9038-59f83b386731';