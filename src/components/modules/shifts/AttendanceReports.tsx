
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Download, 
  Calendar, 
  Users, 
  Clock,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

const weeklyData = [
  { day: 'א', attendance: 0, planned: 0 },
  { day: 'ב', attendance: 0, planned: 0 },
  { day: 'ג', attendance: 0, planned: 0 },
  { day: 'ד', attendance: 0, planned: 0 },
  { day: 'ה', attendance: 0, planned: 0 },
  { day: 'ו', attendance: 0, planned: 0 },
  { day: 'ש', attendance: 0, planned: 0 }
];

const attendanceStatusData = [
  { name: 'נוכח', value: 0, color: '#10B981' },
  { name: 'איחור', value: 0, color: '#F59E0B' },
  { name: 'נעדר', value: 0, color: '#EF4444' },
  { name: 'חופש', value: 0, color: '#8B5CF6' }
];

export const AttendanceReports: React.FC = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [selectedBranch, setSelectedBranch] = useState('all');

  const stats = {
    totalEmployees: 0,
    presentToday: 0,
    lateToday: 0,
    absentToday: 0,
    attendanceRate: 0,
    averageHours: 0
  };

  const topPerformers: any[] = [];

  const concerningEmployees: any[] = [];

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">דוחות נוכחות</h2>
          <p className="text-gray-600">מעקב ניתוח נוכחות עובדים</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border shadow-lg z-50">
              <SelectItem value="all">כל הסניפים</SelectItem>
              <SelectItem value="main">מרכזי</SelectItem>
              <SelectItem value="north">צפון</SelectItem>
              <SelectItem value="south">דרום</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border shadow-lg z-50">
              <SelectItem value="week">השבוע</SelectItem>
              <SelectItem value="month">החודש</SelectItem>
              <SelectItem value="quarter">הרבעון</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            יצוא דוח
          </Button>
        </div>
      </div>

      {/* סטטיסטיקות כלליות */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">סה"כ עובדים</p>
                <p className="text-2xl font-bold">{stats.totalEmployees}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">נוכחים היום</p>
                <p className="text-2xl font-bold text-green-600">{stats.presentToday}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">איחורים</p>
                <p className="text-2xl font-bold text-orange-600">{stats.lateToday}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">נעדרים</p>
                <p className="text-2xl font-bold text-red-600">{stats.absentToday}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">אחוז נוכחות</p>
                <p className="text-2xl font-bold text-blue-600">{stats.attendanceRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ממוצע שעות</p>
                <p className="text-2xl font-bold">{stats.averageHours}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* גרף נוכחות שבועי */}
        <Card>
          <CardHeader>
            <CardTitle>נוכחות שבועית</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="planned" fill="#E5E7EB" name="מתוכנן" />
                <Bar dataKey="attendance" fill="#3B82F6" name="בפועל" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* פילוח סטטוס נוכחות */}
        <Card>
          <CardHeader>
            <CardTitle>פילוח סטטוס נוכחות</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={attendanceStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {attendanceStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* עובדים מצטיינים */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              עובדים מצטיינים
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  אין נתונים להצגה
                </div>
              ) : (
                topPerformers.map((employee, index) => (
                  <div key={employee.name} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-sm text-gray-600">{employee.hours} שעות החודש</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      {employee.attendance}% נוכחות
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* עובדים דורשי תשומת לב */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              דורשי תשומת לב
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {concerningEmployees.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  אין נתונים להצגה
                </div>
              ) : (
                concerningEmployees.map((employee) => (
                  <div key={employee.name} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div>
                      <p className="font-medium">{employee.name}</p>
                      <p className="text-sm text-gray-600">{employee.reason}</p>
                    </div>
                    <div className="text-left">
                      <Badge variant="outline" className="mb-1">
                        {employee.attendance}% נוכחות
                      </Badge>
                      <p className="text-xs text-gray-600">{employee.absences} היעדרויות</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
