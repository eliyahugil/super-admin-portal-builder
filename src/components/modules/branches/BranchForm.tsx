
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BranchFormFields } from './BranchFormFields';
import { BranchFormActions } from './BranchFormActions';

interface BranchFormData {
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  gps_radius: number;
  is_active: boolean;
}

interface BranchFormProps {
  formData: BranchFormData;
  setFormData: React.Dispatch<React.SetStateAction<BranchFormData>>;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export const BranchForm: React.FC<BranchFormProps> = ({
  formData,
  setFormData,
  onSubmit,
  isLoading,
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <BranchFormFields formData={formData} setFormData={setFormData} />
          <BranchFormActions 
            onCancel={() => window.history.back()} 
            loading={isLoading}
            submitText="צור סניף"
            cancelText="ביטול"
          />
        </form>
      </CardContent>
    </Card>
  );
};
