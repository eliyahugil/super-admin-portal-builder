
import React from 'react';
import { Button } from '@/components/ui/button';
import { Building } from 'lucide-react';
import { useBusinessForm } from '@/hooks/useBusinessForm';
import { BasicInfoCard } from './BasicInfoCard';
import { ContactInfoCard } from './ContactInfoCard';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

export const BusinessProfileEdit: React.FC = () => {
  const { isSuperAdmin } = useCurrentBusiness();
  const {
    details,
    setDetails,
    address,
    setAddress,
    loading,
    saving,
    effectiveBusinessId,
    handleSave
  } = useBusinessForm();

  const handleDetailsChange = (updates: Partial<typeof details>) => {
    setDetails(prev => ({ ...prev, ...updates }));
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">טוען...</div>
      </div>
    );
  }

  if (!effectiveBusinessId) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center text-amber-600">
          {isSuperAdmin ? (
            <div>
              <h2 className="text-xl font-semibold mb-2">בחר עסק לעריכה</h2>
              <p>כסופר אדמין, יש לבחור עסק ספציפי לעריכת פרטיו</p>
            </div>
          ) : (
            <div className="text-red-600">לא נמצא מזהה עסק</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Building className="h-8 w-8" />
          פרטי עסק
        </h1>
        <p className="text-gray-600 mt-2">עדכן את פרטי העסק</p>
        {effectiveBusinessId && (
          <p className="text-sm text-gray-500 mt-1">מזהה עסק: {effectiveBusinessId}</p>
        )}
      </div>

      <div className="space-y-6">
        <BasicInfoCard
          details={details}
          onDetailsChange={handleDetailsChange}
          address={address}
          onAddressChange={setAddress}
        />

        <ContactInfoCard
          details={details}
          onDetailsChange={handleDetailsChange}
        />

        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="w-full"
        >
          {saving ? 'שומר...' : 'שמור שינויים'}
        </Button>
      </div>
    </div>
  );
};
