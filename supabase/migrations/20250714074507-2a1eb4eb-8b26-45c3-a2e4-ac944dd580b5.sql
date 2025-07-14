-- Create WhatsApp business connections table
CREATE TABLE IF NOT EXISTS public.whatsapp_business_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  phone_number TEXT,
  device_name TEXT,
  connection_status TEXT NOT NULL DEFAULT 'disconnected' CHECK (connection_status IN ('disconnected', 'connecting', 'connected')),
  qr_code TEXT,
  last_connected_at TIMESTAMP WITH TIME ZONE,
  last_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.whatsapp_business_connections ENABLE ROW LEVEL SECURITY;

-- Create policies for WhatsApp connections
CREATE POLICY "Business owners and super_admin can manage WhatsApp connections"
  ON public.whatsapp_business_connections
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = whatsapp_business_connections.business_id
      AND (b.owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role = 'super_admin'
      ))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = whatsapp_business_connections.business_id
      AND (b.owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role = 'super_admin'
      ))
    )
  );

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_whatsapp_business_connections_updated_at
  BEFORE UPDATE ON public.whatsapp_business_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_business_connections_business_id 
  ON public.whatsapp_business_connections(business_id);