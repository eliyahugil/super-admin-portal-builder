-- Also need to create the WhatsApp contacts and messages tables for the demo
CREATE TABLE IF NOT EXISTS public.whatsapp_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  name TEXT,
  profile_picture_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(business_id, phone_number)
);

CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.whatsapp_contacts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('incoming', 'outgoing')),
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'audio', 'video', 'document')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.whatsapp_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'whatsapp_contacts' 
    AND policyname = 'Business owners and super_admin can manage WhatsApp contacts'
  ) THEN
    CREATE POLICY "Business owners and super_admin can manage WhatsApp contacts"
      ON public.whatsapp_contacts
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM public.businesses b
          WHERE b.id = whatsapp_contacts.business_id
          AND (b.owner_id = auth.uid() OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role = 'super_admin'
          ))
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.businesses b
          WHERE b.id = whatsapp_contacts.business_id
          AND (b.owner_id = auth.uid() OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role = 'super_admin'
          ))
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'whatsapp_messages' 
    AND policyname = 'Business owners and super_admin can manage WhatsApp messages'
  ) THEN
    CREATE POLICY "Business owners and super_admin can manage WhatsApp messages"
      ON public.whatsapp_messages
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM public.businesses b
          WHERE b.id = whatsapp_messages.business_id
          AND (b.owner_id = auth.uid() OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role = 'super_admin'
          ))
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.businesses b
          WHERE b.id = whatsapp_messages.business_id
          AND (b.owner_id = auth.uid() OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role = 'super_admin'
          ))
        )
      );
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_whatsapp_contacts_business_id ON public.whatsapp_contacts(business_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_business_id ON public.whatsapp_messages(business_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_contact_id ON public.whatsapp_messages(contact_id);