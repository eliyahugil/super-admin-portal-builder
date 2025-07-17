-- Fix employee_id in employee_weekly_tokens for specific tokens
UPDATE employee_weekly_tokens 
SET employee_id = '0113d941-6d65-41a7-a23e-b40ff142be13'
WHERE token = '1b36ea38-5ad7-4f9d-bead-6bf2bd98c20a';

UPDATE employee_weekly_tokens 
SET employee_id = '0113d941-6d65-41a7-a23e-b40ff142be13'
WHERE token = 'c8b74057-f6dc-4b28-90ef-f0f1d41d17db';

-- Update other tokens where employee_id is null - use first employee ID as default
UPDATE employee_weekly_tokens 
SET employee_id = '0113d941-6d65-41a7-a23e-b40ff142be13'
WHERE employee_id IS NULL;