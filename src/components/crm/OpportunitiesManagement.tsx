import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Plus, Search, Calendar, TrendingUp, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import type { Opportunity } from '@/types/crm';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

export const OpportunitiesManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const { businessId } = useCurrentBusiness();

  const { data: opportunities, isLoading } = useQuery({
    queryKey: ['opportunities', businessId],
    queryFn: async (): Promise<Opportunity[]> => {
      if (!businessId) return [];
      
      const { data, error } = await supabase
        .from('opportunities')
        .select(`
          *,
          lead:leads(name),
          customer:customers(name)
        `)
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching opportunities:', error);
        throw error;
      }
      
      return (data || []).map(opportunity => ({
        ...opportunity,
        stage: opportunity.stage as Opportunity['stage']
      }));
    },
    enabled: !!businessId,
  });

  const getStageBadge = (stage: string) => {
    const stageConfig = {
      'qualification': { label: 'הכשרה', color: 'bg-blue-100 text-blue-800' },
      'proposal': { label: 'הצעה', color: 'bg-purple-100 text-purple-800' },
      'negotiation': { label: 'משא ומתן', color: 'bg-yellow-100 text-yellow-800' },
      'closed_won': { label: 'נסגר בהצלחה', color: 'bg-green-100 text-green-800' },
      'closed_lost': { label: 'נסגר כישלון', color: 'bg-red-100 text-red-800' },
    };

    const config = stageConfig[stage as keyof typeof stageConfig] || stageConfig.qualification;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const formatCurrency = (amount: number, currency: string = 'ILS') => {
    const symbol = currency === 'ILS' ? '₪' : '$';
    return `${symbol}${amount.toLocaleString()}`;
  };

  const filteredOpportunities = opportunities?.filter(opportunity => {
    const matchesSearch = !searchTerm || 
      opportunity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opportunity.lead?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opportunity.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStage = stageFilter === 'all' || opportunity.stage === stageFilter;
    
    return matchesSearch && matchesStage;
  }) || [];

  const totalValue = filteredOpportunities.reduce((sum, opp) => sum + opp.value, 0);
  const averageProbability = filteredOpportunities.length > 0 
    ? filteredOpportunities.reduce((sum, opp) => sum + opp.probability, 0) / filteredOpportunities.length 
    : 0;

  if (isLoading) {
    return <div className="p-6 text-center">טוען הזדמנויות...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{filteredOpportunities.length}</p>
                <p className="text-sm text-muted-foreground">הזדמנויות פעילות</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
                <p className="text-sm text-muted-foreground">סך הכל ערך הזדמנויות</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{Math.round(averageProbability)}%</p>
                <p className="text-sm text-muted-foreground">ממוצע הסתברות</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>ניהול הזדמנויות</CardTitle>
              <p className="text-sm text-muted-foreground">
                מעקב והזדמנויות מכירה פעילות
              </p>
            </div>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              הוסף הזדמנות חדשה
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="חיפוש לפי כותרת או לקוח..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="שלב" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל השלבים</SelectItem>
                <SelectItem value="qualification">הכשרה</SelectItem>
                <SelectItem value="proposal">הצעה</SelectItem>
                <SelectItem value="negotiation">משא ומתן</SelectItem>
                <SelectItem value="closed_won">נסגר בהצלחה</SelectItem>
                <SelectItem value="closed_lost">נסגר כישלון</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Opportunities List */}
          <div className="space-y-4">
            {filteredOpportunities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm || stageFilter !== 'all' ? 'לא נמצאו הזדמנויות המתאימות לסינון' : 'אין הזדמנויות עדיין'}
              </div>
            ) : (
              filteredOpportunities.map((opportunity) => (
                <div key={opportunity.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{opportunity.title}</h3>
                        {getStageBadge(opportunity.stage)}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        {(opportunity.lead?.name || opportunity.customer?.name) && (
                          <span>
                            לקוח: {opportunity.lead?.name || opportunity.customer?.name}
                          </span>
                        )}
                        {opportunity.expected_close_date && (
                          <span>
                            תאריך סגירה צפוי: {format(new Date(opportunity.expected_close_date), 'dd/MM/yyyy', { locale: he })}
                          </span>
                        )}
                      </div>
                      
                      {opportunity.description && (
                        <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                          {opportunity.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">הסתברות:</span>
                        <Progress value={opportunity.probability} className="flex-1 max-w-32" />
                        <span className="text-sm font-medium">{opportunity.probability}%</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(opportunity.value, opportunity.currency)}
                      </p>
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