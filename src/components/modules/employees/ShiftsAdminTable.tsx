
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, Edit, Trash2, Save, X } from 'lucide-react';
import { useRealData } from '@/hooks/useRealData';
import { RealDataView } from '@/components/ui/RealDataView';
import { useBusiness } from '@/hooks/useBusiness';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ShiftData {
  id: string;
  shift_date: string;
  employee?: {
    first_name: string;
    last_name: string;
  } | null;
  shift_template?: {
    start_time: string;
    end_time: string;
    name: string;
  } | null;
}

export const ShiftsAdminTable: React.FC = () => {
  const { businessId, isLoading } = useBusiness();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});

  const { data: shifts, loading, error, refetch } = useRealData<ShiftData>({
    queryKey: ['scheduled-shifts-admin', businessId],
    tableName: 'scheduled_shifts',
    select: `
      *,
      employee:employees(first_name, last_name),
      shift_template:shift_templates(start_time, end_time, name)
    `,
    orderBy: { column: 'shift_date', ascending: false },
    enabled: !!businessId && !isLoading
  });

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('scheduled_shifts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "הצלחה",
        description: "המשמרת נמחקה בהצלחה"
      });
      
      refetch();
    } catch (error: any) {
      toast({
        title: "שגיאה",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleUpdate = async () => {
    try {
      const { error } = await supabase
        .from('scheduled_shifts')
        .update(editData)
        .eq('id', editingId);

      if (error) throw error;

      toast({
        title: "הצלחה",
        description: "המשמרת עודכנה בהצלחה"
      });
      
      setEditingId(null);
      setEditData({});
      refetch();
    } catch (error: any) {
      toast({
        title: "שגיאה",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return <div className="p-6" dir="rtl">טוען...</div>;
  }

  return (
    <div className="bg-white rounded-lg border p-6" dir="rtl">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-bold">ניהול משמרות</h2>
      </div>

      <RealDataView
        data={shifts || []}
        loading={loading}
        error={error}
        emptyMessage="אין משמרות במערכת"
        emptyIcon={<Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />}
        renderItem={(shift) => (
          <div key={shift.id} className="border rounded-lg p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <div>
                <label className="text-sm font-medium text-gray-500">עובד</label>
                <p className="font-medium">
                  {shift.employee ? 
                    `${shift.employee.first_name} ${shift.employee.last_name}` : 
                    'לא משויך'
                  }
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">תאריך</label>
                {editingId === shift.id ? (
                  <Input
                    type="date"
                    value={editData.shift_date || shift.shift_date}
                    onChange={(e) => setEditData({ ...editData, shift_date: e.target.value })}
                    className="mt-1"
                  />
                ) : (
                  <p className="font-medium">{new Date(shift.shift_date).toLocaleDateString('he-IL')}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">שעות</label>
                {editingId === shift.id ? (
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="time"
                      placeholder="כניסה"
                      value={editData.start_time || shift.shift_template?.start_time}
                      onChange={(e) => setEditData({ ...editData, start_time: e.target.value })}
                    />
                    <Input
                      type="time"
                      placeholder="יציאה" 
                      value={editData.end_time || shift.shift_template?.end_time}
                      onChange={(e) => setEditData({ ...editData, end_time: e.target.value })}
                    />
                  </div>
                ) : (
                  <p className="font-medium">
                    {shift.shift_template?.start_time && shift.shift_template?.end_time ?
                      `${shift.shift_template.start_time}–${shift.shift_template.end_time}` :
                      'לא הוגדר'
                    }
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                {editingId === shift.id ? (
                  <>
                    <Button size="sm" onClick={handleUpdate} className="flex items-center gap-1">
                      <Save className="h-4 w-4" />
                      שמור
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        setEditingId(null);
                        setEditData({});
                      }}
                      className="flex items-center gap-1"
                    >
                      <X className="h-4 w-4" />
                      ביטול
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => { 
                        setEditingId(shift.id); 
                        setEditData(shift); 
                      }}
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-4 w-4" />
                      ערוך
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => handleDelete(shift.id)}
                      className="flex items-center gap-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      מחק
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      />
    </div>
  );
};
