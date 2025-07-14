import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, businessId, to, message } = await req.json()
    console.log('WhatsApp function called:', { action, businessId, to, message })

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get Twilio credentials from secrets
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')

    if (!twilioAccountSid || !twilioAuthToken) {
      throw new Error('Twilio credentials not configured')
    }

    // Get business phone number or use configured Twilio number
    const twilioWhatsAppNumber = 'whatsapp:+1681312854' // Your actual Twilio WhatsApp number

    switch (action) {
      case 'connect':
        // For Twilio, we don't need QR codes - connection is instant
        console.log('Connecting WhatsApp for business:', businessId)
        
        // Update or create connection record
        const { data: connection, error: upsertError } = await supabaseClient
          .from('whatsapp_business_connections')
          .upsert({
            business_id: businessId,
            phone_number: twilioWhatsAppNumber,
            device_name: 'Twilio WhatsApp API',
            connection_status: 'connected',
            last_connected_at: new Date().toISOString()
          })
          .select()
          .single()

        if (upsertError) throw upsertError

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'WhatsApp connected via Twilio',
            connection 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'status':
        // Check connection status
        const { data: statusConnection } = await supabaseClient
          .from('whatsapp_business_connections')
          .select('*')
          .eq('business_id', businessId)
          .single()

        return new Response(
          JSON.stringify({ 
            success: true, 
            status: statusConnection?.connection_status || 'disconnected',
            connection: statusConnection 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'send_message':
        if (!to || !message) {
          throw new Error('Missing required parameters: to, message')
        }

        // Send message via Twilio WhatsApp API
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`
        
        const formData = new FormData()
        formData.append('From', twilioWhatsAppNumber)
        formData.append('To', `whatsapp:${to}`)
        formData.append('Body', message)

        const twilioResponse = await fetch(twilioUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`
          },
          body: formData
        })

        const twilioData = await twilioResponse.json()
        
        if (!twilioResponse.ok) {
          throw new Error(`Twilio error: ${twilioData.message}`)
        }

        // Store message in database
        const { data: messageRecord, error: messageError } = await supabaseClient
          .from('whatsapp_messages')
          .insert({
            business_id: businessId,
            phone_number: to,
            message_content: message,
            message_type: 'text',
            direction: 'outgoing',
            message_status: 'sent',
            whatsapp_message_id: twilioData.sid,
            timestamp: new Date().toISOString()
          })
          .select()
          .single()

        if (messageError) {
          console.error('Error storing message:', messageError)
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'WhatsApp message sent successfully',
            twilioMessageId: twilioData.sid,
            messageRecord
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'send_sms':
        if (!to || !message) {
          throw new Error('Missing required parameters: to, message')
        }

        // Send SMS via Twilio SMS API
        const smsUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`
        
        const smsFormData = new FormData()
        smsFormData.append('From', '+1681312854') // Your Twilio phone number (without whatsapp: prefix)
        smsFormData.append('To', to)
        smsFormData.append('Body', message)

        const smsResponse = await fetch(smsUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`
          },
          body: smsFormData
        })

        const smsData = await smsResponse.json()
        
        if (!smsResponse.ok) {
          throw new Error(`Twilio SMS error: ${smsData.message}`)
        }

        // Store SMS in database (we can reuse the same table or create a new one)
        const { data: smsRecord, error: smsError } = await supabaseClient
          .from('whatsapp_messages')
          .insert({
            business_id: businessId,
            phone_number: to,
            message_content: message,
            message_type: 'sms',
            direction: 'outgoing',
            message_status: 'sent',
            whatsapp_message_id: smsData.sid,
            timestamp: new Date().toISOString()
          })
          .select()
          .single()

        if (smsError) {
          console.error('Error storing SMS:', smsError)
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'SMS sent successfully',
            twilioMessageId: smsData.sid,
            messageRecord: smsRecord
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      default:
        throw new Error(`Unknown action: ${action}`)
    }
  } catch (error) {
    console.error('WhatsApp function error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})