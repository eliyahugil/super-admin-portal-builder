
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, User, Users, Shield, Link as LinkIcon, Cog, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import { NotificationSettings } from './NotificationSettings';
import { ReminderLogsSection } from './ReminderLogsSection';

export const BusinessSettings: React.FC = () => {
  const settingsCategories = [
    { title: 'פרטי עסק', description: 'עדכן פרטי העסק והלוגו', link: '/modules/settings/profile', icon: User },
    { title: 'ניהול מודולים', description: 'בחר אילו מודולים יהיו פעילים', link: '/modules/settings/modules', icon: Layers },
    { title: 'ניהול משתמשים', description: 'הוסף ונהל משתמשים', link: '/modules/settings/users', icon: Users },
    { title: 'הרשאות', description: 'נהל הרשאות משתמשים', link: '/modules/settings/permissions', icon: Shield },
    { title: 'אינטגרציות', description: 'התחבר לשירותים חיצוניים', link: '/modules/settings/integrations', icon: LinkIcon },
    { title: 'הגדרות מתקדמות', description: 'שדות מותאמים אישית ושכפול עסק', link: '/modules/settings/advanced', icon: Cog },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">הגדרות עסק</h1>
        <p className="text-gray-600 mt-2">נהל את הגדרות העסק והמערכת</p>
      </div>

      {/* Notification Settings Section */}
      <div className="mb-8">
        <NotificationSettings />
      </div>

      {/* Reminder Logs Section */}
      <div className="mb-8">
        <ReminderLogsSection />
      </div>

      {/* Settings Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingsCategories.map((category, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <category.icon className="h-6 w-6 text-blue-600" />
                  <div>
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </div>
                </div>
                <Link to={category.link}>
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    הגדר
                  </Button>
                </Link>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
};
