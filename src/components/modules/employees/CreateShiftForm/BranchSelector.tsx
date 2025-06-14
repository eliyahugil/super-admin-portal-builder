
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Branch } from "@/types/branch";

interface BranchSelectorProps {
  selectedBranchId: string;
  onBranchChange: (val: string) => void;
  branches: Branch[] | undefined;
}

export const BranchSelector: React.FC<BranchSelectorProps> = ({
  selectedBranchId,
  onBranchChange,
  branches
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="branch" className="text-sm text-gray-600">סניף משייך *</Label>
      <Select
        value={selectedBranchId}
        onValueChange={onBranchChange}
        disabled={!branches || branches.length === 0}
      >
        <SelectTrigger className="border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-400">
          <SelectValue placeholder={!branches || branches.length === 0 ? "אין סניפים" : "בחר סניף"} />
        </SelectTrigger>
        <SelectContent className="bg-white rounded-xl shadow-lg border z-50 max-h-60 overflow-auto">
          {branches?.map(branch => (
            <SelectItem key={branch.id} value={branch.id} className="p-3 hover:bg-gray-50">
              {branch.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {!branches || branches.length === 0 ? (
        <div className="text-amber-600 bg-amber-50 rounded p-2 text-xs">לא נמצאו סניפים פעילים עבור העסק</div>
      ): null}
    </div>
  );
};
