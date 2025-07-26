-- חלק ב: טבלאות נוספות למערכת החשבונות הממוחשבת

-- טבלת חשבוניות (חובה לפי התקנות - ספר כרוך)
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  sequential_number BIGSERIAL NOT NULL, -- מספור עוקב חובה
  invoice_number TEXT NOT NULL,
  invoice_date DATE NOT NULL,
  customer_id UUID REFERENCES public.customers(id),
  customer_name TEXT NOT NULL,
  customer_tax_id TEXT,
  subtotal DECIMAL(15,2) NOT NULL,
  vat_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(15,2) NOT NULL,
  payment_terms TEXT,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'overdue', 'cancelled'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  permanent_file_id UUID REFERENCES public.permanent_files(id),
  notes TEXT,
  -- לפי התקנות - אין מחיקה, רק סטורנו
  is_cancelled BOOLEAN NOT NULL DEFAULT false,
  cancelled_by_invoice_id UUID REFERENCES public.invoices(id),
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancelled_by UUID REFERENCES auth.users(id),
  cancellation_reason TEXT,
  -- מטאדאטה נוספת
  currency TEXT NOT NULL DEFAULT 'ILS',
  language TEXT NOT NULL DEFAULT 'he'
);

-- טבלת פריטי חשבונית
CREATE TABLE IF NOT EXISTS public.invoice_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  sequential_number BIGSERIAL NOT NULL,
  item_description TEXT NOT NULL,
  quantity DECIMAL(10,3) NOT NULL DEFAULT 1,
  unit_price DECIMAL(15,2) NOT NULL,
  line_total DECIMAL(15,2) NOT NULL,
  vat_rate DECIMAL(5,2) NOT NULL DEFAULT 17.00,
  vat_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  item_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- טבלת קבלות (חובה לפי התקנות - ספר כרוך)
CREATE TABLE IF NOT EXISTS public.receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  sequential_number BIGSERIAL NOT NULL, -- מספור עוקב חובה
  receipt_number TEXT NOT NULL,
  receipt_date DATE NOT NULL,
  invoice_id UUID REFERENCES public.invoices(id),
  customer_id UUID REFERENCES public.customers(id),
  customer_name TEXT NOT NULL,
  amount_received DECIMAL(15,2) NOT NULL,
  payment_method TEXT NOT NULL, -- 'cash', 'credit_card', 'bank_transfer', 'check'
  currency TEXT NOT NULL DEFAULT 'ILS',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  permanent_file_id UUID REFERENCES public.permanent_files(id),
  notes TEXT,
  -- לפי התקנות - אין מחיקה, רק סטורנו
  is_cancelled BOOLEAN NOT NULL DEFAULT false,
  cancelled_by_receipt_id UUID REFERENCES public.receipts(id),
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancelled_by UUID REFERENCES auth.users(id),
  cancellation_reason TEXT
);

-- טבלת ספר יומן (יומן כללי - חובה לפי התקנות)
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  sequential_number BIGSERIAL NOT NULL, -- מספור עוקב חובה
  entry_date DATE NOT NULL,
  reference_number TEXT NOT NULL,
  description TEXT NOT NULL,
  total_debit DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_credit DECIMAL(15,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  permanent_file_id UUID REFERENCES public.permanent_files(id),
  source_document_type TEXT, -- 'invoice', 'receipt', 'manual', etc.
  source_document_id UUID,
  -- לפי התקנות - אין מחיקה, רק סטורנו
  is_cancelled BOOLEAN NOT NULL DEFAULT false,
  cancelled_by_entry_id UUID REFERENCES public.journal_entries(id),
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancelled_by UUID REFERENCES auth.users(id),
  cancellation_reason TEXT
);

