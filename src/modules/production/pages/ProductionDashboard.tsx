import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  Leaf, 
  ClipboardCheck, 
  Sparkles, 
  Wrench, 
  Refrigerator,
  FileText,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

export const ProductionDashboard: React.FC = () => {
  const navigate = useNavigate();

  const modules = [
    {
      title: 'מוצרים',
      description: 'ניהול מוצרי הייצור והגדרות',
      icon: Package,
      path: '/production/products',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'אצוות ייצור',
      description: 'ניהול ומעקב אחר אצוות ייצור יומיות',
      icon: FileText,
      path: '/production/batches',
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50'
    },
    {
      title: 'קבלות חומרי גלם',
      description: 'מעקב קבלת חומרי גלם ותוקפים',
      icon: Leaf,
      path: '/production/raw-receipts',
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    },
    {
      title: 'חומרי גלם במלאי',
      description: 'ניהול מלאי וצריכת חומרי גלם',
      icon: Leaf,
      path: '/production/materials',
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50'
    },
    {
      title: 'בקרת איכות',
      description: 'בדיקות איכות ורישום ממצאים',
      icon: ClipboardCheck,
      path: '/production/quality',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'ניקיון והיגיינה',
      description: 'רישום פעולות ניקיון ואימות',
      icon: Sparkles,
      path: '/production/cleaning',
      color: 'text-pink-500',
      bgColor: 'bg-pink-50'
    },
    {
      title: 'ציוד ייצור',
      description: 'ניהול ציוד ותחזוקה שוטפת',
      icon: Wrench,
      path: '/production/equipment',
      color: 'text-orange-500',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'מקררים ומקפיאים',
      description: 'ניטור טמפרטורות והתראות',
      icon: Refrigerator,
      path: '/fridges',
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-50'
    },
    {
      title: 'דוחות',
      description: 'דוחות ייצור ואנליזה',
      icon: TrendingUp,
      path: '/production/reports',
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50'
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">יומן ייצור - מפעל מזון</h1>
            <p className="text-muted-foreground">מערכת ניהול ותיעוד תהליכי ייצור</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowRight className="h-4 w-4 ml-2" />
          חזור
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <Card 
              key={module.path}
              className="hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => navigate(module.path)}
            >
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg ${module.bgColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className={`h-6 w-6 ${module.color}`} />
                </div>
                <CardTitle className="text-xl">{module.title}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  כניסה למודול
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
