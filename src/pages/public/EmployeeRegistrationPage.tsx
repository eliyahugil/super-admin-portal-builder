import React, { useState, useEffect } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Loader2, CheckCircle, AlertCircle, Building2, MapPin, User, Phone, Mail, Calendar, Home } from 'lucide-react';

interface TokenInfo {
  id: string;
  business_id: string;
  title: string;
  description?: string;
  is_active: boolean;
  expires_at?: string;
  max_registrations?: number;
  current_registrations: number;
}

interface Branch {
  id: string;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

interface FormData {
  first_name: string;
  last_name: string;
  id_number: string;
  email: string;
  phone: string;
  birth_date: string;
  address?: string;
  preferred_branches: string[];
  branch_assignment_notes?: string;
  shift_preferences: {
    morning: boolean;
    evening: boolean;
    fixed_availability: Record<string, any>;
    unavailable_days: Record<string, any>;
    notes: string;
  };
}

export const EmployeeRegistrationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      shift_preferences: {
        morning: true,
        evening: false,
        fixed_availability: {},
        unavailable_days: {},
        notes: ''
      },
      preferred_branches: []
    }
  });

  const preferredBranches = watch('preferred_branches') || [];

  useEffect(() => {
    if (!token) {
      setError('לא נמצא טוקן רישום תקף');
      setIsLoading(false);
      return;
    }

    const fetchTokenInfo = async () => {
      try {
        // קבלת מידע על הטוקן
        const { data: tokenData, error: tokenError } = await supabase
          .rpc('get_registration_token_info', { token_value: token });

        if (tokenError) throw tokenError;
        
        if (!tokenData || tokenData.length === 0) {
          setError('טוקן רישום לא תקף או פג תוקף');
          return;
        }

        setTokenInfo(tokenData[0]);

        // קבלת רשימת סניפים
        const { data: branchesData, error: branchesError } = await supabase
          .rpc('get_business_branches_for_token', { token_value: token });

        if (branchesError) throw branchesError;
        setBranches(branchesData || []);

      } catch (err) {
        console.error('Error fetching token info:', err);
        setError('שגיאה בטעינת נתוני הרישום');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokenInfo();
  }, [token]);

  const handleBranchToggle = (branchId: string) => {
    const current = preferredBranches;
    const updated = current.includes(branchId)
      ? current.filter(id => id !== branchId)
      : [...current, branchId];
    setValue('preferred_branches', updated);
  };

  const onSubmit = async (data: FormData) => {
    if (!tokenInfo) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('employee_registration_requests')
        .insert({
          token_id: tokenInfo.id,
          business_id: tokenInfo.business_id,
          first_name: data.first_name,
          last_name: data.last_name,
          id_number: data.id_number,
          email: data.email,
          phone: data.phone,
          birth_date: data.birth_date,
          address: data.address,
          preferred_branches: data.preferred_branches,
          branch_assignment_notes: data.branch_assignment_notes,
          shift_preferences: data.shift_preferences,
          status: 'pending',
          submitted_at: new Date().toISOString(),
        });

      if (error) throw error;

      setSubmitted(true);
      toast.success('בקשת הרישום נשלחה בהצלחה!');

    } catch (err) {
      console.error('Error submitting registration:', err);
      toast.error('שגיאה בשליחת בקשת הרישום');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>טוען נתוני רישום...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">שגיאה</h2>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">בקשת הרישום נשלחה!</h2>
            <p className="text-muted-foreground mb-4">
              הבקשה שלך נשלחה בהצלחה ותיבדק על ידי המנהלים. 
              תקבל עדכון כאשר הבקשה תאושר.
            </p>
            <p className="text-sm text-muted-foreground">
              ניתן לסגור את הדף
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="text-center">
                <Building2 className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h1 className="text-2xl font-bold mb-2">בקשת הוספה כעובד</h1>
                <h2 className="text-xl text-muted-foreground mb-2">{tokenInfo?.title}</h2>
                {tokenInfo?.description && (
                  <p className="text-muted-foreground">{tokenInfo.description}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Registration Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                פרטים אישיים
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Personal Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">שם פרטי *</Label>
                    <Input
                      id="first_name"
                      {...register('first_name', { required: 'שם פרטי חובה' })}
                    />
                    {errors.first_name && (
                      <p className="text-sm text-destructive mt-1">{errors.first_name.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="last_name">שם משפחה *</Label>
                    <Input
                      id="last_name"
                      {...register('last_name', { required: 'שם משפחה חובה' })}
                    />
                    {errors.last_name && (
                      <p className="text-sm text-destructive mt-1">{errors.last_name.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="id_number">תעודת זהות *</Label>
                    <Input
                      id="id_number"
                      {...register('id_number', { 
                        required: 'תעודת זהות חובה',
                        pattern: {
                          value: /^\d{9}$/,
                          message: 'תעודת זהות חייבת להכיל 9 ספרות'
                        }
                      })}
                    />
                    {errors.id_number && (
                      <p className="text-sm text-destructive mt-1">{errors.id_number.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="birth_date">תאריך לידה *</Label>
                    <Input
                      id="birth_date"
                      type="date"
                      {...register('birth_date', { required: 'תאריך לידה חובה' })}
                    />
                    {errors.birth_date && (
                      <p className="text-sm text-destructive mt-1">{errors.birth_date.message}</p>
                    )}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">דוא"ל *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register('email', { 
                        required: 'דוא"ל חובה',
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: 'כתובת דוא"ל לא תקינה'
                        }
                      })}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">טלפון *</Label>
                    <Input
                      id="phone"
                      {...register('phone', { 
                        required: 'מספר טלפון חובה',
                        pattern: {
                          value: /^[0-9\-\s\+]{9,15}$/,
                          message: 'מספר טלפון לא תקין'
                        }
                      })}
                      placeholder="050-1234567"
                    />
                    {errors.phone && (
                      <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">כתובת</Label>
                  <Input
                    id="address"
                    {...register('address')}
                    placeholder="רחוב, עיר"
                  />
                </div>

                {/* Branch Preferences */}
                {branches.length > 0 && (
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      סניפים מועדפים
                    </Label>
                    <div className="space-y-2">
                      {branches.map((branch) => (
                        <div key={branch.id} className="flex items-center space-x-2 space-x-reverse">
                          <Checkbox
                            id={`branch-${branch.id}`}
                            checked={preferredBranches.includes(branch.id)}
                            onCheckedChange={() => handleBranchToggle(branch.id)}
                          />
                          <Label htmlFor={`branch-${branch.id}`} className="flex-1">
                            <div className="font-medium">{branch.name}</div>
                            {branch.address && (
                              <div className="text-sm text-muted-foreground">{branch.address}</div>
                            )}
                          </Label>
                        </div>
                      ))}
                    </div>
                    
                    <div>
                      <Label htmlFor="branch_notes">הערות לגבי העמדה בסניפים</Label>
                      <Textarea
                        id="branch_notes"
                        {...register('branch_assignment_notes')}
                        placeholder="הערות נוספות לגבי העדפות סניפים..."
                        rows={2}
                      />
                    </div>
                  </div>
                )}

                {/* Shift Preferences */}
                <div className="space-y-3">
                  <Label>העדפות משמרות</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id="morning"
                        checked={watch('shift_preferences.morning')}
                        onCheckedChange={(checked) => setValue('shift_preferences.morning', checked as boolean)}
                      />
                      <Label htmlFor="morning">משמרות בוקר</Label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id="evening"
                        checked={watch('shift_preferences.evening')}
                        onCheckedChange={(checked) => setValue('shift_preferences.evening', checked as boolean)}
                      />
                      <Label htmlFor="evening">משמרות ערב</Label>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="shift_notes">הערות נוספות</Label>
                    <Textarea
                      id="shift_notes"
                      {...register('shift_preferences.notes')}
                      placeholder="הערות לגבי זמינות, מגבלות זמן וכו'..."
                      rows={3}
                    />
                  </div>
                </div>

                {/* Submit */}
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      שולח בקשה...
                    </>
                  ) : (
                    'שלח בקשת רישום'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};