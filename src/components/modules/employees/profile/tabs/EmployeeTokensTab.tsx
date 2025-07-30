import React, { useState } from 'react';
import { KeyRound, Star, Copy, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePermanentTokens } from '@/hooks/usePermanentTokens';
import { toast } from 'sonner';
import type { Employee } from '@/types/employee';

interface EmployeeTokensTabProps {
  employee: Employee;
  employeeId: string;
  employeeName: string;
}

export const EmployeeTokensTab: React.FC<EmployeeTokensTabProps> = ({
  employee,
  employeeId,
  employeeName
}) => {
  console.log('🎯 EmployeeTokensTab נטען! employeeId:', employeeId);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const { generatePermanentTokens } = usePermanentTokens();
  
  // Direct query call instead of using nested hook
  const { data: tokenData, isLoading, refetch } = useQuery({
    queryKey: ['employee-permanent-token', employeeId],
    queryFn: async () => {
      if (!employeeId) return null;
      
      const { data, error } = await supabase
        .from('employee_permanent_tokens')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('is_active', true)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      return data;
    },
    enabled: !!employeeId,
  });

  console.log('🔍 Token data state:', { tokenData, isLoading, employeeId });
  console.log('📊 Full tokenData object:', JSON.stringify(tokenData, null, 2));

  const handleGenerateToken = async () => {
    console.log('🔥 Starting token generation for employee:', employeeId, 'business:', employee.business_id);
    setIsGenerating(true);
    try {
      const result = await generatePermanentTokens.mutateAsync({
        business_id: employee.business_id,
        employee_ids: [employeeId]
      });
      console.log('✅ Token generation result:', result);
      refetch();
    } catch (error) {
      console.error('❌ Error generating token:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyToken = () => {
    if (tokenData?.token) {
      const tokenUrl = `${window.location.origin}/public/permanent-shifts/${tokenData.token}`;
      navigator.clipboard.writeText(tokenUrl);
      toast.success('קישור הטוקן הועתק ללוח');
    }
  };

  const handleOpenToken = () => {
    if (tokenData?.token) {
      const tokenUrl = `${window.location.origin}/public/permanent-shifts/${tokenData.token}`;
      window.open(tokenUrl, '_blank');
    }
  };
  
  return (
    <div className="p-6" dir="rtl">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <KeyRound className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">
              טוקן אישי להגשת משמרות
            </h1>
          </div>
          <p className="text-lg text-gray-600 mb-2">
            עובד: <span className="font-semibold">{employeeName}</span>
          </p>
          <p className="text-sm text-gray-500">
            מזהה עובד: {employeeId}
          </p>
        </div>

        {/* Permanent Token Section */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Star className="h-6 w-6 text-yellow-600" />
            <h2 className="text-xl font-semibold text-gray-800">טוקן קבוע</h2>
          </div>
          <p className="text-gray-700 mb-4">
            טוקן זה יאפשר לעובד להגיש משמרות ולצפות בסידור העבודה שלו בכל עת.
          </p>
          {isLoading ? (
            <div className="bg-white border-2 border-dashed border-yellow-300 rounded-lg p-8 text-center">
              <KeyRound className="h-12 w-12 text-yellow-500 mx-auto mb-3 animate-pulse" />
              <p className="text-gray-600 text-lg">טוען טוקן...</p>
            </div>
          ) : tokenData ? (
            <div className="bg-white border border-green-300 rounded-lg p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <KeyRound className="h-6 w-6 text-green-600" />
                <span className="font-semibold text-gray-800">טוקן קבוע פעיל</span>
              </div>
              
              <div className="flex gap-3 justify-center">
                <Button 
                  onClick={handleOpenToken}
                  className="flex items-center gap-2"
                >
                  פתח טוקן
                </Button>
                <Button 
                  onClick={handleCopyToken}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  העתק קישור
                </Button>
              </div>
              
              <p className="text-sm text-gray-600 mt-4">
                העובד יכול להשתמש בקישור זה כדי להגיש משמרות ולצפות בסידור העבודה שלו
              </p>
            </div>
          ) : (
            <div className="bg-white border-2 border-dashed border-yellow-300 rounded-lg p-8 text-center">
              <KeyRound className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
              <p className="text-gray-600 text-lg mb-4">
                לא קיים טוקן קבוע עבור עובד זה
              </p>
              <Button 
                onClick={handleGenerateToken} 
                disabled={isGenerating}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {isGenerating ? 'יוצר טוקן...' : 'צור טוקן קבוע'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};