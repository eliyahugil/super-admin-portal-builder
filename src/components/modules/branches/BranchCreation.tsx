
import React from 'react';
import { useBranchCreation } from './hooks/useBranchCreation';
import { BranchForm } from './BranchForm';
import { BranchCreationHeader } from './BranchCreationHeader';

export const BranchCreation: React.FC = () => {
  const {
    formData,
    setFormData,
    handleSubmit,
    isLoading,
    businessId,
    isSuperAdmin,
  } = useBranchCreation();

  // Show message if no business access
  if (!businessId && !isSuperAdmin) {
    return (
      <div className="container mx-auto px-4 py-8 text-center" dir="rtl">
        <h2 className="text-xl font-semibold mb-4">אין גישה</h2>
        <p className="text-gray-600">אינך משויך לעסק כלשהו</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <BranchCreationHeader businessId={businessId} />
      <BranchForm
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
};
