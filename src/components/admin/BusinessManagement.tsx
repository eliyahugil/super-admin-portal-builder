
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  Users, 
  Settings, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

interface Business {
  id: string;
  name: string;
  owner: string;
  email: string;
  phone: string;
  status: 'active' | 'pending' | 'suspended';
  users: number;
  modules: string[];
  createdAt: string;
  lastActive: string;
}

export const BusinessManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Mock data - יוחלף בנתונים אמיתיים
  const businesses: Business[] = [
    {
      id: '1',
      name: 'קפה ברחוב הראשי',
      owner: 'יוסי כהן',
      email: 'yossi@coffee-street.co.il',
      phone: '052-1234567',
      status: 'active',
      users: 12,
      modules: ['employees', 'shifts', 'inventory'],
      createdAt: '2024-01-15',
      lastActive: '2024-01-20'
    },
    {
      id: '2',
      name: 'מכולת שכונתית',
      owner: 'רינה לוי',
      email: 'rina@grocery.co.il',
      phone: '053-9876543',
      status: 'pending',
      users: 3,
      modules: ['inventory', 'orders'],
      createdAt: '2024-01-18',
      lastActive: '2024-01-19'
    },
    {
      id: '3',
      name: 'חנות בגדים אופנתית',
      owner: 'דני מזרחי',
      email: 'danny@fashion.co.il',
      phone: '054-5555555',
      status: 'active',
      users: 8,
      modules: ['employees', 'inventory', 'crm'],
      createdAt: '2024-01-10',
      lastActive: '2024-01-20'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">פעיל</Badge>;
      case 'pending':
        return <Badge className="bg-orange-100 text-orange-800">ממתין</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800">מושעה</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'suspended':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         business.owner.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || business.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto p-6" dir="rtl">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ניהול עסקים</h1>
            <p className="text-gray-600 mt-2">נהל עסקים רשומים במערכת</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            הוסף עסק חדש
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-500" />
              <div className="mr-4">
                <p className="text-2xl font-bold">47</p>
                <p className="text-sm text-gray-600">סה"כ עסקים</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="mr-4">
                <p className="text-2xl font-bold">42</p>
                <p className="text-sm text-gray-600">עסקים פעילים</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-500" />
              <div className="mr-4">
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-gray-600">ממתינים לאישור</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-500" />
              <div className="mr-4">
                <p className="text-2xl font-bold">1,247</p>
                <p className="text-sm text-gray-600">סה"כ משתמשים</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="חפש עסק או בעל עסק..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Tabs value={selectedStatus} onValueChange={setSelectedStatus} className="w-auto">
              <TabsList>
                <TabsTrigger value="all">הכל</TabsTrigger>
                <TabsTrigger value="active">פעילים</TabsTrigger>
                <TabsTrigger value="pending">ממתינים</TabsTrigger>
                <TabsTrigger value="suspended">מושעים</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Businesses Table */}
      <Card>
        <CardHeader>
          <CardTitle>רשימת עסקים</CardTitle>
          <CardDescription>
            {filteredBusinesses.length} עסקים מתוך {businesses.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredBusinesses.map((business) => (
              <div key={business.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-4 space-x-reverse">
                    <div className="flex-shrink-0">
                      {getStatusIcon(business.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {business.name}
                        </h3>
                        {getStatusBadge(business.status)}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <p><strong>בעל העסק:</strong> {business.owner}</p>
                          <p><strong>אימייל:</strong> {business.email}</p>
                        </div>
                        <div>
                          <p><strong>טלפון:</strong> {business.phone}</p>
                          <p><strong>משתמשים:</strong> {business.users}</p>
                        </div>
                        <div>
                          <p><strong>נרשם:</strong> {business.createdAt}</p>
                          <p><strong>פעיל לאחרונה:</strong> {business.lastActive}</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <p className="text-sm text-gray-600 mb-2">מודולים פעילים:</p>
                        <div className="flex gap-2 flex-wrap">
                          {business.modules.map((module, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {module}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      צפייה
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-1" />
                      הגדרות
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      עריכה
                    </Button>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
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
};
