import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, sessionId, businessId, phoneNumber, message } = await req.json();
    
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log(`WhatsApp Manager - Action: ${action}, SessionId: ${sessionId}`);

    switch (action) {
      case 'create_session':
        // Create or update WhatsApp session
        const { data: sessionData, error: sessionError } = await supabase
          .from('whatsapp_sessions')
          .upsert({
            id: sessionId,
            business_id: businessId,
            phone_number: phoneNumber,
            connection_status: 'connecting',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (sessionError) {
          console.error('Session creation error:', sessionError);
          return new Response(
            JSON.stringify({ error: 'Failed to create session', details: sessionError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, session: sessionData }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'update_qr':
        // Update QR code for session
        const { qrCode } = await req.json();
        const { error: qrError } = await supabase
          .from('whatsapp_sessions')
          .update({
            qr_code: qrCode,
            connection_status: 'connecting',
            updated_at: new Date().toISOString()
          })
          .eq('id', sessionId);

        if (qrError) {
          console.error('QR update error:', qrError);
          return new Response(
            JSON.stringify({ error: 'Failed to update QR', details: qrError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'update_status':
        // Update connection status
        const { status, error: statusError } = await req.json();
        const updateData: any = {
          connection_status: status,
          updated_at: new Date().toISOString()
        };

        if (status === 'connected') {
          updateData.last_connected_at = new Date().toISOString();
          updateData.qr_code = null; // Clear QR code when connected
        }

        if (statusError) {
          updateData.last_error = statusError;
        }

        const { error: updateError } = await supabase
          .from('whatsapp_sessions')
          .update(updateData)
          .eq('id', sessionId);

        if (updateError) {
          console.error('Status update error:', updateError);
          return new Response(
            JSON.stringify({ error: 'Failed to update status', details: updateError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'get_session':
        // Get session details
        const { data: getSessionData, error: getError } = await supabase
          .from('whatsapp_sessions')
          .select('*')
          .eq('id', sessionId)
          .single();

        if (getError) {
          console.error('Get session error:', getError);
          return new Response(
            JSON.stringify({ error: 'Session not found', details: getError.message }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, session: getSessionData }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'send_message':
        // Log message sending attempt
        console.log(`Sending message to ${phoneNumber}: ${message}`);
        
        // Here you would integrate with your WhatsApp Web API
        // For now, we'll just log and return success
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Message queued for sending',
            recipient: phoneNumber,
            content: message 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'list_business_sessions':
        // List all sessions for a business
        const { data: businessSessions, error: listError } = await supabase
          .from('whatsapp_sessions')
          .select('*')
          .eq('business_id', businessId)
          .order('created_at', { ascending: false });

        if (listError) {
          console.error('List sessions error:', listError);
          return new Response(
            JSON.stringify({ error: 'Failed to list sessions', details: listError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, sessions: businessSessions }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('WhatsApp Manager error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});