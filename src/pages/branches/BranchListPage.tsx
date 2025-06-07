
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHead, TableRow, TableCell, TableBody, TableHeader } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Building, Plus, Edit } from 'lucide-react';
import { useSecureBusinessData } from '@/hooks/useSecureBusinessData';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

export const BranchListPage: React.FC = () => {
  const navigate = useNavigate();
  const { businessId } = useCurrentBusiness();
  
  const { data: branches, isLoading, error } = useSecureBusinessData<any>({
    queryKey: ['branches'],
    tableName: 'branches',
    orderBy: { column: 'name', ascending: true }
  });

  console.log('BranchListPage - Current state:', {
    businessId,
    branchesCount: branches?.length || 0,
    isLoading,
    error
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">טוען סניפים...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6 text-center">
        <h2 className="text-xl font-semibold mb-4">שגיאה בטעינת סניפים</h2>
        <p className="text-gray-600">לא ניתן לטעון את רשימת הסניפים</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6" dir="rtl">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="h-6 w-6" />
            <h1 className="text-2xl font-bold">ניהול סניפים</h1>
          </div>
          <Button onClick={() => navigate('create')}>
            <Plus className="h-4 w-4 ml-2" />
            הוסף סניף חדש
          </Button>
        </div>
        <p className="text-gray-600 mt-2">
          ניהול סניפי העסק שלך - הוספה, עריכה וניהול מיקומים
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>רשימת סניפים</CardTitle>
        </CardHeader>
        <CardContent>
          {!branches || branches.length === 0 ? (
            <div className="text-center py-8">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">אין סניפים</h3>
              <p className="text-gray-600 mb-4">התחל בהוספת הסניף הראשון שלך</p>
              <Button onClick={() => navigate('create')}>
                <Plus className="h-4 w-4 ml-2" />
                הוסף סניף ראשון
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>שם הסניף</TableHead>
                  <TableHead>כתובת</TableHead>
                  <TableHead>מיקום GPS</TableHead>
                  <TableHead>רדיוס (מטרים)</TableHead>
                  <TableHead>סטטוס</TableHead>
                  <TableHead>פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {branches.map((branch: any) => (
                  <TableRow key={branch.id}>
                    <TableCell className="font-medium">{branch.name}</TableCell>
                    <TableCell>{branch.address || 'לא צוינה'}</TableCell>
                    <TableCell>
                      {branch.latitude && branch.longitude ? (
                        <span className="text-sm text-gray-600">
                          {parseFloat(branch.latitude).toFixed(4)}, {parseFloat(branch.longitude).toFixed(4)}
                        </span>
                      ) : (
                        <span className="text-gray-400">לא זמין</span>
                      )}
                    </TableCell>
                    <TableCell>{branch.gps_radius}</TableCell>
                    <TableCell>
                      <Badge variant={branch.is_active ? "default" : "secondary"}>
                        {branch.is_active ? 'פעיל' : 'לא פעיל'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`${branch.id}/edit`)}
                      >
                        <Edit className="h-4 w-4 ml-1" />
                        ערוך
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
