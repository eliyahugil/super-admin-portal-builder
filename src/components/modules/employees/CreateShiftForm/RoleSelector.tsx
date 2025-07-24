import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase } from 'lucide-react';

interface ShiftRole {
  id: string;
  name: string;
  is_active: boolean;
}

interface RoleSelectorProps {
  selectedRoleId: string;
  onRoleChange: (roleId: string) => void;
  roles: ShiftRole[];
  disabled?: boolean;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  selectedRoleId,
  onRoleChange,
  roles,
  disabled = false
}) => {
  const activeRoles = roles.filter(role => role.is_active);

  if (activeRoles.length === 0) {
    return null; // לא מציגים את הרכיב אם אין תפקידים
  }

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2 text-sm font-medium">
        <Briefcase className="h-4 w-4" />
        תפקיד במשמרת
      </Label>
      
      <Select
        value={selectedRoleId}
        onValueChange={onRoleChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="בחר תפקיד (אופציונלי)" />
        </SelectTrigger>
        <SelectContent className="bg-white z-50">
          <SelectItem value="no-role">ללא תפקיד ספציפי</SelectItem>
          {activeRoles.map((role) => (
            <SelectItem key={role.id} value={role.id}>
              {role.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {activeRoles.length > 0 && (
        <p className="text-xs text-gray-500">
          בחר תפקיד ספציפי למשמרת (אופציונלי)
        </p>
      )}
    </div>
  );
};