import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Copy, 
  Settings, 
  Calendar,
  Clock,
  Users
} from 'lucide-react';

export const ShiftCreationHelpCard: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-blue-100/50 transition-colors">
            <CardTitle className="flex items-center justify-between text-blue-800">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                <span>איך ליצור משמרות בקלות?</span>
              </div>
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-3">
              
              {/* תבניות משמרות */}
              <div className="bg-white p-3 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold text-blue-800">שיטה 1: שימוש בתבניות משמרות</span>
                  <Badge variant="outline" className="text-blue-600 border-blue-600">מומלץ</Badge>
                </div>
                <ol className="space-y-1 text-blue-700 mr-4">
                  <li>1. לחץ על <strong>"נהל תבניות"</strong> כדי ליצור תבניות חדשות</li>
                  <li>2. הגדר שעות, סוג משמרת, מספר עובדים נדרש ואיזה סניף</li>
                  <li>3. חזור ללוח המשמרות ולחץ על <strong>"תבניות משמרות"</strong></li>
                  <li>4. בחר תבניות ויישם ליום או לשבוע שלם</li>
                </ol>
              </div>

              {/* העתקה מסידור קודם */}
              <div className="bg-white p-3 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Copy className="h-4 w-4 text-green-600" />
                  <span className="font-semibold text-green-800">שיטה 2: העתקה מסידור קודם</span>
                  <Badge variant="outline" className="text-green-600 border-green-600">חדש!</Badge>
                </div>
                <ol className="space-y-1 text-green-700 mr-4">
                  <li>1. לחץ על <strong>"העתק מסידור קודם"</strong></li>
                  <li>2. בחר שבוע מהעבר שברצונך להעתיק ממנו</li>
                  <li>3. בחר את המשמרות הרצויות</li>
                  <li>4. החלט האם לשמור על השיוכים או ליצור משמרות לא מוקצות</li>
                  <li>5. לחץ "העתק משמרות" והמשמרות יועתקו לשבוע הנוכחי</li>
                </ol>
              </div>

              {/* משמרות לא מוקצות */}
              <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-orange-600" />
                  <span className="font-semibold text-orange-800">מה זה משמרות לא מוקצות?</span>
                </div>
                <p className="text-orange-700 text-sm">
                  כשאתה מעתיק כמשמרות לא מוקצות, המשמרות נוצרות ללא עובד מוקצה. 
                  עובדים יכולים להגיש בקשות למשמרות האלה דרך הטוקנים שלהם, 
                  ואתה יכול לאשר או לדחות את הבקשות.
                </p>
              </div>

              {/* טיפים נוספים */}
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-gray-600" />
                  <span className="font-semibold text-gray-800">טיפים לשימוש יעיל</span>
                </div>
                <ul className="space-y-1 text-gray-700 mr-4 text-sm">
                  <li>• צור תבניות עבור המשמרות הנפוצות שלך (בוקר, ערב, לילה)</li>
                  <li>• השתמש בהעתקה מסידור קודם לשבועות עם דפוס קבוע</li>
                  <li>• בחר "משמרות לא מוקצות" כדי לתת לעובדים לבחור בעצמם</li>
                  <li>• שלב בין השיטות - תבניות לבסיס והעתקה לעידכונים</li>
                </ul>
              </div>

            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};