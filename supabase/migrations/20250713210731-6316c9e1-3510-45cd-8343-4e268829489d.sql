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
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(business_id, phone_number)
);

-- Create WhatsApp messages table
CREATE TABLE public.whatsapp_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.whatsapp_contacts(id) ON DELETE CASCADE,
  message_id TEXT NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'audio', 'video', 'document')),
  direction TEXT NOT NULL CHECK (direction IN ('incoming', 'outgoing')),
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read')),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reply_to_message_id TEXT,
  media_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.whatsapp_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for whatsapp_contacts
CREATE POLICY "Users can view contacts of their business" 
ON public.whatsapp_contacts 
FOR SELECT 
USING (business_id = ANY (get_user_business_ids()));

CREATE POLICY "Users can insert contacts for their business" 
ON public.whatsapp_contacts 
FOR INSERT 
WITH CHECK (business_id = ANY (get_user_business_ids()));

CREATE POLICY "Users can update contacts of their business" 
ON public.whatsapp_contacts 
FOR UPDATE 
USING (business_id = ANY (get_user_business_ids()));

CREATE POLICY "Users can delete contacts of their business" 
ON public.whatsapp_contacts 
FOR DELETE 
USING (business_id = ANY (get_user_business_ids()));

-- Create RLS policies for whatsapp_messages
CREATE POLICY "Users can view messages of their business" 
ON public.whatsapp_messages 
FOR SELECT 
USING (business_id = ANY (get_user_business_ids()));

CREATE POLICY "Users can insert messages for their business" 
ON public.whatsapp_messages 
FOR INSERT 
WITH CHECK (business_id = ANY (get_user_business_ids()));

CREATE POLICY "Users can update messages of their business" 
ON public.whatsapp_messages 
FOR UPDATE 
USING (business_id = ANY (get_user_business_ids()));

-- Create indexes for better performance
CREATE INDEX idx_whatsapp_contacts_business_id ON public.whatsapp_contacts(business_id);
CREATE INDEX idx_whatsapp_contacts_phone ON public.whatsapp_contacts(phone_number);
CREATE INDEX idx_whatsapp_messages_business_id ON public.whatsapp_messages(business_id);
CREATE INDEX idx_whatsapp_messages_contact_id ON public.whatsapp_messages(contact_id);
CREATE INDEX idx_whatsapp_messages_timestamp ON public.whatsapp_messages(timestamp);

-- Create trigger for updated_at
CREATE TRIGGER update_whatsapp_contacts_updated_at
BEFORE UPDATE ON public.whatsapp_contacts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update whatsapp_business_connections table to include session_id
ALTER TABLE public.whatsapp_business_connections 
ADD COLUMN IF NOT EXISTS session_id TEXT,
ADD COLUMN IF NOT EXISTS webhook_token TEXT DEFAULT gen_random_uuid();