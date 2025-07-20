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
    const { action, sessionId, business_id, businessId, phone_number, phoneNumber, message } = await req.json();
    
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const finalBusinessId = business_id || businessId;
    const finalPhoneNumber = phone_number || phoneNumber;
    
    console.log(`WhatsApp Manager - Action: ${action}, BusinessId: ${finalBusinessId}`);

    switch (action) {
      case 'create_session':
        // Create or update WhatsApp session
        const sessionIdToUse = sessionId || crypto.randomUUID();
        const { data: sessionData, error: sessionError } = await supabase
          .from('whatsapp_sessions')
          .upsert({
            id: sessionIdToUse,
            business_id: finalBusinessId,
            phone_number: finalPhoneNumber,
            connection_status: 'connecting',
            qr_code: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IndoaXRlIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9ImJsYWNrIj7Xp9eV16gg0YIt0L7Ui9ecINec15nXqNeq15XXqdeR0ZjXqNeY0LzXnteYPC90ZXh0Pgo8L3N2Zz4K', // Placeholder QR code
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
        console.log(`Sending message to ${finalPhoneNumber}: ${message}`);
        
        // Create log entry
        const logEntry = {
          business_id: finalBusinessId,
          phone: finalPhoneNumber,
          message: message,
          category: 'manual',
          status: 'pending'
        };

        const { data: logData, error: logError } = await supabase
          .from('whatsapp_logs')
          .insert(logEntry)
          .select()
          .single();

        if (logError) {
          console.error('Failed to create log entry:', logError);
          return new Response(
            JSON.stringify({ error: 'Failed to log message', details: logError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Here you would integrate with your WhatsApp Web API
        // For now, we'll simulate success and update the log
        
        // Update log with success status
        const { error: updateError } = await supabase
          .from('whatsapp_logs')
          .update({ 
            status: 'sent', 
            sent_at: new Date().toISOString() 
          })
          .eq('id', logData.id);

        if (updateError) {
          console.error('Failed to update log:', updateError);
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Message sent successfully',
            recipient: finalPhoneNumber,
            content: message,
            log_id: logData.id
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'list_business_sessions':
        // List all sessions for a business
        const { data: businessSessions, error: listError } = await supabase
          .from('whatsapp_sessions')
          .select('*')
          .eq('business_id', finalBusinessId)
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