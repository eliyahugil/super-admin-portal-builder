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

    console.log('🔗 Starting WhatsApp Gateway connection for business:', businessId);

    // Get WhatsApp Gateway credentials from business integrations
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
        JSON.stringify({ error: 'WhatsApp Gateway integration not configured. Please configure it first in Settings.' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // For Gateway we might need different credentials, but for now we'll use the session approach
    // You can add gateway_url and other configs here if needed
    const { gateway_url = 'http://localhost:3000' } = integration.config;

    // Update connection status to connecting
    const { error: updateError } = await supabaseClient
      .from('whatsapp_business_connections')
      .upsert({
        business_id: businessId,
        connection_status: 'connecting',
        device_name: 'WhatsApp Gateway',
        phone_number: ''
      });

    if (updateError) {
      console.error('❌ Error updating connection status:', updateError);
      throw updateError;
    }

    // Generate unique session ID for this business
    const sessionId = `business_${businessId.replace(/-/g, '_')}`;
    
    // Check if session already exists and try to delete it first
    let sessionCreated = false;
    let sessionResponse;
    let qrCode = null;
    
    try {
      // Try to create session
      console.log('🔗 Attempting to create WhatsApp session:', sessionId);
      sessionResponse = await fetch(`${gateway_url}/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionId
        })
      });

      const sessionResult = await sessionResponse.json();
      
      if (!sessionResponse.ok) {
        // If session already exists, try to delete it first
        if (sessionResult.message && sessionResult.message.includes('already exist')) {
          console.log('⚠️ Session already exists, attempting to delete and recreate...');
          
          // Delete existing session
          const deleteResponse = await fetch(`${gateway_url}/session/${sessionId}`, {
            method: 'DELETE'
          });
          
          if (deleteResponse.ok) {
            console.log('🗑️ Successfully deleted existing session');
            
            // Wait a moment for cleanup
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Try to create session again
            const retryResponse = await fetch(`${gateway_url}/session`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                sessionId: sessionId
              })
            });

            const retryResult = await retryResponse.json();
            
            if (retryResponse.ok) {
              sessionCreated = true;
              qrCode = retryResult.qr;
              console.log('✅ Session recreated successfully');
            } else {
              throw new Error(`Failed to recreate session: ${retryResult.message}`);
            }
          } else {
            throw new Error('Failed to delete existing session');
          }
        } else {
          throw new Error(sessionResult.message || 'Failed to create session');
        }
      } else {
        sessionCreated = true;
        qrCode = sessionResult.qr;
        console.log('✅ Session created successfully');
      }

      // If we have a QR code, update the database with it
      if (qrCode) {
        await supabaseClient
          .from('whatsapp_business_connections')
          .update({
            connection_status: 'connecting',
            qr_code: qrCode,
            last_error: null
          })
          .eq('business_id', businessId);

        console.log('📱 QR Code generated and saved');
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            qr_code: qrCode,
            session_id: sessionId,
            status: 'connecting',
            message: 'Scan QR code with your phone to connect'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
    } catch (error) {
      console.error('❌ WhatsApp Gateway connection failed:', error);
      
      // Update connection status to disconnected
      await supabaseClient
        .from('whatsapp_business_connections')
        .update({
          connection_status: 'disconnected',
          last_error: error.message || 'Connection failed'
        })
        .eq('business_id', businessId);

      return new Response(
        JSON.stringify({ 
          error: 'Failed to connect to WhatsApp Gateway',
          details: error.message 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('✅ WhatsApp Gateway session created successfully');

    // Update connection status to connected
    const { error: finalUpdateError } = await supabaseClient
      .from('whatsapp_business_connections')
      .update({
        connection_status: 'connected',
        phone_number: sessionId,
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
        session_id: sessionId,
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