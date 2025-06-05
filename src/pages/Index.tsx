
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">ברוכים הבאים למערכת ניהול העסק</h1>
          <p className="text-xl text-gray-600">פלטפורמה מתקדמת לניהול עסקים עם אינטגרציות חכמות</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🏢 ניהול עסקים
              </CardTitle>
              <CardDescription>
                ניהול מקיף של פרטי העסק, עובדים ומשמרות
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                כלים מתקדמים לניהול יומיומי של העסק שלך
              </p>
              <Button variant="outline" className="w-full">
                התחל עכשיו
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🔗 אינטגרציות
              </CardTitle>
              <CardDescription>
                חיבור לשירותים חיצוניים ואוטומציה חכמה
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                חבר את העסק שלך לכלים הטובים ביותר בשוק
              </p>
              <Button asChild className="w-full">
                <Link to="/global-integrations">
                  נהל אינטגרציות
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📊 דוחות וניתוחים
              </CardTitle>
              <CardDescription>
                תובנות עסקיות ודוחות מתקדמים
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                קבל תמונה ברורה על ביצועי העסק שלך
              </p>
              <Button variant="outline" className="w-full">
                צפה בדוחות
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">מוכן להתחיל?</h2>
          <p className="text-gray-600 mb-6">
            הצטרף לאלפי עסקים שכבר משתמשים במערכת שלנו
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg">
              התחל ניסיון חינם
            </Button>
            <Button variant="outline" size="lg">
              למד עוד
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
