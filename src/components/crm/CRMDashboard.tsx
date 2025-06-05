
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Target, 
  Store, 
  Package, 
  Calendar,
  TrendingUp,
  DollarSign,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

export const CRMDashboard: React.FC = () => {
  const { crmModule } = useParams();

  const crmStats = {
    totalLeads: 248,
    activeClients: 89,
    franchisees: 12,
    monthlyRevenue: 45600
  };

  const recentLeads = [
    {
      id: '1',
      name: 'שרה כהן',
      email: 'sara@example.com',
      phone: '052-1234567',
      source: 'פייסבוק',
      status: 'חדש',
      value: 15000
    },
    {
      id: '2', 
      name: 'דוד לוי',
      email: 'david@example.com',
      phone: '053-9876543',
      source: 'גוגל',
      status: 'במעקב',
      value: 25000
    },
    {
      id: '3',
      name: 'מיכל אברהם',
      email: 'michal@example.com',
      phone: '054-5555555',
      source: 'המלצה',
      status: 'הצעה נשלחה',
      value: 35000
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'חדש':
        return <Badge className="bg-blue-100 text-blue-800">{status}</Badge>;
      case 'במעקב':
        return <Badge className="bg-orange-100 text-orange-800">{status}</Badge>;
      case 'הצעה נשלחה':
        return <Badge className="bg-purple-100 text-purple-800">{status}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const renderModuleContent = () => {
    switch (crmModule) {
      case 'leads':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>ניהול לידים</CardTitle>
                <CardDescription>רשימת לידים ומעקב אחר הזדמנויות מכירה</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentLeads.map((lead) => (
                    <div key={lead.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{lead.name}</h3>
                            {getStatusBadge(lead.status)}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Mail className="h-4 w-4" />
                              {lead.email}
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              {lead.phone}
                            </div>
                            <div className="flex items-center gap-1">
                              <Target className="h-4 w-4" />
                              מקור: {lead.source}
                            </div>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="text-lg font-bold text-green-600">₪{lead.value.toLocaleString()}</p>
                          <Button variant="outline" size="sm" className="mt-2">
                            פרטים
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'franchisees':
        return (
          <Card>
            <CardHeader>
              <CardTitle>ניהול זכיינים</CardTitle>
              <CardDescription>רשימת זכיינים ומעקב ביצועים</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">בקרוב - ממשק ניהול זכיינים מלא</p>
            </CardContent>
          </Card>
        );

      case 'wholesale':
        return (
          <Card>
            <CardHeader>
              <CardTitle>לקוחות סיטונאיים</CardTitle>
              <CardDescription>ניהול לקוחות סיטונאיים והזמנות גדולות</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">בקרוב - ממשק ניהול לקוחות סיטונאיים</p>
            </CardContent>
          </Card>
        );

      case 'events':
        return (
          <Card>
            <CardHeader>
              <CardTitle>לקוחות אירועים</CardTitle>
              <CardDescription>ניהול לקוחות אירועים וחתונות</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">בקרוב - ממשק ניהול אירועים</p>
            </CardContent>
          </Card>
        );

      case 'clients':
        return (
          <Card>
            <CardHeader>
              <CardTitle>לקוחות קצה</CardTitle>
              <CardDescription>ניהול לקוחות פרטיים וקמעונאיים</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">בקרוב - ממשק ניהול לקוחות קצה</p>
            </CardContent>
          </Card>
        );

      default:
        return (
          <div className="space-y-6">
            {/* CRM Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Target className="h-8 w-8 text-blue-500" />
                    <div className="mr-4">
                      <p className="text-2xl font-bold">{crmStats.totalLeads}</p>
                      <p className="text-sm text-gray-600">לידים פעילים</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-green-500" />
                    <div className="mr-4">
                      <p className="text-2xl font-bold">{crmStats.activeClients}</p>
                      <p className="text-sm text-gray-600">לקוחות פעילים</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Store className="h-8 w-8 text-purple-500" />
                    <div className="mr-4">
                      <p className="text-2xl font-bold">{crmStats.franchisees}</p>
                      <p className="text-sm text-gray-600">זכיינים</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-orange-500" />
                    <div className="mr-4">
                      <p className="text-2xl font-bold">₪{crmStats.monthlyRevenue.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">הכנסות חודשיות</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>לידים אחרונים</CardTitle>
                <CardDescription>רשימת הלידים החדשים ביותר</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentLeads.slice(0, 3).map((lead) => (
                    <div key={lead.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{lead.name}</h3>
                            {getStatusBadge(lead.status)}
                          </div>
                          <p className="text-sm text-gray-600">{lead.email} • {lead.phone}</p>
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-green-600">₪{lead.value.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">מערכת CRM</h1>
        <p className="text-gray-600 mt-2">ניהול לקוחות, לידים וזכיינים</p>
      </div>

      {renderModuleContent()}
    </div>
  );
};
