
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { useBusiness } from '@/hooks/useBusiness';
import { useRealData } from '@/hooks/useRealData';
import { QuickTemplatesSection } from './quick/QuickTemplatesSection';
import { CustomTemplateForm } from './quick/CustomTemplateForm';
import { useQuickShiftCreator } from './quick/useQuickShiftCreator';
import { QuickShiftTemplateCreatorProps } from './quick/types';

export const QuickShiftTemplateCreator: React.FC<QuickShiftTemplateCreatorProps> = ({ 
  onTemplateCreated 
}) => {
  const { businessId } = useBusiness();
  const { data: branches } = useRealData<any>({
    queryKey: ['branches-quick-template', businessId],
    tableName: 'branches',
    filters: { is_active: true },
    enabled: !!businessId
  });

  const {
    submitting,
    templateData,
    setTemplateData,
    selectedBranches,
    setSelectedBranches,
    handleQuickCreate,
    handleCustomCreate
  } = useQuickShiftCreator(businessId, onTemplateCreated);

  return (
    <Card className="border-2 border-dashed border-blue-200 hover:border-blue-400 transition-colors">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Plus className="h-5 w-5 text-blue-600" />
          יצירת תבנית משמרת מהירה
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <QuickTemplatesSection
          onQuickCreate={(template) => handleQuickCreate(template, branches || [])}
          submitting={submitting}
          branches={branches || []}
        />

        <CustomTemplateForm
          templateData={templateData}
          setTemplateData={setTemplateData}
          selectedBranches={selectedBranches}
          setSelectedBranches={setSelectedBranches}
          branches={branches || []}
          submitting={submitting}
          onCustomCreate={handleCustomCreate}
          businessId={businessId}
        />

        {(!branches || branches.length === 0) && (
          <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              יש ליצור לפחות סניף אחד כדי ליצור תבניות משמרות
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
