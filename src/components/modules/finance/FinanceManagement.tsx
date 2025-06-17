
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, TrendingDown, Plus, Eye } from 'lucide-react';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { useAuth } from '@/components/auth/AuthContext';
import { useBusinessSelection } from '@/hooks/useBusinessSelection';
import { BusinessSelector } from '@/components/shared/BusinessSelector';
import { useFinanceData } from './hooks/useFinanceData';

export const FinanceManagement: React.FC = () => {
  const { isSuperAdmin } = useCurrentBusiness();
  const { profile } = useAuth();
  const { selectedBusinessId, setSelectedBusinessId } = useBusinessSelection();
  const { data: financeData = [], isLoading } = useFinanceData(selectedBusinessId);

  console.log('💰 FinanceManagement - Current state:', {
    selectedBusinessId,
    isSuperAdmin,
    userRole: profile?.role,
    dataCount: financeData.length
  });

  // Calculate summary statistics from real data
  const monthlyIncome = financeData
    .filter(t => t.transaction_type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = financeData
    .filter(t => t.transaction_type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = monthlyIncome - monthlyExpenses;

  return (
    <div className="max-w-7xl mx-auto p-6" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">ניהול כספים</h1>
        <p className="text-gray-600 mt-2">מעקב הכנסות, הוצאות ודוחות כספיים</p>
        
        {isSuperAdmin && (
          <div className="mt-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                בחר עסק לצפייה
              </label>
              <BusinessSelector
                selectedBusinessId={selectedBusinessId}
                onBusinessChange={setSelectedBusinessId}
                placeholder="בחר עסק לניהול כספים"
                className="max-w-md"
              />
            </div>
            {selectedBusinessId && (
              <Badge variant="outline" className="text-xs">
                מציג נתונים עבור עסק: {selectedBusinessId}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Show content only if business is selected (for super admin) or user has business context */}
      {(selectedBusinessId || !isSuperAdmin) && (
        <>
          {/* Financial Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">סך הכנסות חודשיות</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₪{monthlyIncome.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="inline h-3 w-3 text-green-500" />
                  מהנתונים הקיימים
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">הוצאות חודשיות</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₪{monthlyExpenses.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingDown className="inline h-3 w-3 text-red-500" />
                  מהנתונים הקיימים
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">רווח נקי</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₪{netProfit.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {netProfit >= 0 ? (
                    <TrendingUp className="inline h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="inline h-3 w-3 text-red-500" />
                  )}
                  הכנסות מינוס הוצאות
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">זרימת מזומנים</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₪{monthlyIncome.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  יתרה מחושבת
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>הכנסות</CardTitle>
                <CardDescription>רישום הכנסות חדשות</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  הוסף הכנסה
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>הוצאות</CardTitle>
                <CardDescription>רישום הוצאות ועלויות</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  הוסף הוצאה
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>דוחות</CardTitle>
                <CardDescription>צפייה בדוחות כספיים</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  צפה בדוחות
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>תנועות אחרונות</CardTitle>
                  <CardDescription>תנועות כספיות מהנתונים</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  צפה בהכל
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">טוען נתונים...</div>
              ) : financeData.length > 0 ? (
                <div className="space-y-4">
                  {financeData.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          transaction.transaction_type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {transaction.transaction_type === 'income' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-500">{transaction.category}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(transaction.transaction_date).toLocaleDateString('he-IL')}
                          </p>
                        </div>
                      </div>
                      <div className="text-left">
                        <span className={`font-bold ${
                          transaction.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.transaction_type === 'income' ? '+' : '-'}₪{transaction.amount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  אין תנועות כספיות עדיין
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Show business selection prompt for super admin */}
      {isSuperAdmin && !selectedBusinessId && (
        <div className="text-center py-12">
          <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">בחר עסק לניהול כספים</h2>
          <p className="text-gray-600">יש לבחור עסק ספציפי כדי לצפות בנתונים הכספיים</p>
        </div>
      )}
    </div>
  );
};
