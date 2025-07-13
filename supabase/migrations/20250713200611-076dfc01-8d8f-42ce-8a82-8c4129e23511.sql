-- Add error tracking field to whatsapp_business_connections table
ALTER TABLE public.whatsapp_business_connections 
ADD COLUMN IF NOT EXISTS last_error TEXT;