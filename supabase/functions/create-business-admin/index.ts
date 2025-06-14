
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

    const { businessData, adminData, subscriptionData } = await req.json();
    console.log('📝 Request data:', { businessData, adminData, subscriptionData });

    // Step 1: Create the business
    console.log('🏢 Creating business...');
    const { data: business, error: businessError } = await supabaseAdmin
      .from('businesses')
      .insert({
        name: businessData.name,
        contact_phone: businessData.contact_phone,
        address: businessData.address,
        description: businessData.description,
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

    // Step 2: Create business modules
    if (businessData.selectedModules && businessData.selectedModules.length > 0) {
      console.log('📦 Creating business modules...');
      const moduleInserts = businessData.selectedModules.map((moduleKey: string) => ({
        business_id: business.id,
        module_key: moduleKey,
        is_enabled: true
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

    // Step 3: Create subscription if provided
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

    // Step 4: Create admin user account with proper metadata
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
        await supabaseAdmin.from('businesses').delete().eq('id', business.id);
        console.log('🧹 Business cleanup completed');
      } catch (cleanupError) {
        console.error('⚠️ Error cleaning up business:', cleanupError);
      }
      
      throw new Error(`שגיאה ביצירת המשתמש למנהל העסק: ${adminUserError.message}`);
    }

    console.log('✅ Admin user created successfully:', adminUser.user?.id);

    // Step 5: Update business with owner_id
    console.log('🔗 Linking business to owner...');
    const { error: updateBusinessError } = await supabaseAdmin
      .from('businesses')
      .update({ owner_id: adminUser.user?.id })
      .eq('id', business.id);

    if (updateBusinessError) {
      console.error('⚠️ Warning: Error updating business owner:', updateBusinessError);
      // Don't throw error, owner can be set later
    } else {
      console.log('✅ Business linked to owner successfully');
    }

    // Step 6: Verify profile was created correctly
    console.log('🔍 Verifying profile creation...');
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', adminUser.user?.id)
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
          id: adminUser.user?.id,
          email: adminUser.user?.email
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
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'שגיאה כללית במערכת'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
