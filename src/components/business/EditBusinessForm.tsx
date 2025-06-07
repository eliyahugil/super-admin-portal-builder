
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Building2, Save, ArrowLeft } from 'lucide-react';
import { AddressAutocomplete } from '@/components/ui/AddressAutocomplete';

interface BusinessFormData {
  name: string;
  admin_email: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  description: string;
}

interface AddressData {
  formatted_address: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  latitude: number;
  longitude: number;
}

export const EditBusinessForm: React.FC = () => {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<BusinessFormData>({
    name: '',
    admin_email: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    description: ''
  });
  
  const [address, setAddress] = useState<AddressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (businessId) {
      fetchBusinessData();
    }
  }, [businessId]);

  const fetchBusinessData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .single();

      if (error) {
        console.error('Error fetching business:', error);
        throw error;
      }

      if (data) {
        setFormData({
          name: data.name || '',
          admin_email: data.admin_email || '',
          contact_email: data.contact_email || '',
          contact_phone: data.contact_phone || '',
          address: data.address || '',
          description: data.description || ''
        });

        // If there's address data, try to parse it for the address component
        if (data.address) {
          // For now, just set the formatted address
          // In a real scenario, you might have latitude/longitude stored
          setAddress({
            formatted_address: data.address,
            street: '',
            city: '',
            postalCode: '',
            country: 'Israel',
            latitude: 0,
            longitude: 0
          });
        }
      }
    } catch (error) {
      console.error('Error in fetchBusinessData:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לטעון פרטי העסק',
        variant: 'destructive',
      });
      navigate('/admin/businesses');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof BusinessFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (newAddress: AddressData | null) => {
    setAddress(newAddress);
    if (newAddress) {
      setFormData(prev => ({ ...prev, address: newAddress.formatted_address }));
    }
  };

  const handleSave = async () => {
    if (!businessId) return;

    if (!formData.name.trim()) {
      toast({
        title: 'שגיאה',
        description: 'שם העסק הוא שדה חובה',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);

      const updateData = {
        ...formData,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('businesses')
        .update(updateData)
        .eq('id', businessId);

      if (error) {
        console.error('Error updating business:', error);
        throw error;
      }

      // Log the update activity
      await supabase
        .from('activity_logs')
        .insert({
          action: 'business_updated',
          target_type: 'business',
          target_id: businessId,
          details: {
            business_name: formData.name,
            updated_fields: Object.keys(formData),
            updated_at: new Date().toISOString()
          }
        });

      toast({
        title: 'נשמר בהצלחה! ✅',
        description: 'פרטי העסק עודכנו בהצלחה',
      });

      // Navigate back to business management
      navigate('/admin/businesses');
    } catch (error) {
      console.error('Error in handleSave:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לשמור את השינויים',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8" dir="rtl">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate('/admin/businesses')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          חזור
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="h-8 w-8" />
            עריכת עסק
          </h1>
          <p className="text-gray-600 mt-2">עדכן פרטי העסק</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>פרטי העסק</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="businessName">שם העסק *</Label>
                <Input
                  id="businessName"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="הכנס את שם העסק"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="contactPhone">טלפון ליצירת קשר</Label>
                <Input
                  id="contactPhone"
                  value={formData.contact_phone}
                  onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                  placeholder="03-1234567"
                />
              </div>
            </div>

            {/* Email Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="adminEmail">אימייל מנהל ראשי</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={formData.admin_email}
                  onChange={(e) => handleInputChange('admin_email', e.target.value)}
                  placeholder="admin@company.com"
                />
              </div>
              
              <div>
                <Label htmlFor="contactEmail">אימייל ליצירת קשר</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => handleInputChange('contact_email', e.target.value)}
                  placeholder="info@company.com"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">תיאור העסק</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="תיאור קצר על העסק..."
                rows={3}
              />
            </div>

            {/* Address */}
            <AddressAutocomplete
              label="כתובת העסק"
              value={address}
              onChange={handleAddressChange}
              placeholder="הקלד כתובת העסק..."
            />

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <Button 
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2"
                size="lg"
              >
                <Save className="h-4 w-4" />
                {saving ? 'שומר...' : 'שמור שינויים'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditBusinessForm;
