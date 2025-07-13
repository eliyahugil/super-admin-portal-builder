-- Create WhatsApp contacts table
CREATE TABLE public.whatsapp_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  name TEXT,
  profile_picture_url TEXT,
  last_seen TIMESTAMP WITH TIME ZONE,
  is_blocked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create WhatsApp messages table
CREATE TABLE public.whatsapp_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.whatsapp_contacts(id) ON DELETE CASCADE,
  message_id TEXT NOT NULL, -- WhatsApp message ID
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text', -- text, image, audio, video, document
  direction TEXT NOT NULL, -- incoming, outgoing
  status TEXT NOT NULL DEFAULT 'sent', -- sent, delivered, read
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  reply_to_message_id TEXT,
  media_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create WhatsApp business connections table
CREATE TABLE public.whatsapp_business_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  device_name TEXT,
  session_data JSONB,
  qr_code TEXT,
  connection_status TEXT NOT NULL DEFAULT 'disconnected', -- disconnected, connecting, connected
  last_connected_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.whatsapp_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_business_connections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for WhatsApp contacts
CREATE POLICY "Users can manage contacts for their business" 
ON public.whatsapp_contacts 
FOR ALL 
USING (business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid()));

-- Create RLS policies for WhatsApp messages
CREATE POLICY "Users can manage messages for their business" 
ON public.whatsapp_messages 
FOR ALL 
USING (business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid()));

-- Create RLS policies for WhatsApp business connections
CREATE POLICY "Users can manage connections for their business" 
ON public.whatsapp_business_connections 
FOR ALL 
USING (business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid()));

-- Create indexes for better performance
CREATE INDEX idx_whatsapp_contacts_business_id ON public.whatsapp_contacts(business_id);
CREATE INDEX idx_whatsapp_contacts_phone ON public.whatsapp_contacts(phone_number);
CREATE INDEX idx_whatsapp_messages_business_id ON public.whatsapp_messages(business_id);
CREATE INDEX idx_whatsapp_messages_contact_id ON public.whatsapp_messages(contact_id);
CREATE INDEX idx_whatsapp_messages_timestamp ON public.whatsapp_messages(timestamp);
CREATE INDEX idx_whatsapp_business_connections_business_id ON public.whatsapp_business_connections(business_id);

-- Create triggers for automatic timestamps
CREATE TRIGGER update_whatsapp_contacts_updated_at
BEFORE UPDATE ON public.whatsapp_contacts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_whatsapp_business_connections_updated_at
BEFORE UPDATE ON public.whatsapp_business_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();