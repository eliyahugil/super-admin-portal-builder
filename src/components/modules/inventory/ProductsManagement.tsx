
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Package, Plus, Search, Edit, Trash2, AlertTriangle } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  minStock: number;
  price: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export const ProductsManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock data
  const products: Product[] = [
    {
      id: '1',
      name: 'מוצר דוגמה 1',
      sku: 'PRD001',
      category: 'אלקטרוניקה',
      currentStock: 25,
      minStock: 10,
      price: 299.99,
      status: 'in_stock'
    },
    {
      id: '2',
      name: 'מוצר דוגמה 2',
      sku: 'PRD002',
      category: 'ביגוד',
      currentStock: 5,
      minStock: 10,
      price: 89.99,
      status: 'low_stock'
    },
    {
      id: '3',
      name: 'מוצר דוגמה 3',
      sku: 'PRD003',
      category: 'ספרים',
      currentStock: 0,
      minStock: 5,
      price: 49.99,
      status: 'out_of_stock'
    }
  ];

  const getStatusBadge = (status: Product['status']) => {
    switch (status) {
      case 'in_stock':
        return <Badge className="bg-green-100 text-green-800">במלאי</Badge>;
      case 'low_stock':
        return <Badge className="bg-yellow-100 text-yellow-800">מלאי נמוך</Badge>;
      case 'out_of_stock':
        return <Badge variant="destructive">אזל המלאי</Badge>;
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">ניהול מוצרים</h1>
        <p className="text-gray-600 mt-2">נהל את קטלוג המוצרים שלך</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="חפש מוצרים..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              הוסף מוצר
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>הוסף מוצר חדש</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>שם המוצר</Label>
                <Input placeholder="שם המוצר" />
              </div>
              <div>
                <Label>קוד מוצר (SKU)</Label>
                <Input placeholder="PRD001" />
              </div>
              <div>
                <Label>קטגוריה</Label>
                <Input placeholder="קטגוריה" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>מלאי נוכחי</Label>
                  <Input type="number" placeholder="0" />
                </div>
                <div>
                  <Label>מלאי מינימלי</Label>
                  <Input type="number" placeholder="0" />
                </div>
              </div>
              <div>
                <Label>מחיר</Label>
                <Input type="number" step="0.01" placeholder="0.00" />
              </div>
              <div>
                <Label>תיאור</Label>
                <Textarea placeholder="תיאור המוצר..." />
              </div>
              <Button className="w-full">
                הוסף מוצר
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Package className="h-6 w-6 text-blue-600" />
                  <div>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <CardDescription>{product.sku}</CardDescription>
                  </div>
                </div>
                {getStatusBadge(product.status)}
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">קטגוריה:</span>
                  <span>{product.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">מלאי נוכחי:</span>
                  <span className={product.currentStock <= product.minStock ? 'text-red-600 font-medium' : ''}>
                    {product.currentStock}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">מחיר:</span>
                  <span className="font-medium">₪{product.price}</span>
                </div>
                
                {product.currentStock <= product.minStock && (
                  <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-600">מלאי נמוך!</span>
                  </div>
                )}

                <div className="flex gap-2 pt-3">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="h-4 w-4 mr-1" />
                    ערוך
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">לא נמצאו מוצרים</p>
        </div>
      )}
    </div>
  );
};