-- טבלת פרטי רישומי יומן (דביט/קרדיט)
CREATE TABLE IF NOT EXISTS public.journal_entry_lines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  journal_entry_id UUID NOT NULL REFERENCES public.journal_entries(id) ON DELETE CASCADE,
  sequential_number BIGSERIAL NOT NULL,
  account_code TEXT NOT NULL,
  account_name TEXT NOT NULL,
  debit_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  credit_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- טבלת ספר חשבונות (תרשים חשבונות)
CREATE TABLE IF NOT EXISTS public.chart_of_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  account_code TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL, -- 'asset', 'liability', 'equity', 'revenue', 'expense'
  parent_account_id UUID REFERENCES public.chart_of_accounts(id),
  level INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(business_id, account_code)
);

-- טבלת מלאי (רשימת מפקד המצאי - חובה לפי התקנות)
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  sequential_number BIGSERIAL NOT NULL, -- מספור עוקב חובה
  item_code TEXT NOT NULL,
  item_name TEXT NOT NULL,
  category TEXT,
  unit_of_measure TEXT NOT NULL DEFAULT 'unit',
  cost_price DECIMAL(15,2),
  selling_price DECIMAL(15,2),
  current_quantity DECIMAL(10,3) NOT NULL DEFAULT 0,
  minimum_quantity DECIMAL(10,3) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(business_id, item_code)
);

-- טבלת תנועות מלאי (ספר תנועת מלאי - חובה לפי התקנות)
CREATE TABLE IF NOT EXISTS public.inventory_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  sequential_number BIGSERIAL NOT NULL, -- מספור עוקב חובה
  inventory_item_id UUID NOT NULL REFERENCES public.inventory_items(id),
  movement_type TEXT NOT NULL, -- 'in', 'out', 'adjustment', 'opening_balance'
  quantity DECIMAL(10,3) NOT NULL,
  unit_cost DECIMAL(15,2),
  total_value DECIMAL(15,2),
  reference_number TEXT,
  movement_date DATE NOT NULL,
  description TEXT,
  source_document_type TEXT, -- 'purchase', 'sale', 'adjustment', etc.
  source_document_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  permanent_file_id UUID REFERENCES public.permanent_files(id),
  -- לפי התקנות - אין מחיקה, רק סטורנו
  is_cancelled BOOLEAN NOT NULL DEFAULT false,
  cancelled_by_movement_id UUID REFERENCES public.inventory_movements(id),
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancelled_by UUID REFERENCES auth.users(id),
  cancellation_reason TEXT
);

-- טבלת הזמנות (ספר הזמנות - לפי התקנות)
CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  sequential_number BIGSERIAL NOT NULL, -- מספור עוקב חובה
  order_number TEXT NOT NULL,
  order_date DATE NOT NULL,
  supplier_name TEXT NOT NULL,
  supplier_id TEXT,
  total_amount DECIMAL(15,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'received', 'cancelled'
  expected_delivery_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  permanent_file_id UUID REFERENCES public.permanent_files(id),
  notes TEXT,
  -- לפי התקנות - אין מחיקה, רק סטורנו
  is_cancelled BOOLEAN NOT NULL DEFAULT false,
  cancelled_by_order_id UUID REFERENCES public.purchase_orders(id),
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancelled_by UUID REFERENCES auth.users(id),
  cancellation_reason TEXT
);

-- פונקציות עזר למערכת החשבונות

-- פונקציה לקבלת המספר העוקב הבא
CREATE OR REPLACE FUNCTION public.get_next_sequential_number(
  table_name_param TEXT,
  business_id_param UUID
) RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  next_number BIGINT;
  query_text TEXT;
BEGIN
  -- בניית השאילתה באופן דינמי
  query_text := format(
    'SELECT COALESCE(MAX(sequential_number), 0) + 1 FROM %I WHERE business_id = $1',
    table_name_param
  );
  
  EXECUTE query_text INTO next_number USING business_id_param;
  
  RETURN next_number;
END;
$$;

