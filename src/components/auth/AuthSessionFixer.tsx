import React, { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

interface AuthSessionFixerProps {
  onFixAttempted: () => void;
}

export const AuthSessionFixer: React.FC<AuthSessionFixerProps> = ({ onFixAttempted }) => {
  const fixSession = async () => {
    console.log('🔧 Attempting to fix auth session...');
    
    try {
      // מחיקת סשן מקומי
      localStorage.clear();
      sessionStorage.clear();
      
      // מחיקת סשן מ-Supabase
      await supabase.auth.signOut({ scope: 'local' });
      
      // אתחול מחדש של הקליינט
      await supabase.auth.refreshSession();
      
      console.log('✅ Auth session fixed successfully');
      onFixAttempted();
      
      // ניתוב לעמוד ההתחברות
      window.location.href = '/auth?tab=signin';
    } catch (error) {
      console.error('❌ Error fixing auth session:', error);
      // בכל מקרה ננסה להתחיל מחדש
      window.location.href = '/auth?tab=signin';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6">
      <div className="max-w-md text-center space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-destructive mb-2">
            בעיה במערכת האימות
          </h1>
          <p className="text-muted-foreground">
            זוהתה בעיה בסשן האימות. זה יכול לקרות לאחר עדכונים במערכת.
          </p>
        </div>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            לחץ על הכפתור למטה כדי לתקן את הבעיה ולהתחבר מחדש:
          </p>
          
          <Button 
            onClick={fixSession}
            className="w-full"
            size="lg"
          >
            תקן והתחבר מחדש
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground">
          <p>אם הבעיה נמשכת, נסה לרענן את הדף או לפנות לתמיכה</p>
        </div>
      </div>
    </div>
  );
};