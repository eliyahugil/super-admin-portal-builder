import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

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
    console.log('❌ OpenAI API key not configured');
    return new Response(
      JSON.stringify({ success: false, error: 'OpenAI API key not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    console.log('🔍 Received request for ID document analysis');
    const { file, fileName } = await req.json();
    
    if (!file) {
      console.log('❌ No file provided');
      return new Response(
        JSON.stringify({ success: false, error: 'No file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('📄 Processing file:', fileName);
    
    // If it's a PDF, we need to inform the user that direct PDF analysis isn't supported yet
    if (fileName && fileName.toLowerCase().endsWith('.pdf')) {
      console.log('❌ PDF detected - currently not supported for automatic analysis');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'ניתוח קובצי PDF אינו נתמך כרגע. אנא המר את התמונה לפורמט JPG או PNG' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('📤 Sending request to OpenAI...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert at analyzing Israeli ID documents. Extract the following information and return it as a JSON object:
            - first_name (Hebrew first name)
            - last_name (Hebrew last name) 
            - id_number (Israeli ID number - exactly 9 digits)
            - birth_date (birth date in YYYY-MM-DD format)
            - confidence (percentage of how confident you are in the extraction, 0-100)
            
            Return ONLY valid JSON in this exact format:
            {"first_name": "...", "last_name": "...", "id_number": "...", "birth_date": "...", "confidence": 95}
            
            Important:
            - If this is not an Israeli ID document, return an error
            - Ensure ID number is exactly 9 digits
            - Ensure birth date is valid and in correct format
            - Return only the JSON, no additional text`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please analyze this Israeli ID document and extract the personal information.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: file
                }
              }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.1
      })
    });

    console.log('📊 OpenAI Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API error:', response.status, errorText);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `שגיאה בשירות ניתוח התמונות. נסה שוב מאוחר יותר (${response.status})` 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('📊 Full OpenAI response:', JSON.stringify(data, null, 2));
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response structure from OpenAI');
    }
    
    const aiResponse = data.choices[0].message.content.trim();
    console.log('📝 AI Response content:', aiResponse);

    try {
      // Try to parse the JSON response
      const extractedData = JSON.parse(aiResponse);
      console.log('🔍 Parsed extracted data:', extractedData);
      
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

      console.log('✅ Validation complete, returning data:', extractedData);

      return new Response(JSON.stringify({ 
        success: true, 
        data: extractedData 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (parseError) {
      console.error('❌ Failed to parse AI response:', parseError);
      console.error('❌ Raw AI response:', aiResponse);
      
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'שגיאה בניתוח התמונה. אנא וודא שהתמונה ברורה ומכילה תעודת זהות ישראלית',
        raw_response: aiResponse.substring(0, 200) // Limit response size
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('💥 Error in analyze-id-document function:', error);
    console.error('💥 Error stack:', error.stack);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'שגיאה כללית בניתוח התמונה' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});