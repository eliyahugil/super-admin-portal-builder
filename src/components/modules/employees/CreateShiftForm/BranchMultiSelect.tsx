
import React from "react";
import type { Branch } from "@/types/branch";
import { X } from "lucide-react";

interface BranchMultiSelectProps {
  branches: Branch[] | undefined;
  selectedBranchIds: string[];
  onChange: (val: string[]) => void;
  disabled?: boolean;
}

export const BranchMultiSelect: React.FC<BranchMultiSelectProps> = ({
  branches,
  selectedBranchIds,
  onChange,
  disabled,
}) => {
  const handleSelect = (branchId: string) => {
    if (selectedBranchIds.includes(branchId)) {
      onChange(selectedBranchIds.filter((id) => id !== branchId));
    } else {
      onChange([...selectedBranchIds, branchId]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm text-gray-600 font-medium">סניפים משויכים *</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedBranchIds.length === 0 && (
          <span className="text-xs text-gray-400">לא נבחרו סניפים</span>
        )}
        {selectedBranchIds.map((id) => {
          const branch = branches?.find((b) => b.id === id);
          if (!branch) return null;
          return (
            <span
              key={id}
              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-xl flex items-center gap-1 text-xs"
              style={{ whiteSpace: "nowrap" }}
            >
              {branch.name}
              <button
                type="button"
                className="ml-1 text-blue-500 hover:text-red-600 focus:outline-none"
                onClick={() => handleSelect(id)}
                tabIndex={-1}
                disabled={disabled}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-2">
        {branches?.map((branch) => (
          <button
            key={branch.id}
            type="button"
            className={`px-3 py-2 rounded-full border
            ${selectedBranchIds.includes(branch.id)
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-700 border-gray-300"}
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            hover:bg-blue-100 transition-colors`}
            onClick={() => handleSelect(branch.id)}
            disabled={disabled}
          >
            {branch.name}
          </button>
        ))}
      </div>
      {!branches || branches.length === 0 ? (
        <div className="text-amber-600 bg-amber-50 rounded p-2 text-xs mt-2">לא נמצאו סניפים פעילים עבור העסק</div>
      ) : null}
    </div>
  );
};
