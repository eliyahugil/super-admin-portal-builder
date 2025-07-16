-- הוספת שדה is_archived לטבלת branches
ALTER TABLE public.branches 
ADD COLUMN is_archived boolean NOT NULL DEFAULT false;

-- יצירת אינדקס לביצועים טובים יותר
CREATE INDEX idx_branches_is_archived ON public.branches(is_archived);

-- עדכון ה-RLS policies כדי לתמוך בארכיון
CREATE POLICY "Users can view archived branches of their current business" 
ON public.branches 
FOR SELECT 
USING (
  CASE
    WHEN (( SELECT profiles.role
       FROM profiles
      WHERE (profiles.id = auth.uid())) = 'super_admin'::user_role) THEN (business_id IN ( SELECT businesses.id
       FROM businesses
      WHERE (businesses.is_active = true)))
    ELSE (business_id IN ( SELECT DISTINCT user_businesses.business_id
       FROM user_businesses
      WHERE (user_businesses.user_id = auth.uid())
    UNION
     SELECT profiles.business_id
       FROM profiles
      WHERE ((profiles.id = auth.uid()) AND (profiles.business_id IS NOT NULL))))
  END
);