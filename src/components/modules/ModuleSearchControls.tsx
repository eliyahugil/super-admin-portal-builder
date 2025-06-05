
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Wrench, Search } from 'lucide-react';

interface ModuleSearchControlsProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onCreateModule: () => void;
  onCreateCustomModule: () => void;
}

export const ModuleSearchControls: React.FC<ModuleSearchControlsProps> = ({
  searchTerm,
  onSearchChange,
  onCreateModule,
  onCreateCustomModule,
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div className="flex-1">
        <Label htmlFor="search">חיפוש מודלים</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            id="search"
            placeholder="חפש לפי שם או תיאור..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button 
          onClick={onCreateCustomModule} 
          variant="outline" 
          className="flex items-center gap-2"
        >
          <Wrench className="h-4 w-4" />
          <span>צור מודל מותאם אישית</span>
        </Button>
        <Button 
          onClick={onCreateModule} 
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>צור מודל רגיל</span>
        </Button>
      </div>
    </div>
  );
};
