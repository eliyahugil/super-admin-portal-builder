
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Verify the request is from an authenticated super admin
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user is super admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'super_admin') {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { businessData, adminData } = await req.json()

    console.log('Creating business admin user:', adminData.email)

    // Create the business admin user
    const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email: adminData.email,
      password: '123456', // Default password
      email_confirm: true,
      user_metadata: {
        full_name: adminData.full_name,
        role: 'business_admin'
      }
    })

    if (createUserError) {
      console.error('Error creating user:', createUserError)
      return new Response(
        JSON.stringify({ error: `Failed to create user: ${createUserError.message}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('User created successfully:', newUser.user.email)

    // Create the business
    const { data: business, error: businessError } = await supabaseAdmin
      .from('businesses')
      .insert({
        name: businessData.name,
        admin_email: adminData.email,
        contact_email: adminData.email,
        contact_phone: businessData.contact_phone || null,
        address: businessData.address || null,
        description: businessData.description || null,
        is_active: true,
        owner_id: newUser.user.id
      })
      .select()
      .single()

    if (businessError) {
      console.error('Error creating business:', businessError)
      // Clean up the user if business creation failed
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id)
      return new Response(
        JSON.stringify({ error: `Failed to create business: ${businessError.message}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Business created successfully:', business.name)

    // Create profile for the new user
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: newUser.user.id,
        email: adminData.email,
        full_name: adminData.full_name,
        role: 'business_admin',
        business_id: business.id
      })

    if (profileError) {
      console.error('Error creating profile:', profileError)
      // Don't fail the entire process for profile creation error
    }

    // Create default business module configurations
    const defaultModules = businessData.selectedModules || [
      'shift_management',
      'employee_documents',
      'employee_notes',
      'salary_management',
      'employee_contacts',
      'branch_management',
      'employee_attendance'
    ]

    if (defaultModules.length > 0) {
      const { error: modulesError } = await supabaseAdmin
        .from('business_module_config')
        .insert(
          defaultModules.map((module_key: string) => ({
            business_id: business.id,
            module_key,
            is_enabled: true,
            enabled_by: newUser.user.id,
            enabled_at: new Date().toISOString()
          }))
        )

      if (modulesError) {
        console.error('Error creating modules:', modulesError)
        // Don't fail for module configuration errors
      }
    }

    // Log the activity
    const { error: logError } = await supabaseAdmin
      .from('activity_logs')
      .insert({
        user_id: user.id,
        action: 'business_created_with_admin',
        target_type: 'business',
        target_id: business.id,
        details: {
          business_name: business.name,
          admin_email: adminData.email,
          admin_created: true,
          modules_enabled: defaultModules,
          created_at: new Date().toISOString()
        }
      })

    if (logError) {
      console.error('Error logging activity:', logError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        business,
        admin: {
          email: newUser.user.email,
          id: newUser.user.id
        },
        message: 'Business and admin user created successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
