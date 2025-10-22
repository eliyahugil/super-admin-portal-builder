-- תיקון פונקציות עם search_path לאבטחה
create or replace function set_fridges_updated_at() returns trigger 
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function trg_check_temp_thresholds() returns trigger 
language plpgsql
security definer  
set search_path = public
as $$
declare
  v_min numeric;
  v_max numeric;
  v_name text;
  v_type text;
  v_thresh text;
begin
  select min_temp, max_temp, name, type into v_min, v_max, v_name, v_type
  from fridges where id = new.fridge_id;

  v_thresh := v_min::text || '–' || v_max::text || '°C';

  if new.temperature > v_max then
    insert into fridge_alerts (business_id, fridge_id, temp_log_id, alert_type, threshold, actual_temp, details)
    values (new.business_id, new.fridge_id, new.id, 'חריגה-גבוהה', v_thresh, new.temperature,
            'טמפ׳ מעל המותר | '||coalesce(v_name,'')||' ('||coalesce(v_type,'')||')');
  elsif new.temperature < v_min then
    insert into fridge_alerts (business_id, fridge_id, temp_log_id, alert_type, threshold, actual_temp, details)
    values (new.business_id, new.fridge_id, new.id, 'חריגה-נמוכה', v_thresh, new.temperature,
            'טמפ׳ מתחת למותר | '||coalesce(v_name,'')||' ('||coalesce(v_type,'')||')');
  else
    update fridge_alerts
    set status='סגורה', resolved_at=now(), details=coalesce(details,'')||' | נסגר אוטומטית (חזרה לטווח)'
    where fridge_id=new.fridge_id and status='פתוחה';

    insert into fridge_alerts (business_id, fridge_id, temp_log_id, alert_type, threshold, actual_temp, details, status, resolved_at)
    values (new.business_id, new.fridge_id, new.id, 'חזרה-לטווח', v_thresh, new.temperature,
            'טמפ׳ תקינה מחדש', 'סגורה', now());
  end if;

  return new;
end;
$$;