
import React from 'react';
import { SidebarFooter as BaseSidebarFooter } from '@/components/ui/sidebar';
import { getVersionInfo } from '@/lib/version';
import { Badge } from '@/components/ui/badge';
import { Calendar, Code } from 'lucide-react';

export const SidebarFooterContent: React.FC = () => {
  const versionInfo = getVersionInfo();
  
  return (
    <BaseSidebarFooter className="p-4 text-right border-t space-y-2">
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <Badge variant="outline" className="text-xs">
            v{versionInfo.version}
          </Badge>
          <span className="text-muted-foreground">{versionInfo.codeName}</span>
        </div>
        
        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{new Date(versionInfo.releaseDate).toLocaleDateString('he-IL')}</span>
        </div>
        
        {!versionInfo.isProduction && (
          <div className="flex items-center justify-center gap-1 text-xs">
            <Code className="h-3 w-3" />
            <Badge variant="secondary" className="text-xs">
              {versionInfo.environment}
            </Badge>
          </div>
        )}
      </div>
    </BaseSidebarFooter>
  );
};
