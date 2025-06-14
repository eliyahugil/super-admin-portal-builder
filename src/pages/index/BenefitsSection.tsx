
import React from 'react';

export const BenefitsSection: React.FC = () => (
  <div className="mt-20 bg-white rounded-2xl p-8 shadow-lg">
    <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
      למה לבחור במערכת שלנו?
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <h4 className="font-semibold text-gray-900">הקמה מהירה</h4>
            <p className="text-gray-600">התקנה ותפעול תוך דקות ספורות</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="text-2xl">🔒</span>
          <div>
            <h4 className="font-semibold text-gray-900">אבטחה מתקדמת</h4>
            <p className="text-gray-600">הגנה מלאה על נתוני העסק והעובדים</p>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">📱</span>
          <div>
            <h4 className="font-semibold text-gray-900">ממשק ידידותי</h4>
            <p className="text-gray-600">עיצוב אינטואיטיבי ונוח לשימוש</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="text-2xl">🎯</span>
          <div>
            <h4 className="font-semibold text-gray-900">תמיכה מלאה</h4>
            <p className="text-gray-600">צוות התמיכה זמין לעזרה בכל עת</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);
