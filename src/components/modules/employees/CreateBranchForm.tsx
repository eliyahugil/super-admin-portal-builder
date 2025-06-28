
import React from 'react';
import { Button } from '@/components/ui/button';
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
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="branch-name">שם הסניף *</Label>
        <Input
          id="branch-name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="הזן שם הסניף"
          required
          disabled={loading}
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
          <Label htmlFor="branch-latitude">קו רוחב</Label>
          <Input
            id="branch-latitude"
            type="number"
            step="any"
            value={formData.latitude}
            onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
            placeholder="31.7683"
            disabled={loading}
          />
        </div>
        <div>
          <Label htmlFor="branch-longitude">קו אורך</Label>
          <Input
            id="branch-longitude"
            type="number"
            step="any"
            value={formData.longitude}
            onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
            placeholder="35.2137"
            disabled={loading}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="branch-radius">רדיוס GPS (מטרים)</Label>
        <Input
          id="branch-radius"
          type="number"
          min="10"
          max="5000"
          value={formData.gps_radius}
          onChange={(e) => setFormData({ ...formData, gps_radius: parseInt(e.target.value) || 100 })}
          disabled={loading}
        />
        <p className="text-sm text-gray-500 mt-1">
          רדיוס בין 10 ל-5000 מטרים לבדיקת נוכחות עובדים
        </p>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="branch-active">סניף פעיל</Label>
        <Switch
          id="branch-active"
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
          disabled={loading}
        />
      </div>

      <div className="flex justify-end space-x-2 space-x-reverse pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          ביטול
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'יוצר...' : 'צור סניף'}
        </Button>
      </div>
    </form>
  );
};
