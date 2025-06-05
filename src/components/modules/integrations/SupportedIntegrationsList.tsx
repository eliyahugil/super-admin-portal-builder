
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SupportedIntegration {
  id: string;
  integration_name: string;
  display_name: string;
  description: string | null;
  category: string;
  icon: string | null;
  requires_global_key: boolean;
  requires_business_credentials: boolean;
  documentation_url: string | null;
  is_active: boolean;
}

export const SupportedIntegrationsList: React.FC = () => {
  const { data: integrations, isLoading } = useQuery({
    queryKey: ['supported-integrations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('supported_integrations')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });

      if (error) throw error;
      return data as SupportedIntegration[];
    },
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'maps': 'bg-blue-100 text-blue-800',
      'crm': 'bg-purple-100 text-purple-800',
      'invoicing': 'bg-green-100 text-green-800',
      'communication': 'bg-yellow-100 text-yellow-800',
      'automation': 'bg-orange-100 text-orange-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const groupedIntegrations = integrations?.reduce((acc, integration) => {
    if (!acc[integration.category]) {
      acc[integration.category] = [];
    }
    acc[integration.category].push(integration);
    return acc;
  }, {} as Record<string, SupportedIntegration[]>);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedIntegrations || {}).map(([category, categoryIntegrations]) => (
        <div key={category}>
          <h3 className="text-lg font-semibold mb-3 capitalize">
            {category === 'maps' && 'מפות וניווט'}
            {category === 'crm' && 'ניהול לקוחות'}
            {category === 'invoicing' && 'חשבוניות'}
            {category === 'communication' && 'תקשורת'}
            {category === 'automation' && 'אוטומציה'}
            {!['maps', 'crm', 'invoicing', 'communication', 'automation'].includes(category) && category}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryIntegrations.map((integration) => (
              <Card key={integration.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{integration.icon}</span>
                      <div>
                        <CardTitle className="text-sm">{integration.display_name}</CardTitle>
                        <Badge variant="outline" className={getCategoryColor(integration.category)}>
                          {integration.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <CardDescription className="text-sm mb-4">
                    {integration.description}
                  </CardDescription>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      {integration.requires_global_key && (
                        <Badge variant="secondary" className="text-xs">
                          מפתח גלובלי
                        </Badge>
                      )}
                      {integration.requires_business_credentials && (
                        <Badge variant="outline" className="text-xs">
                          הגדרות עסק
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {integration.documentation_url && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(integration.documentation_url!, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Settings className="h-3 w-3 mr-1" />
                        הגדר
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
