
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Building, MapPin, Save } from 'lucide-react';

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
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-6 w-6" />
          פרטי הסניף
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">שם הסניף *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="הכנס שם סניף"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">כתובת</Label>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="כתובת הסניף"
                rows={2}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">קו רוחב</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                placeholder="31.7683"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">קו אורך</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                placeholder="35.2137"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gps_radius">רדיוס GPS (מטר)</Label>
            <Input
              id="gps_radius"
              type="number"
              value={formData.gps_radius}
              onChange={(e) => setFormData(prev => ({ ...prev, gps_radius: parseInt(e.target.value) || 100 }))}
              placeholder="100"
              min="10"
              max="1000"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="is_active">סניף פעיל</Label>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full flex items-center gap-2"
            disabled={isLoading}
          >
            <Save className="h-4 w-4" />
            {isLoading ? 'יוצר...' : 'צור סניף'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
