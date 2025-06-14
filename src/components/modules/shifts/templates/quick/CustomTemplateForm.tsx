
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, MapPin, Users, UserCog } from 'lucide-react';
import { QuickTemplateData, ShiftType } from './types';
import { useShiftRoles } from '../useShiftRoles';
import { AddRoleDialog } from '../AddRoleDialog';
import { useToast } from '@/hooks/use-toast';

interface CustomTemplateFormProps {
  templateData: QuickTemplateData;
  setTemplateData: (data: QuickTemplateData) => void;
  selectedBranches: string[];
  setSelectedBranches: (branches: string[]) => void;
  branches: any[];
  submitting: boolean;
  onCustomCreate: () => void;
  businessId?: string;
}

export const CustomTemplateForm: React.FC<CustomTemplateFormProps> = ({
  templateData,
  setTemplateData,
  selectedBranches,
  setSelectedBranches,
  branches,
  submitting,
  onCustomCreate,
  businessId
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [addRoleDialogOpen, setAddRoleDialogOpen] = useState(false);
  const { toast } = useToast();
  const { roles, loading: loadingRoles, addRole } = useShiftRoles(businessId);

  if (!isExpanded) {
    return (
      <div className="border-t pt-4">
        <Button
          variant="ghost"
          onClick={() => setIsExpanded(true)}
          className="w-full flex items-center justify-between"
        >
          <span>תבנית מותאמת אישית</span>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="border-t pt-4">
      <Button
        variant="ghost"
        onClick={() => setIsExpanded(false)}
        className="w-full flex items-center justify-between"
      >
        <span>תבנית מותאמת אישית</span>
        <Plus className="h-4 w-4 transition-transform rotate-45" />
      </Button>

      <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="custom-name">שם התבנית</Label>
            <Input
              id="custom-name"
              value={templateData.name}
              onChange={(e) => setTemplateData({ ...templateData, name: e.target.value })}
              placeholder="למשל: משמרת מיוחדת"
            />
          </div>

          <div>
            <Label htmlFor="custom-branches">סניפים</Label>
            <div className="flex flex-wrap gap-2">
              {branches?.map((branch) => (
                <button
                  key={branch.id}
                  type="button"
                  className={`px-2 py-1 rounded-full border flex items-center gap-1
                    ${selectedBranches.includes(branch.id)
                      ? "bg-blue-700 text-white border-blue-800"
                      : "bg-white text-blue-700 border-blue-300 hover:bg-blue-50"}
                  `}
                  onClick={() =>
                    setSelectedBranches(selectedBranches.includes(branch.id)
                      ? selectedBranches.filter((id) => id !== branch.id)
                      : [...selectedBranches, branch.id])
                  }
                  disabled={submitting}
                >
                  <MapPin className="h-4 w-4" />
                  {branch.name}
                </button>
              ))}
              {(!branches || branches.length === 0) && (
                <span className="text-xs text-gray-400 px-2 py-1">אין סניפים</span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="custom-start">שעת התחלה</Label>
            <Input
              id="custom-start"
              type="time"
              value={templateData.start_time}
              onChange={(e) => setTemplateData({ ...templateData, start_time: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="custom-end">שעת סיום</Label>
            <Input
              id="custom-end"
              type="time"
              value={templateData.end_time}
              onChange={(e) => setTemplateData({ ...templateData, end_time: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="custom-employees">מספר עובדים</Label>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <Input
                id="custom-employees"
                type="number"
                min="1"
                value={templateData.required_employees}
                onChange={(e) => setTemplateData({ ...templateData, required_employees: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="custom-type">סוג משמרת</Label>
          <Select value={templateData.shift_type} onValueChange={(value: ShiftType) => setTemplateData({ ...templateData, shift_type: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="morning">בוקר</SelectItem>
              <SelectItem value="afternoon">צהריים</SelectItem>
              <SelectItem value="evening">ערב</SelectItem>
              <SelectItem value="night">לילה</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="custom-role">תפקיד</Label>
          <div className="flex items-center gap-2">
            <Select
              value={templateData.role_name || ""}
              onValueChange={v => setTemplateData({ ...templateData, role_name: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר תפקיד..." />
              </SelectTrigger>
              <SelectContent>
                {roles.map(r => (
                  <SelectItem key={r.name} value={r.name}>
                    <UserCog className="inline-block w-4 h-4 mr-2 text-blue-600" />
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="icon"
              type="button"
              className="w-8 h-8 p-0 rounded-full border-blue-300 text-blue-600 hover:bg-blue-50"
              title="הוסף תפקיד חדש"
              onClick={() => setAddRoleDialogOpen(true)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Button 
          onClick={onCustomCreate}
          disabled={submitting || !templateData.name || selectedBranches.length === 0}
          className="w-full"
        >
          {submitting ? 'יוצר...' : 'צור תבנית מותאמת'}
        </Button>

        <AddRoleDialog
          open={addRoleDialogOpen}
          onOpenChange={setAddRoleDialogOpen}
          loading={loadingRoles}
          onRoleCreated={async (name) => {
            await addRole(name);
            toast({ title: "נוצר תפקיד חדש!", description: "התפקיד נוסף בהצלחה" });
          }}
        />
      </div>
    </div>
  );
};
