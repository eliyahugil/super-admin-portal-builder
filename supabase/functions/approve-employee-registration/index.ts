import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ApprovalRequest {
  requestId: string;
  createEmployee?: boolean;
  notes?: string;
  businessId: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { requestId, createEmployee, notes, businessId }: ApprovalRequest = await req.json();

    console.log('🔄 Processing approval request:', { requestId, createEmployee, businessId });

    // אישור הבקשה
    const { data: requestData, error: approvalError } = await supabase
      .from('employee_registration_requests')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        notes: notes,
      })
      .eq('id', requestId)
      .select('*')
      .single();

    if (approvalError) {
      console.error('❌ Error approving request:', approvalError);
      throw approvalError;
    }

    console.log('✅ Request approved:', requestData);

    let employeeData = null;

    // יצירת עובד חדש אם נדרש
    if (createEmployee && requestData) {
      console.log('🔄 Creating new employee from request data...');
      
      // בדיקה אם העובד כבר קיים
      const { data: existingEmployee, error: checkError } = await supabase
        .from('employees')
        .select('id')
        .eq('id_number', requestData.id_number)
        .eq('business_id', businessId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❌ Error checking existing employee:', checkError);
      }

      if (!existingEmployee) {
        // יצירת עובד חדש
        const { data: newEmployee, error: createError } = await supabase
          .from('employees')
          .insert({
            business_id: businessId,
            first_name: requestData.first_name,
            last_name: requestData.last_name,
            id_number: requestData.id_number,
            email: requestData.email,
            phone: requestData.phone,
            birth_date: requestData.birth_date,
            address: requestData.address,
            is_active: true,
            created_at: new Date().toISOString(),
          })
          .select('*')
          .single();

        if (createError) {
          console.error('❌ Error creating employee:', createError);
          throw createError;
        }

        employeeData = newEmployee;
        console.log('✅ Employee created:', newEmployee);

        // יצירת הקצאות סניפים אם יש
        if (requestData.preferred_branches && requestData.preferred_branches.length > 0) {
          const branchAssignments = requestData.preferred_branches.map((branchId: string, index: number) => ({
            employee_id: newEmployee.id,
            branch_id: branchId,
            role_name: 'עובד',
            priority_order: index + 1,
            is_active: true,
          }));

          const { error: assignmentError } = await supabase
            .from('employee_branch_assignments')
            .insert(branchAssignments);

          if (assignmentError) {
            console.error('❌ Error creating branch assignments:', assignmentError);
          } else {
            console.log('✅ Branch assignments created');
          }
        }
      } else {
        console.log('ℹ️ Employee already exists, skipping creation');
        employeeData = existingEmployee;
      }
    }

    // שליחת התראה למנהל העסק
    try {
      const { data: businessOwner, error: ownerError } = await supabase
        .from('businesses')
        .select('owner_id, name')
        .eq('id', businessId)
        .single();

      if (ownerError) {
        console.error('❌ Error fetching business owner:', ownerError);
      } else if (businessOwner) {
        // יצירת רשומת התראה
        const notificationMessage = createEmployee 
          ? `עובד חדש ${requestData.first_name} ${requestData.last_name} אושר ונוסף למערכת`
          : `בקשת רישום של ${requestData.first_name} ${requestData.last_name} אושרה`;

        const { error: notificationError } = await supabase
          .from('activity_logs')
          .insert({
            user_id: businessOwner.owner_id,
            action: 'employee_registration_approved',
            target_type: 'employee_registration_request',
            target_id: requestId,
            details: {
              employee_name: `${requestData.first_name} ${requestData.last_name}`,
              employee_created: createEmployee,
              business_name: businessOwner.name,
              message: notificationMessage
            }
          });

        if (notificationError) {
          console.error('❌ Error creating notification:', notificationError);
        } else {
          console.log('✅ Notification created');
        }
      }
    } catch (error) {
      console.error('❌ Error with notification process:', error);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'בקשת הרישום אושרה בהצלחה',
        employee: employeeData,
        request: requestData
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ Edge function error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'שגיאה בעיבוד הבקשה',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});