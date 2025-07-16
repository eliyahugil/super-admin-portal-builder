import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

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
    const { phone, code } = await req.json();

    console.log('📱 Original phone number received:', phone);

    // Clean and format Israeli phone number
    let cleanPhone = phone.replace(/[\s\-\(\)]/g, ''); // Remove spaces, dashes, parentheses
    console.log('📱 Cleaned phone number:', cleanPhone);

    let formattedPhone = cleanPhone;
    if (cleanPhone.startsWith('0')) {
      // Israeli number starting with 0 - remove 0 and add +972
      formattedPhone = '+972' + cleanPhone.substring(1);
    } else if (cleanPhone.startsWith('972')) {
      // Already has 972 country code - add +
      formattedPhone = '+' + cleanPhone;
    } else if (!cleanPhone.startsWith('+')) {
      // No country code - assume Israeli and add +972
      formattedPhone = '+972' + cleanPhone;
    }

    console.log('📱 Final formatted phone number:', formattedPhone);

    // Validate phone number format (should be +972xxxxxxxxx with 9 digits after 972)
    const phoneRegex = /^\+972[5-9]\d{8}$/;
    if (!phoneRegex.test(formattedPhone)) {
      console.error('❌ Invalid phone number format:', formattedPhone);
      return new Response(
        JSON.stringify({ 
          error: 'מספר טלפון לא תקין. אנא הכנס מספר ישראלי תקין (לדוגמה: 050-1234567)' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');

    if (!accountSid || !authToken) {
      console.error('❌ Missing Twilio credentials');
      return new Response(
        JSON.stringify({ error: 'Twilio credentials not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create the message body
    const message = `קוד האימות שלך למערכת ניהול העובדים: ${code}`;
    
    // Get Twilio phone number from environment or use default
    const twilioFromNumber = Deno.env.get('TWILIO_FROM_NUMBER') || '+15551234567';
    
    // Prepare the request to Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    
    const formData = new URLSearchParams();
    formData.append('To', formattedPhone);
    formData.append('From', twilioFromNumber);
    formData.append('Body', message);

    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Twilio API error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to send SMS' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const result = await response.json();
    console.log('✅ SMS sent successfully:', result.sid);

    return new Response(
      JSON.stringify({ success: true, messageSid: result.sid }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Error sending SMS:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});