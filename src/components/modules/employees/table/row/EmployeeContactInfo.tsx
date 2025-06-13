
import React from 'react';
import { Phone, Mail } from 'lucide-react';

interface EmployeeContactInfoProps {
  phone?: string | null;
  email?: string | null;
}

export const EmployeeContactInfo: React.FC<EmployeeContactInfoProps> = ({
  phone,
  email
}) => {
  return (
    <div className="space-y-1">
      {phone && (
        <div className="flex items-center text-sm text-gray-600">
          <Phone className="h-3 w-3 mr-1" />
          {phone}
        </div>
      )}
      {email && (
        <div className="flex items-center text-sm text-gray-600">
          <Mail className="h-3 w-3 mr-1" />
          {email}
        </div>
      )}
    </div>
  );
};
