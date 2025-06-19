
-- Create Google Calendar integration tables with proper business isolation

-- Table for storing Google Calendar integration settings per business
CREATE TABLE IF NOT EXISTS public.google_calendar_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  google_calendar_id TEXT NOT NULL,
  calendar_name TEXT NOT NULL,
  calendar_description TEXT,
  sync_enabled BOOLEAN NOT NULL DEFAULT true,
  sync_direction TEXT NOT NULL DEFAULT 'bidirectional' CHECK (sync_direction IN ('import_only', 'export_only', 'bidirectional')),
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_status TEXT NOT NULL DEFAULT 'active' CHECK (sync_status IN ('active', 'paused', 'error')),
  sync_error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Ensure one calendar per business (can be relaxed if needed)
  UNIQUE(business_id, google_calendar_id)
);

-- Table for storing Google OAuth tokens per user/business
CREATE TABLE IF NOT EXISTS public.google_oauth_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  scope TEXT NOT NULL DEFAULT 'https://www.googleapis.com/auth/calendar',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure one token per user per business
  UNIQUE(business_id, user_id)
);

-- Table for storing Google Calendar events synchronized with the system
CREATE TABLE IF NOT EXISTS public.google_calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  google_event_id TEXT NOT NULL,
  google_calendar_id TEXT NOT NULL,
  employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  is_all_day BOOLEAN NOT NULL DEFAULT false,
  location TEXT,
  attendees JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('tentative', 'confirmed', 'cancelled')),
  sync_direction TEXT NOT NULL DEFAULT 'imported' CHECK (sync_direction IN ('imported', 'exported', 'bidirectional')),
  last_synced_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  google_updated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure unique Google events per business
  UNIQUE(business_id, google_event_id)
);

-- Table for logging Google Calendar sync operations
CREATE TABLE IF NOT EXISTS public.google_calendar_sync_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  integration_id UUID REFERENCES public.google_calendar_integrations(id) ON DELETE CASCADE,
  sync_type TEXT NOT NULL CHECK (sync_type IN ('full_sync', 'incremental_sync', 'manual_sync')),
  sync_direction TEXT NOT NULL CHECK (sync_direction IN ('import', 'export', 'bidirectional')),
  status TEXT NOT NULL CHECK (status IN ('started', 'completed', 'failed', 'partial')),
  events_processed INTEGER DEFAULT 0,
  events_created INTEGER DEFAULT 0,
  events_updated INTEGER DEFAULT 0,
  events_deleted INTEGER DEFAULT 0,
  error_message TEXT,
  sync_duration_ms INTEGER,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security on all tables
ALTER TABLE public.google_calendar_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_oauth_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_calendar_sync_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for google_calendar_integrations
CREATE POLICY "Users can view their business calendar integrations" 
  ON public.google_calendar_integrations 
  FOR SELECT 
  USING (
    business_id IN (SELECT unnest(get_user_business_ids()))
  );

CREATE POLICY "Business admins can manage calendar integrations" 
  ON public.google_calendar_integrations 
  FOR ALL 
  USING (
    business_id IN (SELECT unnest(get_user_business_ids()))
  );

-- RLS Policies for google_oauth_tokens
CREATE POLICY "Users can view their own OAuth tokens" 
  ON public.google_oauth_tokens 
  FOR SELECT 
  USING (
    user_id = auth.uid() AND 
    business_id IN (SELECT unnest(get_user_business_ids()))
  );

CREATE POLICY "Users can manage their own OAuth tokens" 
  ON public.google_oauth_tokens 
  FOR ALL 
  USING (
    user_id = auth.uid() AND 
    business_id IN (SELECT unnest(get_user_business_ids()))
  );

-- RLS Policies for google_calendar_events
CREATE POLICY "Users can view their business calendar events" 
  ON public.google_calendar_events 
  FOR SELECT 
  USING (
    business_id IN (SELECT unnest(get_user_business_ids()))
  );

CREATE POLICY "Business users can manage calendar events" 
  ON public.google_calendar_events 
  FOR ALL 
  USING (
    business_id IN (SELECT unnest(get_user_business_ids()))
  );

-- RLS Policies for google_calendar_sync_logs
CREATE POLICY "Users can view their business sync logs" 
  ON public.google_calendar_sync_logs 
  FOR SELECT 
  USING (
    business_id IN (SELECT unnest(get_user_business_ids()))
  );

CREATE POLICY "Business users can create sync logs" 
  ON public.google_calendar_sync_logs 
  FOR INSERT 
  WITH CHECK (
    business_id IN (SELECT unnest(get_user_business_ids()))
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_google_calendar_integrations_business_id 
  ON public.google_calendar_integrations(business_id);

CREATE INDEX IF NOT EXISTS idx_google_oauth_tokens_business_user 
  ON public.google_oauth_tokens(business_id, user_id);

CREATE INDEX IF NOT EXISTS idx_google_calendar_events_business_id 
  ON public.google_calendar_events(business_id);

CREATE INDEX IF NOT EXISTS idx_google_calendar_events_employee_id 
  ON public.google_calendar_events(employee_id);

CREATE INDEX IF NOT EXISTS idx_google_calendar_events_start_time 
  ON public.google_calendar_events(start_time);

CREATE INDEX IF NOT EXISTS idx_google_calendar_sync_logs_business_id 
  ON public.google_calendar_sync_logs(business_id);

CREATE INDEX IF NOT EXISTS idx_google_calendar_sync_logs_created_at 
  ON public.google_calendar_sync_logs(started_at);
