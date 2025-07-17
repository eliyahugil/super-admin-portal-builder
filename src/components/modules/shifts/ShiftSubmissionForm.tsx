
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { ShiftTokenService, ShiftSubmissionData } from '@/services/ShiftTokenService';
import { Clock, MapPin, User, Calendar } from 'lucide-react';

export const ShiftSubmissionForm: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [tokenData, setTokenData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedShiftType, setSelectedShiftType] = useState<string>('');
  const [canWorkMorning, setCanWorkMorning] = useState(false);
  const [canWorkEvening, setCanWorkEvening] = useState(false);
  const [formData, setFormData] = useState<ShiftSubmissionData>({
    shift_date: '',
    start_time: '',
    end_time: '',
    branch_preference: '',
    role_preference: '',
    notes: '',
  });

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        toast({
          title: 'שגיאה',
          description: 'לא נמצא טוקן תקף',
          variant: 'destructive',
        });
        navigate('/');
        return;
      }

      try {
        const data = await ShiftTokenService.validateToken(token);
        if (!data) {
          toast({
            title: 'טוקן לא תקף',
            description: 'הטוקן פג תוקף או כבר נוצל',
            variant: 'destructive',
          });
          navigate('/');
          return;
        }
        setTokenData(data);
      } catch (error) {
        console.error('Token validation error:', error);
        toast({
          title: 'שגיאה',
          description: 'שגיאה בבדיקת הטוקן',
          variant: 'destructive',
        });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    // Validate that a shift type is selected
    if (!selectedShiftType) {
      toast({
        title: 'שגיאה',
        description: 'יש לבחור סוג משמרת',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      await ShiftTokenService.submitShift(token, formData);
      toast({
        title: 'הצלחה!',
        description: 'בקשת המשמרת נשלחה בהצלחה',
      });
      navigate('/shift-submitted');
    } catch (error) {
      console.error('Shift submission error:', error);
      toast({
        title: 'שגיאה',
        description: 'שגיאה בשליחת בקשת המשמרת',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ShiftSubmissionData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleShiftTypeChange = (shiftType: string) => {
    setSelectedShiftType(shiftType);
    
    // Set predefined times based on shift type
    switch(shiftType) {
      case 'morning':
        setFormData(prev => ({ ...prev, start_time: '07:00', end_time: '15:00' }));
        break;
      case 'afternoon':
        setFormData(prev => ({ ...prev, start_time: '15:00', end_time: '23:00' }));
        break;
      case 'evening':
        setFormData(prev => ({ ...prev, start_time: '17:00', end_time: '01:00' }));
        break;
      case 'night':
        setFormData(prev => ({ ...prev, start_time: '23:00', end_time: '07:00' }));
        break;
    }
  };

  // Get available shift types based on employee preference
  const getAvailableShiftTypes = () => {
    const preferredType = tokenData?.employee?.preferred_shift_type;
    const allTypes = [
      { value: 'morning', label: 'משמרת בוקר (07:00-15:00)', time: '07:00-15:00' },
      { value: 'afternoon', label: 'משמרת צהריים (15:00-23:00)', time: '15:00-23:00' },
      { value: 'evening', label: 'משמרת ערב (17:00-01:00)', time: '17:00-01:00' },
      { value: 'night', label: 'משמרת לילה (23:00-07:00)', time: '23:00-07:00' }
    ];

    // If employee has a preferred shift type, show only that as primary option
    if (preferredType) {
      return allTypes.filter(type => type.value === preferredType);
    }
    
    // If no preference, show all options
    return allTypes;
  };

  // Get additional shift types (for special checkboxes)
  const getAdditionalShiftTypes = () => {
    const preferredType = tokenData?.employee?.preferred_shift_type;
    const allTypes = [
      { value: 'morning', label: 'יכול לעבוד גם בבוקר', enabled: canWorkMorning, setter: setCanWorkMorning },
      { value: 'evening', label: 'יכול לעבוד גם בערב', enabled: canWorkEvening, setter: setCanWorkEvening }
    ];

    // If employee is evening worker, show morning as additional option
    if (preferredType === 'evening') {
      return allTypes.filter(type => type.value === 'morning');
    }
    
    // If employee is morning worker, show evening as additional option  
    if (preferredType === 'morning') {
      return allTypes.filter(type => type.value === 'evening');
    }
    
    return [];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">טוען...</p>
        </div>
      </div>
    );
  }

  if (!tokenData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              הגשת בקשה למשמרת
            </CardTitle>
            <div className="flex items-center justify-center gap-2 text-gray-600 mt-2">
              <User className="h-4 w-4" />
              <span>
                {tokenData.employee?.first_name} {tokenData.employee?.last_name}
              </span>
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Shift Type Selection */}
              <div>
                <Label className="text-base font-medium mb-3 block">בחירת סוג משמרת</Label>
                <div className="space-y-3">
                  {getAvailableShiftTypes().map((shiftType) => (
                    <div key={shiftType.value} className="border rounded-lg p-3">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <input
                          type="radio"
                          id={shiftType.value}
                          name="shiftType"
                          value={shiftType.value}
                          checked={selectedShiftType === shiftType.value}
                          onChange={(e) => handleShiftTypeChange(e.target.value)}
                          className="h-4 w-4"
                        />
                        <Label htmlFor={shiftType.value} className="flex-1 cursor-pointer">
                          {shiftType.label}
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Additional shift options for special days */}
                {getAdditionalShiftTypes().length > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <Label className="text-sm font-medium mb-2 block text-blue-800">
                      אופציות נוספות לימים מיוחדים
                    </Label>
                    <div className="space-y-2">
                      {getAdditionalShiftTypes().map((option) => (
                        <div key={option.value} className="flex items-center space-x-2 space-x-reverse">
                          <Checkbox
                            id={`additional-${option.value}`}
                            checked={option.enabled}
                            onCheckedChange={(checked) => option.setter(!!checked)}
                          />
                          <Label htmlFor={`additional-${option.value}`} className="text-sm cursor-pointer">
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="shift_date" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    תאריך המשמרת
                  </Label>
                  <Input
                    id="shift_date"
                    type="date"
                    value={formData.shift_date}
                    onChange={(e) => handleInputChange('shift_date', e.target.value)}
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <Label htmlFor="branch_preference" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    העדפת סניף
                  </Label>
                  <Input
                    id="branch_preference"
                    placeholder="שם הסניף המועדף"
                    value={formData.branch_preference}
                    onChange={(e) => handleInputChange('branch_preference', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_time" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    שעת התחלה
                  </Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => handleInputChange('start_time', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="end_time" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    שעת סיום
                  </Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => handleInputChange('end_time', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="role_preference">העדפת תפקיד (אופציונלי)</Label>
                <Input
                  id="role_preference"
                  placeholder="התפקיד המועדף עליך"
                  value={formData.role_preference}
                  onChange={(e) => handleInputChange('role_preference', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="notes">הערות נוספות (אופציונלי)</Label>
                <Textarea
                  id="notes"
                  placeholder="הערות או בקשות מיוחדות"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>שימו לב:</strong> לאחר שליחת הבקשה לא ניתן יהיה לערוך אותה. 
                  אנא ודאו שכל הפרטים נכונים לפני השליחה.
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={submitting}
              >
                {submitting ? 'שולח...' : 'שלח בקשת משמרת'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
