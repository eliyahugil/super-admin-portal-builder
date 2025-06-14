
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import { Archive, RotateCcw, Search, Building, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ArchivedBusiness {
  id: string;
  name: string;
  admin_email: string;
  contact_phone?: string;
  created_at: string;
  archived_at?: string;
}

export const ArchivedBusinessesPage: React.FC = () => {
  const [archivedBusinesses, setArchivedBusinesses] = useState<ArchivedBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const { logActivity } = useActivityLogger();
  const navigate = useNavigate();

  useEffect(() => {
    fetchArchivedBusinesses();
  }, []);

  const fetchArchivedBusinesses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('businesses')
        .select('id, name, admin_email, contact_phone, created_at')
        .eq('is_active', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching archived businesses:', error);
        throw error;
      }

      setArchivedBusinesses(data || []);
    } catch (error) {
      console.error('Error in fetchArchivedBusinesses:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לטעון עסקים בארכיון',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const restoreBusiness = async (businessId: string, businessName: string) => {
    try {
      const { error } = await supabase
        .from('businesses')
        .update({ is_active: true })
        .eq('id', businessId);

      if (error) {
        console.error('Error restoring business:', error);
        throw error;
      }

      // Log the restoration activity using the activity logger
      await logActivity({
        action: 'business_restored',
        target_type: 'business',
        target_id: businessId,
        details: {
          business_name: businessName,
          restored_at: new Date().toISOString()
        }
      });

      toast({
        title: 'עסק שוחזר בהצלחה! 🔄',
        description: `העסק "${businessName}" שוחזר מהארכיון`,
      });

      // Remove from archived list
      setArchivedBusinesses(prev => prev.filter(b => b.id !== businessId));
    } catch (error) {
      console.error('Error in restoreBusiness:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לשחזר את העסק',
        variant: 'destructive',
      });
    }
  };

  const filteredBusinesses = archivedBusinesses.filter(business =>
    business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.admin_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="flex items-center gap-2 mb-4">
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-700 hover:text-blue-700 px-2 py-1"
          onClick={() => navigate('/admin/businesses')}
        >
          <ChevronRight className="h-5 w-5" />
          חזור לניהול עסקים
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Archive className="h-8 w-8" />
          עסקים בארכיון
        </h1>
      </div>
      <p className="text-gray-600 mt-2">נהל עסקים שהועברו לארכיון</p>

      {/* Stats */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Archive className="h-8 w-8 text-gray-600" />
            <div className="mr-4">
              <p className="text-2xl font-bold text-gray-900">{archivedBusinesses.length}</p>
              <p className="text-gray-600">עסקים בארכיון</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="חיפוש עסקים בארכיון..."
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Archived Businesses List */}
      <Card>
        <CardHeader>
          <CardTitle>רשימת עסקים בארכיון ({filteredBusinesses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredBusinesses.length === 0 ? (
            <div className="text-center py-8">
              <Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'לא נמצאו עסקים' : 'אין עסקים בארכיון'}
              </h3>
              <p className="text-gray-600">
                {searchTerm ? 'נסה לשנות את החיפוש' : 'כל העסקים פעילים כרגע'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBusinesses.map((business) => (
                <Card key={business.id} className="hover:shadow-md transition-shadow border-l-4 border-l-red-500">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 mb-2">
                          {business.name}
                        </h3>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>📧 {business.admin_email}</p>
                          {business.contact_phone && (
                            <p>📞 {business.contact_phone}</p>
                          )}
                          <p>📅 נוצר: {new Date(business.created_at).toLocaleDateString('he-IL')}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-red-100 text-red-800">
                        בארכיון
                      </Badge>
                    </div>

                    <Button
                      onClick={() => restoreBusiness(business.id, business.name)}
                      className="w-full"
                      variant="outline"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      שחזר עסק
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ArchivedBusinessesPage;
