
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import { EditBranchDialog } from './EditBranchDialog';
import { Branch } from '@/types/branch';

interface BranchesListProps {
  branches: Branch[];
  onRefetch: () => void;
}

export const BranchesList: React.FC<BranchesListProps> = ({ branches, onRefetch }) => {
  const [editBranchOpen, setEditBranchOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const { toast } = useToast();
  const { logActivity } = useActivityLogger();

  const handleEdit = (branch: Branch) => {
    setSelectedBranch(branch);
    setEditBranchOpen(true);
    
    logActivity({
      action: 'view_edit_form',
      target_type: 'branch',
      target_id: branch.id,
      details: { branch_name: branch.name }
    });
  };

  const handleEditSuccess = () => {
    onRefetch();
    setSelectedBranch(null);
  };

  const handleDelete = async (branchId: string, branchName: string) => {
    if (!confirm(`האם אתה בטוח שברצונך למחוק את הסניף "${branchName}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('branches')
        .delete()
        .eq('id', branchId);

      if (error) {
        console.error('Error deleting branch:', error);
        
        logActivity({
          action: 'delete_failed',
          target_type: 'branch',
          target_id: branchId,
          details: { 
            branch_name: branchName,
            error: error.message 
          }
        });

        toast({
          title: 'שגיאה',
          description: 'לא ניתן למחוק את הסניף',
          variant: 'destructive',
        });
        return;
      }

      logActivity({
        action: 'delete',
        target_type: 'branch',
        target_id: branchId,
        details: { 
          branch_name: branchName,
          success: true 
        }
      });

      toast({
        title: 'הצלחה',
        description: 'הסניף נמחק בהצלחה',
      });

      onRefetch();
    } catch (error) {
      console.error('Error in handleDelete:', error);
      
      logActivity({
        action: 'delete_failed',
        target_type: 'branch',
        target_id: branchId,
        details: { 
          branch_name: branchName,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });

      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה בלתי צפויה',
        variant: 'destructive',
      });
    }
  };

  if (branches.length === 0) {
    return (
      <div className="text-center py-8">
        <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">אין סניפים עדיין</p>
        <p className="text-sm text-gray-400">התחל על ידי הוספת הסניף הראשון</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {branches.map((branch) => (
          <div
            key={branch.id}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-medium text-gray-900">{branch.name}</h3>
                {!branch.is_active && (
                  <Badge variant="outline" className="text-red-600 border-red-200">
                    לא פעיל
                  </Badge>
                )}
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                {branch.address && (
                  <div>כתובת: {branch.address}</div>
                )}
                {branch.latitude && branch.longitude && (
                  <div>
                    קואורדינטות: {branch.latitude.toFixed(6)}, {branch.longitude.toFixed(6)}
                  </div>
                )}
                {branch.gps_radius && (
                  <div>רדיוס GPS: {branch.gps_radius} מטר</div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleEdit(branch)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-600 hover:text-red-700"
                onClick={() => handleDelete(branch.id, branch.name)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <EditBranchDialog
        open={editBranchOpen}
        onOpenChange={setEditBranchOpen}
        onSuccess={handleEditSuccess}
        branch={selectedBranch}
      />
    </>
  );
};
