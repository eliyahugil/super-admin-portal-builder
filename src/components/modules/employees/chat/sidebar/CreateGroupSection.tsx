
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface CreateGroupSectionProps {
  onCreateGroup: () => void;
}

export const CreateGroupSection: React.FC<CreateGroupSectionProps> = ({
  onCreateGroup,
}) => {
  return (
    <div className="p-4 border-b">
      <Button 
        onClick={onCreateGroup}
        className="w-full"
        size="sm"
      >
        <Plus className="h-4 w-4 mr-2" />
        צור קבוצה חדשה
      </Button>
    </div>
  );
};
