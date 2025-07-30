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
  const [permanentToken, setPermanentToken] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTokens();
    fetchPermanentToken();
  }, [employeeId]);

  const fetchTokens = async () => {
    try {
      const { data, error } = await supabase
        .from('employee_weekly_tokens')
        .select('*')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTokens(data || []);
    } catch (error) {
      console.error('Error fetching tokens:', error);
    }
  };

  const fetchPermanentToken = async () => {
    try {
      const { data, error } = await supabase
        .from('employee_permanent_tokens')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('is_active', true)
        .single();

      if (!error && data) {
        setPermanentToken(data);
      }
    } catch (error) {
      console.error('Error fetching permanent token:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePermanentToken = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-permanent-token', {
        body: { employee_id: employeeId }
      });

      if (error) throw error;
      
      toast({
        title: "הצלחה",
        description: "טוקן קבוע נוצר בהצלחה",
      });
      
      fetchPermanentToken();
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן ליצור טוקן קבוע",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async (token: string) => {
    try {
      await navigator.clipboard.writeText(token);
      toast({
        title: "הועתק",
        description: "הטוקן הועתק ללוח",
      });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן להעתיק",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6" dir="rtl">
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <KeyRound className="h-5 w-5" />
          טוקני הגשת משמרות
        </h2>
        <p className="text-gray-600 mb-6">
          טוקן קבוע לעובד {employeeName} להגשת משמרות
        </p>

        {/* Permanent Token */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            טוקן קבוע
          </h3>
          
          {permanentToken ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <Badge className="bg-green-100 text-green-700">
                  פעיל
                </Badge>
                <span className="text-sm text-gray-500">
                  נוצר: {format(new Date(permanentToken.created_at), 'dd/MM/yyyy')}
                </span>
              </div>
              
              <div className="bg-white border rounded p-3 mb-3 font-mono text-sm break-all">
                {permanentToken.token}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(permanentToken.token)}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  העתק
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`/public/permanent-shifts/${permanentToken.token}`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  פתח דף
                </Button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
              <KeyRound className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-4">אין טוקן קבוע</p>
              <Button onClick={generatePermanentToken}>
                <KeyRound className="h-4 w-4 mr-2" />
                צור טוקן קבוע
              </Button>
            </div>
          )}
        </div>

        {/* Weekly Tokens */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-500" />
            טוקנים שבועיים
          </h3>
          
          {tokens.length === 0 ? (
            <div className="text-center py-6">
              <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">אין טוקנים שבועיים</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tokens.slice(0, 5).map((token) => (
                <div key={token.id} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={token.is_active ? "default" : "secondary"}>
                      {token.is_active ? "פעיל" : "לא פעיל"}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {format(new Date(token.week_start_date), 'dd/MM')} - {format(new Date(token.week_end_date), 'dd/MM')}
                    </span>
                  </div>
                  
                  <div className="bg-white border rounded p-2 mb-2 font-mono text-xs break-all">
                    {token.token}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(token.token)}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      העתק
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};