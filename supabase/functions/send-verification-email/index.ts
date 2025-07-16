import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// יצירת לקוח Supabase עם הרשאות מנהל
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req: Request) => {
  // טיפול בבקשות CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      email, 
      confirmationUrl, 
      userFullName 
    } = await req.json();

    console.log('📧 שליחת מייל אימות ל:', email);

    // כאן תוכל להוסיף את הלוגיקה לשליחת מייל
    // באמצעות ספק מיילים כמו Resend או SendGrid
    
    // לעת עתה נחזיר הודעת הצלחה
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'מייל אימות נשלח בהצלחה',
        email: email 
      }),
      {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        },
      }
    );

  } catch (error) {
    console.error('❌ שגיאה בשליחת מייל אימות:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'שגיאה בשליחת מייל אימות',
        details: error.message 
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        },
      }
    );
  }
});