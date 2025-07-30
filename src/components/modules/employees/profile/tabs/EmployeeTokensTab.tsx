import React, { useState } from 'react';
import { KeyRound, Star, Copy, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  const { useEmployeePermanentToken, generatePermanentTokens } = usePermanentTokens();
  
  const { data: tokenData, isLoading, refetch } = useEmployeePermanentToken(employeeId);
  const generateMutation = generatePermanentTokens;

  const handleGenerateToken = async () => {
    setIsGenerating(true);
    try {
      await generateMutation.mutateAsync({
        business_id: employee.business_id,
        employee_ids: [employeeId]
      });
      refetch();
    } catch (error) {
      console.error('Error generating token:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyToken = () => {
    if (tokenData?.token) {
      const tokenUrl = `${window.location.origin}/submit-shifts/${tokenData.token}`;
      navigator.clipboard.writeText(tokenUrl);
      toast.success('קישור הטוקן הועתק ללוח');
    }
  };
  
  return (
    <div className="p-8 bg-white min-h-[500px]" dir="rtl">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
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

        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">✓</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-800">הטאב עובד בהצלחה!</h3>
              <p className="text-green-700">המערכת טוענת כרגע את הטוקנים...</p>
            </div>
          </div>
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
            <div className="bg-white border border-green-300 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-gray-800">טוקן פעיל</span>
                </div>
                <div className="text-sm text-gray-500">
                  נוצר: {new Date(tokenData.created_at).toLocaleDateString('he-IL')}
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex items-center justify-between">
                  <code className="text-sm bg-white px-3 py-2 rounded border break-all">
                    {`${window.location.origin}/submit-shifts/${tokenData.token}`}
                  </code>
                  <Button 
                    onClick={handleCopyToken}
                    variant="outline" 
                    size="sm"
                    className="mr-2 flex-shrink-0"
                  >
                    <Copy className="h-4 w-4 ml-1" />
                    העתק
                  </Button>
                </div>
              </div>
              
              <p className="text-sm text-gray-600">
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