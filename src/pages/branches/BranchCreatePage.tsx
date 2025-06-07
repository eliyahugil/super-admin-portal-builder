
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, ArrowRight } from 'lucide-react';
import { BranchForm } from '@/components/modules/branches/BranchForm';
import { useBranchCreation } from '@/components/modules/branches/hooks/useBranchCreation';
import { BranchCreationHeader } from '@/components/modules/branches/BranchCreationHeader';

export const BranchCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    formData,
    setFormData,
    handleSubmit,
    isLoading,
    businessId
  } = useBranchCreation();

  console.log('BranchCreatePage - Current state:', {
    businessId,
    isLoading,
    formData
  });

  const handleCancel = () => {
    navigate('/branches');
  };

  const onSubmit = (e: React.FormEvent) => {
    handleSubmit(e);
    // Navigation will be handled by the hook's onSuccess callback
  };

  return (
    <div className="max-w-4xl mx-auto p-6" dir="rtl">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <span 
            onClick={() => navigate('/branches')}
            className="cursor-pointer hover:text-blue-600"
          >
            סניפים
          </span>
          <ArrowRight className="h-4 w-4" />
          <span>יצירת סניף חדש</span>
        </div>
      </div>

      <BranchCreationHeader businessId={businessId} />

      <BranchForm
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
        isLoading={isLoading}
      />
    </div>
  );
};
