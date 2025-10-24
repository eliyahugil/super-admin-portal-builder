import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRawMaterialReceipts } from '../hooks/useRawMaterialReceipts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, AlertTriangle, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

export const RawReceiptsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: receipts, isLoading } = useRawMaterialReceipts();

  const isExpired = (expiryDate?: string) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry > 0 && daysUntilExpiry <= 7;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">קבלות חומרי גלם</h1>
            <p className="text-muted-foreground">מעקב אחר חומרי גלם שהתקבלו</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/production')}>
            <ArrowRight className="h-4 w-4 ml-2" />
            חזור
          </Button>
          <Button onClick={() => navigate('/production/raw-receipts/new')}>
            <Plus className="h-4 w-4 ml-2" />
            קבלה חדשה
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">טוען...</div>
      ) : !receipts?.length ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">אין קבלות להצגה</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {receipts.map((receipt) => (
            <Card 
              key={receipt.id}
              className={`hover:shadow-md transition-shadow cursor-pointer ${
                isExpired(receipt.expiration_date) ? 'border-red-200 bg-red-50' : 
                isExpiringSoon(receipt.expiration_date) ? 'border-orange-200 bg-orange-50' : ''
              }`}
              onClick={() => navigate(`/production/raw-receipts/${receipt.id}`)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-xl">{receipt.material_name}</CardTitle>
                    <p className="text-sm text-muted-foreground">ספק: {receipt.supplier_name}</p>
                  </div>
                  {isExpired(receipt.expiration_date) && (
                    <Badge variant="destructive">
                      <AlertTriangle className="h-3 w-3 ml-1" />
                      פג תוקף
                    </Badge>
                  )}
                  {!isExpired(receipt.expiration_date) && isExpiringSoon(receipt.expiration_date) && (
                    <Badge variant="destructive" className="bg-orange-500">
                      <AlertTriangle className="h-3 w-3 ml-1" />
                      פג תוקף בקרוב
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">תאריך קבלה</p>
                    <p className="font-medium">
                      {format(new Date(receipt.received_date), 'dd/MM/yyyy', { locale: he })}
                    </p>
                  </div>
                  {receipt.expiration_date && (
                    <div>
                      <p className="text-muted-foreground">תוקף</p>
                      <p className="font-medium">
                        {format(new Date(receipt.expiration_date), 'dd/MM/yyyy', { locale: he })}
                      </p>
                    </div>
                  )}
                  {receipt.quantity && (
                    <div>
                      <p className="text-muted-foreground">כמות</p>
                      <p className="font-medium">{receipt.quantity} {receipt.unit || ''}</p>
                    </div>
                  )}
                  {receipt.lot_code && (
                    <div>
                      <p className="text-muted-foreground">קוד מנה</p>
                      <p className="font-medium">{receipt.lot_code}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
