
import React from 'react';
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

interface CreateBranchFormProps {
  formData: BranchFormData;
  setFormData: React.Dispatch<React.SetStateAction<BranchFormData>>;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  loading: boolean;
}

export const CreateBranchForm: React.FC<CreateBranchFormProps> = ({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  loading,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <BranchFormFields formData={formData} setFormData={setFormData} />
      <BranchFormActions onCancel={onCancel} loading={loading} />
    </form>
  );
};
