import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // Handle GET request for webhook verification
  if (req.method === 'GET') {
    const url = new URL(req.url);
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    console.log('🔍 Webhook verification request:', { mode, token, challenge });

    // Verify webhook
    if (mode === 'subscribe') {
      // Get all webhook verify tokens from active WhatsApp integrations
      const { data: integrations, error } = await supabaseClient
        .from('business_integrations')
        .select('credentials')
        .eq('integration_name', 'whatsapp')
        .eq('is_active', true);

      if (error) {
        console.error('❌ Error fetching integrations:', error);
        return new Response('Forbidden', { status: 403 });
      }

      // Check if token matches any active integration
      const validToken = integrations?.some(integration => {
        const credentials = integration.credentials as any;
        return credentials?.webhook_verify_token === token;
      });

      if (validToken) {
        console.log('✅ Webhook verification successful');
        return new Response(challenge, { status: 200 });
      } else {
        console.log('❌ Invalid verify token');
        return new Response('Forbidden', { status: 403 });
      }
    }

    return new Response('Not Found', { status: 404 });
  }

  // Handle POST request for incoming messages or Gateway status updates
  if (req.method === 'POST') {
    try {
      const body = await req.json();
      console.log('📨 Incoming webhook:', JSON.stringify(body, null, 2));

      // Check if this is a Gateway status update (has sessionId field)
      if (body.sessionId) {
        return await handleGatewayStatusUpdate(body, supabaseClient);
      }

      // Verify webhook signature (recommended for production)
      // const signature = req.headers.get('x-hub-signature-256');
      // if (!verifySignature(JSON.stringify(body), signature)) {
      //   return new Response('Unauthorized', { status: 401 });
      // }

      // Process WhatsApp Business API webhook entries
      if (body.entry && body.entry.length > 0) {
        for (const entry of body.entry) {
          if (entry.changes) {
            for (const change of entry.changes) {
              if (change.field === 'messages') {
                await processMessages(change.value, supabaseClient);
              }
            }
          }
        }
      }

      return new Response('EVENT_RECEIVED', { status: 200 });
    } catch (error) {
      console.error('💥 Error processing webhook:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }

  return new Response('Method Not Allowed', { status: 405 });
});

async function handleGatewayStatusUpdate(payload: any, supabaseClient: any) {
  try {
    console.log('🔗 Gateway status update:', payload);

    // Extract business ID from session ID (format: business_UUID)
    const sessionIdMatch = payload.sessionId.match(/^business_(.+)$/);
    if (!sessionIdMatch) {
      console.error('❌ Invalid session ID format:', payload.sessionId);
      return new Response(
        JSON.stringify({ error: 'Invalid session ID format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const businessId = sessionIdMatch[1].replace(/_/g, '-');
    console.log('🏢 Business ID:', businessId);

    // Update connection status based on webhook
    const updateData: any = {
      connection_status: payload.status,
      last_error: payload.error || null,
    };

    if (payload.status === 'connected') {
      updateData.phone_number = payload.phoneNumber || payload.sessionId;
      updateData.last_connected_at = new Date().toISOString();
      updateData.qr_code = null; // Clear QR code when connected
      console.log('✅ Connection established for business:', businessId);
    } else if (payload.status === 'connecting' && payload.qr) {
      updateData.qr_code = payload.qr;
      console.log('📱 QR Code updated for business:', businessId);
    } else if (payload.status === 'disconnected') {
      updateData.qr_code = null;
      console.log('❌ Connection lost for business:', businessId);
    }

    const { error: updateError } = await supabaseClient
      .from('whatsapp_business_connections')
      .update(updateData)
      .eq('business_id', businessId);

    if (updateError) {
      console.error('❌ Error updating connection status:', updateError);
      throw updateError;
    }

    console.log('✅ Connection status updated successfully');

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 Gateway webhook error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function processMessages(value: any, supabaseClient: any) {
  const phoneNumberId = value.metadata?.phone_number_id;
  
  if (!phoneNumberId) {
    console.log('⚠️ No phone number ID in webhook');
    return;
  }

  // Find business by phone number ID
  const { data: integration, error: integrationError } = await supabaseClient
    .from('business_integrations')
    .select('business_id, credentials')
    .eq('integration_name', 'whatsapp')
    .eq('is_active', true)
    .single();

  if (integrationError || !integration) {
    console.error('❌ Integration not found for phone number ID:', phoneNumberId);
    return;
  }

  const credentials = integration.credentials as any;
  if (credentials?.phone_number_id !== phoneNumberId) {
    console.log('⚠️ Phone number ID mismatch');
    return;
  }

  const businessId = integration.business_id;

  // Process messages
  if (value.messages) {
    for (const message of value.messages) {
      await processIncomingMessage(message, businessId, supabaseClient);
    }
  }

  // Process message status updates
  if (value.statuses) {
    for (const status of value.statuses) {
      await processMessageStatus(status, businessId, supabaseClient);
    }
  }
}

async function processIncomingMessage(message: any, businessId: string, supabaseClient: any) {
  try {
    const phoneNumber = message.from;
    const messageId = message.id;
    const timestamp = new Date(parseInt(message.timestamp) * 1000).toISOString();

    // Create or get contact
    const { data: contact, error: contactError } = await supabaseClient
      .from('whatsapp_contacts')
      .upsert({
        business_id: businessId,
        phone_number: phoneNumber,
        name: message.profile?.name || null,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (contactError) {
      console.error('❌ Error creating/updating contact:', contactError);
      return;
    }

    // Extract message content based on type
    let content = '';
    let messageType = 'text';
    let mediaUrl = null;

    if (message.text) {
      content = message.text.body;
      messageType = 'text';
    } else if (message.image) {
      content = message.image.caption || 'תמונה';
      messageType = 'image';
      mediaUrl = message.image.id;
    } else if (message.audio) {
      content = 'הודעה קולית';
      messageType = 'audio';
      mediaUrl = message.audio.id;
    } else if (message.video) {
      content = message.video.caption || 'וידאו';
      messageType = 'video';
      mediaUrl = message.video.id;
    } else if (message.document) {
      content = message.document.filename || 'מסמך';
      messageType = 'document';
      mediaUrl = message.document.id;
    }

    // Store message in database
    const { error: messageError } = await supabaseClient
      .from('whatsapp_messages')
      .insert({
        business_id: businessId,
        contact_id: contact.id,
        message_id: messageId,
        content,
        message_type: messageType,
        direction: 'incoming',
        status: 'read',
        timestamp,
        media_url: mediaUrl
      });

    if (messageError) {
      console.error('❌ Error storing message:', messageError);
    } else {
      console.log('✅ Message stored successfully:', messageId);
    }

    // Mark message as read (optional)
    await markMessageAsRead(messageId, phoneNumber, businessId, supabaseClient);

  } catch (error) {
    console.error('💥 Error processing incoming message:', error);
  }
}

async function processMessageStatus(status: any, businessId: string, supabaseClient: any) {
  try {
    const messageId = status.id;
    const statusValue = status.status; // sent, delivered, read, failed

    // Update message status in database
    const { error } = await supabaseClient
      .from('whatsapp_messages')
      .update({ status: statusValue })
      .eq('business_id', businessId)
      .eq('message_id', messageId);

    if (error) {
      console.error('❌ Error updating message status:', error);
    } else {
      console.log('✅ Message status updated:', messageId, statusValue);
    }
  } catch (error) {
    console.error('💥 Error processing message status:', error);
  }
}

async function markMessageAsRead(messageId: string, phoneNumber: string, businessId: string, supabaseClient: any) {
  try {
    // Get WhatsApp API credentials
    const { data: integration, error } = await supabaseClient
      .from('business_integrations')
      .select('credentials, config')
      .eq('business_id', businessId)
      .eq('integration_name', 'whatsapp')
      .eq('is_active', true)
      .single();

    if (error || !integration) {
      console.error('❌ Integration not found');
      return;
    }

    const { access_token, phone_number_id } = integration.credentials as any;
    const { api_version = 'v18.0' } = integration.config as any;

    // Mark message as read via WhatsApp API
    const response = await fetch(`https://graph.facebook.com/${api_version}/${phone_number_id}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId
      })
    });

    if (!response.ok) {
      console.error('❌ Failed to mark message as read:', await response.text());
    } else {
      console.log('✅ Message marked as read:', messageId);
    }
  } catch (error) {
    console.error('💥 Error marking message as read:', error);
  }
}