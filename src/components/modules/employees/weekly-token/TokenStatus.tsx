
import React from 'react';
import { Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TokenData } from './types';

interface TokenStatusProps {
  tokenData: TokenData;
}

export const TokenStatus: React.FC<TokenStatusProps> = ({ tokenData }) => {
  const weekStart = new Date(tokenData.week_start_date).toLocaleDateString('he-IL');
  const weekEnd = new Date(tokenData.week_end_date).toLocaleDateString('he-IL');
  const isExpired = new Date(tokenData.expires_at) < new Date();
  const isActive = tokenData.is_active && !isExpired;

  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-blue-600" />
      <span className="text-sm font-medium">טוכן שבוע {weekStart} - {weekEnd}</span>
      <Badge variant={!isActive ? "destructive" : "default"}>
        {!tokenData.is_active ? "בוטל" : isExpired ? "פג תוקף" : "פעיל"}
      </Badge>
    </div>
  );
};
