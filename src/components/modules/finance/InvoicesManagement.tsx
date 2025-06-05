
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Eye, Download } from 'lucide-react';

export const InvoicesManagement: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">ניהול חשבוניות</h1>
        <p className="text-gray-600 mt-2">צור ונהל חשבוניות עסקיות</p>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>חשבוניות</CardTitle>
              <CardDescription>רשימת כל החשבוניות</CardDescription>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              חשבונית חדשה
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">חשבונית #{1000 + i}</p>
                    <p className="text-sm text-gray-500">לקוח {i + 1}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium">₪{(Math.random() * 1000 + 100).toFixed(2)}</span>
                  <Badge variant={i % 2 === 0 ? 'default' : 'secondary'}>
                    {i % 2 === 0 ? 'שולמה' : 'ממתינה'}
                  </Badge>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
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
