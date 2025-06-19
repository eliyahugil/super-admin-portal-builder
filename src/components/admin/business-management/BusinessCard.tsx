
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Settings, Edit, CheckCircle, XCircle, Trash2 } from 'lucide-react';

interface EnrichedBusiness {
  id: string;
  name: string;
  contact_email?: string;  // Optional to match database schema
  admin_email?: string;    // Optional to match database schema
  contact_phone?: string;  // Optional to match database schema
  description?: string;
  logo_url?: string;
  is_active: boolean;
  created_at: string;
  employee_count?: number;
  branches_count?: number;
  last_activity?: string;
}

interface BusinessCardProps {
  business: EnrichedBusiness;
  onView: (businessId: string) => void;
  onSettings: (businessId: string) => void;
  onEdit: (businessId: string) => void;
  onDelete: (businessId: string) => void;
}

export const BusinessCard: React.FC<BusinessCardProps> = ({
  business,
  onView,
  onSettings,
  onEdit,
  onDelete
}) => {
  const getStatusBadge = (status: boolean) => {
    return status ? (
      <Badge className="bg-green-100 text-green-800">פעיל</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">לא פעיל</Badge>
    );
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const handleDelete = () => {
    if (confirm(`האם אתה בטוח שברצונך למחוק את העסק "${business.name}"? פעולה זו לא ניתנת לביטול ותמחק את כל הנתונים הקשורים לעסק.`)) {
      onDelete(business.id);
    }
  };

  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-start space-x-4 space-x-reverse">
          <div className="flex-shrink-0">
            {getStatusIcon(business.is_active)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {business.name}
              </h3>
              {getStatusBadge(business.is_active)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div>
                <p><strong>אימייל יצירת קשר:</strong> {business.contact_email || business.admin_email || 'לא צוין'}</p>
                <p><strong>טלפון:</strong> {business.contact_phone || 'לא צוין'}</p>
              </div>
              <div>
                <p><strong>עובדים:</strong> {business.employee_count || 0}</p>
                <p><strong>סניפים:</strong> {business.branches_count || 0}</p>
              </div>
              <div>
                <p><strong>נרשם:</strong> {new Date(business.created_at).toLocaleDateString('he-IL')}</p>
                <p><strong>פעיל לאחרונה:</strong> {new Date(business.last_activity || business.created_at).toLocaleDateString('he-IL')}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onView(business.id)}
          >
            <Eye className="h-4 w-4 mr-1" />
            צפייה
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onSettings(business.id)}
          >
            <Settings className="h-4 w-4 mr-1" />
            הגדרות
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onEdit(business.id)}
          >
            <Edit className="h-4 w-4 mr-1" />
            עריכה
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={handleDelete}
            className="text-red-600 hover:text-red-800 border-red-300 hover:border-red-400"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            מחק
          </Button>
        </div>
      </div>
    </div>
  );
};
