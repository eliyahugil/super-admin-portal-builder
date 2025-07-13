import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Mail, Phone, Building, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import type { Lead } from '@/types/crm';

export const LeadsManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { businessId } = useCurrentBusiness();
  const { toast } = useToast();

  const { data: leads, isLoading, refetch } = useQuery({
    queryKey: ['leads', businessId],
    queryFn: async (): Promise<Lead[]> => {
      if (!businessId) return [];
      
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching leads:', error);
        throw error;
      }
      
      return (data || []).map(lead => ({
        ...lead,
        status: lead.status as Lead['status']
      }));
    },
    enabled: !!businessId,
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'new': { variant: 'default' as const, label: 'חדש', color: 'bg-blue-100 text-blue-800' },
      'contacted': { variant: 'secondary' as const, label: 'נוצר קשר', color: 'bg-orange-100 text-orange-800' },
      'qualified': { variant: 'default' as const, label: 'מוכשר', color: 'bg-green-100 text-green-800' },
      'proposal': { variant: 'default' as const, label: 'הצעה', color: 'bg-purple-100 text-purple-800' },
      'negotiation': { variant: 'default' as const, label: 'משא ומתן', color: 'bg-yellow-100 text-yellow-800' },
      'closed_won': { variant: 'default' as const, label: 'נסגר בהצלחה', color: 'bg-green-100 text-green-800' },
      'closed_lost': { variant: 'destructive' as const, label: 'נסגר כישלון', color: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.new;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const filteredLeads = leads?.filter(lead => {
    const matchesSearch = !searchTerm || 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  if (isLoading) {
    return <div className="p-6 text-center">טוען לידים...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>ניהול לידים</CardTitle>
              <p className="text-sm text-muted-foreground">
                רשימת לידים ומעקב אחר הזדמנויות מכירה
              </p>
            </div>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              הוסף ליד חדש
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="חיפוש לפי שם, אימייל או חברה..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="סטטוס" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל הסטטוסים</SelectItem>
                <SelectItem value="new">חדש</SelectItem>
                <SelectItem value="contacted">נוצר קשר</SelectItem>
                <SelectItem value="qualified">מוכשר</SelectItem>
                <SelectItem value="proposal">הצעה</SelectItem>
                <SelectItem value="negotiation">משא ומתן</SelectItem>
                <SelectItem value="closed_won">נסגר בהצלחה</SelectItem>
                <SelectItem value="closed_lost">נסגר כישלון</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Leads List */}
          <div className="space-y-4">
            {filteredLeads.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm || statusFilter !== 'all' ? 'לא נמצאו לידים המתאימים לסינון' : 'אין לידים עדיין'}
              </div>
            ) : (
              filteredLeads.map((lead) => (
                <div key={lead.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{lead.name}</h3>
                        {getStatusBadge(lead.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-muted-foreground">
                        {lead.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {lead.email}
                          </div>
                        )}
                        {lead.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {lead.phone}
                          </div>
                        )}
                        {lead.company && (
                          <div className="flex items-center gap-1">
                            <Building className="h-4 w-4" />
                            {lead.company}
                          </div>
                        )}
                        {lead.position && (
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {lead.position}
                          </div>
                        )}
                      </div>
                      
                      {lead.notes && (
                        <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                          {lead.notes}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      {lead.lead_value && (
                        <p className="text-lg font-bold text-green-600">
                          ₪{lead.lead_value.toLocaleString()}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          עריכה
                        </Button>
                        <Button variant="outline" size="sm">
                          פעילויות
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};