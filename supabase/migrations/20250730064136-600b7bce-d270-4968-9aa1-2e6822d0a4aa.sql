-- עדכון משמרות קיימות להעתיק שעות מהתבניות שלהן
UPDATE scheduled_shifts 
SET 
  start_time = st.start_time,
  end_time = st.end_time,
  shift_type = st.shift_type
FROM shift_templates st 
WHERE scheduled_shifts.shift_template_id = st.id 
  AND (scheduled_shifts.start_time IS NULL OR scheduled_shifts.end_time IS NULL);