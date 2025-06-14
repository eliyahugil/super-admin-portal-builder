
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Users, RefreshCw, Search, Plus } from 'lucide-react';
import { useBranchesData } from '@/hooks/useBranchesData';
import { CreateEmployeeDialog } from './CreateEmployeeDialog';
import { ImportManager } from './ImportManager';
import { useState } from 'react';

interface EmployeeManagementHeaderProps {
  onRefetch: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedBranch: string;
  onBranchChange: (value: string) => void;
  selectedEmployeeType: string;
  onEmployeeTypeChange: (value: string) => void;
  isArchived: boolean;
  onArchivedChange: (value: boolean) => void;
  hideFilters?: boolean;
}

export const EmployeeManagementHeader: React.FC<EmployeeManagementHeaderProps> = ({
  onRefetch,
  searchTerm,
  onSearchChange,
  selectedBranch,
  onBranchChange,
  selectedEmployeeType,
  onEmployeeTypeChange,
  isArchived,
  onArchivedChange,
  hideFilters = false,
}) => {
  const [createEmployeeOpen, setCreateEmployeeOpen] = useState(false);
  const { data: branches } = useBranchesData();

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6" />
            <h1 className="text-2xl font-bold">ניהול עובדים</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onRefetch}>
              <RefreshCw className="h-4 w-4 ml-2" />
              רענן
            </Button>
            <Button onClick={() => setCreateEmployeeOpen(true)}>
              <Plus className="h-4 w-4 ml-2" />
              הוסף עובד
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>סינון וחיפוש</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="חפש עובד לפי שם, טלפון או מייל..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pr-10"
              />
            </div>

            {/* Filters - hide when hideFilters is true */}
            {!hideFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Branch Filter */}
                <div>
                  <Label htmlFor="branch-select">סניף</Label>
                  <Select value={selectedBranch} onValueChange={onBranchChange}>
                    <SelectTrigger id="branch-select">
                      <SelectValue placeholder="כל הסניפים" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">כל הסניפים</SelectItem>
                      {branches?.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Employee Type Filter */}
                <div>
                  <Label htmlFor="type-select">סוג עובד</Label>
                  <Select value={selectedEmployeeType} onValueChange={onEmployeeTypeChange}>
                    <SelectTrigger id="type-select">
                      <SelectValue placeholder="כל הסוגים" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">כל הסוגים</SelectItem>
                      <SelectItem value="permanent">קבוע</SelectItem>
                      <SelectItem value="temporary">זמני</SelectItem>
                      <SelectItem value="contractor">קבלן</SelectItem>
                      <SelectItem value="intern">מתמחה</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Archive Toggle */}
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch
                    id="archived-toggle"
                    checked={isArchived}
                    onCheckedChange={onArchivedChange}
                  />
                  <Label htmlFor="archived-toggle">עובדים בארכיון</Label>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CreateEmployeeDialog
        open={createEmployeeOpen}
        onOpenChange={setCreateEmployeeOpen}
        onSuccess={onRefetch}
      />
    </>
  );
};
