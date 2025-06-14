
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, XCircle, Building2, Plus, User, Users, ShoppingCart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AccessRequest } from './types';

interface BusinessCreationData {
  name: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
}

interface AssignmentFormProps {
  request: AccessRequest;
  onApprove: (assignmentData: any) => void;
  onReject: () => void;
  isLoading: boolean;
  reviewNotes: string;
  onReviewNotesChange: (notes: string) => void;
}

export const AssignmentForm: React.FC<AssignmentFormProps> = ({
  request,
  onApprove,
  onReject,
  isLoading,
  reviewNotes,
  onReviewNotesChange
}) => {
  const [assignmentType, setAssignmentType] = useState<'existing_business' | 'new_business' | 'customer' | 'employee' | 'other'>('existing_business');
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [newBusinessData, setNewBusinessData] = useState<BusinessCreationData>({
    name: '',
    description: '',
    contactEmail: request.profiles?.email || '',
    contactPhone: ''
  });
  const [customUserType, setCustomUserType] = useState('');
  const { toast } = useToast();

  const { data: businesses = [] } = useQuery({
    queryKey: ['businesses-for-assignment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('id, name, description, contact_email, is_active')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data || [];
    },
    enabled: request.status === 'pending'
  });

  const handleApprove = () => {
    const assignmentData = {
      type: assignmentType,
      businessId: selectedBusinessId,
      newBusinessData,
      customUserType,
      reviewNotes
    };

    if (assignmentType === 'existing_business' && !selectedBusinessId) {
      toast({
        title: 'שגיאה',
        description: 'נא לבחור עסק לשיוך המשתמש',
        variant: 'destructive',
      });
      return;
    }

    if (assignmentType === 'new_business' && !newBusinessData.name) {
      toast({
        title: 'שגיאה',
        description: 'נא להזין שם עסק',
        variant: 'destructive',
      });
      return;
    }

    if (assignmentType === 'other' && !customUserType) {
      toast({
        title: 'שגיאה',
        description: 'נא להגדיר סוג משתמש מותאם',
        variant: 'destructive',
      });
      return;
    }

    onApprove(assignmentData);
  };

  return (
    <div className="space-y-6 border-t pt-6">
      <div>
        <Label className="text-lg font-semibold text-gray-800 mb-4 block">אישור הבקשה ושיוך משתמש</Label>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor={`assignment-type-${request.id}`} className="font-medium">סוג השיוך:</Label>
            <Select value={assignmentType} onValueChange={(value: any) => setAssignmentType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="בחר סוג שיוך..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="existing_business">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    שיוך לעסק קיים
                  </div>
                </SelectItem>
                <SelectItem value="new_business">
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    יצירת עסק חדש
                  </div>
                </SelectItem>
                <SelectItem value="customer">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    לקוח
                  </div>
                </SelectItem>
                <SelectItem value="employee">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    עובד
                  </div>
                </SelectItem>
                <SelectItem value="other">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    סוג משתמש מותאם
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {assignmentType === 'existing_business' && (
            <div>
              <Label htmlFor={`business-${request.id}`}>בחר עסק לשיוך:</Label>
              <Select value={selectedBusinessId} onValueChange={setSelectedBusinessId}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר עסק..." />
                </SelectTrigger>
                <SelectContent>
                  {businesses.map((business) => (
                    <SelectItem key={business.id} value={business.id}>
                      <div>
                        <div className="font-medium">{business.name}</div>
                        {business.contact_email && (
                          <div className="text-xs text-gray-500">{business.contact_email}</div>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {assignmentType === 'new_business' && (
            <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
              <h5 className="font-medium text-blue-900">פרטי העסק החדש:</h5>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor={`business-name-${request.id}`}>שם העסק *</Label>
                  <Input
                    id={`business-name-${request.id}`}
                    value={newBusinessData.name}
                    onChange={(e) => setNewBusinessData({...newBusinessData, name: e.target.value})}
                    placeholder="שם העסק"
                  />
                </div>
                <div>
                  <Label htmlFor={`business-phone-${request.id}`}>טלפון</Label>
                  <Input
                    id={`business-phone-${request.id}`}
                    value={newBusinessData.contactPhone}
                    onChange={(e) => setNewBusinessData({...newBusinessData, contactPhone: e.target.value})}
                    placeholder="מספר טלפון"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor={`business-desc-${request.id}`}>תיאור העסק</Label>
                <Textarea
                  id={`business-desc-${request.id}`}
                  value={newBusinessData.description}
                  onChange={(e) => setNewBusinessData({...newBusinessData, description: e.target.value})}
                  placeholder="תיאור קצר של העסק..."
                  rows={2}
                />
              </div>
            </div>
          )}

          {assignmentType === 'other' && (
            <div>
              <Label htmlFor={`custom-type-${request.id}`}>הגדר סוג משתמש:</Label>
              <Input
                id={`custom-type-${request.id}`}
                value={customUserType}
                onChange={(e) => setCustomUserType(e.target.value)}
                placeholder="לדוגמה: ספק, קבלן, יועץ..."
              />
            </div>
          )}
          
          <div>
            <Label htmlFor={`notes-${request.id}`}>הערות לאישור (אופציונלי):</Label>
            <Textarea
              id={`notes-${request.id}`}
              value={reviewNotes}
              onChange={(e) => onReviewNotesChange(e.target.value)}
              placeholder="הערות למשתמש או לצוות..."
              rows={3}
            />
          </div>
        </div>
      </div>
      
      <div className="flex gap-3 pt-4 border-t">
        <Button
          onClick={handleApprove}
          disabled={isLoading}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
        >
          <CheckCircle className="h-4 w-4" />
          אשר ושייך משתמש
        </Button>
        <Button
          variant="outline"
          onClick={onReject}
          disabled={isLoading}
          className="flex items-center gap-2 border-red-300 text-red-700 hover:bg-red-50"
        >
          <XCircle className="h-4 w-4" />
          דחה בקשה
        </Button>
      </div>
    </div>
  );
};
