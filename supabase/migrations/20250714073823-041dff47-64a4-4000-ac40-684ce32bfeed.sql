-- Create WhatsApp business connections table
CREATE TABLE IF NOT EXISTS public.whatsapp_business_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL,
  phone_number TEXT,
  device_name TEXT DEFAULT 'WhatsApp Web Client',
  session_data JSONB,
  qr_code TEXT,
  connection_status TEXT NOT NULL DEFAULT 'disconnected' CHECK (connection_status IN ('disconnected', 'connecting', 'connected')),
  session_id TEXT,
  webhook_token TEXT,
  last_connected_at TIMESTAMP WITH TIME ZONE,
  last_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create WhatsApp contacts table
CREATE TABLE IF NOT EXISTS public.whatsapp_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL,
  phone_number TEXT NOT NULL,
  contact_name TEXT,
  profile_picture_url TEXT,
  last_seen TIMESTAMP WITH TIME ZONE,
  is_blocked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(business_id, phone_number)
);

-- Create WhatsApp messages table
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL,
  contact_id UUID REFERENCES public.whatsapp_contacts(id),
  phone_number TEXT NOT NULL,
  message_content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'document', 'audio', 'video')),
  direction TEXT NOT NULL CHECK (direction IN ('incoming', 'outgoing')),
  message_status TEXT DEFAULT 'sent' CHECK (message_status IN ('sent', 'delivered', 'read', 'failed')),
  whatsapp_message_id TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.whatsapp_business_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their business WhatsApp connections" 
ON public.whatsapp_business_connections 
FOR ALL 
USING (
  business_id IN (
    SELECT id FROM public.businesses 
    WHERE owner_id = auth.uid()
  ) OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

CREATE POLICY "Users can manage their business WhatsApp contacts" 
ON public.whatsapp_contacts 
FOR ALL 
USING (
  business_id IN (
    SELECT id FROM public.businesses 
    WHERE owner_id = auth.uid()
  ) OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

CREATE POLICY "Users can manage their business WhatsApp messages" 
ON public.whatsapp_messages 
FOR ALL 
USING (
  business_id IN (
    SELECT id FROM public.businesses 
    WHERE owner_id = auth.uid()
  ) OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_connections_business_id ON public.whatsapp_business_connections(business_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_contacts_business_id ON public.whatsapp_contacts(business_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_business_id ON public.whatsapp_messages(business_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_contact_id ON public.whatsapp_messages(contact_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_timestamp ON public.whatsapp_messages(timestamp DESC);