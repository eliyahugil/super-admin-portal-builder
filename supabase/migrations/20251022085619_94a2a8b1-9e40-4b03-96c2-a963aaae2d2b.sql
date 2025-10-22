-- טבלת מקררים/מקפיאים
create table if not exists fridges (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null,
  name text not null,
  location text,
  type text not null default 'מקרר',
  min_temp numeric not null,
  max_temp numeric not null,
  is_active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, name)
);

-- רישומי טמפרטורה
create table if not exists fridge_temperature_logs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null,
  fridge_id uuid not null references fridges(id) on delete cascade,
  measured_at timestamptz not null default now(),
  temperature numeric not null,
  method text not null default 'ידני',
  probe_id text,
  probe_calibrated boolean default false,
  measured_by uuid,
  note text,
  created_at timestamptz not null default now()
);

-- התראות
create table if not exists fridge_alerts (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null,
  fridge_id uuid not null references fridges(id) on delete cascade,
  temp_log_id uuid references fridge_temperature_logs(id) on delete set null,
  alert_type text not null,
  threshold text,
  actual_temp numeric,
  occurred_at timestamptz not null default now(),
  resolved_at timestamptz,
  status text not null default 'פתוחה',
  details text
);

-- פעולות מתקנות
create table if not exists corrective_actions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null,
  fridge_id uuid not null references fridges(id) on delete cascade,
  alert_id uuid references fridge_alerts(id) on delete set null,
  action_time timestamptz not null default now(),
  action_taken text not null,
  taken_by uuid,
  verification_note text,
  closed boolean not null default false,
  created_at timestamptz not null default now()
);

-- טריגר updated_at
create or replace function set_fridges_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_fridges_updated on fridges;
create trigger trg_fridges_updated before update on fridges
  for each row execute function set_fridges_updated_at();

-- אינדקסים
create index if not exists idx_fridges_business_name on fridges(business_id, name);
create index if not exists idx_temp_logs_fridge_time on fridge_temperature_logs(fridge_id, measured_at desc);
create index if not exists idx_alerts_fridge_time on fridge_alerts(fridge_id, occurred_at desc);

-- טריגר התראות אוטומטי
create or replace function trg_check_temp_thresholds() returns trigger as $$
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
$$ language plpgsql;

drop trigger if exists trg_temp_thresholds on fridge_temperature_logs;
create trigger trg_temp_thresholds after insert on fridge_temperature_logs
  for each row execute function trg_check_temp_thresholds();

-- RLS
alter table fridges enable row level security;
alter table fridge_temperature_logs enable row level security;
alter table fridge_alerts enable row level security;
alter table corrective_actions enable row level security;

create policy sel_fridges on fridges for select using (business_id = any(get_user_business_ids()));
create policy mod_fridges on fridges for all using (business_id = any(get_user_business_ids())) with check (business_id = any(get_user_business_ids()));

create policy sel_temp_logs on fridge_temperature_logs for select using (business_id = any(get_user_business_ids()));
create policy ins_temp_logs on fridge_temperature_logs for insert with check (business_id = any(get_user_business_ids()));
create policy upd_temp_logs on fridge_temperature_logs for update using (business_id = any(get_user_business_ids())) with check (business_id = any(get_user_business_ids()));
create policy del_temp_logs on fridge_temperature_logs for delete using (business_id = any(get_user_business_ids()));

create policy sel_alerts on fridge_alerts for select using (business_id = any(get_user_business_ids()));
create policy mod_alerts on fridge_alerts for all using (business_id = any(get_user_business_ids())) with check (business_id = any(get_user_business_ids()));

create policy sel_actions on corrective_actions for select using (business_id = any(get_user_business_ids()));
create policy ins_actions on corrective_actions for insert with check (business_id = any(get_user_business_ids()));
create policy upd_actions on corrective_actions for update using (business_id = any(get_user_business_ids())) with check (business_id = any(get_user_business_ids()));