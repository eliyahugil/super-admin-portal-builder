
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Edit, Eye } from 'lucide-react';
import { CreateAgreementDialog } from './CreateAgreementDialog';
import type { Customer, CustomerAgreement } from '@/types/customers';

interface CustomerAgreementsProps {
  agreements: CustomerAgreement[];
  customers: Customer[];
}

export const CustomerAgreements: React.FC<CustomerAgreementsProps> = ({
  agreements,
  customers
}) => {
  const [createAgreementOpen, setCreateAgreementOpen] = useState(false);

  const getStatusLabel = (status: string) => {
    const statuses: Record<string, string> = {
      draft: 'טיוטה',
      active: 'פעיל',
      signed: 'חתום',
      expired: 'פג תוקף'
    };
    return statuses[status] || status;
  };

  const getStatusVariant = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      draft: 'outline',
      active: 'default',
      signed: 'secondary',
      expired: 'destructive'
    };
    return variants[status] || 'outline';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">הסכמים</h3>
        <Button 
          onClick={() => setCreateAgreementOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          הסכם חדש
        </Button>
      </div>

      {agreements.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">אין הסכמים</h3>
          <p className="text-gray-600">התחל על ידי יצירת ההסכם הראשון</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agreements.map((agreement) => (
            <Card key={agreement.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg truncate">{agreement.title}</CardTitle>
                  <Badge variant={getStatusVariant(agreement.status)}>
                    {getStatusLabel(agreement.status)}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  לקוח: {agreement.customer?.name || 'לא ידוע'}
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {agreement.content.substring(0, 150)}...
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  נוצר: {new Date(agreement.created_at).toLocaleDateString('he-IL')}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateAgreementDialog
        open={createAgreementOpen}
        onOpenChange={setCreateAgreementOpen}
        customers={customers}
      />
    </div>
  );
};
