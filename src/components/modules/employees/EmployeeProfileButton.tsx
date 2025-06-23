
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, User, FileText, Building, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

interface EmployeeProfileButtonProps {
  employeeId: string;
  employeeName: string;
  hasNotes?: boolean;
  hasDocuments?: boolean;
  hasBranchAssignments?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  showPreview?: boolean;
}

export const EmployeeProfileButton: React.FC<EmployeeProfileButtonProps> = ({
  employeeId,
  employeeName,
  hasNotes = false,
  hasDocuments = false,
  hasBranchAssignments = false,
  variant = 'default',
  size = 'sm',
  showPreview = false,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    const profilePath = `/modules/employees/profile/${employeeId}`;
    console.log('🔗 Navigating to employee profile:', {
      employeeId,
      employeeName,
      targetPath: profilePath,
      currentPath: window.location.pathname
    });
    navigate(profilePath);
  };

  if (!showPreview) {
    return (
      <Button
        variant={variant}
        size={size}
        onClick={handleClick}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
      >
        <Eye className="h-4 w-4" />
        <span>פרופיל</span>
      </Button>
    );
  }

  return (
    <div className="relative group">
      <Button
        variant={variant}
        size={size}
        onClick={handleClick}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
      >
        <Eye className="h-4 w-4" />
        <span>פרופיל</span>
      </Button>

      {/* Preview Tooltip */}
      <div className="absolute z-10 invisible group-hover:visible bg-white border border-gray-200 rounded-lg shadow-lg p-3 top-full mt-1 right-0 w-64">
        <div className="text-sm font-medium mb-2">{employeeName}</div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="flex items-center text-xs text-gray-600">
              <User className="h-3 w-3 mr-1" />
              פרטים אישיים
            </span>
            <Badge variant="outline" className="text-xs">זמין</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="flex items-center text-xs text-gray-600">
              <MessageSquare className="h-3 w-3 mr-1" />
              הערות
            </span>
            <Badge variant={hasNotes ? 'default' : 'secondary'} className="text-xs">
              {hasNotes ? 'יש' : 'אין'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="flex items-center text-xs text-gray-600">
              <FileText className="h-3 w-3 mr-1" />
              מסמכים
            </span>
            <Badge variant={hasDocuments ? 'default' : 'secondary'} className="text-xs">
              {hasDocuments ? 'יש' : 'אין'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="flex items-center text-xs text-gray-600">
              <Building className="h-3 w-3 mr-1" />
              הקצאות סניפים
            </span>
            <Badge variant={hasBranchAssignments ? 'default' : 'secondary'} className="text-xs">
              {hasBranchAssignments ? 'יש' : 'אין'}
            </Badge>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 mt-2 pt-2 border-t">
          לחץ לפתיחת פרופיל מלא עם כל הכרטיסיות
        </div>
      </div>
    </div>
  );
};
