
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Building, MapPin, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

export const BranchCreation: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    gps_radius: 100,
    is_active: true,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { businessId, isSuperAdmin } = useCurrentBusiness();

  console.log('BranchCreation - Current state:', {
    businessId,
    isSuperAdmin,
    formData
  });

  const createBranchMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      console.log('Creating branch with form data:', data);
      
      if (!businessId) {
        throw new Error('לא נמצא מזהה עסק. אנא נסה שוב.');
      }

      // Prepare the data exactly as the database expects it
      const branchData = {
        business_id: businessId,
        name: data.name.trim(),
        address: data.address.trim() || null,
        latitude: data.latitude ? parseFloat(data.latitude) : null,
        longitude: data.longitude ? parseFloat(data.longitude) : null,
        gps_radius: data.gps_radius,
        is_active: data.is_active,
      };

      console.log('Inserting branch data to database:', branchData);

      // Validate required fields before insertion
      if (!branchData.name) {
        throw new Error('שם הסניף הוא שדה חובה');
      }

      if (!branchData.business_id) {
        throw new Error('מזהה העסק חסר');
      }

      const { data: result, error } = await supabase
        .from('branches')
        .insert([branchData])
        .select()
        .single();

      if (error) {
        console.error('Database error creating branch:', error);
        throw new Error(`שגיאה ביצירת הסניף: ${error.message}`);
      }
      
      console.log('Branch created successfully:', result);
      return result;
    },
    onSuccess: (result) => {
      console.log('Branch creation successful:', result);
      toast({
        title: 'הצלחה',
        description: `הסניף "${result.name}" נוצר בהצלחה`,
      });
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      queryClient.invalidateQueries({ queryKey: ['business-branches', businessId] });
      
      // Reset form
      setFormData({
        name: '',
        address: '',
        latitude: '',
        longitude: '',
        gps_radius: 100,
        is_active: true,
      });
    },
    onError: (error) => {
      console.error('Branch creation failed:', error);
      toast({
        title: 'שגיאה',
        description: error instanceof Error ? error.message : 'אירעה שגיאה ביצירת הסניף',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission started with data:', formData);
    
    if (!formData.name.trim()) {
      toast({
        title: 'שגיאה',
        description: 'שם הסניף הוא שדה חובה',
        variant: 'destructive',
      });
      return;
    }

    if (!businessId) {
      console.error('No businessId available for branch creation');
      toast({
        title: 'שגיאה',
        description: 'לא נמצא מזהה עסק. אנא נסה שוב או פנה למנהל המערכת.',
        variant: 'destructive',
      });
      return;
    }

    createBranchMutation.mutate(formData);
  };

  // Show message if no business access
  if (!businessId && !isSuperAdmin) {
    return (
      <div className="container mx-auto px-4 py-8 text-center" dir="rtl">
        <h2 className="text-xl font-semibold mb-4">אין גישה</h2>
        <p className="text-gray-600">אינך משויך לעסק כלשהו</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">יצירת סניף חדש</h1>
        <p className="text-gray-600">הוסף סניף חדש לעסק</p>
        {businessId && (
          <p className="text-sm text-blue-600 mt-2">עסק נוכחי: {businessId}</p>
        )}
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-6 w-6" />
            פרטי הסניף
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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
              disabled={createBranchMutation.isPending}
            >
              <Save className="h-4 w-4" />
              {createBranchMutation.isPending ? 'יוצר...' : 'צור סניף'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
