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
    const { businessId, to, message, contactId } = await req.json()
    console.log('Send WhatsApp message:', { businessId, to, message, contactId })

    if (!businessId || !to || !message) {
      throw new Error('Missing required parameters: businessId, to, message')
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get Twilio credentials
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')

    if (!twilioAccountSid || !twilioAuthToken) {
      throw new Error('Twilio credentials not configured')
    }

    const twilioWhatsAppNumber = 'whatsapp:+14155238886' // Twilio sandbox number

    // Ensure contact exists
    let finalContactId = contactId
    if (!contactId) {
      const { data: existingContact } = await supabaseClient
        .from('whatsapp_contacts')
        .select('id')
        .eq('business_id', businessId)
        .eq('phone_number', to)
        .single()

      if (existingContact) {
        finalContactId = existingContact.id
      } else {
        // Create new contact
        const { data: newContact, error: contactError } = await supabaseClient
          .from('whatsapp_contacts')
          .insert({
            business_id: businessId,
            phone_number: to,
            contact_name: to
          })
          .select()
          .single()

        if (contactError) throw contactError
        finalContactId = newContact.id
      }
    }

    // Send message via Twilio
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
        contact_id: finalContactId,
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
      // Don't throw error - message was sent successfully
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Message sent successfully',
        twilioMessageId: twilioData.sid,
        messageRecord,
        contactId: finalContactId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Send WhatsApp message error:', error)
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