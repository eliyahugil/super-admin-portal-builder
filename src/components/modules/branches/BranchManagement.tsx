
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building, MapPin, Users, Settings, Plus, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { BranchEditDialog } from './BranchEditDialog';
import { Branch } from '@/types/branch';

export const BranchManagement: React.FC = () => {
  const navigate = useNavigate();
  const [editBranchOpen, setEditBranchOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  const { data: branches, refetch } = useQuery({
    queryKey: ['branches-detailed'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('branches')
        .select(`
          *,
          employees:employees(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const handleEditBranch = (branch: any) => {
    const normalizedBranch: Branch = {
      id: branch.id,
      name: branch.name,
      address: branch.address,
      business_id: branch.business_id,
      latitude: branch.latitude,
      longitude: branch.longitude,
      gps_radius: branch.gps_radius,
      is_active: branch.is_active,
      created_at: branch.created_at,
      updated_at: branch.updated_at,
    };
    
    setSelectedBranch(normalizedBranch);
    setEditBranchOpen(true);
  };

  const handleViewEmployees = (branchId: string, branchName: string) => {
    // Navigate to employees page with branch filter
    navigate(`/modules/employees?branch=${branchId}&branchName=${encodeURIComponent(branchName)}`);
  };

  const handleCreateBranch = () => {
    navigate('/modules/branches/create');
  };

  const handleEditSuccess = () => {
    refetch();
    setSelectedBranch(null);
  };

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ניהול סניפים</h1>
        <p className="text-gray-600">ניהול כל הסניפים של העסק</p>
      </div>

      {/* Add Branch Button */}
      <div className="mb-6">
        <Button onClick={handleCreateBranch} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          הוסף סניף חדש
        </Button>
      </div>

      {/* Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches?.map((branch) => (
          <Card key={branch.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building className="h-6 w-6 text-blue-600" />
                  <Badge variant={branch.is_active ? "default" : "secondary"}>
                    {branch.is_active ? 'פעיל' : 'לא פעיל'}
                  </Badge>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleEditBranch(branch)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold text-lg mb-2">{branch.name}</h3>
              
              {branch.address && (
                <div className="flex items-start gap-2 mb-3">
                  <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                  <p className="text-sm text-gray-600">{branch.address}</p>
                </div>
              )}

              <div className="flex items-center gap-2 mb-4">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {branch.employees?.[0]?.count || 0} עובדים
                </span>
              </div>

              {branch.gps_radius && (
                <div className="mb-4 p-2 bg-blue-50 rounded-md">
                  <p className="text-xs text-blue-800">
                    רדיוס GPS: {branch.gps_radius} מטר
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleEditBranch(branch)}
                >
                  <Edit className="h-4 w-4 ml-1" />
                  ערוך
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleViewEmployees(branch.id, branch.name)}
                >
                  צפה בעובדים
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {branches?.length === 0 && (
        <div className="text-center py-12">
          <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">אין סניפים</h3>
          <p className="text-gray-600 mb-4">התחל על ידי הוספת הסניף הראשון</p>
          <Button onClick={handleCreateBranch}>
            <Plus className="h-4 w-4 ml-2" />
            הוסף סניף ראשון
          </Button>
        </div>
      )}

      <BranchEditDialog
        open={editBranchOpen}
        onOpenChange={setEditBranchOpen}
        onSuccess={handleEditSuccess}
        branch={selectedBranch}
      />
    </div>
  );
};
