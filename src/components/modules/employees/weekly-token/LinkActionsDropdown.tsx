
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link, Copy, ExternalLink, Sparkles } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LinkActionsDropdownProps {
  compact?: boolean;
  onOpenLink: (useAdvanced: boolean) => void;
  onCopyLink: (useAdvanced: boolean) => void;
}

export const LinkActionsDropdown: React.FC<LinkActionsDropdownProps> = ({
  compact = false,
  onOpenLink,
  onCopyLink,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2"
          title="פעולות קישור"
        >
          <Link className="h-4 w-4" />
          {!compact && 'פעולות קישור'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onOpenLink(false)}>
          <ExternalLink className="h-4 w-4 mr-2" />
          פתח טופס רגיל
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onOpenLink(true)}>
          <Sparkles className="h-4 w-4 mr-2" />
          פתח מערכת מתקדמת
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onCopyLink(false)}>
          <Copy className="h-4 w-4 mr-2" />
          העתק טופס רגיל
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onCopyLink(true)}>
          <Copy className="h-4 w-4 mr-2" />
          העתק מערכת מתקדמת
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
