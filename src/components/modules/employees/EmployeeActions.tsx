
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useBusiness } from '@/hooks/useBusiness';
import { 
  Eye, 
  Edit, 
  FileText, 
  Phone, 
  UserPlus,
  Settings
} from 'lucide-react';


interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  is_active: boolean;
}

interface EmployeeActionsProps {
  employee: Employee;
  onEdit?: (employeeId: string) => void;
  onTokenSent?: () => void;
}

export const EmployeeActions: React.FC<EmployeeActionsProps> = ({
  employee,
  onEdit,
  onTokenSent
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { businessId } = useBusiness();
  const employeeName = `${employee.first_name} ${employee.last_name}`;

  const handleViewProfile = () => {
    if (businessId) {
      navigate(`/business/${businessId}/modules/employees/profile/${employee.id}`);
    } else {
      navigate(`/modules/employees/profile/${employee.id}`);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(employee.id);
    } else {
      toast({
        title: 'עריכת עובד',
        description: 'הפונקציה תתווסף בקרוב',
      });
    }
  };

  const handleCall = () => {
    if (employee.phone) {
      window.open(`tel:${employee.phone}`, '_self');
    } else {
      toast({
        title: 'שגיאה',
        description: 'לא נמצא מספר טלפון לעובד זה',
        variant: 'destructive',
      });
    }
  };

  const handleViewDocuments = () => {
    if (businessId) {
      navigate(`/business/${businessId}/modules/employees/profile/${employee.id}#documents`);
    } else {
      navigate(`/modules/employees/profile/${employee.id}#documents`);
    }
  };

  const handleViewAttendance = () => {
    if (businessId) {
      navigate(`/business/${businessId}/modules/employees/attendance`);
    } else {
      navigate(`/modules/employees/attendance`);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {/* View Profile */}
      <Button
        onClick={handleViewProfile}
        variant="outline"
        size="sm"
        className="h-8 w-8 p-0"
        title="צפייה בפרופיל מלא"
      >
        <Eye className="h-3 w-3" />
      </Button>

      {/* Edit Employee */}
      <Button
        onClick={handleEdit}
        variant="outline"
        size="sm"
        className="h-8 w-8 p-0"
        title="עריכת עובד"
      >
        <Edit className="h-3 w-3" />
      </Button>

      {/* Call Employee */}
      {employee.phone && (
        <Button
          onClick={handleCall}
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
          title="התקשרות"
        >
          <Phone className="h-3 w-3" />
        </Button>
      )}

      {/* View Documents */}
      <Button
        onClick={handleViewDocuments}
        variant="outline"
        size="sm"
        className="h-8 w-8 p-0 text-purple-600 hover:text-purple-700"
        title="צפייה במסמכים"
      >
        <FileText className="h-3 w-3" />
      </Button>

    </div>
  );
};
