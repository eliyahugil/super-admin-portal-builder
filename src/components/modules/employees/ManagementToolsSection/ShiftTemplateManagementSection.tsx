
import React from 'react';
import { Clock } from 'lucide-react';
// Import the correct component name
import { QuickShiftTemplateCreatorDialog } from '../CreateShiftForm/QuickShiftTemplateCreatorDialog';
import { ShiftTemplateManagementSectionProps } from './types';

export const ShiftTemplateManagementSection: React.FC<ShiftTemplateManagementSectionProps> = () => {
  // For now, we have to pass minimal dummy props since this dialog requires them
  // Set up controlled dialog state for this demo. In a real usage, businessId etc should come from context/props.
  const [open, setOpen] = React.useState(false);
  // The businessId can be fetched via useBusiness() hook, but here let's leave empty and mark TODO
  const businessId = ""; // TODO: integrate with useBusiness hook for real implementation

  // Template created handler is a no-op for now. In real usage, this should trigger a refetch.
  const handleTemplateCreated = () => {};

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Clock className="h-5 w-5" />
        ניהול תבניות משמרות
      </h3>
      {/* Render a button to open the dialog for demonstration */}
      <button
        className="bg-blue-600 text-white rounded px-4 py-2 mb-2"
        onClick={() => setOpen(true)}
        type="button"
      >
        הוספת תבנית מהירה
      </button>
      <QuickShiftTemplateCreatorDialog
        open={open}
        onOpenChange={setOpen}
        businessId={businessId}
        onTemplateCreated={handleTemplateCreated}
      />
    </div>
  );
};
