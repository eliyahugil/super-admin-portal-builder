-- Create WhatsApp logs table for message tracking
CREATE TABLE IF NOT EXISTS public.whatsapp_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'manual',
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  error TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.whatsapp_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for WhatsApp logs
CREATE POLICY "Business owners and super_admin can manage WhatsApp logs"
  ON public.whatsapp_logs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = whatsapp_logs.business_id
      AND (b.owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role = 'super_admin'
      ))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = whatsapp_logs.business_id
      AND (b.owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role = 'super_admin'
      ))
    )
  );

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_whatsapp_logs_updated_at
  BEFORE UPDATE ON public.whatsapp_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_business_id 
  ON public.whatsapp_logs(business_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_status 
  ON public.whatsapp_logs(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_created_at 
  ON public.whatsapp_logs(created_at DESC);