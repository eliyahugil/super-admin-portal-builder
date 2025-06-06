
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AddressAutocomplete } from '@/components/ui/AddressAutocomplete';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useBusiness } from '@/hooks/useBusiness';
import { Building, Upload } from 'lucide-react';

interface BusinessDetails {
  id: string;
  name: string;
  contact_phone?: string;
  address?: string;
  logo_url?: string;
  contact_email?: string;
  admin_email?: string;
  description?: string;
}

export const BusinessProfileEdit: React.FC = () => {
  const { businessId: urlBusinessId } = useParams();
  const { business, businessId: hookBusinessId } = useBusiness();
  const { toast } = useToast();
  
  // Use businessId from URL if available, otherwise from hook
  const effectiveBusinessId = urlBusinessId || hookBusinessId;
  
  const [details, setDetails] = useState<BusinessDetails>({
    id: '',
    name: '',
    contact_phone: '',
    address: '',
    logo_url: '',
    contact_email: '',
    admin_email: '',
    description: ''
  });
  
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchBusinessDetails = async () => {
      if (!effectiveBusinessId) {
        console.log('No business ID available');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('businesses')
          .select('*')
          .eq('id', effectiveBusinessId)
          .single();

        if (error) {
          console.error('Error fetching business:', error);
          throw error;
        }
        
        if (data) {
          setDetails(data);
          if (data.address) {
            setAddress(data.address);
          }
        }
      } catch (error) {
        console.error('Error fetching business details:', error);
        toast({
          title: 'שגיאה',
          description: 'לא ניתן לטעון את פרטי העסק',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessDetails();
  }, [effectiveBusinessId, toast]);

  const handleSave = async () => {
    if (!effectiveBusinessId) {
      toast({
        title: 'שגיאה',
        description: 'לא נמצא מזהה עסק',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('businesses')
        .update({
          name: details.name,
          contact_phone: details.contact_phone,
          address: typeof address === 'string' ? address : details.address,
          contact_email: details.contact_email,
          admin_email: details.admin_email,
          description: details.description,
          updated_at: new Date().toISOString(),
        })
        .eq('id', effectiveBusinessId);

      if (error) throw error;

      toast({
        title: 'נשמר בהצלחה',
        description: 'פרטי העסק עודכנו',
      });
    } catch (error) {
      console.error('Error updating business:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לעדכן את פרטי העסק',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
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
      <div className="max-w-4xl mx-auto p-6" dir="rtl">
        <div className="text-center text-red-600">לא נמצא מזהה עסק</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6" dir="rtl">
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
        <Card>
          <CardHeader>
            <CardTitle>מידע בסיסי</CardTitle>
            <CardDescription>פרטי העסק הבסיסיים</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>שם העסק</Label>
                <Input 
                  value={details.name}
                  onChange={(e) => setDetails(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="שם העסק" 
                />
              </div>
              <div>
                <Label>טלפון</Label>
                <Input 
                  value={details.contact_phone || ''}
                  onChange={(e) => setDetails(prev => ({ ...prev, contact_phone: e.target.value }))}
                  placeholder="03-1234567" 
                />
              </div>
            </div>
            
            <div>
              <Label>תיאור העסק</Label>
              <Textarea 
                value={details.description || ''}
                onChange={(e) => setDetails(prev => ({ ...prev, description: e.target.value }))}
                placeholder="תיאור קצר על העסק..." 
              />
            </div>

            <AddressAutocomplete
              label="כתובת העסק"
              value={address}
              onChange={setAddress}
              placeholder="הקלד כתובת העסק..."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>פרטי יצירת קשר</CardTitle>
            <CardDescription>דרכי יצירת קשר עם העסק</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>אימייל ליצירת קשר</Label>
                <Input 
                  type="email" 
                  value={details.contact_email || ''}
                  onChange={(e) => setDetails(prev => ({ ...prev, contact_email: e.target.value }))}
                  placeholder="info@company.com" 
                />
              </div>
              <div>
                <Label>אימייל מנהל</Label>
                <Input 
                  type="email" 
                  value={details.admin_email || ''}
                  onChange={(e) => setDetails(prev => ({ ...prev, admin_email: e.target.value }))}
                  placeholder="admin@company.com" 
                />
              </div>
            </div>
          </CardContent>
        </Card>

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
