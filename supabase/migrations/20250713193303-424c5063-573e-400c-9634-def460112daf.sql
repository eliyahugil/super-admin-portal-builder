-- יצירת טבלאות עבור WhatsApp Business Integration

-- טבלת חיבורי WhatsApp Business
CREATE TABLE IF NOT EXISTS public.whatsapp_business_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL,
  phone_number TEXT,
  device_name TEXT,
  session_data JSONB DEFAULT '{}',
  qr_code TEXT,
  connection_status TEXT NOT NULL DEFAULT 'disconnected' CHECK (connection_status IN ('disconnected', 'connecting', 'connected')),
  last_connected_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(business_id)
);

-- טבלת אנשי קשר WhatsApp
CREATE TABLE IF NOT EXISTS public.whatsapp_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL,
  phone_number TEXT NOT NULL,
  name TEXT,
  profile_picture_url TEXT,
  last_seen TIMESTAMP WITH TIME ZONE,
  is_blocked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(business_id, phone_number)
);

-- טבלת הודעות WhatsApp
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL,
  contact_id UUID NOT NULL,
  message_id TEXT NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'audio', 'video', 'document')),
  direction TEXT NOT NULL CHECK (direction IN ('incoming', 'outgoing')),
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read')),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reply_to_message_id TEXT,
  media_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(business_id, message_id)
);

-- יצירת foreign keys
ALTER TABLE public.whatsapp_business_connections
ADD CONSTRAINT whatsapp_business_connections_business_id_fkey 
FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON DELETE CASCADE;

ALTER TABLE public.whatsapp_contacts
ADD CONSTRAINT whatsapp_contacts_business_id_fkey 
FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON DELETE CASCADE;

ALTER TABLE public.whatsapp_messages
ADD CONSTRAINT whatsapp_messages_business_id_fkey 
FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON DELETE CASCADE;

ALTER TABLE public.whatsapp_messages
ADD CONSTRAINT whatsapp_messages_contact_id_fkey 
FOREIGN KEY (contact_id) REFERENCES public.whatsapp_contacts(id) ON DELETE CASCADE;

-- הפעלת Row Level Security
ALTER TABLE public.whatsapp_business_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- יצירת מדיניות RLS עבור חיבורי WhatsApp Business
CREATE POLICY "Users can view their business WhatsApp connections"
ON public.whatsapp_business_connections FOR SELECT
USING (business_id = ANY (get_user_business_ids()));

CREATE POLICY "Users can manage their business WhatsApp connections"
ON public.whatsapp_business_connections FOR ALL
USING (business_id = ANY (get_user_business_ids()));

-- יצירת מדיניות RLS עבור אנשי קשר WhatsApp
CREATE POLICY "Users can view their business WhatsApp contacts"
ON public.whatsapp_contacts FOR SELECT
USING (business_id = ANY (get_user_business_ids()));

CREATE POLICY "Users can manage their business WhatsApp contacts"
ON public.whatsapp_contacts FOR ALL
USING (business_id = ANY (get_user_business_ids()));

-- יצירת מדיניות RLS עבור הודעות WhatsApp
CREATE POLICY "Users can view their business WhatsApp messages"
ON public.whatsapp_messages FOR SELECT
USING (business_id = ANY (get_user_business_ids()));

CREATE POLICY "Users can manage their business WhatsApp messages"
ON public.whatsapp_messages FOR ALL
USING (business_id = ANY (get_user_business_ids()));

-- יצירת אינדקסים לביצועים טובים יותר
CREATE INDEX IF NOT EXISTS idx_whatsapp_contacts_business_id ON public.whatsapp_contacts(business_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_contacts_phone ON public.whatsapp_contacts(phone_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_business_id ON public.whatsapp_messages(business_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_contact_id ON public.whatsapp_messages(contact_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_timestamp ON public.whatsapp_messages(timestamp);

-- יצירת טריגרים לעדכון updated_at
CREATE TRIGGER update_whatsapp_business_connections_updated_at
BEFORE UPDATE ON public.whatsapp_business_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_whatsapp_contacts_updated_at
BEFORE UPDATE ON public.whatsapp_contacts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();