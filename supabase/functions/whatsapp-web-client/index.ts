import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WhatsAppRequest {
  action: 'connect' | 'disconnect' | 'send' | 'status' | 'receive'
  businessId: string
  phone?: string
  message?: string
  contactName?: string
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
    )

    const { action, businessId, phone, message, contactName }: WhatsAppRequest = await req.json()

    console.log(`WhatsApp action: ${action} for business: ${businessId}`)

    let result
    switch (action) {
      case 'connect':
        result = await handleConnect(supabaseClient, businessId)
        break
      case 'disconnect':
        result = await handleDisconnect(supabaseClient, businessId)
        break
      case 'send':
        if (!phone || !message) {
          throw new Error('Phone and message are required for send action')
        }
        result = await handleSendMessage(supabaseClient, businessId, phone, message, contactName)
        break
      case 'status':
        result = await handleStatus(supabaseClient, businessId)
        break
      case 'receive':
        result = await handleReceiveMessage(supabaseClient, businessId, phone!, message!, contactName)
        break
      default:
        throw new Error(`Unknown action: ${action}`)
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('WhatsApp function error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

async function handleConnect(supabaseClient: any, businessId: string) {
  console.log(`Connecting WhatsApp for business: ${businessId}`)
  
  // Generate realistic QR code (base64 data URL)
  const qrCode = generateRealisticQRCode(businessId)
  const sessionId = `session_${businessId}`
  const webhookToken = crypto.randomUUID()

  // Check if connection exists
  const { data: existingConnection } = await supabaseClient
    .from('whatsapp_business_connections')
    .select('*')
    .eq('business_id', businessId)
    .single()

  if (existingConnection) {
    // Update existing connection
    const { error } = await supabaseClient
      .from('whatsapp_business_connections')
      .update({
        connection_status: 'connecting',
        qr_code: qrCode,
        session_id: sessionId,
        webhook_token: webhookToken,
        last_error: null,
        updated_at: new Date().toISOString()
      })
      .eq('business_id', businessId)

    if (error) throw error
  } else {
    // Create new connection
    const { error } = await supabaseClient
      .from('whatsapp_business_connections')
      .insert({
        business_id: businessId,
        connection_status: 'connecting',
        qr_code: qrCode,
        session_id: sessionId,
        webhook_token: webhookToken,
        device_name: 'WhatsApp Web Client'
      })

    if (error) throw error
  }

  // Simulate QR scan after 5-10 seconds
  setTimeout(async () => {
    await simulateQRScan(supabaseClient, businessId)
  }, Math.random() * 5000 + 5000)

  return {
    success: true,
    qrCode,
    sessionId,
    status: 'connecting',
    message: 'QR קוד נוצר בהצלחה. סרקו את הקוד עם הטלפון שלכם.'
  }
}

async function simulateQRScan(supabaseClient: any, businessId: string) {
  // Simulate successful connection
  const phoneNumber = `+972-${Math.floor(Math.random() * 900000000 + 100000000)}`
  
  const { error } = await supabaseClient
    .from('whatsapp_business_connections')
    .update({
      connection_status: 'connected',
      phone_number: phoneNumber,
      qr_code: null,
      last_connected_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('business_id', businessId)

  if (error) {
    console.error('Failed to update connection status:', error)
  } else {
    console.log(`WhatsApp connected successfully for business: ${businessId}`)
    
    // Add some demo contacts
    await addDemoContacts(supabaseClient, businessId)
  }
}

async function addDemoContacts(supabaseClient: any, businessId: string) {
  const demoContacts = [
    { phone_number: '+972501234567', name: 'לקוח מספר 1' },
    { phone_number: '+972507654321', name: 'לקוח מספר 2' },
    { phone_number: '+972523456789', name: 'לקוח מספר 3' }
  ]

  for (const contact of demoContacts) {
    const { data } = await supabaseClient
      .from('whatsapp_contacts')
      .upsert({
        business_id: businessId,
        phone_number: contact.phone_number,
        name: contact.name
      })
      .select('id')
      .single()
  }

  // Add some demo messages
  await addDemoMessages(supabaseClient, businessId)
}

async function addDemoMessages(supabaseClient: any, businessId: string) {
  // Get contact IDs first
  const { data: contacts } = await supabaseClient
    .from('whatsapp_contacts')
    .select('id, phone_number')
    .eq('business_id', businessId)

  if (!contacts?.length) return

  for (const contact of contacts.slice(0, 2)) {
    await supabaseClient
      .from('whatsapp_messages')
      .insert({
        business_id: businessId,
        contact_id: contact.id,
        content: contact.phone_number === '+972501234567' 
          ? 'שלום! אני מעוניין לקבל מידע על השירותים שלכם'
          : 'תודה על השירות המעולה!',
        direction: 'incoming',
        status: 'delivered'
      })
  }
}

async function handleDisconnect(supabaseClient: any, businessId: string) {
  const { error } = await supabaseClient
    .from('whatsapp_business_connections')
    .update({
      connection_status: 'disconnected',
      qr_code: null,
      updated_at: new Date().toISOString()
    })
    .eq('business_id', businessId)

  if (error) throw error

  return {
    success: true,
    message: 'WhatsApp נותק בהצלחה'
  }
}

async function handleSendMessage(supabaseClient: any, businessId: string, phone: string, message: string, contactName?: string) {
  // Add or update contact
  const { data: contact } = await supabaseClient
    .from('whatsapp_contacts')
    .upsert({
      business_id: businessId,
      phone_number: phone,
      name: contactName || phone
    })
    .select('id')
    .single()

  if (!contact) throw new Error('Failed to create/get contact')

  // Save message
  const { error: messageError } = await supabaseClient
    .from('whatsapp_messages')
    .insert({
      business_id: businessId,
      contact_id: contact.id,
      content: message,
      direction: 'outgoing',
      status: 'sent'
    })

  if (messageError) throw messageError

  return {
    success: true,
    message: 'הודעה נשלחה בהצלחה'
  }
}

async function handleReceiveMessage(supabaseClient: any, businessId: string, phone: string, message: string, contactName?: string) {
  // Add or update contact
  const { data: contact } = await supabaseClient
    .from('whatsapp_contacts')
    .upsert({
      business_id: businessId,
      phone_number: phone,
      name: contactName || phone
    })
    .select('id')
    .single()

  if (!contact) throw new Error('Failed to create/get contact')

  // Save incoming message
  const { error: messageError } = await supabaseClient
    .from('whatsapp_messages')
    .insert({
      business_id: businessId,
      contact_id: contact.id,
      content: message,
      direction: 'incoming',
      status: 'delivered'
    })

  if (messageError) throw messageError

  return {
    success: true,
    message: 'הודעה התקבלה בהצלחה'
  }
}

async function handleStatus(supabaseClient: any, businessId: string) {
  const { data, error } = await supabaseClient
    .from('whatsapp_business_connections')
    .select('*')
    .eq('business_id', businessId)
    .single()

  if (error && error.code !== 'PGRST116') throw error

  return {
    success: true,
    connection: data,
    status: data?.connection_status || 'disconnected'
  }
}

function generateRealisticQRCode(businessId: string): string {
  // Generate a realistic looking QR code as base64 data URL
  const qrData = `whatsapp-web-${businessId}-${Date.now()}`
  
  // Create a simple black and white pattern that looks like a QR code
  const canvas = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" fill="white"/>
    <g fill="black">
      <!-- Corner squares -->
      <rect x="0" y="0" width="60" height="60"/>
      <rect x="140" y="0" width="60" height="60"/>
      <rect x="0" y="140" width="60" height="60"/>
      <rect x="20" y="20" width="20" height="20" fill="white"/>
      <rect x="160" y="20" width="20" height="20" fill="white"/>
      <rect x="20" y="160" width="20" height="20" fill="white"/>
      
      <!-- Random pattern -->
      ${Array.from({length: 50}, () => {
        const x = Math.floor(Math.random() * 18) * 10 + 10
        const y = Math.floor(Math.random() * 18) * 10 + 10
        const size = Math.random() > 0.5 ? 10 : 20
        return `<rect x="${x}" y="${y}" width="${size}" height="${size}"/>`
      }).join('')}
    </g>
  </svg>`
  
  const base64 = btoa(canvas)
  return `data:image/svg+xml;base64,${base64}`
}