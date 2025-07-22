import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (!openAIApiKey) {
    return new Response(
      JSON.stringify({ error: 'OpenAI API key not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { image } = await req.json();
    
    if (!image) {
      return new Response(
        JSON.stringify({ error: 'No image provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analyzing ID document with OpenAI Vision...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: `אתה מומחה בניתוח תעודות זהות ישראליות. נתח את התמונה וחלץ את המידע הבא בפורמט JSON מדויק:
            {
              "first_name": "שם פרטי",
              "last_name": "שם משפחה", 
              "id_number": "מספר תעודת זהות (9 ספרות)",
              "birth_date": "תאריך לידה בפורמט YYYY-MM-DD",
              "confidence": "רמת ביטחון 0-100",
              "errors": ["רשימת שגיאות אם יש"]
            }
            
            חשוב:
            - אם זה לא תעודת זהות ישראלית, החזר שגיאה
            - וודא שמספר ת.ז. הוא 9 ספרות בדיוק
            - וודא שהתאריך תקין
            - אם יש ספק בקריאה, ציין ב-confidence נמוך
            - החזר רק JSON תקני ללא טקסט נוסף`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'אנא נתח את תעודת הזהות הזו וחלץ את המידע הנדרש'
              },
              {
                type: 'image_url',
                image_url: {
                  url: image
                }
              }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.1
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content.trim();
    
    console.log('OpenAI response:', aiResponse);

    try {
      // Try to parse the JSON response
      const extractedData = JSON.parse(aiResponse);
      
      // Validate the response structure
      if (!extractedData.first_name || !extractedData.last_name || !extractedData.id_number) {
        throw new Error('Missing required fields in extraction');
      }

      // Validate ID number format (9 digits)
      if (!/^\d{9}$/.test(extractedData.id_number)) {
        extractedData.errors = extractedData.errors || [];
        extractedData.errors.push('מספר תעודת זהות לא תקין');
        extractedData.confidence = Math.min(extractedData.confidence || 0, 50);
      }

      // Validate birth date format
      if (extractedData.birth_date && !/^\d{4}-\d{2}-\d{2}$/.test(extractedData.birth_date)) {
        extractedData.errors = extractedData.errors || [];
        extractedData.errors.push('פורמט תאריך לידה לא תקין');
        extractedData.confidence = Math.min(extractedData.confidence || 0, 50);
      }

      console.log('Extracted data:', extractedData);

      return new Response(JSON.stringify({ 
        success: true, 
        data: extractedData 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'שגיאה בניתוח התמונה. אנא וודא שהתמונה ברורה וברונה טובה',
        raw_response: aiResponse
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in analyze-id-document function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'שגיאה בניתוח התמונה' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});