
import React from 'react';
import { AlertCircle, Phone } from 'lucide-react';
import { AccessRequest } from './types';

interface UserProfileDisplayProps {
  request: AccessRequest;
}

export const UserProfileDisplay: React.FC<UserProfileDisplayProps> = ({ request }) => {
  const profileFullName = request.profiles?.full_name;
  const profileEmail = request.profiles?.email;
  const profilePhone = request.profiles?.phone;
  const hasProfileData = profileFullName || profileEmail || profilePhone;

  return (
    <div className="bg-blue-50 p-4 rounded-lg mb-4">
      <h3 className="text-lg font-semibold text-blue-900 mb-2">פרטי המבקש</h3>
      
      {/* Show warning if profile data is missing */}
      {!hasProfileData && (
        <div className="bg-red-50 border border-red-200 p-3 rounded-lg mb-3">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="h-4 w-4" />
            <span className="font-medium">חסרים פרטי משתמש!</span>
          </div>
          <p className="text-sm text-red-700 mt-1">
            לא ניתן לטעון את פרטי המשתמש מהמסד נתונים. User ID: {request.user_id}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium text-gray-700">שם מלא:</span>
          <p className="text-gray-900 font-medium">
            {profileFullName || (
              <span className="text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                לא זמין
              </span>
            )}
          </p>
        </div>
        <div>
          <span className="font-medium text-gray-700">אימייל:</span>
          <p className="text-gray-900">
            {profileEmail || (
              <span className="text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                לא זמין
              </span>
            )}
          </p>
        </div>
        <div>
          <span className="font-medium text-gray-700">טלפון:</span>
          <p className="text-gray-900 flex items-center gap-1">
            <Phone className="h-3 w-3" />
            {profilePhone || (
              <span className="text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                לא זמין
              </span>
            )}
          </p>
        </div>
        <div>
          <span className="font-medium text-gray-700">תפקיד מבוקש:</span>
          <p className="text-gray-900">
            {request.requested_role === 'business_admin' ? 'מנהל עסק' : 
             request.requested_role === 'business_user' ? 'משתמש עסק' : 
             request.requested_role === 'super_admin' ? 'מנהל מערכת' : 
             request.requested_role}
          </p>
        </div>
        <div className="col-span-2">
          <span className="font-medium text-gray-700">תאריך בקשה:</span>
          <p className="text-gray-900">
            {new Date(request.created_at).toLocaleDateString('he-IL')} 
            {' בשעה '}
            {new Date(request.created_at).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div className="col-span-2">
          <span className="font-medium text-gray-700">מזהה משתמש:</span>
          <p className="text-xs text-gray-500 font-mono">{request.user_id}</p>
        </div>
      </div>
    </div>
  );
};
