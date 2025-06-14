
import type { AccessRequestMutationParams, AccessRequestEnriched } from '../types';
import { createNewBusiness } from './businessCreation';
import { createCustomerRecord } from './customerCreation';

export interface AssignmentResult {
  businessId: string | null;
  userRole: 'super_admin' | 'business_admin' | 'business_user';
}

export const resolveAssignmentType = async (
  assignmentData: AccessRequestMutationParams['assignmentData'],
  request: AccessRequestEnriched,
  requestedRole: 'super_admin' | 'business_admin' | 'business_user'
): Promise<AssignmentResult> => {
  if (!assignmentData) {
    return {
      businessId: null,
      userRole: requestedRole
    };
  }

  console.log('🔄 Processing assignment data:', assignmentData);

  switch (assignmentData.type) {
    case 'existing_business':
      return {
        businessId: assignmentData.businessId || null,
        userRole: requestedRole
      };

    case 'new_business': {
      const businessId = await createNewBusiness(assignmentData, request.user_id);
      return {
        businessId,
        userRole: 'business_admin' // Owner of new business becomes admin
      };
    }

    case 'customer': {
      const businessId = assignmentData.businessId || null;
      if (businessId) {
        await createCustomerRecord(businessId, request.profiles);
      }
      return {
        businessId,
        userRole: 'business_user'
      };
    }

    case 'employee':
      console.log('👨‍💼 User will be assigned as employee');
      return {
        businessId: assignmentData.businessId || null,
        userRole: 'business_user'
      };

    case 'other':
      console.log('🔧 Custom user type:', assignmentData.customUserType);
      return {
        businessId: assignmentData.businessId || null,
        userRole: 'business_user'
      };

    default:
      return {
        businessId: null,
        userRole: requestedRole
      };
  }
};

export const getAssignmentTypeLabel = (type: string): string => {
  switch (type) {
    case 'existing_business': return 'עסק קיים';
    case 'new_business': return 'עסק חדש';
    case 'customer': return 'לקוח';
    case 'employee': return 'עובד';
    case 'other': return 'סוג מותאם';
    default: return 'לא מוגדר';
  }
};
