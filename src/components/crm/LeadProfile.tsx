import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Building, 
  User, 
  Calendar,
  MessageSquare,
  Activity,
  FileText,
  DollarSign
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { WhatsAppChatPanel } from './WhatsAppChatPanel';
import type { Lead } from '@/types/crm';

export const LeadProfile: React.FC = () => {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const { businessId } = useCurrentBusiness();

  const { data: lead, isLoading } = useQuery({
    queryKey: ['lead', leadId],
    queryFn: async (): Promise<Lead | null> => {
      if (!leadId || !businessId) return null;
      
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .eq('business_id', businessId)
        .single();
      
      if (error) {
        console.error('Error fetching lead:', error);
        throw error;
      }
      
      return data as Lead;
    },
    enabled: !!leadId && !!businessId,
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'new': { label: 'חדש', color: 'bg-blue-100 text-blue-800' },
      'contacted': { label: 'נוצר קשר', color: 'bg-orange-100 text-orange-800' },
      'qualified': { label: 'מוכשר', color: 'bg-green-100 text-green-800' },
      'proposal': { label: 'הצעה', color: 'bg-purple-100 text-purple-800' },
      'negotiation': { label: 'משא ומתן', color: 'bg-yellow-100 text-yellow-800' },
      'closed_won': { label: 'נסגר בהצלחה', color: 'bg-green-100 text-green-800' },
      'closed_lost': { label: 'נסגר כישלון', color: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.new;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return <div className="p-6 text-center">טוען פרטי ליד...</div>;
  }

  if (!lead) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-lg font-semibold mb-2">ליד לא נמצא</h2>
        <Button onClick={() => navigate('/crm/leads')} variant="outline">
          חזור לרשימת לידים
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/crm/leads')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          חזור לרשימת לידים
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{lead.name}</h1>
          <p className="text-muted-foreground">פרטי ליד</p>
        </div>
        {getStatusBadge(lead.status)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lead Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                פרטי ליד
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lead.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{lead.email}</span>
                  </div>
                )}
                {lead.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{lead.phone}</span>
                  </div>
                )}
                {lead.company && (
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{lead.company}</span>
                  </div>
                )}
                {lead.position && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{lead.position}</span>
                  </div>
                )}
                {lead.lead_value && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold">₪{lead.lead_value.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">נוצר: {formatDate(lead.created_at)}</span>
                </div>
              </div>
              
              {lead.notes && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">הערות</h4>
                  <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                    {lead.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tabs for Activities, Documents, etc. */}
          <Card>
            <CardContent className="p-0">
              <Tabs defaultValue="activities" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="activities" className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    פעילויות
                  </TabsTrigger>
                  <TabsTrigger value="documents" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    מסמכים
                  </TabsTrigger>
                  <TabsTrigger value="history" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    היסטוריה
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="activities" className="p-6">
                  <div className="text-center text-muted-foreground py-8">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>אין פעילויות עדיין</p>
                    <Button variant="outline" size="sm" className="mt-4">
                      הוסף פעילות
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="documents" className="p-6">
                  <div className="text-center text-muted-foreground py-8">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>אין מסמכים עדיין</p>
                    <Button variant="outline" size="sm" className="mt-4">
                      הוסף מסמך
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="history" className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded">
                      <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">ליד נוצר</p>
                        <p className="text-xs text-muted-foreground">{formatDate(lead.created_at)}</p>
                      </div>
                    </div>
                    {lead.source && (
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded">
                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">מקור: {lead.source}</p>
                          <p className="text-xs text-muted-foreground">מידע על המקור</p>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>פעולות מהירות</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="outline">
                עדכן סטטוס
              </Button>
              <Button className="w-full" variant="outline">
                צור הזדמנות
              </Button>
              <Button className="w-full" variant="outline">
                שלח אימייל
              </Button>
              {lead.phone && (
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => window.open(`tel:${lead.phone}`)}
                >
                  התקשר
                </Button>
              )}
            </CardContent>
          </Card>

          {/* WhatsApp Chat */}
          <WhatsAppChatPanel 
            customerPhone={lead.phone}
            leadId={lead.id}
          />
        </div>
      </div>
    </div>
  );
};