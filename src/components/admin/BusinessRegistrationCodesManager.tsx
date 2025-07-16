import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Copy, Plus, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';

interface BusinessRegistrationCode {
  id: string;
  business_id: string;
  code: string;
  is_active: boolean;
  created_at: string;
  usage_count: number;
  max_usage: number | null;
  business_name?: string;
}

interface Business {
  id: string;
  name: string;
}

export const BusinessRegistrationCodesManager: React.FC = () => {
  const [codes, setCodes] = useState<BusinessRegistrationCode[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [maxUsage, setMaxUsage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchCodes();
    fetchBusinesses();
  }, []);

  const fetchCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('business_registration_codes')
        .select(`
          *,
          businesses!inner(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const codesWithBusinessName = data?.map(code => ({
        ...code,
        business_name: code.businesses?.name
      })) || [];

      setCodes(codesWithBusinessName);
    } catch (error: any) {
      toast({
        title: "שגיאה",
        description: `שגיאה בטעינת קודי ההרשמה: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const fetchBusinesses = async () => {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setBusinesses(data || []);
    } catch (error: any) {
      toast({
        title: "שגיאה",
        description: `שגיאה בטעינת העסקים: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const generateCode = async () => {
    if (!selectedBusinessId) {
      toast({
        title: "שגיאה",
        description: "יש לבחור עסק",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // יצירת קוד חדש
      const { data: newCode, error: codeError } = await supabase
        .rpc('generate_business_registration_code');

      if (codeError) throw codeError;

      const { error: insertError } = await supabase
        .from('business_registration_codes')
        .insert({
          business_id: selectedBusinessId,
          code: newCode,
          created_by: user?.id,
          max_usage: maxUsage ? parseInt(maxUsage) : null
        });

      if (insertError) throw insertError;

      toast({
        title: "הצלחה",
        description: `קוד הרשמה חדש נוצר בהצלחה: ${newCode}`,
      });

      // איפוס טופס
      setSelectedBusinessId('');
      setMaxUsage('');
      
      // רענון הרשימה
      fetchCodes();
    } catch (error: any) {
      toast({
        title: "שגיאה",
        description: `שגיאה ביצירת קוד הרשמה: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCodeStatus = async (codeId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('business_registration_codes')
        .update({ is_active: !currentStatus })
        .eq('id', codeId);

      if (error) throw error;

      toast({
        title: "הצלחה",
        description: `סטטוס הקוד ${!currentStatus ? 'הופעל' : 'הושבת'} בהצלחה`,
      });

      fetchCodes();
    } catch (error: any) {
      toast({
        title: "שגיאה",
        description: `שגיאה בעדכון סטטוס הקוד: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const deleteCode = async (codeId: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק קוד זה?')) return;

    try {
      const { error } = await supabase
        .from('business_registration_codes')
        .delete()
        .eq('id', codeId);

      if (error) throw error;

      toast({
        title: "הצלחה",
        description: "קוד ההרשמה נמחק בהצלחה",
      });

      fetchCodes();
    } catch (error: any) {
      toast({
        title: "שגיאה",
        description: `שגיאה במחיקת הקוד: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "הועתק",
      description: "הקוד הועתק ללוח",
    });
  };

  return (
    <div className="container mx-auto p-6" dir="rtl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">ניהול קודי הרשמה לעסקים</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">בחר עסק</label>
              <select
                value={selectedBusinessId}
                onChange={(e) => setSelectedBusinessId(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">בחר עסק...</option>
                {businesses.map((business) => (
                  <option key={business.id} value={business.id}>
                    {business.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">מגבלת שימושים (אופציונלי)</label>
              <Input
                type="number"
                value={maxUsage}
                onChange={(e) => setMaxUsage(e.target.value)}
                placeholder="ללא מגבלה"
                min="1"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={generateCode}
                disabled={isLoading}
                className="w-full"
              >
                <Plus className="h-4 w-4 ml-2" />
                {isLoading ? 'יוצר...' : 'צור קוד חדש'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {codes.map((code) => (
          <Card key={code.id} className="relative">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{code.business_name}</h3>
                  <Badge variant={code.is_active ? "default" : "secondary"}>
                    {code.is_active ? 'פעיל' : 'לא פעיל'}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleCodeStatus(code.id, code.is_active)}
                  >
                    {code.is_active ? 
                      <ToggleRight className="h-4 w-4" /> : 
                      <ToggleLeft className="h-4 w-4" />
                    }
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteCode(code.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                  <span className="font-mono text-lg font-bold">{code.code}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(code.code)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="text-sm text-gray-600 space-y-1">
                  <div>נוצר: {new Date(code.created_at).toLocaleDateString('he-IL')}</div>
                  <div>שימושים: {code.usage_count}{code.max_usage ? ` מתוך ${code.max_usage}` : ''}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {codes.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">אין קודי הרשמה עדיין</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};