
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

export const BranchCreation: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    gps_coordinates: '',
    gps_radius: 100,
    is_active: true,
    description: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createBranchMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: result, error } = await supabase
        .from('branches')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast({
        title: 'הצלחה',
        description: 'הסניף נוצר בהצלחה',
      });
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      setFormData({
        name: '',
        address: '',
        gps_coordinates: '',
        gps_radius: 100,
        is_active: true,
        description: ''
      });
    },
    onError: (error) => {
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה ביצירת הסניף',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createBranchMutation.mutate(formData);
  };

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">יצירת סניף חדש</h1>
        <p className="text-gray-600">הוסף סניף חדש לעסק</p>
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
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="כתובת הסניף"
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

            <div className="space-y-2">
              <Label htmlFor="description">תיאור</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="תיאור הסניף"
                rows={3}
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
