import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { MapPin, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import type { Branch } from '../shifts/schedule/types';

interface BranchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  branch?: Branch; // אם יש branch זה אומר שזה עריכה, אחרת זה יצירה
}

export const BranchDialog: React.FC<BranchDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
  branch
}) => {
  const { businessId } = useCurrentBusiness();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    gps_radius: '100',
    is_active: true
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  useEffect(() => {
    if (branch) {
      // עריכת סניף קיים
      setFormData({
        name: branch.name || '',
        address: branch.address || '',
        latitude: branch.latitude?.toString() || '',
        longitude: branch.longitude?.toString() || '',
        gps_radius: branch.gps_radius?.toString() || '100',
        is_active: branch.is_active ?? true
      });
    } else {
      // יצירת סניף חדש
      setFormData({
        name: '',
        address: '',
        latitude: '',
        longitude: '',
        gps_radius: '100',
        is_active: true
      });
    }
  }, [branch, isOpen]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "שגיאה",
        description: "הדפדפן שלך לא תומך בזיהוי מיקום",
        variant: "destructive"
      });
      return;
    }

    setIsGettingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          latitude: latitude.toString(),
          longitude: longitude.toString()
        }));
        setIsGettingLocation(false);
        
        toast({
          title: "מיקום התקבל",
          description: "הקואורדינטות עודכנו בהצלחה"
        });
      },
      (error) => {
        console.error('Error getting location:', error);
        setIsGettingLocation(false);
        
        toast({
          title: "שגיאה בקבלת מיקום",
          description: "לא ניתן היה לקבל את המיקום הנוכחי",
          variant: "destructive"
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        title: "שגיאה",
        description: "שם הסניף הוא שדה חובה",
        variant: "destructive"
      });
      return false;
    }

    if (formData.latitude && formData.longitude) {
      const lat = parseFloat(formData.latitude);
      const lng = parseFloat(formData.longitude);
      
      if (isNaN(lat) || isNaN(lng)) {
        toast({
          title: "שגיאה",
          description: "קואורדינטות GPS לא תקינות",
          variant: "destructive"
        });
        return false;
      }

      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        toast({
          title: "שגיאה",
          description: "קואורדינטות GPS מחוץ לטווח המותר",
          variant: "destructive"
        });
        return false;
      }
    }

    const radius = parseInt(formData.gps_radius);
    if (isNaN(radius) || radius < 1 || radius > 10000) {
      toast({
        title: "שגיאה",
        description: "רדיוס GPS חייב להיות בין 1 ל-10000 מטר",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (!businessId) {
      toast({
        title: "שגיאה",
        description: "לא נמצא מזהה עסק",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const branchData = {
        name: formData.name.trim(),
        address: formData.address.trim() || null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        gps_radius: parseInt(formData.gps_radius),
        is_active: formData.is_active,
        business_id: businessId
      };

      let result;
      
      if (branch) {
        // עדכון סניף קיים
        result = await supabase
          .from('branches')
          .update(branchData)
          .eq('id', branch.id)
          .select()
          .single();
      } else {
        // יצירת סניף חדש
        result = await supabase
          .from('branches')
          .insert([branchData])
          .select()
          .single();
      }

      if (result.error) {
        console.error('Error saving branch:', result.error);
        toast({
          title: "שגיאה בשמירת הסניף",
          description: result.error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: branch ? "סניף עודכן בהצלחה" : "סניף נוצר בהצלחה",
        description: `הסניף "${formData.name}" ${branch ? 'עודכן' : 'נוצר'} בהצלחה`
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving branch:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בשמירת הסניף",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {branch ? 'עריכת סניף' : 'יצירת סניף חדש'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* שם הסניף */}
          <div className="space-y-2">
            <Label htmlFor="name">שם הסניף *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="הכנס שם הסניף"
              required
            />
          </div>

          {/* כתובת */}
          <div className="space-y-2">
            <Label htmlFor="address">כתובת</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="הכנס כתובת הסניף"
            />
          </div>

          {/* קואורדינטות GPS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>קואורדינטות GPS</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="text-xs"
              >
                <MapPin className="h-3 w-3 mr-1" />
                {isGettingLocation ? 'מקבל מיקום...' : 'קבל מיקום נוכחי'}
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="latitude" className="text-xs">קו רוחב (Latitude)</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => handleInputChange('latitude', e.target.value)}
                  placeholder="32.0853"
                />
              </div>
              <div>
                <Label htmlFor="longitude" className="text-xs">קו אורך (Longitude)</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => handleInputChange('longitude', e.target.value)}
                  placeholder="34.7818"
                />
              </div>
            </div>
          </div>

          {/* רדיוס GPS */}
          <div className="space-y-2">
            <Label htmlFor="gps_radius">רדיוס GPS (מטרים)</Label>
            <Input
              id="gps_radius"
              type="number"
              min="1"
              max="10000"
              value={formData.gps_radius}
              onChange={(e) => handleInputChange('gps_radius', e.target.value)}
              placeholder="100"
            />
            <p className="text-xs text-muted-foreground">
              הרדיוס שבו עובדים יוכלו לדווח נוכחות (1-10000 מטר)
            </p>
          </div>

          {/* סטטוס פעיל */}
          <div className="flex items-center justify-between">
            <Label htmlFor="is_active">סניף פעיל</Label>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleInputChange('is_active', checked)}
            />
          </div>

          {/* כפתורי פעולה */}
          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'שומר...' : (branch ? 'עדכן סניף' : 'צור סניף')}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              ביטול
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};