-- Add missing columns to whatsapp_business_connections
ALTER TABLE public.whatsapp_business_connections 
ADD COLUMN IF NOT EXISTS session_id TEXT,
ADD COLUMN IF NOT EXISTS webhook_token TEXT DEFAULT gen_random_uuid();

-- Update RLS policies if not exist (ignore if they already exist)
DO $$
BEGIN
  -- Enable RLS if not enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_class pc 
    JOIN pg_namespace pn ON pc.relnamespace = pn.oid 
    WHERE pn.nspname = 'public' AND pc.relname = 'whatsapp_contacts' AND pc.relrowsecurity = true
  ) THEN
    ALTER TABLE public.whatsapp_contacts ENABLE ROW LEVEL SECURITY;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class pc 
    JOIN pg_namespace pn ON pc.relnamespace = pn.oid 
    WHERE pn.nspname = 'public' AND pc.relname = 'whatsapp_messages' AND pc.relrowsecurity = true
  ) THEN
    ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;