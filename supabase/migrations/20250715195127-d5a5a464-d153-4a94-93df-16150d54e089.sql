-- Update RLS policy for employee_notes to allow super_admin
DROP POLICY IF EXISTS "Business members can create employee notes" ON employee_notes;

CREATE POLICY "Business members and super_admin can create employee notes" 
ON employee_notes 
FOR INSERT 
WITH CHECK (
  (
    -- Super admin can create notes for any business
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  ) OR (
    -- Business owners can create notes for their business
    business_id IN (
      SELECT b.id
      FROM businesses b
      WHERE b.owner_id = auth.uid()
    ) AND created_by = auth.uid()
  ) OR (
    -- Business admins can create notes for their assigned business
    business_id IN (
      SELECT p.business_id
      FROM profiles p
      WHERE p.id = auth.uid() AND p.business_id IS NOT NULL
    ) AND created_by = auth.uid()
  )
);

-- Also update the view policy to be consistent
DROP POLICY IF EXISTS "Business members can view employee notes" ON employee_notes;

CREATE POLICY "Business members and super_admin can view employee notes" 
ON employee_notes 
FOR SELECT 
USING (
  (
    -- Super admin can view notes for any business
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  ) OR (
    -- Business owners can view notes for their business
    business_id IN (
      SELECT b.id
      FROM businesses b
      WHERE b.owner_id = auth.uid()
    )
  ) OR (
    -- Business admins can view notes for their assigned business
    business_id IN (
      SELECT p.business_id
      FROM profiles p
      WHERE p.id = auth.uid() AND p.business_id IS NOT NULL
    )
  )
);