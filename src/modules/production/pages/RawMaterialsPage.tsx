import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Leaf, AlertTriangle, Package } from 'lucide-react';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { RawMaterial } from '@/types/production';

export const RawMaterialsPage: React.FC = () => {
  const navigate = useNavigate();
  const { businessId } = useCurrentBusiness();

  const { data: materials, isLoading } = useQuery({
    queryKey: ['raw-materials', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('raw_materials')
        .select('*')
        .eq('business_id', businessId!)
        .eq('is_active', true)
        .order('material_name');
      
      if (error) throw error;
      return data as RawMaterial[];
    },
    enabled: !!businessId
  });

  const getLowStockMaterials = () => {
    return materials?.filter(m => 
      m.min_stock && m.current_stock !== undefined && m.current_stock < m.min_stock
    ) || [];
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Leaf className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">חומרי גלם</h1>
            <p className="text-muted-foreground">ניהול מלאי וצריכת חומרי גלם</p>
          </div>
        </div>
        <Button onClick={() => navigate('/production/materials/new')}>
          <Plus className="h-4 w-4 ml-2" />
          חומר גלם חדש
        </Button>
      </div>

      {getLowStockMaterials().length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-700 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              התראת מלאי נמוך
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-orange-600">
              {getLowStockMaterials().length} חומרי גלם במלאי נמוך ודורשים הזמנה
            </p>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="text-center py-12">טוען...</div>
      ) : !materials?.length ? (
        <Card>
          <CardContent className="text-center py-12">
            <Leaf className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">אין חומרי גלם להצגה</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map((material) => {
            const isLowStock = material.min_stock && material.current_stock !== undefined && material.current_stock < material.min_stock;
            
            return (
              <Card 
                key={material.id}
                className={`hover:shadow-md transition-shadow cursor-pointer ${isLowStock ? 'border-orange-200' : ''}`}
                onClick={() => navigate(`/production/materials/${material.id}`)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg">{material.material_name}</CardTitle>
                      {material.material_code && (
                        <p className="text-sm text-muted-foreground">קוד: {material.material_code}</p>
                      )}
                    </div>
                    {isLowStock && (
                      <Badge variant="destructive" className="mr-2">
                        <AlertTriangle className="h-3 w-3 ml-1" />
                        נמוך
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">מלאי נוכחי</span>
                    <span className="font-medium">
                      {material.current_stock || 0} {material.unit}
                    </span>
                  </div>
                  {material.min_stock && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">מלאי מינימלי</span>
                      <span className="text-sm">{material.min_stock} {material.unit}</span>
                    </div>
                  )}
                  {material.supplier && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">ספק</span>
                      <span className="text-sm">{material.supplier}</span>
                    </div>
                  )}
                  {material.category && (
                    <Badge variant="outline">{material.category}</Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
