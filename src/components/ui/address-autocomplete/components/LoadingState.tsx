
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2, MapPin } from 'lucide-react';

interface LoadingStateProps {
  label: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ label }) => {
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="relative">
        <Input
          disabled
          placeholder="טוען Google Maps..."
          className="pr-10 pl-3 text-right"
          dir="rtl"
        />
        <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
      </div>
    </div>
  );
};
