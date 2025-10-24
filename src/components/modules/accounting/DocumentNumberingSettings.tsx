import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Hash, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  DOCUMENT_TYPES, 
  getDocumentTypesByCategory,
  getCategoryLabel,
  getCategoryColor,
  type DocumentType 
} from '@/constants/documentTypes';

interface DocumentNumberingSettingsProps {
  businessId: string;
}

export const DocumentNumberingSettings: React.FC<DocumentNumberingSettingsProps> = ({ businessId }) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [numberingData, setNumberingData] = useState<Record<string, number>>({});

  // שליפת הגדרות ספרור קיימות
  React.useEffect(() => {
    const fetchSequentialNumbers = async () => {
      if (!businessId) return;
      
      const { data, error } = await (supabase as any)
        .from('sequential_numbers')
        .select('*')
        .eq('business_id', businessId);
      
      if (error) {
        console.error('Error fetching sequential numbers:', error);
        return;
      }
      
      if (data) {
        const mapping: Record<string, number> = {};
        data.forEach((sn: any) => {
          mapping[sn.document_type] = sn.current_number;
        });
        setNumberingData(mapping);
      }
    };
    
    fetchSequentialNumbers();
  }, [businessId]);


  const handleNumberChange = (docCode: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setNumberingData(prev => ({ ...prev, [docCode]: numValue }));
  };

  const handleSaveAll = async () => {
    if (!businessId) {
      toast({
        title: 'שגיאה',
        description: 'לא נבחר עסק',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      // עדכון או הוספה לכל סוג מסמך
      const updates = Object.entries(numberingData).map(([docType, currentNum]) => ({
        business_id: businessId,
        document_type: docType,
        current_number: currentNum,
        prefix: DOCUMENT_TYPES[docType]?.prefix || '',
      }));

      for (const update of updates) {
        const { error } = await (supabase as any)
          .from('sequential_numbers')
          .upsert(update, {
            onConflict: 'business_id,document_type',
          });

        if (error) throw error;
      }

      toast({
        title: 'נשמר בהצלחה',
        description: 'הגדרות הספרור עודכנו',
      });
    } catch (error: any) {
      console.error('Error saving numbering:', error);
      toast({
        title: 'שגיאה בשמירה',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const renderDocumentTypeCard = (docType: DocumentType) => {
    const currentNumber = numberingData[docType.code] || 1;
    const exampleNumber = `${docType.prefix}${currentNumber.toString().padStart(4, '0')}`;

    return (
      <Card key={docType.code} className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                {docType.nameHe}
                <Badge variant="outline" className="font-mono text-xs">
                  {docType.code}
                </Badge>
              </CardTitle>
              <CardDescription className="mt-1">
                {docType.nameEn} • {docType.description}
              </CardDescription>
            </div>
            <Badge className={getCategoryColor(docType.category)}>
              {getCategoryLabel(docType.category)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor={`num-${docType.code}`}>מספר התחלתי</Label>
              <Input
                id={`num-${docType.code}`}
                type="number"
                min="1"
                value={numberingData[docType.code] || 1}
                onChange={(e) => handleNumberChange(docType.code, e.target.value)}
                className="text-right"
              />
            </div>
            <div className="space-y-2">
              <Label>קידומת</Label>
              <Input value={docType.prefix} disabled className="font-mono bg-gray-50" />
            </div>
            <div className="space-y-2">
              <Label>דוגמה למספר</Label>
              <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-blue-50 text-blue-900 font-mono">
                <Hash className="h-4 w-4" />
                {exampleNumber}
              </div>
            </div>
          </div>
          {docType.requiresVAT && (
            <div className="mt-3 flex items-center gap-2 text-sm text-green-700">
              <CheckCircle2 className="h-4 w-4" />
              מסמך חייב במע״מ
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const categories: DocumentType['category'][] = ['sales', 'purchase', 'credit', 'delivery', 'other'];

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">ספרור מסמכים</h2>
        <p className="text-gray-600">הגדרת מספור עוקב לכל סוגי המסמכים החשבונאיים</p>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">⚠️ חשוב לדעת:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>כל סוג מסמך חייב במספור עוקב נפרד</li>
                <li>אסור להשתמש באותו מספר לסוגי מסמכים שונים</li>
                <li>לא ניתן למחוק או לדלג על מספרים לאחר השימוש בהם</li>
                <li>שינוי מספור ישפיע רק על מסמכים חדשים</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="sales" dir="rtl">
        <TabsList className="grid w-full grid-cols-5">
          {categories.map((cat) => (
            <TabsTrigger key={cat} value={cat}>
              {getCategoryLabel(cat)}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((cat) => (
          <TabsContent key={cat} value={cat} className="space-y-4 mt-6">
            {getDocumentTypesByCategory(cat).map(renderDocumentTypeCard)}
            {getDocumentTypesByCategory(cat).length === 0 && (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  אין מסמכים פעילים בקטגוריה זו
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button onClick={handleSaveAll} disabled={saving} size="lg">
          <Save className="h-4 w-4 ml-2" />
          {saving ? 'שומר...' : 'שמור הגדרות'}
        </Button>
      </div>
    </div>
  );
};
