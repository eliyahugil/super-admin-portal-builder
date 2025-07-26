-- יצירת מערכת ניהול חשבונות ממוחשבת לפי תקנות רשות המיסים
-- חלק א: טבלאות בסיסיות למערכת החשבונות

-- טבלת הגדרות מערכת החשבונות הממוחשבת
CREATE TABLE IF NOT EXISTS public.accounting_system_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  system_name TEXT NOT NULL,
  software_version TEXT NOT NULL,
  license_number TEXT,
  tax_authority_registration_number TEXT,
  is_registered_software BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(business_id)
);

-- טבלת קבצים קבועים (לפי התקנות - אין מחיקה, מספור עוקב)
CREATE TABLE IF NOT EXISTS public.permanent_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  file_type TEXT NOT NULL, -- 'receipts', 'invoices', 'journal', 'ledger', etc.
  sequential_number BIGSERIAL NOT NULL, -- מספור עוקב אוטומטי
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  content_hash TEXT NOT NULL, -- לוודא שהקובץ לא שונה
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}',
  -- אין מחיקה - רק הוספה
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- טבלת רשומות חשבונאיות עם מספור עוקב
CREATE TABLE IF NOT EXISTS public.accounting_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  sequential_number BIGSERIAL NOT NULL, -- מספור עוקב חובה לפי התקנות
  record_type TEXT NOT NULL, -- 'receipt', 'payment', 'invoice', 'credit_note', etc.
  document_number TEXT NOT NULL,
  document_date DATE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  customer_supplier TEXT,
  description TEXT NOT NULL,
  account_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  permanent_file_id UUID REFERENCES public.permanent_files(id),
  additional_data JSONB DEFAULT '{}',
  -- לפי התקנות - אין מחיקת רשומות, רק סטורנו
  is_cancelled BOOLEAN NOT NULL DEFAULT false,
  cancelled_by_record_id UUID REFERENCES public.accounting_records(id),
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancelled_by UUID REFERENCES auth.users(id),
  cancellation_reason TEXT
);

-- טבלת גיבויים רבעוניים (חובה לפי התקנות)
CREATE TABLE IF NOT EXISTS public.quarterly_backups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  quarter INTEGER NOT NULL, -- 1-4
  year INTEGER NOT NULL,
  backup_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  backup_location TEXT NOT NULL, -- מיקום שונה מהמחשב הראשי
  backup_size_mb DECIMAL(10,2),
  backup_hash TEXT NOT NULL, -- לוודא תקינות הגיבוי
  created_by UUID REFERENCES auth.users(id),
  verification_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'verified', 'failed'
  verification_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  UNIQUE(business_id, quarter, year)
);

-- טבלת לוג פעילות מערכת (חובה לפי התקנות)
CREATE TABLE IF NOT EXISTS public.accounting_activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  sequential_number BIGSERIAL NOT NULL, -- מספור עוקב של פעולות
  action_type TEXT NOT NULL, -- 'create', 'update', 'cancel', 'backup', 'login', etc.
  table_name TEXT,
  record_id TEXT,
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT,
  action_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  additional_info JSONB DEFAULT '{}'
);

-- טבלת הגדרות מערכת קופות ממוחשבות
CREATE TABLE IF NOT EXISTS public.pos_system_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.branches(id),
  pos_name TEXT NOT NULL,
  serial_number TEXT NOT NULL,
  software_version TEXT NOT NULL,
  tax_authority_approval_number TEXT,
  installation_date DATE NOT NULL,
  last_inspection_date DATE,
  next_inspection_due DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  power_backup_available BOOLEAN NOT NULL DEFAULT false, -- מתקן הגנה מפני הפסקת חשמל
  backup_duration_minutes INTEGER DEFAULT 30
);

-- אינדקסים לביצועים טובים
CREATE INDEX IF NOT EXISTS idx_permanent_files_business_sequential ON public.permanent_files(business_id, sequential_number);
CREATE INDEX IF NOT EXISTS idx_accounting_records_business_sequential ON public.accounting_records(business_id, sequential_number);
CREATE INDEX IF NOT EXISTS idx_accounting_records_date ON public.accounting_records(business_id, document_date);
CREATE INDEX IF NOT EXISTS idx_activity_log_business_timestamp ON public.accounting_activity_log(business_id, action_timestamp);
CREATE INDEX IF NOT EXISTS idx_quarterly_backups_business_quarter ON public.quarterly_backups(business_id, year, quarter);

-- RLS Policies
ALTER TABLE public.accounting_system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permanent_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounting_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quarterly_backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounting_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_system_settings ENABLE ROW LEVEL SECURITY;

