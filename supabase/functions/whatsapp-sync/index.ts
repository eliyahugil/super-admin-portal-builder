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

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🔄 Starting WhatsApp sync process...');

    // Get all active WhatsApp connections
    const { data: connections, error: connectionsError } = await supabaseClient
      .from('whatsapp_business_connections')
      .select('business_id, phone_number')
      .eq('connection_status', 'connected');

    if (connectionsError) {
      console.error('❌ Error fetching connections:', connectionsError);
      throw connectionsError;
    }

    if (!connections || connections.length === 0) {
      console.log('ℹ️ No active WhatsApp connections found');
      return new Response(
        JSON.stringify({ message: 'No active connections to sync' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let syncResults = [];

    for (const connection of connections) {
      try {
        console.log(`📱 Syncing messages for business: ${connection.business_id}`);
        
        // Get gateway configuration for this business
        const { data: integration, error: integrationError } = await supabaseClient
          .from('business_integrations')
          .select('config')
          .eq('business_id', connection.business_id)
          .eq('integration_name', 'whatsapp')
          .eq('is_active', true)
          .single();

        if (integrationError || !integration) {
          console.log(`⚠️ Integration not found for business: ${connection.business_id}`);
          continue;
        }

        const { gateway_url = 'http://localhost:3000' } = integration.config;
        const sessionId = `business_${connection.business_id.replace(/-/g, '_')}`;

        // Get messages from Gateway
        const messagesResponse = await fetch(`${gateway_url}/messages/${sessionId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!messagesResponse.ok) {
          console.log(`⚠️ Failed to fetch messages for session: ${sessionId}`);
          continue;
        }

        const messagesData = await messagesResponse.json();
        console.log(`📥 Received ${messagesData.messages?.length || 0} messages for ${sessionId}`);

        if (messagesData.messages && messagesData.messages.length > 0) {
          await processMessages(messagesData.messages, connection.business_id, supabaseClient);
        }

        // Get contacts from Gateway
        const contactsResponse = await fetch(`${gateway_url}/contacts/${sessionId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (contactsResponse.ok) {
          const contactsData = await contactsResponse.json();
          console.log(`👥 Received ${contactsData.contacts?.length || 0} contacts for ${sessionId}`);
          
          if (contactsData.contacts && contactsData.contacts.length > 0) {
            await processContacts(contactsData.contacts, connection.business_id, supabaseClient);
          }
        }

        syncResults.push({
          business_id: connection.business_id,
          status: 'success',
          messages_synced: messagesData.messages?.length || 0
        });

      } catch (error) {
        console.error(`💥 Error syncing business ${connection.business_id}:`, error);
        syncResults.push({
          business_id: connection.business_id,
          status: 'error',
          error: error.message
        });
      }
    }

    console.log('✅ Sync completed');

    return new Response(
      JSON.stringify({ 
        success: true,
        synced_businesses: syncResults.length,
        results: syncResults
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('💥 Sync error:', error);
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

async function processMessages(messages: any[], businessId: string, supabaseClient: any) {
  for (const message of messages) {
    try {
      // Create or get contact first
      const { data: contact, error: contactError } = await supabaseClient
        .from('whatsapp_contacts')
        .upsert({
          business_id: businessId,
          phone_number: message.from || message.to,
          name: message.sender_name || null,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (contactError) {
        console.error('❌ Error creating/updating contact:', contactError);
        continue;
      }

      // Check if message already exists
      const { data: existingMessage } = await supabaseClient
        .from('whatsapp_messages')
        .select('id')
        .eq('business_id', businessId)
        .eq('message_id', message.id)
        .single();

      if (existingMessage) {
        console.log(`⏭️ Message ${message.id} already exists, skipping`);
        continue;
      }

      // Determine direction
      const direction = message.fromMe ? 'outgoing' : 'incoming';

      // Store message
      const { error: messageError } = await supabaseClient
        .from('whatsapp_messages')
        .insert({
          business_id: businessId,
          contact_id: contact.id,
          message_id: message.id,
          content: message.body || message.content || '',
          message_type: message.type || 'text',
          direction: direction,
          status: 'read',
          timestamp: new Date(message.timestamp * 1000).toISOString(),
          media_url: message.media_url || null
        });

      if (messageError) {
        console.error('❌ Error storing message:', messageError);
      } else {
        console.log(`✅ Stored message: ${message.id}`);
      }

    } catch (error) {
      console.error('💥 Error processing message:', error);
    }
  }
}

async function processContacts(contacts: any[], businessId: string, supabaseClient: any) {
  for (const contact of contacts) {
    try {
      const { error: contactError } = await supabaseClient
        .from('whatsapp_contacts')
        .upsert({
          business_id: businessId,
          phone_number: contact.phone || contact.id,
          name: contact.name || contact.pushname || null,
          profile_picture_url: contact.profile_pic || null,
          last_seen: contact.last_seen ? new Date(contact.last_seen * 1000).toISOString() : null,
          updated_at: new Date().toISOString()
        });

      if (contactError) {
        console.error('❌ Error updating contact:', contactError);
      } else {
        console.log(`✅ Updated contact: ${contact.phone || contact.id}`);
      }

    } catch (error) {
      console.error('💥 Error processing contact:', error);
    }
  }
}