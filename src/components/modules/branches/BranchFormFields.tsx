
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AddressAutocomplete } from '@/components/ui/AddressAutocomplete';

interface BranchFormData {
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  gps_radius: number;
  is_active: boolean;
}

interface BranchFormFieldsProps {
  formData: BranchFormData;
  setFormData: React.Dispatch<React.SetStateAction<BranchFormData>>;
}

export const BranchFormFields: React.FC<BranchFormFieldsProps> = ({
  formData,
  setFormData,
}) => {
  const handleAddressChange = (addressData: any) => {
    if (addressData) {
      setFormData(prev => ({
        ...prev,
        address: addressData.formatted_address,
        latitude: addressData.latitude.toString(),
        longitude: addressData.longitude.toString(),
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        address: '',
        latitude: '',
        longitude: '',
      }));
    }
  };

  return (
    <>
      <div>
        <Label htmlFor="name">שם הסניף *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="הזן שם הסניף"
          required
        />
      </div>

      <div>
        <AddressAutocomplete
          label="כתובת הסניף"
          placeholder="חפש כתובת..."
          onChange={handleAddressChange}
          value={formData.address ? {
            formatted_address: formData.address,
            street: '',
            city: '',
            postalCode: '',
            country: 'Israel',
            latitude: parseFloat(formData.latitude) || 0,
            longitude: parseFloat(formData.longitude) || 0,
          } : null}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="latitude">קו רוחב (נמלא אוטומטית)</Label>
          <Input
            id="latitude"
            type="number"
            step="any"
            value={formData.latitude}
            onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
            placeholder="31.7683"
            readOnly
            className="bg-gray-50"
          />
          <p className="text-xs text-gray-500 mt-1">מתעדכן אוטומטית עם בחירת הכתובת</p>
        </div>
        <div>
          <Label htmlFor="longitude">קו אורך (נמלא אוטומטית)</Label>
          <Input
            id="longitude"
            type="number"
            step="any"
            value={formData.longitude}
            onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
            placeholder="35.2137"
            readOnly
            className="bg-gray-50"
          />
          <p className="text-xs text-gray-500 mt-1">מתעדכן אוטומטית עם בחירת הכתובת</p>
        </div>
      </div>

      <div>
        <Label htmlFor="gps_radius">רדיוס GPS (מטרים)</Label>
        <Input
          id="gps_radius"
          type="number"
          min="10"
          max="1000"
          value={formData.gps_radius}
          onChange={(e) => setFormData({ ...formData, gps_radius: parseInt(e.target.value) || 100 })}
        />
        <p className="text-sm text-gray-500 mt-1">
          רדיוס בו עובדים יכולים לבצע ניקוב כניסה/יציאה (10-1000 מטרים)
        </p>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="is_active">סניף פעיל</Label>
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
      </div>
    </>
  );
};
