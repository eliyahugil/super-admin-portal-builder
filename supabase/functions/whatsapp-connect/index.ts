import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WhatsAppConnectRequest {
  businessId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { businessId }: WhatsAppConnectRequest = await req.json();

    console.log('🔗 Starting WhatsApp Business API connection for business:', businessId);

    // Get WhatsApp Business API credentials from business integrations
    const { data: integration, error: integrationError } = await supabaseClient
      .from('business_integrations')
      .select('credentials, config')
      .eq('business_id', businessId)
      .eq('integration_name', 'whatsapp')
      .eq('is_active', true)
      .single();

    if (integrationError || !integration) {
      console.error('❌ WhatsApp integration not found:', integrationError);
      return new Response(
        JSON.stringify({ error: 'WhatsApp Business API integration not configured. Please configure it first in Settings.' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { access_token, phone_number_id } = integration.credentials;
    const { app_id, app_secret, api_version = 'v18.0' } = integration.config;

    if (!access_token || !phone_number_id) {
      console.error('❌ Missing WhatsApp credentials');
      return new Response(
        JSON.stringify({ error: 'Missing WhatsApp Business API credentials' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Update connection status to connecting
    const { error: updateError } = await supabaseClient
      .from('whatsapp_business_connections')
      .upsert({
        business_id: businessId,
        connection_status: 'connecting',
        device_name: 'WhatsApp Business API',
        phone_number: ''
      });

    if (updateError) {
      console.error('❌ Error updating connection status:', updateError);
      throw updateError;
    }

    // Test the connection by getting phone number info
    const phoneInfoResponse = await fetch(`https://graph.facebook.com/${api_version}/${phone_number_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      }
    });

    const phoneInfoResult = await phoneInfoResponse.json();

    if (!phoneInfoResponse.ok) {
      console.error('❌ WhatsApp API connection failed:', phoneInfoResult);
      
      // Update connection status to disconnected
      await supabaseClient
        .from('whatsapp_business_connections')
        .update({
          connection_status: 'disconnected',
          last_error: phoneInfoResult.error?.message || 'Connection failed'
        })
        .eq('business_id', businessId);

      return new Response(
        JSON.stringify({ 
          error: 'Failed to connect to WhatsApp Business API',
          details: phoneInfoResult 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('✅ WhatsApp API connection successful:', phoneInfoResult);

    // Update connection status to connected with real phone number
    const { error: finalUpdateError } = await supabaseClient
      .from('whatsapp_business_connections')
      .update({
        connection_status: 'connected',
        phone_number: phoneInfoResult.display_phone_number || phoneInfoResult.id,
        last_connected_at: new Date().toISOString(),
        last_error: null
      })
      .eq('business_id', businessId);

    if (finalUpdateError) {
      console.error('❌ Error updating final connection status:', finalUpdateError);
      throw finalUpdateError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        phone_number: phoneInfoResult.display_phone_number || phoneInfoResult.id,
        status: 'connected'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('💥 Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});