
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
    console.log('🚀 Starting create-business-admin function');

    // Initialize admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Validate environment variables
    if (!Deno.env.get('SUPABASE_URL') || !Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')) {
      console.error('❌ Missing required environment variables');
      throw new Error('שגיאת תצורה: חסרים משתני סביבה נדרשים');
    }

    const { businessData, adminData, subscriptionData } = await req.json();
    console.log('📝 Request data received:', { 
      businessName: businessData?.name, 
      adminEmail: adminData?.email,
      hasSubscription: !!subscriptionData 
    });

    // Validate required data
    if (!businessData?.name || !adminData?.email || !adminData?.full_name) {
      throw new Error('חסרים נתונים נדרשים: שם עסק, מייל או שם מלא של המנהל');
    }

    // Step 1: Check if business already exists
    const { data: existingBusiness, error: checkError } = await supabaseAdmin
      .from('businesses')
      .select('id, name')
      .eq('name', businessData.name)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('❌ Error checking existing business:', checkError);
      throw new Error(`שגיאה בבדיקת עסק קיים: ${checkError.message}`);
    }

    if (existingBusiness) {
      throw new Error(`עסק עם השם "${businessData.name}" כבר קיים במערכת`);
    }

    // Step 2: Check if user with this email already exists
    const { data: existingUser, error: userCheckError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (userCheckError) {
      console.error('❌ Error checking existing users:', userCheckError);
      throw new Error(`שגיאה בבדיקת משתמשים קיימים: ${userCheckError.message}`);
    }

    const emailExists = existingUser.users?.some(user => user.email === adminData.email);
    if (emailExists) {
      throw new Error(`משתמש עם המייל ${adminData.email} כבר קיים במערכת`);
    }

    // Step 3: Create the business
    console.log('🏢 Creating business...');
    const { data: business, error: businessError } = await supabaseAdmin
      .from('businesses')
      .insert({
        name: businessData.name,
        contact_phone: businessData.contact_phone || null,
        contact_email: adminData.email, // אימייל העסק זהה לאימייל המנהל
        address: businessData.address || null,
        description: businessData.description || null,
        admin_email: adminData.email,
        is_active: true
      })
      .select()
      .single();

    if (businessError) {
      console.error('❌ Error creating business:', businessError);
      throw new Error(`שגיאה ביצירת העסק: ${businessError.message}`);
    }

    console.log('✅ Business created successfully:', business.id);

    // Step 4: Create business modules
    if (businessData.selectedModules && businessData.selectedModules.length > 0) {
      console.log('📦 Creating business modules...');
      const moduleInserts = businessData.selectedModules.map((moduleKey: string) => ({
        business_id: business.id,
        module_key: moduleKey,
        is_enabled: true,
        created_at: new Date().toISOString(),
        enabled_at: new Date().toISOString()
      }));

      const { error: modulesError } = await supabaseAdmin
        .from('business_module_config')
        .insert(moduleInserts);

      if (modulesError) {
        console.error('⚠️ Warning: Error creating modules:', modulesError);
        // Don't throw error, modules can be added later
      } else {
        console.log('✅ Business modules created successfully');
      }
    }

    // Step 5: Create subscription if provided
    if (subscriptionData) {
      console.log('💳 Creating subscription...');
      const { error: subscriptionError } = await supabaseAdmin
        .from('business_subscriptions')
        .insert({
          business_id: business.id,
          plan_id: subscriptionData.plan_id,
          start_date: subscriptionData.start_date,
          is_active: true
        });

      if (subscriptionError) {
        console.error('⚠️ Warning: Error creating subscription:', subscriptionError);
        // Don't throw error, subscription can be added later
      } else {
        console.log('✅ Subscription created successfully');
      }
    }

    // Step 6: Create admin user account with proper metadata
    console.log('👤 Creating admin user account...');
    const { data: adminUser, error: adminUserError } = await supabaseAdmin.auth.admin.createUser({
      email: adminData.email,
      password: '123456', // Initial password - user must change on first login
      email_confirm: true,
      user_metadata: {
        full_name: adminData.full_name,
        role: 'business_admin',
        business_id: business.id
      }
    });

    if (adminUserError) {
      console.error('❌ Error creating admin user:', adminUserError);
      
      // Try to cleanup business if user creation failed
      try {
        console.log('🧹 Attempting to cleanup business...');
        await supabaseAdmin.from('businesses').delete().eq('id', business.id);
        console.log('🧹 Business cleanup completed');
      } catch (cleanupError) {
        console.error('⚠️ Error cleaning up business:', cleanupError);
      }
      
      throw new Error(`שגיאה ביצירת המשתמש למנהל העסק: ${adminUserError.message}`);
    }

    if (!adminUser.user) {
      throw new Error('לא ניתן ליצור את המשתמש - לא התקבל מזהה משתמש');
    }

    console.log('✅ Admin user created successfully:', adminUser.user.id);

    // Step 7: Update business with owner_id
    console.log('🔗 Linking business to owner...');
    const { error: updateBusinessError } = await supabaseAdmin
      .from('businesses')
      .update({ owner_id: adminUser.user.id })
      .eq('id', business.id);

    if (updateBusinessError) {
      console.error('⚠️ Warning: Error updating business owner:', updateBusinessError);
      // Don't throw error, owner can be set later
    } else {
      console.log('✅ Business linked to owner successfully');
    }

    // Step 8: Wait a moment and verify profile was created correctly
    console.log('🔍 Waiting and verifying profile creation...');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', adminUser.user.id)
      .single();

    if (profileError) {
      console.error('⚠️ Warning: Error fetching profile:', profileError);
    } else {
      console.log('✅ Profile verified:', {
        id: profile.id,
        email: profile.email,
        role: profile.role,
        business_id: profile.business_id
      });
    }

    console.log('🎉 Business and admin creation completed successfully!');

    return new Response(
      JSON.stringify({
        success: true,
        business: business,
        admin: {
          id: adminUser.user.id,
          email: adminUser.user.email
        },
        message: 'העסק והמנהל נוצרו בהצלחה'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('💥 Function error:', error);
    
    // Return detailed error information
    const errorMessage = error instanceof Error ? error.message : 'שגיאה כללית במערכת';
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
