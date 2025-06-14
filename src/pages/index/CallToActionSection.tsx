
import React from 'react';
import { Button } from '@/components/ui/button';

interface CallToActionSectionProps {
  onAuth: () => void;
  onLearnMore: () => void;
  onLogin: () => void;
}
export const CallToActionSection: React.FC<CallToActionSectionProps> = ({
  onAuth, onLearnMore, onLogin
}) => (
  <div className="text-center space-y-6">
    <h2 className="text-3xl font-semibold text-gray-900 mb-8">
      מוכנים להתחיל?
    </h2>
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto">
      <Button 
        size="lg" 
        className="w-full sm:w-auto text-lg px-8 py-4 bg-green-600 hover:bg-green-700"
        onClick={onAuth}
      >
        🧪 נסו את המערכת בחינם
      </Button>
      <Button 
        size="lg" 
        variant="outline" 
        className="w-full sm:w-auto text-lg px-8 py-4"
        onClick={onLearnMore}
      >
        📘 למידע נוסף
      </Button>
    </div>
    <div className="mt-8 pt-6 border-t border-gray-200">
      <p className="text-gray-600 mb-4">
        כבר יש לכם חשבון?
      </p>
      <Button 
        variant="ghost" 
        size="lg"
        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        onClick={onLogin}
      >
        🔐 התחברו כאן
      </Button>
    </div>
  </div>
);
