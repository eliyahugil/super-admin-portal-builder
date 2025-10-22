import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
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
    console.log('WhatsApp webhook called:', req.method)
    
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method === 'POST') {
      // Handle incoming messages from Twilio webhook
      const formData = await req.formData()
      const data: Record<string, string> = {}
      
      for (const [key, value] of formData.entries()) {
        data[key] = value.toString()
      }

      console.log('Webhook data:', data)

      const {
        From: from,
        To: to,
        Body: body,
        MessageSid: messageSid,
        ProfileName: profileName
      } = data

      if (!from || !body) {
        console.log('Missing required webhook data')
        return new Response('OK', { headers: corsHeaders })
      }

      // Extract phone number (remove whatsapp: prefix)
      const phoneNumber = from.replace('whatsapp:', '')
      
      // Find business based on the receiving WhatsApp number
      // In production, you'd map different Twilio numbers to different businesses
      const { data: businesses } = await supabaseClient
        .from('businesses')
        .select('id')
        .limit(1)

      if (!businesses || businesses.length === 0) {
        console.log('No business found')
        return new Response('OK', { headers: corsHeaders })
      }

      const businessId = businesses[0].id

      // Find or create contact
      let { data: contact } = await supabaseClient
        .from('whatsapp_contacts')
        .select('id')
        .eq('business_id', businessId)
        .eq('phone_number', phoneNumber)
        .single()

      if (!contact) {
        const { data: newContact, error: contactError } = await supabaseClient
          .from('whatsapp_contacts')
          .insert({
            business_id: businessId,
            phone_number: phoneNumber,
            contact_name: profileName || phoneNumber
          })
          .select()
          .single()

        if (contactError) {
          console.error('Error creating contact:', contactError)
          return new Response('OK', { headers: corsHeaders })
        }
        contact = newContact
      }

      // Store incoming message
      const { error: messageError } = await supabaseClient
        .from('whatsapp_messages')
        .insert({
          business_id: businessId,
          contact_id: contact.id,
          phone_number: phoneNumber,
          message_content: body,
          message_type: 'text',
          direction: 'incoming',
          message_status: 'received',
          whatsapp_message_id: messageSid,
          timestamp: new Date().toISOString()
        })

      if (messageError) {
        console.error('Error storing message:', messageError)
      } else {
        console.log('Message stored successfully')
      }

      return new Response('OK', { headers: corsHeaders })
    }

    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders 
    })

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response('OK', { headers: corsHeaders })
  }
})