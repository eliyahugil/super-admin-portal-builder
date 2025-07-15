-- Create table for user dashboard layouts
CREATE TABLE public.user_dashboard_layouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  page_type TEXT NOT NULL,
  layout_config JSONB NOT NULL DEFAULT '{"sections": []}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, page_type)
);

-- Enable Row Level Security
ALTER TABLE public.user_dashboard_layouts ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own dashboard layouts" 
ON public.user_dashboard_layouts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own dashboard layouts" 
ON public.user_dashboard_layouts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dashboard layouts" 
ON public.user_dashboard_layouts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dashboard layouts" 
ON public.user_dashboard_layouts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_dashboard_layouts_updated_at
BEFORE UPDATE ON public.user_dashboard_layouts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();