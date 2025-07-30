import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  KeyRound, 
  Copy, 
  RefreshCw, 
  Calendar,
  Clock,
  ExternalLink,
  CheckCircle,
  XCircle,
  Star,
  Eye
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { usePermanentTokens } from '@/hooks/usePermanentTokens';
import type { Employee } from '@/types/employee';

interface EmployeeTokensTabProps {
  employee: Employee;
  employeeId: string;
  employeeName: string;
}

interface EmployeeToken {
  id: string;
  token: string;
  business_id: string;
  week_start_date: string;
  week_end_date: string;
  expires_at: string;
  is_active: boolean;
  created_at: string;
}

interface PermanentToken {
  id: string;
  token: string;
  business_id: string;
  is_active: boolean;
  created_at: string;
  last_used_at?: string;
  uses_count: number;
}

export const EmployeeTokensTab: React.FC<EmployeeTokensTabProps> = ({
  employee,
  employeeId,
  employeeName
}) => {
  console.log('🎯 EmployeeTokensTab rendered with:', { employeeId, employeeName, hasEmployee: !!employee });
  
  const [tokens, setTokens] = useState<EmployeeToken[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { useEmployeePermanentToken, generatePermanentTokens, getPermanentTokenShifts } = usePermanentTokens();

  // Get permanent token for this employee
  const { data: permanentToken, isLoading: permanentLoading, error: permanentError } = useEmployeePermanentToken(employeeId);

  console.log('🔍 EmployeeTokensTab state:', { 
    tokensCount: tokens.length, 
    isLoading, 
    permanentLoading, 
    hasPermanentToken: !!permanentToken,
    permanentError: permanentError?.message 
  });

  useEffect(() => {
    console.log('🔄 EmployeeTokensTab useEffect triggered, employeeId:', employeeId);
    fetchTokens();
  }, [employeeId]);

  const fetchTokens = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('employee_weekly_tokens')
        .select('*')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTokens(data || []);
    } catch (error) {
      console.error('Error fetching tokens:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לטעון את הטוקנים",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePermanentToken = async () => {
    if (!employee.business_id) return;
    
    await generatePermanentTokens.mutateAsync({
      business_id: employee.business_id,
      employee_ids: [employeeId]
    });
  };

  const handleViewPermanentTokenShifts = async () => {
    if (!permanentToken?.token) return;
    
    try {
      const response = await getPermanentTokenShifts.mutateAsync({
        token: permanentToken.token
      });
      
      const url = `${window.location.origin}/public/permanent-shifts/${permanentToken.token}`;
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const copyTokenToClipboard = async (token: string) => {
    try {
      await navigator.clipboard.writeText(token);
      toast({
        title: "הועתק",
        description: "הטוקן הועתק ללוח",
      });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן להעתיק את הטוקן",
        variant: "destructive",
      });
    }
  };

  const getTokenURL = (token: string, isPermanent = false) => {
    if (isPermanent) {
      return `${window.location.origin}/public/permanent-shifts/${token}`;
    }
    return `${window.location.origin}/shift-submission/${token}`;
  };

  const openTokenPage = (token: string, isPermanent = false) => {
    const url = getTokenURL(token, isPermanent);
    window.open(url, '_blank');
  };

  const activeTokens = tokens.filter(t => t.is_active && new Date(t.expires_at) > new Date());
  const expiredTokens = tokens.filter(t => !t.is_active || new Date(t.expires_at) <= new Date());

  if (isLoading || permanentLoading) {
    console.log('⏳ EmployeeTokensTab loading state');
    return (
      <div className="w-full p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">טוען טוקנים...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-4" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6 border border-blue-100">
        <div className="flex items-center gap-3 mb-2">
          <KeyRound className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-800">טוקני הגשת משמרות</h2>
        </div>
        <p className="text-sm text-gray-600 font-medium">{employeeName}</p>
        <p className="text-xs text-gray-500 mt-1">
          טוקנים אישיים לעובד להגשת משמרות וצפייה בסידור עבודה
        </p>
      </div>

      {/* Permanent Token Card */}
      <Card className="mb-6 border-l-4 border-l-yellow-400">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Star className="h-5 w-5 text-yellow-500" />
            טוקן קבוע
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              מומלץ
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {permanentError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-700 text-sm">שגיאה: {permanentError.message}</p>
            </div>
          )}
          
          {permanentToken ? (
            <div className="space-y-4">
              {/* Token Info */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-green-700">פעיל וזמין</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    נוצר: {format(new Date(permanentToken.created_at), 'dd/MM/yyyy', { locale: he })}
                  </div>
                </div>
                
                <div className="bg-white border rounded-md p-3 mb-3">
                  <div className="font-mono text-xs break-all text-center text-gray-700">
                    {permanentToken.token}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center">
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">שימושים:</span> {permanentToken.uses_count}
                    {permanentToken.last_used_at && (
                      <span className="block sm:inline sm:mr-3">
                        <span className="font-medium">שימוש אחרון:</span> {format(new Date(permanentToken.last_used_at), 'dd/MM HH:mm', { locale: he })}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyTokenToClipboard(permanentToken.token)}
                      className="text-xs"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      העתק
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openTokenPage(permanentToken.token, true)}
                      className="text-xs"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      צפה
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <KeyRound className="h-8 w-8 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-4 text-sm">לא נוצר טוקן קבוע עדיין</p>
              <Button 
                onClick={handleGeneratePermanentToken}
                disabled={generatePermanentTokens.isPending}
                size="sm"
              >
                {generatePermanentTokens.isPending ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <KeyRound className="h-4 w-4 mr-2" />
                )}
                צור טוקן קבוע
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Tokens Card */}
      <Card className="border-l-4 border-l-blue-400">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-blue-500" />
            טוקנים שבועיים
            <Badge variant="outline" className="bg-gray-50 text-gray-600">
              מערכת ישנה
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tokens.length === 0 ? (
            <div className="text-center py-6">
              <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 text-sm">לא נמצאו טוקנים שבועיים</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Active Tokens */}
              {activeTokens.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    פעילים ({activeTokens.length})
                  </h4>
                  <div className="space-y-3">
                    {activeTokens.map((token) => (
                      <div key={token.id} className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-100 text-green-700 text-xs">פעיל</Badge>
                            <span className="text-xs text-gray-600">
                              {format(new Date(token.week_start_date), 'dd/MM', { locale: he })} - {format(new Date(token.week_end_date), 'dd/MM', { locale: he })}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            פג תוקף: {format(new Date(token.expires_at), 'dd/MM HH:mm', { locale: he })}
                          </div>
                        </div>
                        
                        <div className="bg-white border rounded p-2 mb-2">
                          <div className="font-mono text-xs break-all text-center text-gray-700">
                            {token.token}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyTokenToClipboard(token.token)}
                            className="text-xs"
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            העתק
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openTokenPage(token.token)}
                            className="text-xs"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            פתח
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Expired Tokens - Compact View */}
              {expiredTokens.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2 text-red-600">
                    <XCircle className="h-4 w-4" />
                    פג תוקף ({expiredTokens.length})
                  </h4>
                  <div className="space-y-2">
                    {expiredTokens.slice(0, 3).map((token) => (
                      <div key={token.id} className="bg-red-50 border border-red-200 rounded-lg p-3 opacity-75">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-red-100 text-red-700 text-xs">פג תוקף</Badge>
                            <span className="text-xs text-gray-600">
                              {format(new Date(token.week_start_date), 'dd/MM', { locale: he })} - {format(new Date(token.week_end_date), 'dd/MM', { locale: he })}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {format(new Date(token.expires_at), 'dd/MM', { locale: he })}
                          </span>
                        </div>
                      </div>
                    ))}
                    {expiredTokens.length > 3 && (
                      <p className="text-xs text-gray-500 text-center py-2">
                        ועוד {expiredTokens.length - 3} טוקנים שפג תוקפם
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};