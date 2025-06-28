
import React from 'react';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  label?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ label }) => {
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="flex items-center space-x-2 p-2 border rounded">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-gray-500">טוען שירות המפות...</span>
      </div>
    </div>
  );
};
