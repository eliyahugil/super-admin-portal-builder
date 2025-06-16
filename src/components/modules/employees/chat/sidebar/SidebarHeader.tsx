
import React, { useState } from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Zap, Search } from 'lucide-react';
import { SearchInput } from './SearchInput';
import { QuickGroupDialog } from '../QuickGroupDialog';

interface SidebarHeaderProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  searchValue = '',
  onSearchChange = () => {},
}) => {
  const [showSearch, setShowSearch] = useState(false);
  const [showQuickGroups, setShowQuickGroups] = useState(false);

  return (
    <>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">צ'אט עובדים</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSearch(!showSearch)}
              className={`h-8 w-8 p-0 ${showSearch ? 'bg-blue-50 text-blue-600' : ''}`}
            >
              <Search className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowQuickGroups(true)}
              className="h-8 w-8 p-0"
            >
              <Zap className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {showSearch && (
          <div className="mt-3">
            <SearchInput
              value={searchValue}
              onChange={onSearchChange}
              placeholder="חפש עובדים או קבוצות..."
            />
          </div>
        )}
      </CardHeader>

      <QuickGroupDialog
        open={showQuickGroups}
        onOpenChange={setShowQuickGroups}
      />
    </>
  );
};
