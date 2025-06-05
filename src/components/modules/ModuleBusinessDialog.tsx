
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Building2, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Module {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
}

interface Business {
  id: string;
  name: string;
  is_active: boolean;
}

interface BusinessModule {
  business_id: string;
  is_enabled: boolean;
}

interface ModuleBusinessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  module: Module | null;
}

export const ModuleBusinessDialog: React.FC<ModuleBusinessDialogProps> = ({
  open,
  onOpenChange,
  module,
}) => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [businessModules, setBusinessModules] = useState<BusinessModule[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && module) {
      fetchData();
    }
  }, [open, module]);

  const fetchData = async () => {
    if (!module) return;

    setLoading(true);
    try {
      // Fetch all businesses
      const { data: businessesData, error: businessesError } = await supabase
        .from('businesses')
        .select('id, name, is_active')
        .order('name');

      if (businessesError) {
        console.error('Error fetching businesses:', businessesError);
        return;
      }

      // Fetch business-module relationships
      const { data: businessModulesData, error: businessModulesError } = await supabase
        .from('business_modules')
        .select('business_id, is_enabled')
        .eq('module_id', module.id);

      if (businessModulesError) {
        console.error('Error fetching business modules:', businessModulesError);
        return;
      }

      setBusinesses(businessesData || []);
      setBusinessModules(businessModulesData || []);
    } catch (error) {
      console.error('Error in fetchData:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleModule = async (businessId: string, currentEnabled: boolean) => {
    if (!module) return;

    try {
      if (currentEnabled) {
        // Remove the module from business
        const { error } = await supabase
          .from('business_modules')
          .delete()
          .eq('business_id', businessId)
          .eq('module_id', module.id);

        if (error) {
          console.error('Error removing module from business:', error);
          toast({
            title: 'שגיאה',
            description: 'לא ניתן להסיר את המודל מהעסק',
            variant: 'destructive',
          });
          return;
        }
      } else {
        // Add the module to business
        const { error } = await supabase
          .from('business_modules')
          .insert({
            business_id: businessId,
            module_id: module.id,
            is_enabled: true,
          });

        if (error) {
          console.error('Error adding module to business:', error);
          toast({
            title: 'שגיאה',
            description: 'לא ניתן להוסיף את המודל לעסק',
            variant: 'destructive',
          });
          return;
        }
      }

      toast({
        title: 'הצלחה',
        description: `המודל ${currentEnabled ? 'הוסר מ' : 'נוסף ל'}העסק בהצלחה`,
      });

      fetchData();
    } catch (error) {
      console.error('Error in handleToggleModule:', error);
    }
  };

  const isModuleEnabled = (businessId: string) => {
    return businessModules.some(bm => bm.business_id === businessId && bm.is_enabled);
  };

  const enabledCount = businesses.filter(business => isModuleEnabled(business.id)).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3 space-x-reverse">
            {module?.icon && <span className="text-2xl">{module.icon}</span>}
            <span>ניהול עסקים - {module?.name}</span>
          </DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">טוען עסקים...</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <Building2 className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">סך הכל עסקים</p>
                <p className="text-2xl font-bold text-blue-600">{businesses.length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">עם המודל</p>
                <p className="text-2xl font-bold text-green-600">{enabledCount}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <XCircle className="h-6 w-6 text-red-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">בלי המודל</p>
                <p className="text-2xl font-bold text-red-600">{businesses.length - enabledCount}</p>
              </div>
            </div>

            {/* Businesses Table */}
            {businesses.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">אין עסקים במערכת</h3>
                <p className="text-gray-600">צור עסקים כדי לנהל מודלים</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">שם העסק</TableHead>
                    <TableHead className="text-right">סטטוס העסק</TableHead>
                    <TableHead className="text-right">סטטוס המודל</TableHead>
                    <TableHead className="text-right">פעולות</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {businesses.map((business) => {
                    const moduleEnabled = isModuleEnabled(business.id);
                    return (
                      <TableRow key={business.id}>
                        <TableCell className="font-medium">{business.name}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={business.is_active ? "default" : "secondary"}
                            className={business.is_active ? "bg-green-100 text-green-800" : ""}
                          >
                            {business.is_active ? 'פעיל' : 'לא פעיל'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={moduleEnabled ? "default" : "secondary"}
                            className={moduleEnabled ? "bg-blue-100 text-blue-800" : ""}
                          >
                            {moduleEnabled ? 'מופעל' : 'לא מופעל'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={moduleEnabled}
                            onCheckedChange={() => handleToggleModule(business.id, moduleEnabled)}
                            disabled={!business.is_active}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        )}

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={() => onOpenChange(false)}>סגור</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
