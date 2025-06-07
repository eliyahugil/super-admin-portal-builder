
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

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
        <Label htmlFor="address">כתובת</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="הזן כתובת הסניף"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="latitude">קו רוחב</Label>
          <Input
            id="latitude"
            type="number"
            step="any"
            value={formData.latitude}
            onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
            placeholder="31.7683"
          />
        </div>
        <div>
          <Label htmlFor="longitude">קו אורך</Label>
          <Input
            id="longitude"
            type="number"
            step="any"
            value={formData.longitude}
            onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
            placeholder="35.2137"
          />
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
