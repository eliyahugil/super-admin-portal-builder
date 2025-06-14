
-- צור את הדלי אם אינו קיים (לא יכפיל דלי קיים)
insert into storage.buckets (id, name, public)
values ('employee-files', 'employee-files', true)
on conflict (id) do nothing;

-- אפשר הרשאות קריאה ציבורית על הדלי (תחת storage.objects)
-- מדיניות: כל אחד יכול לקרוא קבצים מהדלי employee-files
create policy "Public read access for employee-files"
on storage.objects
for select
using (bucket_id = 'employee-files');

-- אפשר העלאה רק על-ידי משתמשים שנכנסו (authenticated)
create policy "Authenticated users can upload to employee-files"
on storage.objects
for insert
with check (
  bucket_id = 'employee-files'
  and auth.role() = 'authenticated'
);

-- אפשר מחיקה רק על-ידי משתמשים שנכנסו (authenticated)  
create policy "Authenticated users can delete from employee-files"
on storage.objects
for delete
using (
  bucket_id = 'employee-files'
  and auth.role() = 'authenticated'
);

-- אפשר עדכון רק על-ידי משתמשים שנכנסו (authenticated)
create policy "Authenticated users can update employee-files"
on storage.objects
for update
using (
  bucket_id = 'employee-files'
  and auth.role() = 'authenticated'
)
with check (
  bucket_id = 'employee-files'
  and auth.role() = 'authenticated'
);
