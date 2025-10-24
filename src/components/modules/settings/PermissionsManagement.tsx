import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Shield, Search, Edit, AlertCircle, Crown, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useRealData } from '@/hooks/useRealData';

type UserRole = 'super_admin' | 'business_admin' | 'business_user';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: UserRole;
  business_id: string | null;
  businesses?: {
    name: string;
  };
}

export const PermissionsManagement: React.FC = () => {
  const { toast } = useToast();
  const [currentUserRole, setCurrentUserRole] = useState<UserRole | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [newRole, setNewRole] = useState<UserRole>('business_user');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [updating, setUpdating] = useState(false);

  // בדיקת role של המשתמש הנוכחי
  React.useEffect(() => {
    const checkUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setCurrentUserRole(profile.role as UserRole);
        }
      }
    };
    checkUserRole();
  }, []);

  // שליפת כל המשתמשים (רק super_admin יכול לראות)
  const { data: profiles, refetch } = useRealData<UserProfile>({
    queryKey: ['all-profiles'],
    tableName: 'profiles',
    select: '*, businesses(name)',
    enabled: currentUserRole === 'super_admin',
  });

  const filteredProfiles = profiles?.filter(profile => 
    profile.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800';
      case 'business_admin':
        return 'bg-blue-100 text-blue-800';
      case 'business_user':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return <Crown className="h-4 w-4" />;
      case 'business_admin':
        return <Shield className="h-4 w-4" />;
      case 'business_user':
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return 'מנהל מערכת';
      case 'business_admin':
        return 'מנהל עסק';
      case 'business_user':
        return 'משתמש עסק';
      default:
        return role;
    }
  };

  const handleEditRole = (profile: UserProfile) => {
    setEditingUser(profile);
    setNewRole(profile.role);
    setShowConfirmDialog(true);
  };

  const handleConfirmRoleChange = async () => {
    if (!editingUser) return;

    setUpdating(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', editingUser.id);

      if (error) throw error;

      await refetch();

      toast({
        title: 'הרשאה עודכנה',
        description: `התפקיד של ${editingUser.full_name} עודכן ל${getRoleLabel(newRole)}`,
      });

      setShowConfirmDialog(false);
      setEditingUser(null);
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast({
        title: 'שגיאה בעדכון',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  if (currentUserRole !== 'super_admin') {
    return (
      <div className="max-w-7xl mx-auto p-6" dir="rtl">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-semibold">גישה מוגבלת</p>
                <p className="text-sm">רק מנהלי מערכת יכולים לנהל הרשאות</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Shield className="h-8 w-8" />
          ניהול הרשאות
        </h1>
        <p className="text-gray-600 mt-2">נהל תפקידים והרשאות של משתמשים במערכת</p>
      </div>

      {/* מידע על סוגי הרשאות */}
      <Card className="mb-6 bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Crown className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">מנהל מערכת (Super Admin)</p>
                <p className="text-sm text-gray-700">גישה מלאה לכל העסקים והמודולים, ניהול אינטגרציות גלובליות</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">מנהל עסק (Business Admin)</p>
                <p className="text-sm text-gray-700">גישה לכל מודולי העסק: עובדים, משמרות, הגשות, טוקנים, מסמכים</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">משתמש עסק (Business User)</p>
                <p className="text-sm text-gray-700">גישה מוגבלת: אזור אישי, הגשת משמרות, קבלת התראות</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* חיפוש משתמשים */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>רשימת משתמשים</CardTitle>
          <CardDescription>חפש ונהל הרשאות של משתמשים במערכת</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Search className="h-4 w-4 text-gray-500" />
            <Input
              placeholder="חפש לפי שם או אימייל..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">משתמש</TableHead>
                  <TableHead className="text-right">אימייל</TableHead>
                  <TableHead className="text-right">עסק</TableHead>
                  <TableHead className="text-right">תפקיד</TableHead>
                  <TableHead className="text-right">פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProfiles && filteredProfiles.length > 0 ? (
                  filteredProfiles.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell className="font-medium">{profile.full_name || 'לא צוין'}</TableCell>
                      <TableCell className="font-mono text-sm">{profile.email}</TableCell>
                      <TableCell>{profile.businesses?.name || 'ללא עסק'}</TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(profile.role)}>
                          <span className="flex items-center gap-1">
                            {getRoleIcon(profile.role)}
                            {getRoleLabel(profile.role)}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditRole(profile)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      {searchTerm ? 'לא נמצאו משתמשים' : 'אין משתמשים במערכת'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* דיאלוג אישור שינוי הרשאה */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>שינוי הרשאת משתמש</AlertDialogTitle>
            <AlertDialogDescription>
              האם אתה בטוח שברצונך לשנות את ההרשאה של <strong>{editingUser?.full_name}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>תפקיד חדש</Label>
              <Select value={newRole} onValueChange={(val) => setNewRole(val as UserRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4" />
                      מנהל מערכת
                    </div>
                  </SelectItem>
                  <SelectItem value="business_admin">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      מנהל עסק
                    </div>
                  </SelectItem>
                  <SelectItem value="business_user">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      משתמש עסק
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800">
                  שינוי הרשאות ישפיע על הגישה של המשתמש למערכת. וודא שההרשאה החדשה מתאימה לתפקידו.
                </p>
              </div>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRoleChange} disabled={updating}>
              {updating ? 'מעדכן...' : 'אישור שינוי'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
