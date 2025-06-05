
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, FileText, CreditCard, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export const FinanceManagement: React.FC = () => {
  const stats = [
    { label: 'הכנסות החודש', value: '₪45,230', icon: DollarSign, color: 'text-green-600' },
    { label: 'חשבוניות פתוחות', value: '12', icon: FileText, color: 'text-blue-600' },
    { label: 'תשלומים ממתינים', value: '₪8,450', icon: CreditCard, color: 'text-orange-600' },
    { label: 'רווח נקי', value: '₪12,780', icon: TrendingUp, color: 'text-purple-600' },
  ];

  const quickActions = [
    { title: 'ניהול חשבוניות', description: 'צור ונהל חשבוניות', link: '/modules/finance/invoices', icon: FileText },
    { title: 'מעקב תשלומים', description: 'עקוב אחר תשלומים נכנסים', link: '/modules/finance/payments', icon: CreditCard },
    { title: 'דוחות כספיים', description: 'צפה בדוחות ואנליטיקה', link: '/modules/finance/reports', icon: TrendingUp },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">ניהול כספים</h1>
        <p className="text-gray-600 mt-2">מעקב הכנסות, הוצאות וחשבוניות</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickActions.map((action, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <action.icon className="h-6 w-6 text-blue-600" />
                  <div>
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                    <CardDescription>{action.description}</CardDescription>
                  </div>
                </div>
                <Link to={action.link}>
                  <Button variant="outline">צפה</Button>
                </Link>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
};
