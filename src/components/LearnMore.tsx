
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Check, Users, Building, Clock, Plug, BarChart3, Shield } from 'lucide-react';

const LearnMore = () => {
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            למידע מפורט על המערכת
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            גלו כיצד המערכת שלנו יכולה לשדרג את ניהול העסק שלכם ולחסוך זמן יקר
          </p>
        </div>

        {/* Detailed Features */}
        <div className="space-y-12 mb-16">
          <DetailedFeature
            icon={<Users className="h-12 w-12 text-blue-600" />}
            title="ניהול עובדים מתקדם"
            description="מערכת מקיפה לניהול כל היבטי העובדים בעסק"
            features={[
              'ניהול מידע אישי ומקצועי של עובדים',
              'מעקב נוכחות ושעות עבודה בזמן אמת',
              'ניהול בקשות חופשות ומחלות',
              'מסמכים דיגיטליים וחתימות אלקטרוניות',
              'תכנון משמרות חכם ואוטומטי',
              'ייבוא נתונים מאקסל בקלות'
            ]}
          />

          <DetailedFeature
            icon={<Plug className="h-12 w-12 text-green-600" />}
            title="אינטגרציות חכמות"
            description="חיבור מהיר ואמין לשירותים החיצוניים המובילים"
            features={[
              'WhatsApp Business API להודעות אוטומטיות',
              'Google Maps לניווט וניהול כתובות',
              'Facebook Leads API לניהול לידים',
              'מערכות חשבוניות (חשבונית ירוקה, סופטקאש)',
              'מערכות תשלום (PayPal, אשראי)',
              'חתימות דיגיטליות מתקדמות'
            ]}
          />

          <DetailedFeature
            icon={<BarChart3 className="h-12 w-12 text-purple-600" />}
            title="CRM מובנה ודוחות"
            description="ניהול לקוחות ותובנות עסקיות מתקדמות"
            features={[
              'מעקב לידים ממקורות שונים',
              'ניהול צינור מכירות (Sales Pipeline)',
              'אוטומציות שיווקיות',
              'דוחות ביצועים מפורטים',
              'ניתוח נתוני עובדים ונוכחות',
              'תחזיות ותובנות עסקיות'
            ]}
          />

          <DetailedFeature
            icon={<Building className="h-12 w-12 text-orange-600" />}
            title="ניהול מולטי-סניפים"
            description="ניהול מרכזי של עסק עם מספר סניפים או מיקומים"
            features={[
              'ניהול מרכזי של כל הסניפים',
              'הגדרת הרשאות לכל סניף',
              'תפקידים מותאמים לכל מיקום',
              'דוחות משולבים בין סניפים',
              'העברת עובדים בין סניפים',
              'ניהול משמרות ברמת הסניף'
            ]}
          />
        </div>

        {/* Security & Support */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-16">
          <div className="text-center mb-8">
            <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              אבטחה ותמיכה ברמה הגבוהה ביותר
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-xl font-semibold text-gray-900 mb-4">🔒 אבטחת מידע</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>הצפנה מתקדמת של כל הנתונים</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>גיבויים אוטומטיים יומיים</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>אימות דו-שלבי (2FA)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>ציות מלא לתקנות הגנת הפרטיות</span>
                </li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-xl font-semibold text-gray-900 mb-4">🎯 תמיכה ושירות</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>תמיכה טכנית 24/7</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>הדרכה מלאה וליווי בהטמעה</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>עדכונים ושיפורים רציפים</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>התאמות אישיות לפי הצורך</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-gray-900 mb-8">
            תוכניות מחיר שמתאימות לכל עסק
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <PricingCard
              title="בסיסי"
              price="₪299"
              period="לחודש"
              features={[
                'עד 25 עובדים',
                'ניהול נוכחות ומשמרות',
                '3 אינטגרציות בסיסיות',
                'תמיכה במייל',
                'דוחות בסיסיים'
              ]}
              isPopular={false}
            />
            
            <PricingCard
              title="מתקדם"
              price="₪599"
              period="לחודש"
              features={[
                'עד 100 עובדים',
                'כל התכונות הבסיסיות',
                'אינטגרציות ללא הגבלה',
                'CRM מלא',
                'תמיכה טלפונית',
                'דוחות מתקדמים',
                '3 סניפים'
              ]}
              isPopular={true}
            />
            
            <PricingCard
              title="ארגוני"
              price="₪999"
              period="לחודש"
              features={[
                'עובדים ללא הגבלה',
                'כל התכונות המתקדמות',
                'התאמות אישיות',
                'ייעוץ אישי',
                'תמיכה ייעודית',
                'סניפים ללא הגבלה',
                'API מותאם'
              ]}
              isPopular={false}
            />
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            מוכנים לבחון את המערכת?
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="bg-green-600 hover:bg-green-700" asChild>
              <Link to="/auth">
                🧪 התחילו ניסיון חינם היום
                <ArrowRight className="mr-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/">
                ← חזרה לעמוד הבית
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface DetailedFeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
}

const DetailedFeature: React.FC<DetailedFeatureProps> = ({ icon, title, description, features }) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gray-50">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            {icon}
          </div>
          <div>
            <CardTitle className="text-2xl text-gray-900">{title}</CardTitle>
            <CardDescription className="text-lg mt-2">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

interface PricingCardProps {
  title: string;
  price: string;
  period: string;
  features: string[];
  isPopular: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({ title, price, period, features, isPopular }) => {
  return (
    <Card className={`relative h-full ${isPopular ? 'border-blue-500 shadow-lg scale-105' : ''}`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
            הכי פופולרי
          </span>
        </div>
      )}
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
        <div className="mt-4">
          <span className="text-3xl font-bold text-gray-900">{price}</span>
          <span className="text-gray-600 mr-2">{period}</span>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-sm text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
        <Button 
          className={`w-full mt-6 ${isPopular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
          variant={isPopular ? 'default' : 'outline'}
          asChild
        >
          <Link to="/auth">
            התחל עכשיו
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default LearnMore;
