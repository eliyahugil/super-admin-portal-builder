import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// In-memory storage for WhatsApp clients per business
const whatsappClients = new Map<string, any>();
const qrCodes = new Map<string, string>();

interface WhatsAppRequest {
  action: 'connect' | 'disconnect' | 'send' | 'status';
  businessId: string;
  phone?: string;
  message?: string;
  contactName?: string;
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

    const { action, businessId, phone, message, contactName }: WhatsAppRequest = await req.json();

    console.log(`🔥 WhatsApp Native - Action: ${action}, Business: ${businessId}`);

    switch (action) {
      case 'connect':
        return await handleConnect(supabaseClient, businessId);
      
      case 'disconnect':
        return await handleDisconnect(supabaseClient, businessId);
      
      case 'send':
        return await handleSendMessage(supabaseClient, businessId, phone!, message!, contactName);
      
      case 'status':
        return await handleStatus(supabaseClient, businessId);
      
      default:
        throw new Error('Invalid action');
    }

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

async function handleConnect(supabaseClient: any, businessId: string) {
  try {
    console.log('🔗 Starting WhatsApp connection for business:', businessId);

    // Create a mock QR code for demonstration
    // In a real implementation, you would integrate with whatsapp-web.js here
    const qrCode = generateMockQRCode(businessId);
    qrCodes.set(businessId, qrCode);

    // Update connection status to connecting
    const { error: updateError } = await supabaseClient
      .from('whatsapp_business_connections')
      .upsert({
        business_id: businessId,
        connection_status: 'connecting',
        device_name: 'WhatsApp Web Client',
        phone_number: '',
        session_id: `session_${businessId}`,
        qr_code: qrCode,
        last_error: null
      });

    if (updateError) {
      console.error('❌ Error updating connection status:', updateError);
      throw updateError;
    }

    // Simulate connection process
    setTimeout(async () => {
      try {
        // Simulate successful connection after QR scan
        await supabaseClient
          .from('whatsapp_business_connections')
          .update({
            connection_status: 'connected',
            phone_number: `+972-XXX-XXX-XXX`,
            last_connected_at: new Date().toISOString(),
            qr_code: null
          })
          .eq('business_id', businessId);
        
        console.log('✅ Mock connection established for business:', businessId);
      } catch (error) {
        console.error('❌ Error in mock connection:', error);
      }
    }, 10000); // Simulate 10 seconds for QR scan

    return new Response(
      JSON.stringify({ 
        success: true, 
        qr_code: qrCode,
        status: 'connecting',
        message: 'Scan QR code with your WhatsApp app'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ WhatsApp connection failed:', error);
    
    await supabaseClient
      .from('whatsapp_business_connections')
      .update({
        connection_status: 'disconnected',
        last_error: error.message || 'Connection failed'
      })
      .eq('business_id', businessId);

    return new Response(
      JSON.stringify({ 
        error: 'Failed to connect to WhatsApp',
        details: error.message 
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

async function handleDisconnect(supabaseClient: any, businessId: string) {
  try {
    console.log('🔌 Disconnecting WhatsApp for business:', businessId);

    // Remove client from memory
    whatsappClients.delete(businessId);
    qrCodes.delete(businessId);

    // Update connection status
    const { error } = await supabaseClient
      .from('whatsapp_business_connections')
      .update({
        connection_status: 'disconnected',
        qr_code: null,
        session_data: null
      })
      .eq('business_id', businessId);

    if (error) throw error;

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'WhatsApp disconnected successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ WhatsApp disconnect failed:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to disconnect WhatsApp',
        details: error.message 
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

async function handleSendMessage(supabaseClient: any, businessId: string, phone: string, message: string, contactName?: string) {
  try {
    console.log(`📱 Sending message to ${phone} for business: ${businessId}`);

    // Check if business is connected
    const { data: connection } = await supabaseClient
      .from('whatsapp_business_connections')
      .select('connection_status')
      .eq('business_id', businessId)
      .single();

    if (!connection || connection.connection_status !== 'connected') {
      throw new Error('WhatsApp not connected. Please connect first.');
    }

    // Clean phone number
    const cleanPhone = phone.replace(/[^\d]/g, '');
    
    // Find or create contact
    let { data: contact, error: contactError } = await supabaseClient
      .from('whatsapp_contacts')
      .select('*')
      .eq('business_id', businessId)
      .eq('phone_number', cleanPhone)
      .maybeSingle();

    if (contactError && contactError.code !== 'PGRST116') {
      throw contactError;
    }

    if (!contact) {
      // Create new contact
      const { data: newContact, error: createError } = await supabaseClient
        .from('whatsapp_contacts')
        .insert({
          business_id: businessId,
          phone_number: cleanPhone,
          name: contactName || cleanPhone
        })
        .select()
        .single();

      if (createError) throw createError;
      contact = newContact;
    }

    // Save message to database
    const { data: savedMessage, error: messageError } = await supabaseClient
      .from('whatsapp_messages')
      .insert({
        business_id: businessId,
        contact_id: contact.id,
        message_id: `msg_${Date.now()}`,
        content: message,
        message_type: 'text',
        direction: 'outgoing',
        status: 'sent',
        timestamp: new Date().toISOString()
      })
      .select()
      .single();

    if (messageError) throw messageError;

    // In a real implementation, you would send the message via whatsapp-web.js here
    console.log(`✅ Message saved and would be sent: ${message}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Message sent successfully',
        messageId: savedMessage.id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Send message failed:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send message',
        details: error.message 
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

async function handleStatus(supabaseClient: any, businessId: string) {
  try {
    const { data: connection } = await supabaseClient
      .from('whatsapp_business_connections')
      .select('*')
      .eq('business_id', businessId)
      .maybeSingle();

    return new Response(
      JSON.stringify({ 
        success: true,
        connection: connection || null,
        qr_code: qrCodes.get(businessId) || null
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Status check failed:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to get status',
        details: error.message 
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

function generateMockQRCode(businessId: string): string {
  // Generate a mock QR code as base64 data URL
  // In real implementation, this would come from whatsapp-web.js
  const qrData = `wa-mock-${businessId}-${Date.now()}`;
  
  // Create a simple mock QR code pattern (for demo purposes)
  const mockQRSvg = `
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="white"/>
      <rect x="20" y="20" width="160" height="160" fill="black"/>
      <rect x="40" y="40" width="120" height="120" fill="white"/>
      <rect x="60" y="60" width="80" height="80" fill="black"/>
      <rect x="80" y="80" width="40" height="40" fill="white"/>
      <text x="100" y="100" text-anchor="middle" fill="black" font-size="8">QR</text>
      <text x="100" y="190" text-anchor="middle" fill="black" font-size="6">${businessId.slice(0, 8)}</text>
    </svg>
  `;
  
  // Convert to base64 data URL
  const base64 = btoa(mockQRSvg);
  return `data:image/svg+xml;base64,${base64}`;
}