-- Add submission_type column to distinguish between regular and special submissions
ALTER TABLE shift_submissions 
ADD COLUMN submission_type TEXT DEFAULT 'regular';

-- Add check constraint for valid submission types
ALTER TABLE shift_submissions 
ADD CONSTRAINT valid_submission_type 
CHECK (submission_type IN ('regular', 'special', 'urgent', 'replacement'));

-- Create an index for better performance when filtering by submission type
CREATE INDEX idx_shift_submissions_submission_type 
ON shift_submissions(submission_type);

-- Update existing submissions to have default type
UPDATE shift_submissions 
SET submission_type = 'regular' 
WHERE submission_type IS NULL;