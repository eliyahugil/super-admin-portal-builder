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
  XCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
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

export const EmployeeTokensTab: React.FC<EmployeeTokensTabProps> = ({
  employee,
  employeeId,
  employeeName
}) => {
  const [tokens, setTokens] = useState<EmployeeToken[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
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

  const getTokenURL = (token: string) => {
    return `${window.location.origin}/shift-submission/${token}`;
  };

  const openTokenPage = (token: string) => {
    const url = getTokenURL(token);
    window.open(url, '_blank');
  };

  const activeTokens = tokens.filter(t => t.is_active && new Date(t.expires_at) > new Date());
  const expiredTokens = tokens.filter(t => !t.is_active || new Date(t.expires_at) <= new Date());

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            טוקני הגשת משמרות - {employeeName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            טוקנים אישיים לעובד להגשת משמרות בשבועות שונים
          </p>

          {tokens.length === 0 ? (
            <div className="text-center py-8">
              <KeyRound className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">לא נמצאו טוקנים עבור עובד זה</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Active Tokens */}
              {activeTokens.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    טוקנים פעילים ({activeTokens.length})
                  </h3>
                  <div className="grid gap-4">
                    {activeTokens.map((token) => (
                      <Card key={token.id} className="border-green-200 bg-green-50/50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="bg-green-100 text-green-700">
                                פעיל
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                נוצר: {format(new Date(token.created_at), 'PPP', { locale: he })}
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4 inline mr-1" />
                              {format(new Date(token.week_start_date), 'PPP', { locale: he })} - {format(new Date(token.week_end_date), 'PPP', { locale: he })}
                            </div>
                          </div>
                          
                          <div className="bg-white border border-green-200 rounded-md p-3 mb-3">
                            <div className="font-mono text-sm break-all text-center">
                              {token.token}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              פג תוקף: {format(new Date(token.expires_at), 'PPp', { locale: he })}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyTokenToClipboard(token.token)}
                              >
                                <Copy className="h-4 w-4 mr-1" />
                                העתק
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openTokenPage(token.token)}
                              >
                                <ExternalLink className="h-4 w-4 mr-1" />
                                פתח דף
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Expired Tokens */}
              {expiredTokens.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-500" />
                    טוקנים שפג תוקפם ({expiredTokens.length})
                  </h3>
                  <div className="grid gap-4">
                    {expiredTokens.slice(0, 5).map((token) => (
                      <Card key={token.id} className="border-red-200 bg-red-50/50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="bg-red-100 text-red-700">
                                פג תוקף
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                נוצר: {format(new Date(token.created_at), 'PPP', { locale: he })}
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4 inline mr-1" />
                              {format(new Date(token.week_start_date), 'PPP', { locale: he })} - {format(new Date(token.week_end_date), 'PPP', { locale: he })}
                            </div>
                          </div>
                          
                          <div className="bg-white border border-red-200 rounded-md p-3 mb-3 opacity-60">
                            <div className="font-mono text-sm break-all text-center">
                              {token.token}
                            </div>
                          </div>

                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            פג תוקף: {format(new Date(token.expires_at), 'PPp', { locale: he })}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {expiredTokens.length > 5 && (
                      <p className="text-sm text-muted-foreground text-center">
                        ועוד {expiredTokens.length - 5} טוקנים...
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