
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, MapPin } from 'lucide-react';
import { useBusiness } from '@/hooks/useBusiness';
import { useBranchesData } from '@/hooks/useBranchesData';
import { CreateBranchDialog } from './CreateBranchDialog';
import { BranchesList } from './BranchesList';

export const BranchManagement: React.FC = () => {
  const [createBranchOpen, setCreateBranchOpen] = useState(false);
  const { businessId } = useBusiness();
  const queryClient = useQueryClient();

  const { data: branches = [], isLoading, refetch } = useBranchesData(businessId);

  const handleBranchCreated = () => {
    queryClient.invalidateQueries({ queryKey: ['branches'] });
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64" dir="rtl">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MapPin className="h-6 w-6 text-blue-600" />
            ניהול סניפים
          </h2>
          <p className="text-gray-600">ניהול סניפי העסק ומיקומים גיאוגרפיים</p>
        </div>
        <Button onClick={() => setCreateBranchOpen(true)}>
          <Plus className="h-4 w-4 ml-2" />
          הוסף סניף
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>רשימת סניפים ({branches.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <BranchesList branches={branches} onRefetch={refetch} />
        </CardContent>
      </Card>

      <CreateBranchDialog
        open={createBranchOpen}
        onOpenChange={setCreateBranchOpen}
        onSuccess={handleBranchCreated}
      />
    </div>
  );
};
