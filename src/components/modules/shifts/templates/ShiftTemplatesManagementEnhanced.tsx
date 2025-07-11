
import React from 'react';
import { useBusiness } from '@/hooks/useBusiness';
import { useRealData } from '@/hooks/useRealData';
import { ShiftTemplatesHeader } from './ShiftTemplatesHeader';
import { ShiftTemplateFormDialog } from './ShiftTemplateFormDialog';
import { ShiftTemplateCard } from './ShiftTemplateCard';
import { ShiftTemplateEmptyState } from './ShiftTemplateEmptyState';
import { QuickShiftTemplateCreator } from './QuickShiftTemplateCreator';
import { useShiftTemplatesLogic } from './useShiftTemplatesLogic';

type ShiftType = 'morning' | 'afternoon' | 'evening' | 'night';

interface ShiftTemplate {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  shift_type: ShiftType;
  required_employees: number;
  is_active: boolean;
  branch_id: string;
  business_id: string;
  created_at: string;
}

export const ShiftTemplatesManagementEnhanced: React.FC = () => {
  const { businessId, isLoading } = useBusiness();

  const { data: templates, refetch } = useRealData<ShiftTemplate>({
    queryKey: ['shift-templates', businessId],
    tableName: 'shift_templates',
    filters: { is_active: true },
    enabled: !!businessId && !isLoading
  });

  const { data: branches, refetch: refetchBranches } = useRealData<any>({
    queryKey: ['branches-for-templates', businessId],
    tableName: 'branches',
    filters: { is_active: true },
    enabled: !!businessId && !isLoading
  });

  const {
    dialogOpen,
    setDialogOpen,
    formData,
    setFormData,
    handleSubmit,
    deactivateTemplate,
    openCreateDialog
  } = useShiftTemplatesLogic(businessId, refetch);

  if (isLoading) {
    return <div className="flex items-center justify-center p-6">טוען...</div>;
  }

  return (
    <div className="space-y-6" dir="rtl">
      <ShiftTemplatesHeader onCreateTemplate={openCreateDialog} />

      {/* Quick Template Creator */}
      <QuickShiftTemplateCreator onTemplateCreated={refetch} />

      <ShiftTemplateFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        branches={branches || []}
        onBranchAdded={refetchBranches}
      />

      {templates && templates.length > 0 ? (
        <div>
          <h3 className="text-lg font-semibold mb-4">תבניות משמרות קיימות</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <ShiftTemplateCard
                key={template.id}
                template={template}
                branches={branches || []}
                onDeactivate={deactivateTemplate}
              />
            ))}
          </div>
        </div>
      ) : (
        <ShiftTemplateEmptyState onCreateTemplate={openCreateDialog} />
      )}
    </div>
  );
};
