import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WhatsAppMessageRequest {
  phoneNumber: string;
  message: string;
  businessId: string;
  messageType?: 'text' | 'template';
  templateName?: string;
  templateParams?: string[];
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

    const { phoneNumber, message, businessId, messageType = 'text', templateName, templateParams }: WhatsAppMessageRequest = await req.json();

    console.log('🚀 Sending WhatsApp message:', { phoneNumber, businessId, messageType });

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
        JSON.stringify({ error: 'WhatsApp integration not configured' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { access_token, phone_number_id } = integration.credentials;
    const { api_version = 'v18.0' } = integration.config;

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

    // Format phone number (remove + and ensure it starts with country code)
    const formattedPhone = phoneNumber.replace(/\D/g, '').replace(/^0/, '972');

    let messagePayload: any;

    if (messageType === 'template' && templateName) {
      // Send template message
      messagePayload = {
        messaging_product: "whatsapp",
        to: formattedPhone,
        type: "template",
        template: {
          name: templateName,
          language: {
            code: "he"
          }
        }
      };

      if (templateParams && templateParams.length > 0) {
        messagePayload.template.components = [
          {
            type: "body",
            parameters: templateParams.map(param => ({
              type: "text",
              text: param
            }))
          }
        ];
      }
    } else {
      // Send text message
      messagePayload = {
        messaging_product: "whatsapp",
        to: formattedPhone,
        type: "text",
        text: {
          body: message
        }
      };
    }

    // Send message via WhatsApp Business API
    const whatsappResponse = await fetch(`https://graph.facebook.com/${api_version}/${phone_number_id}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messagePayload)
    });

    const whatsappResult = await whatsappResponse.json();

    if (!whatsappResponse.ok) {
      console.error('❌ WhatsApp API error:', whatsappResult);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to send WhatsApp message',
          details: whatsappResult 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('✅ WhatsApp message sent successfully:', whatsappResult);

    // Store message in database
    const { error: dbError } = await supabaseClient
      .from('whatsapp_messages')
      .insert({
        business_id: businessId,
        contact_id: null, // We'll need to handle contact creation separately
        message_id: whatsappResult.messages?.[0]?.id || `msg_${Date.now()}`,
        content: messageType === 'template' ? `Template: ${templateName}` : message,
        message_type: 'text',
        direction: 'outgoing',
        status: 'sent',
        timestamp: new Date().toISOString()
      });

    if (dbError) {
      console.error('⚠️ Failed to store message in database:', dbError);
      // Don't fail the request if we can't store in DB
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: whatsappResult.messages?.[0]?.id,
        status: 'sent'
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