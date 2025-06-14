
import React from 'react';
import { FeatureCard } from './FeatureCard';

export const FeaturesGrid: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
    <FeatureCard 
      title="👥 ניהול עובדים מתקדם"
      description="ניהול מידע עובדים, מסמכים דיגיטליים, מעקב נוכחות, בקשות עובדים וכלי ניהול משמרות חכמים"
      icon="👥"
    />
    <FeatureCard 
      title="🔗 אינטגרציות חכמות"
      description="חיבור קל ומהיר ל-WhatsApp Business, Google Maps, Facebook Leads, מערכות חשבוניות ועוד"
      icon="🔗"
    />
    <FeatureCard 
      title="🤝 CRM מובנה"
      description="מעקב לידים, ניהול לקוחות, אוטומציות שיווקיות וכלי מכירות מתקדמים"
      icon="🤝"
    />
    <FeatureCard 
      title="🏢 ניהול סניפים"
      description="ניהול מרכזי של מספר סניפים, הגדרת תפקידים והרשאות לכל סניף"
      icon="🏢"
    />
    <FeatureCard 
      title="📊 דוחות וניתוחים"
      description="דוחות מפורטים על ביצועי עובדים, נוכחות, מכירות ותובנות עסקיות"
      icon="📊"
    />
    <FeatureCard 
      title="⚙️ התאמה אישית"
      description="מודולים מותאמים אישית, הגדרות גמישות והתאמה לצרכי העסק הספציפיים"
      icon="⚙️"
    />
  </div>
);
