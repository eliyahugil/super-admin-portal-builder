import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { business_id, message_template, phone_numbers, tokens } = await req.json();

    if (!business_id) {
      return new Response(
        JSON.stringify({ error: 'Business ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('📱 Bulk WhatsApp sending for business:', business_id);

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get active WhatsApp connection for this business
    const { data: whatsappConnection, error: connectionError } = await supabaseAdmin
      .from('whatsapp_business_connections')
      .select('*')
      .eq('business_id', business_id)
      .eq('is_active', true)
      .maybeSingle();

    if (connectionError) {
      console.error('❌ Error fetching WhatsApp connection:', connectionError);
      throw connectionError;
    }

    const results = [];
    let successCount = 0;
    let failCount = 0;

    // If WhatsApp API is available, use it
    if (whatsappConnection && whatsappConnection.webhook_url) {
      console.log('🔌 Using WhatsApp API connection');
      
      for (let i = 0; i < phone_numbers.length; i++) {
        const phoneNumber = phone_numbers[i];
        const token = tokens[i];
        const personalizedMessage = message_template.replace('{TOKEN_URL}', token);

        try {
          // Call WhatsApp API
          const response = await fetch(whatsappConnection.webhook_url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${whatsappConnection.access_token || ''}`,
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              to: phoneNumber,
              text: { body: personalizedMessage }
            })
          });

          if (response.ok) {
            successCount++;
            results.push({
              phone: phoneNumber,
              status: 'sent',
              method: 'api'
            });
          } else {
            throw new Error(`API call failed: ${response.status}`);
          }

        } catch (error) {
          console.error(`❌ Failed to send via API to ${phoneNumber}:`, error);
          failCount++;
          results.push({
            phone: phoneNumber,
            status: 'failed',
            error: error.message,
            method: 'api'
          });
        }

        // Small delay between messages
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    } else {
      // Fallback: Return URLs for manual opening
      console.log('📱 No API available, preparing manual WhatsApp URLs');
      
      for (let i = 0; i < phone_numbers.length; i++) {
        const phoneNumber = phone_numbers[i];
        const token = tokens[i];
        const personalizedMessage = message_template.replace('{TOKEN_URL}', token);
        
        const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
        const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(personalizedMessage)}`;
        
        results.push({
          phone: phoneNumber,
          whatsapp_url: whatsappUrl,
          status: 'ready',
          method: 'manual'
        });
      }
      
      successCount = results.length;
    }

    // Log the bulk send operation
    await supabaseAdmin
      .from('whatsapp_logs')
      .insert({
        business_id,
        message_type: 'bulk_token_send',
        recipient_count: phone_numbers.length,
        success_count: successCount,
        fail_count: failCount,
        method: whatsappConnection ? 'api' : 'manual',
        metadata: {
          total_recipients: phone_numbers.length,
          has_api_connection: !!whatsappConnection,
          template_used: 'employee_tokens'
        }
      });

    const response = {
      success: true,
      message: `WhatsApp bulk send completed`,
      summary: {
        total: phone_numbers.length,
        successful: successCount,
        failed: failCount,
        method: whatsappConnection ? 'api' : 'manual'
      },
      results,
      has_api: !!whatsappConnection
    };

    console.log('✅ Bulk WhatsApp send completed:', response.summary);

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Unexpected error in bulk WhatsApp send:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});