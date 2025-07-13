import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Settings, 
  Globe, 
  MessageSquare, 
  DollarSign,
  FileText,
  Facebook,
  Search,
  Plus,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface GlobalIntegration {
  id: string;
  integration_name: string;
  display_name: string;
  description?: string;
  is_active: boolean;
  is_global: boolean;
  last_tested_at?: string;
  created_at: string;
}

export const AdminIntegrationsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: integrations = [], isLoading } = useQuery({
    queryKey: ['admin-integrations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('global_integrations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as GlobalIntegration[];
    }
  });

  // Mock data for demonstration
  const mockIntegrations: GlobalIntegration[] = [
    {
      id: '1',
      integration_name: 'whatsapp',
      display_name: 'WhatsApp Business',
      description: 'אינטגרציה עם WhatsApp Business API לשליחת הודעות אוטומטיות',
      is_active: true,
      is_global: true,
      last_tested_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      integration_name: 'google-maps',
      display_name: 'Google Maps',
      description: 'אינטגרציה עם Google Maps API למיקום ונווט',
      is_active: true,
      is_global: true,
      last_tested_at: new Date(Date.now() - 86400000).toISOString(),
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      integration_name: 'payments',
      display_name: 'מערכת תשלומים',
      description: 'אינטגרציה עם מערכות תשלום מקוונות',
      is_active: false,
      is_global: true,
      created_at: new Date().toISOString()
    },
    {
      id: '4',
      integration_name: 'facebook',
      display_name: 'Facebook Business',
      description: 'אינטגרציה עם Facebook Business API',
      is_active: true,
      is_global: true,
      last_tested_at: new Date(Date.now() - 172800000).toISOString(),
      created_at: new Date().toISOString()
    }
  ];

  const displayIntegrations = integrations.length > 0 ? integrations : mockIntegrations;

  const getIntegrationIcon = (name: string) => {
    switch (name) {
      case 'whatsapp':
        return <MessageSquare className="h-5 w-5" />;
      case 'google-maps':
        return <Globe className="h-5 w-5" />;
      case 'payments':
        return <DollarSign className="h-5 w-5" />;
      case 'facebook':
        return <Facebook className="h-5 w-5" />;
      case 'invoices':
        return <FileText className="h-5 w-5" />;
      default:
        return <Settings className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (integration: GlobalIntegration) => {
    if (!integration.is_active) {
      return <Badge variant="secondary"><AlertCircle className="h-3 w-3 mr-1" />לא פעיל</Badge>;
    }
    
    if (!integration.last_tested_at) {
      return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />לא נבדק</Badge>;
    }
    
    const daysSinceTest = Math.floor((Date.now() - new Date(integration.last_tested_at).getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceTest > 7) {
      return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />נדרש בדיקה</Badge>;
    }
    
    return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />פעיל</Badge>;
  };

  const filteredIntegrations = displayIntegrations.filter(integration =>
    integration.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    integration.integration_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    integration.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div className="p-6 text-center">טוען אינטגרציות...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">ניהול אינטגרציות</h1>
          <p className="text-muted-foreground">ניהול ותצורה של אינטגרציות גלובליות במערכת</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          הוסף אינטגרציה
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>אינטגרציות גלובליות</CardTitle>
            <div className="relative w-80">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="חיפוש אינטגרציות..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredIntegrations.map((integration) => (
              <Card key={integration.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getIntegrationIcon(integration.integration_name)}
                      <h3 className="font-semibold">{integration.display_name}</h3>
                    </div>
                    {getStatusBadge(integration)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {integration.description && (
                    <p className="text-sm text-muted-foreground">{integration.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>גלובלי: {integration.is_global ? 'כן' : 'לא'}</span>
                    {integration.last_tested_at && (
                      <span>
                        נבדק: {new Date(integration.last_tested_at).toLocaleDateString('he-IL')}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      הגדרות
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      בדיקה
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredIntegrations.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'לא נמצאו אינטגרציות המתאימות לחיפוש' : 'אין אינטגרציות עדיין'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">פעילות</p>
                <p className="text-2xl font-bold">
                  {displayIntegrations.filter(i => i.is_active).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">לא פעילות</p>
                <p className="text-2xl font-bold">
                  {displayIntegrations.filter(i => !i.is_active).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Globe className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">גלובליות</p>
                <p className="text-2xl font-bold">
                  {displayIntegrations.filter(i => i.is_global).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">דורש בדיקה</p>
                <p className="text-2xl font-bold">
                  {displayIntegrations.filter(i => {
                    if (!i.last_tested_at) return true;
                    const daysSinceTest = Math.floor((Date.now() - new Date(i.last_tested_at).getTime()) / (1000 * 60 * 60 * 24));
                    return daysSinceTest > 7;
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};