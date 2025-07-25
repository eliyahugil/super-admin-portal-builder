import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { UserCheck, Shield, Search, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useShiftRoles } from '../shifts/templates/useShiftRoles';
import { AddRoleDialog } from '../shifts/templates/AddRoleDialog';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import type { Branch, EmployeeBranchPriority } from '@/types/supabase';

export const BranchRoles: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddRoleDialog, setShowAddRoleDialog] = useState(false);
  const [editingRole, setEditingRole] = useState<{id: string, name: string} | null>(null);
  const { businessId } = useCurrentBusiness();
  const { roles, loading: rolesLoading, addRole, updateRole } = useShiftRoles(businessId);

  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('branches')
        .select('id, name')
        .eq('is_active', true)
        .order('name') as { data: Branch[] | null; error: any };

      if (error) throw error;
      return data || [];
    },
  });

  const { data: employeeBranchPriorities } = useQuery({
    queryKey: ['employee-branch-priorities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_branch_priorities')
        .select(`
          *,
          employee:employees(first_name, last_name, employee_id),
          branch:branches(name)
        `)
        .order('priority_order') as { data: EmployeeBranchPriority[] | null; error: any };

      if (error) throw error;
      return data || [];
    },
  });

  const filteredRoles = employeeBranchPriorities?.filter(role =>
    role.employee && (
      `${role.employee.first_name} ${role.employee.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.employee.employee_id?.toLowerCase().includes(searchTerm.toLowerCase())
    ) ||
    role.branch?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPriorityBadge = (priority: number) => {
    const variants = {
      1: 'bg-green-100 text-green-800',
      2: 'bg-yellow-100 text-yellow-800',
      3: 'bg-orange-100 text-orange-800'
    };

    const labels = {
      1: 'עדיפות ראשונה',
      2: 'עדיפות שנייה',
      3: 'עדיפות שלישית'
    };

    return (
      <Badge className={variants[priority as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {labels[priority as keyof typeof labels] || `עדיפות ${priority}`}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">תפקידים בסניפים</h1>
        <p className="text-gray-600">ניהול תפקידים ועדיפויות עובדים בסניפים שונים</p>
      </div>

      {/* Shift Roles Section */}
      {roles && roles.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">תפקידי משמרות</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((role) => (
              <Card key={role.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Shield className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{role.name}</h3>
                        <p className="text-sm text-gray-600">תפקיד משמרת</p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setEditingRole({ id: role.id, name: role.name })}
                    >
                      ערוך
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="חפש עובדים או סניפים..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Button 
          className="flex items-center gap-2"
          onClick={() => setShowAddRoleDialog(true)}
        >
          <Plus className="h-4 w-4" />
          הוסף תפקיד
        </Button>
      </div>

      {/* Roles List */}
      <div className="space-y-4">
        {filteredRoles?.map((role) => (
          <Card key={role.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <UserCheck className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {role.employee && `${role.employee.first_name} ${role.employee.last_name}`}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {role.employee?.employee_id} • {role.branch?.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getPriorityBadge(role.priority_order)}
                  
                  {role.weekly_hours_limit && role.weekly_hours_limit > 0 && (
                    <Badge variant="outline">
                      {role.weekly_hours_limit} שעות/שבוע
                    </Badge>
                  )}

                  <Button size="sm" variant="outline">
                    ערוך
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRoles?.length === 0 && (
        <div className="text-center py-12">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">אין תפקידים</h3>
          <p className="text-gray-600">לא נמצאו תפקידים במערכת</p>
        </div>
      )}

      <AddRoleDialog
        open={showAddRoleDialog}
        onOpenChange={setShowAddRoleDialog}
        onRoleCreated={addRole}
        loading={rolesLoading}
      />

      <AddRoleDialog
        open={!!editingRole}
        onOpenChange={(open) => !open && setEditingRole(null)}
        onRoleCreated={async (name) => {
          if (editingRole) {
            await updateRole(editingRole.id, name);
            setEditingRole(null);
          }
        }}
        loading={rolesLoading}
        initialValue={editingRole?.name || ""}
        title="ערוך תפקיד"
      />
    </div>
  );
};
