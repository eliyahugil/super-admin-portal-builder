import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Plus } from 'lucide-react';

interface InventoryManagementProps {
  businessId: string;
}

export const InventoryManagement: React.FC<InventoryManagementProps> = ({ businessId }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">ניהול מלאי</h2>
          <p className="text-gray-600">מעקב מלאי לפי תקנות רשות המיסים</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          פריט חדש
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            פריטי מלאי
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">בקרוב</h3>
            <p className="text-gray-600">מודול ניהול המלאי יהיה זמין בקרוב</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};