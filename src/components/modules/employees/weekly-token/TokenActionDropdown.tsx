
import React from 'react';
import { Button } from '@/components/ui/button';
import { Send, Sparkles } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TokenActionDropdownProps {
  loading: boolean;
  phone: string;
  isActive: boolean;
  useAPI: boolean;
  onSendWhatsApp: (useAdvanced: boolean) => void;
}

export const TokenActionDropdown: React.FC<TokenActionDropdownProps> = ({
  loading,
  phone,
  isActive,
  useAPI,
  onSendWhatsApp,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          disabled={loading || !phone || !isActive}
          className="flex items-center gap-2"
        >
          <Send className="h-4 w-4" />
          {loading ? 'שולח...' : 'שלח בוואטסאפ'}
          {useAPI && (
            <span className="text-xs text-blue-600">(API)</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onSendWhatsApp(false)}>
          <Send className="h-4 w-4 mr-2" />
          טופס רגיל
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSendWhatsApp(true)}>
          <Sparkles className="h-4 w-4 mr-2" />
          מערכת מתקדמת
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
