-- Fix the whatsapp_business_connections table to allow null phone_number
ALTER TABLE public.whatsapp_business_connections 
ALTER COLUMN phone_number DROP NOT NULL;