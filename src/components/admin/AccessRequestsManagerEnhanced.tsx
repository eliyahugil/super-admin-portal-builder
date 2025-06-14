import React, { useState } from 'react';
import { useAccessRequests } from '@/hooks/useAccessRequests';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckCircle, XCircle, Clock, UserPlus, Building2, Plus, User, Users, ShoppingCart, Phone, AlertCircle } from 'lucide-react';
import { AccessRequest } from '@/types/access-request';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BusinessCreationData {
  name: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
}

const AccessRequestCard: React.FC<{
  request: AccessRequest;
  onApprove: (requestId: string, assignmentData: any) => void;
  onReject: (requestId: string, reviewNotes: string) => void;
  isLoading: boolean;
}> = ({ request, onApprove, onReject, isLoading }) => {
  const [assignmentType, setAssignmentType] = useState<'existing_business' | 'new_business' | 'customer' | 'employee' | 'other'>('existing_business');
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [newBusinessData, setNewBusinessData] = useState<BusinessCreationData>({
    name: '',
    description: '',
    contactEmail: request.profiles?.email || '',
    contactPhone: ''
  });
  const [customUserType, setCustomUserType] = useState('');
  const [isCreateBusinessDialogOpen, setIsCreateBusinessDialogOpen] = useState(false);
  const { toast } = useToast();

  // Debug logging for profile data
  console.log('🔍 AccessRequestCard - Request data:', {
    id: request.id,
    user_id: request.user_id,
    profiles: request.profiles,
    businesses: request.businesses
  });

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            ממתין לאישור
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            אושר
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            נדחה
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Handle missing profile data
  const profileFullName = request.profiles?.full_name;
  const profileEmail = request.profiles?.email;
  const profilePhone = request.profiles?.phone;
  const hasProfileData = profileFullName || profileEmail || profilePhone;

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

    onApprove(request.id, assignmentData);
  };

  const createNewBusiness = async () => {
    if (!newBusinessData.name) {
      toast({
        title: 'שגיאה',
        description: 'נא להזין שם עסק',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('businesses')
        .insert({
          name: newBusinessData.name,
          description: newBusinessData.description,
          contact_email: newBusinessData.contactEmail,
          contact_phone: newBusinessData.contactPhone,
          owner_id: request.user_id,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      setSelectedBusinessId(data.id);
      setAssignmentType('existing_business');
      setIsCreateBusinessDialogOpen(false);

      toast({
        title: 'עסק נוצר בהצלחה',
        description: `העסק "${newBusinessData.name}" נוצר ונבחר לשיוך`,
      });
    } catch (error) {
      console.error('Error creating business:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן ליצור את העסק',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className={`border-l-4 ${request.status === 'pending' ? 'border-l-yellow-500' : 'border-l-gray-300'}`}>
      <CardContent className="p-6">
        {/* פרטי המבקש */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
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

            {request.businesses?.name && (
              <div className="flex items-center gap-2 mb-3 p-3 bg-gray-50 rounded">
                <Building2 className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">עסק מבוקש:</span>
                <span className="text-sm text-gray-900">{request.businesses.name}</span>
              </div>
            )}
          </div>
          {getStatusBadge(request.status)}
        </div>
        
        {request.request_reason && (
          <div className="mb-6">
            <h4 className="font-medium mb-2 text-gray-700">סיבת הבקשה ומידע נוסף:</h4>
            <div className="bg-gray-50 p-3 rounded border-l-4 border-l-blue-400">
              <p className="text-gray-800">{request.request_reason}</p>
            </div>
          </div>
        )}
        
        {
        request.status === 'pending' && (
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
                    onChange={(e) => setReviewNotes(e.target.value)}
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
                onClick={() => onReject(request.id, reviewNotes)}
                disabled={isLoading}
                className="flex items-center gap-2 border-red-300 text-red-700 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4" />
                דחה בקשה
              </Button>
            </div>
          </div>
        )
        }
        
        {request.status !== 'pending' && request.review_notes && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border-l-4 border-l-gray-400">
            <h4 className="font-medium mb-2 text-gray-700">הערות מנהל המערכת:</h4>
            <p className="text-sm text-gray-800">{request.review_notes}</p>
            {request.reviewed_at && (
              <p className="text-xs text-gray-500 mt-2">
                נבדק ב: {new Date(request.reviewed_at).toLocaleDateString('he-IL')} 
                {' בשעה '}
                {new Date(request.reviewed_at).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const AccessRequestsManagerEnhanced: React.FC = () => {
  const { requests, isLoading, handleRequestMutation } = useAccessRequests();

  // Debug logging for all requests
  console.log('📋 AccessRequestsManagerEnhanced - All requests:', requests);

  const handleApprove = (requestId: string, assignmentData: any) => {
    console.log('🔄 Approving request with assignment:', { requestId, assignmentData });
    
    handleRequestMutation.mutate({ 
      requestId, 
      action: 'approve',
      reviewNotes: assignmentData.reviewNotes,
      assignmentData: assignmentData
    });
  };

  const handleReject = (requestId: string, reviewNotes: string) => {
    console.log('❌ Rejecting request:', { requestId, reviewNotes });
    
    handleRequestMutation.mutate({ 
      requestId, 
      action: 'reject',
      reviewNotes: reviewNotes 
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8" dir="rtl">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <UserPlus className="h-8 w-8" />
          ניהול בקשות גישה מתקדם
        </h1>
        <p className="text-gray-600 mt-2">סקור פרטי משתמשים, שייך לעסק או צור עסק חדש, ואשר בקשות גישה למערכת</p>
      </div>
      
      {/* Debug Card for troubleshooting */}
      <Card className="mb-6 bg-yellow-50 border-yellow-200">
        <CardContent className="p-4">
          <h3 className="font-medium mb-2 text-yellow-800">מידע דיבוג למפתח:</h3>
          <div className="text-sm space-y-1">
            <p>סה"כ בקשות: {requests.length}</p>
            <p>בקשות ממתינות: {pendingRequests.length}</p>
            <p>בקשות מעובדות: {processedRequests.length}</p>
            <p className="text-xs text-yellow-700 mt-2">
              אם אינך רואה פרטי משתמש, בדוק את הקונסול לפרטים נוספים
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="mr-4">
                <p className="text-2xl font-bold text-yellow-600">{pendingRequests.length}</p>
                <p className="text-sm text-gray-600">בקשות ממתינות</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="mr-4">
                <p className="text-2xl font-bold text-green-600">
                  {requests.filter(r => r.status === 'approved').length}
                </p>
                <p className="text-sm text-gray-600">בקשות אושרו</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="mr-4">
                <p className="text-2xl font-bold text-red-600">
                  {requests.filter(r => r.status === 'rejected').length}
                </p>
                <p className="text-sm text-gray-600">בקשות נדחו</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Pending Requests */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            בקשות ממתינות לאישור ({pendingRequests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">אין בקשות ממתינות</h3>
              <p className="text-gray-600">כל הבקשות טופלו</p>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingRequests.map((request) => (
                <AccessRequestCard
                  key={request.id}
                  request={request}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  isLoading={handleRequestMutation.isPending}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Processed Requests */}
      <Card>
        <CardHeader>
          <CardTitle>בקשות שטופלו ({processedRequests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {processedRequests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">אין בקשות שטופלו</p>
            </div>
          ) : (
            <div className="space-y-4">
              {processedRequests.slice(0, 10).map((request) => (
                <AccessRequestCard
                  key={request.id}
                  request={request}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  isLoading={handleRequestMutation.isPending}
                />
              ))}
              {processedRequests.length > 10 && (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">
                    מוצגות 10 בקשות אחרונות מתוך {processedRequests.length}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
