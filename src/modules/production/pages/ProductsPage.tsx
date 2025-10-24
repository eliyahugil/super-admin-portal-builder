import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Package2, Clock, ArrowRight } from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: products, isLoading } = useProducts();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Package2 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">מוצרים</h1>
            <p className="text-muted-foreground">ניהול מוצרי הייצור</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/production')}>
            <ArrowRight className="h-4 w-4 ml-2" />
            חזור
          </Button>
          <Button onClick={() => navigate('/production/products/new')}>
            <Plus className="h-4 w-4 ml-2" />
            מוצר חדש
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">טוען...</div>
      ) : !products?.length ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">אין מוצרים להצגה</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <Card 
              key={product.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/production/products/${product.id}`)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    {product.product_code && (
                      <p className="text-sm text-muted-foreground">קוד: {product.product_code}</p>
                    )}
                  </div>
                  <Badge variant="outline">{product.product_type}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">יחידת ברירת מחדל</span>
                    <span className="font-medium">{product.default_unit}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">תוקף: {product.shelf_life_days} ימים</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