-- מדיניות אבטחה לטבלאות
CREATE POLICY "Business users can manage accounting settings" 
ON public.accounting_system_settings 
FOR ALL 
USING (business_id = ANY (get_user_business_ids()))
WITH CHECK (business_id = ANY (get_user_business_ids()));

CREATE POLICY "Business users can view permanent files" 
ON public.permanent_files 
FOR SELECT 
USING (business_id = ANY (get_user_business_ids()));

CREATE POLICY "Business users can insert permanent files" 
ON public.permanent_files 
FOR INSERT 
WITH CHECK (business_id = ANY (get_user_business_ids()));

-- אין מחיקה או עדכון של קבצים קבועים לפי התקנות
CREATE POLICY "No updates or deletes on permanent files" 
ON public.permanent_files 
FOR UPDATE 
USING (false);

CREATE POLICY "Business users can view accounting records" 
ON public.accounting_records 
FOR SELECT 
USING (business_id = ANY (get_user_business_ids()));

CREATE POLICY "Business users can insert accounting records" 
ON public.accounting_records 
FOR INSERT 
WITH CHECK (business_id = ANY (get_user_business_ids()));

-- רק סטורנו מותר, לא מחיקה או עדכון ישיר
CREATE POLICY "Only cancellation updates allowed on accounting records" 
ON public.accounting_records 
FOR UPDATE 
USING (business_id = ANY (get_user_business_ids()) AND is_cancelled = false)
WITH CHECK (business_id = ANY (get_user_business_ids()) AND (is_cancelled = true OR cancelled_by_record_id IS NOT NULL));

CREATE POLICY "Business users can manage quarterly backups" 
ON public.quarterly_backups 
FOR ALL 
USING (business_id = ANY (get_user_business_ids()))
WITH CHECK (business_id = ANY (get_user_business_ids()));

CREATE POLICY "Business users can view activity log" 
ON public.accounting_activity_log 
FOR SELECT 
USING (business_id = ANY (get_user_business_ids()));

CREATE POLICY "System can insert activity log" 
ON public.accounting_activity_log 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Business users can manage POS settings" 
ON public.pos_system_settings 
FOR ALL 
USING (business_id = ANY (get_user_business_ids()))
WITH CHECK (business_id = ANY (get_user_business_ids()));

-- טריגרים לעדכון אוטומטי של updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_accounting()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_accounting_settings_updated_at
    BEFORE UPDATE ON public.accounting_system_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_accounting();

CREATE TRIGGER update_pos_settings_updated_at
    BEFORE UPDATE ON public.pos_system_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_accounting();

-- טריגר ליצירת לוג אוטומטי לכל פעולה
CREATE OR REPLACE FUNCTION public.log_accounting_activity()
RETURNS TRIGGER AS $$
DECLARE
    action_type_val TEXT;
    business_id_val UUID;
BEGIN
    -- קביעת סוג הפעולה
    CASE TG_OP
        WHEN 'INSERT' THEN action_type_val := 'create';
        WHEN 'UPDATE' THEN action_type_val := 'update';
        WHEN 'DELETE' THEN action_type_val := 'delete';
    END CASE;

    -- קבלת business_id מהרשומה
    CASE TG_OP
        WHEN 'DELETE' THEN business_id_val := OLD.business_id;
        ELSE business_id_val := NEW.business_id;
    END CASE;

    -- הוספת רשומה ללוג
    INSERT INTO public.accounting_activity_log (
        business_id,
        action_type,
        table_name,
        record_id,
        user_id,
        old_values,
        new_values
    ) VALUES (
        business_id_val,
        action_type_val,
        TG_TABLE_NAME,
        CASE TG_OP WHEN 'DELETE' THEN OLD.id::TEXT ELSE NEW.id::TEXT END,
        auth.uid(),
        CASE TG_OP WHEN 'DELETE' THEN row_to_json(OLD) WHEN 'UPDATE' THEN row_to_json(OLD) ELSE NULL END,
        CASE TG_OP WHEN 'DELETE' THEN NULL ELSE row_to_json(NEW) END
    );

    RETURN CASE TG_OP WHEN 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- הוספת טריגרים ללוג לטבלאות הרלוונטיות
CREATE TRIGGER log_accounting_records_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.accounting_records
    FOR EACH ROW EXECUTE FUNCTION public.log_accounting_activity();

CREATE TRIGGER log_permanent_files_changes
    AFTER INSERT ON public.permanent_files
    FOR EACH ROW EXECUTE FUNCTION public.log_accounting_activity();

CREATE TRIGGER log_quarterly_backups_changes
    AFTER INSERT OR UPDATE ON public.quarterly_backups
    FOR EACH ROW EXECUTE FUNCTION public.log_accounting_activity();