-- פונקציה לבדיקת רציפות המספרים העוקבים (חובה לפי התקנות)
CREATE OR REPLACE FUNCTION public.check_sequential_integrity(
  table_name_param TEXT,
  business_id_param UUID
) RETURNS TABLE(
  missing_numbers BIGINT[],
  duplicate_numbers BIGINT[],
  max_number BIGINT,
  total_records BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  query_text TEXT;
  rec RECORD;
  expected_number BIGINT := 1;
  missing_nums BIGINT[] := '{}';
  duplicate_nums BIGINT[] := '{}';
  max_num BIGINT := 0;
  total_recs BIGINT := 0;
BEGIN
  -- בניית השאילתה לקבלת כל המספרים הרצופים
  query_text := format(
    'SELECT sequential_number, COUNT(*) as count_occurrences 
     FROM %I 
     WHERE business_id = $1 
     GROUP BY sequential_number 
     ORDER BY sequential_number',
    table_name_param
  );
  
  FOR rec IN EXECUTE query_text USING business_id_param LOOP
    -- בדיקת מספרים חסרים
    WHILE expected_number < rec.sequential_number LOOP
      missing_nums := missing_nums || expected_number;
      expected_number := expected_number + 1;
    END LOOP;
    
    -- בדיקת מספרים כפולים
    IF rec.count_occurrences > 1 THEN
      duplicate_nums := duplicate_nums || rec.sequential_number;
    END IF;
    
    max_num := rec.sequential_number;
    total_recs := total_recs + rec.count_occurrences;
    expected_number := rec.sequential_number + 1;
  END LOOP;
  
  RETURN QUERY SELECT missing_nums, duplicate_nums, max_num, total_recs;
END;
$$;

-- פונקציה ליצירת גיבוי רבעוני (חובה לפי התקנות)
CREATE OR REPLACE FUNCTION public.create_quarterly_backup(
  business_id_param UUID,
  quarter_param INTEGER,
  year_param INTEGER,
  backup_location_param TEXT
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  backup_id UUID;
  backup_data JSONB;
  backup_size DECIMAL(10,2);
  backup_hash_val TEXT;
BEGIN
  -- יצירת נתוני הגיבוי
  SELECT jsonb_build_object(
    'accounting_records', (
      SELECT jsonb_agg(row_to_json(ar))
      FROM accounting_records ar
      WHERE ar.business_id = business_id_param
        AND EXTRACT(QUARTER FROM ar.document_date) = quarter_param
        AND EXTRACT(YEAR FROM ar.document_date) = year_param
    ),
    'invoices', (
      SELECT jsonb_agg(row_to_json(i))
      FROM invoices i
      WHERE i.business_id = business_id_param
        AND EXTRACT(QUARTER FROM i.invoice_date) = quarter_param
        AND EXTRACT(YEAR FROM i.invoice_date) = year_param
    ),
    'receipts', (
      SELECT jsonb_agg(row_to_json(r))
      FROM receipts r
      WHERE r.business_id = business_id_param
        AND EXTRACT(QUARTER FROM r.receipt_date) = quarter_param
        AND EXTRACT(YEAR FROM r.receipt_date) = year_param
    ),
    'journal_entries', (
      SELECT jsonb_agg(row_to_json(je))
      FROM journal_entries je
      WHERE je.business_id = business_id_param
        AND EXTRACT(QUARTER FROM je.entry_date) = quarter_param
        AND EXTRACT(YEAR FROM je.entry_date) = year_param
    )
  ) INTO backup_data;
  
  -- חישוב גודל הגיבוי (KB)
  backup_size := length(backup_data::text) / 1024.0;
  
  -- חישוב hash לוודא תקינות
  backup_hash_val := encode(digest(backup_data::text, 'sha256'), 'hex');
  
  -- יצירת רשומת הגיבוי
  INSERT INTO quarterly_backups (
    business_id,
    quarter,
    year,
    backup_location,
    backup_size_mb,
    backup_hash,
    created_by
  ) VALUES (
    business_id_param,
    quarter_param,
    year_param,
    backup_location_param,
    backup_size,
    backup_hash_val,
    auth.uid()
  ) RETURNING id INTO backup_id;
  
  RETURN backup_id;
END;
$$;

-- אינדקסים נוספים לביצועים
CREATE INDEX IF NOT EXISTS idx_invoices_business_date ON public.invoices(business_id, invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON public.invoices(business_id, customer_id);
CREATE INDEX IF NOT EXISTS idx_receipts_business_date ON public.receipts(business_id, receipt_date);
CREATE INDEX IF NOT EXISTS idx_journal_entries_business_date ON public.journal_entries(business_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_item_date ON public.inventory_movements(inventory_item_id, movement_date);

-- RLS Policies לטבלאות החדשות
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entry_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;

-- מדיניות אבטחה לטבלאות החדשות
CREATE POLICY "Business users can manage invoices" 
ON public.invoices 
FOR ALL 
USING (business_id = ANY (get_user_business_ids()))
WITH CHECK (business_id = ANY (get_user_business_ids()));

CREATE POLICY "Business users can manage invoice items" 
ON public.invoice_items 
FOR ALL 
USING (EXISTS (SELECT 1 FROM invoices WHERE id = invoice_items.invoice_id AND business_id = ANY (get_user_business_ids())))
WITH CHECK (EXISTS (SELECT 1 FROM invoices WHERE id = invoice_items.invoice_id AND business_id = ANY (get_user_business_ids())));

CREATE POLICY "Business users can manage receipts" 
ON public.receipts 
FOR ALL 
USING (business_id = ANY (get_user_business_ids()))
WITH CHECK (business_id = ANY (get_user_business_ids()));

CREATE POLICY "Business users can manage journal entries" 
ON public.journal_entries 
FOR ALL 
USING (business_id = ANY (get_user_business_ids()))
WITH CHECK (business_id = ANY (get_user_business_ids()));

CREATE POLICY "Business users can manage journal entry lines" 
ON public.journal_entry_lines 
FOR ALL 
USING (EXISTS (SELECT 1 FROM journal_entries WHERE id = journal_entry_lines.journal_entry_id AND business_id = ANY (get_user_business_ids())))
WITH CHECK (EXISTS (SELECT 1 FROM journal_entries WHERE id = journal_entry_lines.journal_entry_id AND business_id = ANY (get_user_business_ids())));

CREATE POLICY "Business users can manage chart of accounts" 
ON public.chart_of_accounts 
FOR ALL 
USING (business_id = ANY (get_user_business_ids()))
WITH CHECK (business_id = ANY (get_user_business_ids()));

CREATE POLICY "Business users can manage inventory items" 
ON public.inventory_items 
FOR ALL 
USING (business_id = ANY (get_user_business_ids()))
WITH CHECK (business_id = ANY (get_user_business_ids()));

CREATE POLICY "Business users can manage inventory movements" 
ON public.inventory_movements 
FOR ALL 
USING (business_id = ANY (get_user_business_ids()))
WITH CHECK (business_id = ANY (get_user_business_ids()));

CREATE POLICY "Business users can manage purchase orders" 
ON public.purchase_orders 
FOR ALL 
USING (business_id = ANY (get_user_business_ids()))
WITH CHECK (business_id = ANY (get_user_business_ids()));

-- הוספת טריגרים ללוג לטבלאות החדשות
CREATE TRIGGER log_invoices_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.invoices
    FOR EACH ROW EXECUTE FUNCTION public.log_accounting_activity();

CREATE TRIGGER log_receipts_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.receipts
    FOR EACH ROW EXECUTE FUNCTION public.log_accounting_activity();

CREATE TRIGGER log_journal_entries_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.journal_entries
    FOR EACH ROW EXECUTE FUNCTION public.log_accounting_activity();

CREATE TRIGGER log_inventory_movements_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.inventory_movements
    FOR EACH ROW EXECUTE FUNCTION public.log_accounting_activity();