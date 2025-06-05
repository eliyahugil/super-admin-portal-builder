
import React from 'react';
import { AuthForm } from '@/components/auth/AuthForm';
import { useAuth } from '@/components/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  // אם המשתמש לא מחובר, הצג את טופס ההתחברות
  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <AuthForm />
      </div>
    );
  }

  // אם המשתמש מחובר, הצג את כלי המשתמש
  return (
    <div className="flex-1 flex items-center justify-end gap-4 px-4">
      <div className="flex items-center gap-2 text-right">
        <span className="text-sm text-muted-foreground">
          {user.email}
        </span>
        <User className="h-4 w-4" />
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleSignOut}
        className="flex items-center gap-2"
      >
        <span>התנתק</span>
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
};
