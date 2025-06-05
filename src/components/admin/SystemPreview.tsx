
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Eye, 
  Settings, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Play,
  Pause,
  Download,
  Upload
} from 'lucide-react';

export const SystemPreview: React.FC = () => {
  const { moduleId } = useParams();
  const [previewMode, setPreviewMode] = useState('desktop');

  // Mock data for module preview
  const moduleData = {
    id: moduleId || '1',
    name: 'ניהול עובדים',
    description: 'מודול לניהול עובדים, נוכחות ומשמרות',
    version: '2.1.3',
    status: 'active',
    lastTested: '2024-01-20',
    testResults: {
      functionality: 98,
      performance: 95,
      security: 100,
      compatibility: 97
    },
    businesses: 15,
    users: 342
  };

  const testScenarios = [
    {
      name: 'יצירת עובד חדש',
      status: 'passed',
      duration: '2.3s',
      lastRun: '2024-01-20 14:30'
    },
    {
      name: 'עדכון נתוני עובד',
      status: 'passed',
      duration: '1.8s',
      lastRun: '2024-01-20 14:32'
    },
    {
      name: 'מחיקת עובד',
      status: 'warning',
      duration: '3.1s',
      lastRun: '2024-01-20 14:35'
    },
    {
      name: 'ייבוא רשימת עובדים',
      status: 'failed',
      duration: 'timeout',
      lastRun: '2024-01-20 14:40'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'passed':
        return <Badge className="bg-green-100 text-green-800">עבר</Badge>;
      case 'warning':
        return <Badge className="bg-orange-100 text-orange-800">אזהרה</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">נכשל</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6" dir="rtl">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">תצוגת מערכת - {moduleData.name}</h1>
            <p className="text-gray-600 mt-2">בדיקה ותצוגה מקדימה של המודול</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              ייצא דוח
            </Button>
            <Button>
              <Play className="h-4 w-4 mr-2" />
              הרץ בדיקות
            </Button>
          </div>
        </div>
      </div>

      {/* Module Info */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-3">
                {moduleData.name}
                <Badge variant="outline">v{moduleData.version}</Badge>
                <Badge className="bg-green-100 text-green-800">פעיל</Badge>
              </CardTitle>
              <CardDescription className="mt-2">
                {moduleData.description}
              </CardDescription>
            </div>
            <div className="text-left">
              <p className="text-sm text-gray-600">בדיקה אחרונה</p>
              <p className="font-semibold">{moduleData.lastTested}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{moduleData.businesses}</div>
              <p className="text-sm text-gray-600">עסקים משתמשים</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{moduleData.users}</div>
              <p className="text-sm text-gray-600">משתמשים פעילים</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{moduleData.testResults.functionality}%</div>
              <p className="text-sm text-gray-600">תקינות פונקציות</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{moduleData.testResults.performance}%</div>
              <p className="text-sm text-gray-600">ביצועים</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Results */}
        <Card>
          <CardHeader>
            <CardTitle>תוצאות בדיקות</CardTitle>
            <CardDescription>תוצאות בדיקות אוטומטיות של המודול</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testScenarios.map((test, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <p className="font-medium">{test.name}</p>
                      <p className="text-sm text-gray-600">
                        זמן ריצה: {test.duration} | {test.lastRun}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(test.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>מדדי ביצועים</CardTitle>
            <CardDescription>מדדי איכות ובטיחות המודול</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">פונקציונליות</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${moduleData.testResults.functionality}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold">{moduleData.testResults.functionality}%</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">ביצועים</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${moduleData.testResults.performance}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold">{moduleData.testResults.performance}%</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">אבטחה</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${moduleData.testResults.security}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold">{moduleData.testResults.security}%</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">תאימות</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full" 
                      style={{ width: `${moduleData.testResults.compatibility}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold">{moduleData.testResults.compatibility}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Module Preview */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>תצוגה מקדימה</CardTitle>
              <CardDescription>תצוגה של המודול כפי שהוא נראה לעסקים</CardDescription>
            </div>
            <Tabs value={previewMode} onValueChange={setPreviewMode}>
              <TabsList>
                <TabsTrigger value="desktop">דסקטופ</TabsTrigger>
                <TabsTrigger value="tablet">טאבלט</TabsTrigger>
                <TabsTrigger value="mobile">מובייל</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-4 bg-gray-50 min-h-96 flex items-center justify-center">
            <div className="text-center">
              <Eye className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">תצוגה מקדימה של המודול</p>
              <p className="text-sm text-gray-500 mt-2">
                כאן תוצג תצוגה חיה של המודול במצב {previewMode}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
