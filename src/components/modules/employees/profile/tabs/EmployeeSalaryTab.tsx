
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DollarSign, Plus, Edit, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EmployeeSalaryTabProps {
  employeeId: string;
  employeeName: string;
}

export const EmployeeSalaryTab: React.FC<EmployeeSalaryTabProps> = ({
  employeeId,
  employeeName
}) => {
  const [salaryHistory, setSalaryHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSalary, setEditingSalary] = useState<any>(null);
  const [newSalary, setNewSalary] = useState({
    amount: '',
    type: 'salary_change',
    currency: 'ILS',
    effective_date: new Date().toISOString().split('T')[0],
    reason: '',
    notes: ''
  });

  useEffect(() => {
    fetchSalaryHistory();
  }, [employeeId]);

  const fetchSalaryHistory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('employee_salary_history')
        .select('*')
        .eq('employee_id', employeeId)
        .order('effective_date', { ascending: false });

      if (error) throw error;
      setSalaryHistory(data || []);
    } catch (error) {
      console.error('Error fetching salary history:', error);
      toast.error('שגיאה בטעינת היסטוריית שכר');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSalary = async () => {
    try {
      const { data, error } = await supabase
        .from('employee_salary_history')
        .insert({
          employee_id: employeeId,
          amount: parseFloat(newSalary.amount),
          type: newSalary.type,
          currency: newSalary.currency,
          effective_date: newSalary.effective_date,
          reason: newSalary.reason,
          notes: newSalary.notes,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;

      setSalaryHistory([data, ...salaryHistory]);
      setNewSalary({
        amount: '',
        type: 'salary_change',
        currency: 'ILS',
        effective_date: new Date().toISOString().split('T')[0],
        reason: '',
        notes: ''
      });
      setIsAddDialogOpen(false);
      toast.success('רשומת שכר נוספה בהצלחה');
    } catch (error) {
      console.error('Error adding salary record:', error);
      toast.error('שגיאה בהוספת רשומת שכר');
    }
  };

  const handleEditSalary = async () => {
    if (!editingSalary) return;

    try {
      const { data, error } = await supabase
        .from('employee_salary_history')
        .update({
          amount: parseFloat(editingSalary.amount),
          type: editingSalary.type,
          currency: editingSalary.currency,
          effective_date: editingSalary.effective_date,
          reason: editingSalary.reason,
          notes: editingSalary.notes
        })
        .eq('id', editingSalary.id)
        .select()
        .single();

      if (error) throw error;

      setSalaryHistory(salaryHistory.map(salary => salary.id === editingSalary.id ? data : salary));
      setEditingSalary(null);
      toast.success('רשומת שכר עודכנה בהצלחה');
    } catch (error) {
      console.error('Error updating salary record:', error);
      toast.error('שגיאה בעדכון רשומת שכר');
    }
  };

  const handleDeleteSalary = async (salaryId: string) => {
    try {
      const { error } = await supabase
        .from('employee_salary_history')
        .delete()
        .eq('id', salaryId);

      if (error) throw error;

      setSalaryHistory(salaryHistory.filter(salary => salary.id !== salaryId));
      toast.success('רשומת שכר נמחקה בהצלחה');
    } catch (error) {
      console.error('Error deleting salary record:', error);
      toast.error('שגיאה במחיקת רשומת שכר');
    }
  };

  const salaryTypes = [
    { value: 'salary_change', label: 'שינוי שכר' },
    { value: 'bonus', label: 'בונוס' },
    { value: 'promotion', label: 'קידום' },
    { value: 'cost_of_living', label: 'יוקר מחיה' },
    { value: 'performance', label: 'הערכת ביצועים' },
    { value: 'other', label: 'אחר' }
  ];

  const currencies = [
    { value: 'ILS', label: '₪ שקל' },
    { value: 'USD', label: '$ דולר' },
    { value: 'EUR', label: '€ יורו' }
  ];

  const formatCurrency = (amount: number, currency: string) => {
    const symbols = { ILS: '₪', USD: '$', EUR: '€' };
    return `${amount.toLocaleString()} ${symbols[currency as keyof typeof symbols] || currency}`;
  };

  const getChangeIcon = (index: number) => {
    if (index === salaryHistory.length - 1) return null;
    const current = salaryHistory[index];
    const previous = salaryHistory[index + 1];
    
    if (current.amount > previous.amount) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (current.amount < previous.amount) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            היסטוריית שכר
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8">טוען...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            היסטוריית שכר
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                הוסף רשומת שכר
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>הוספת רשומת שכר חדשה</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="salary-type">סוג הרשומה</Label>
                  <Select value={newSalary.type} onValueChange={(value) => setNewSalary({...newSalary, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {salaryTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="amount">סכום</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={newSalary.amount}
                      onChange={(e) => setNewSalary({...newSalary, amount: e.target.value})}
                      placeholder="הכנס סכום..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency">מטבע</Label>
                    <Select value={newSalary.currency} onValueChange={(value) => setNewSalary({...newSalary, currency: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map(currency => (
                          <SelectItem key={currency.value} value={currency.value}>
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="effective-date">תאריך יעיל</Label>
                  <Input
                    id="effective-date"
                    type="date"
                    value={newSalary.effective_date}
                    onChange={(e) => setNewSalary({...newSalary, effective_date: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="reason">סיבה</Label>
                  <Input
                    id="reason"
                    value={newSalary.reason}
                    onChange={(e) => setNewSalary({...newSalary, reason: e.target.value})}
                    placeholder="הכנס סיבה לשינוי..."
                  />
                </div>
                <div>
                  <Label htmlFor="notes">הערות</Label>
                  <Textarea
                    id="notes"
                    value={newSalary.notes}
                    onChange={(e) => setNewSalary({...newSalary, notes: e.target.value})}
                    placeholder="הערות נוספות..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddSalary} disabled={!newSalary.amount.trim()}>
                    הוסף רשומה
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    ביטול
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {salaryHistory.length > 0 ? (
          <div className="space-y-4">
            {salaryHistory.map((salary, index) => (
              <div key={salary.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {salaryTypes.find(t => t.value === salary.type)?.label || salary.type}
                    </Badge>
                    {getChangeIcon(index)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {new Date(salary.effective_date).toLocaleDateString('he-IL')}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingSalary({
                        ...salary,
                        amount: salary.amount.toString(),
                        effective_date: salary.effective_date
                      })}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSalary(salary.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mb-2">
                  <span className="text-lg font-semibold">
                    {formatCurrency(salary.amount, salary.currency)}
                  </span>
                </div>
                {salary.reason && (
                  <p className="text-sm text-gray-600 mb-1">סיבה: {salary.reason}</p>
                )}
                {salary.notes && (
                  <p className="text-sm text-gray-500">{salary.notes}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">אין נתוני שכר</h3>
            <p className="text-gray-500">לא הוגדרו נתוני שכר עבור עובד זה</p>
          </div>
        )}

        {/* Edit Salary Dialog */}
        <Dialog open={!!editingSalary} onOpenChange={() => setEditingSalary(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>עריכת רשומת שכר</DialogTitle>
            </DialogHeader>
            {editingSalary && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-salary-type">סוג הרשומה</Label>
                  <Select 
                    value={editingSalary.type} 
                    onValueChange={(value) => setEditingSalary({...editingSalary, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {salaryTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="edit-amount">סכום</Label>
                    <Input
                      id="edit-amount"
                      type="number"
                      step="0.01"
                      value={editingSalary.amount}
                      onChange={(e) => setEditingSalary({...editingSalary, amount: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-currency">מטבע</Label>
                    <Select 
                      value={editingSalary.currency} 
                      onValueChange={(value) => setEditingSalary({...editingSalary, currency: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map(currency => (
                          <SelectItem key={currency.value} value={currency.value}>
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-effective-date">תאריך יעיל</Label>
                  <Input
                    id="edit-effective-date"
                    type="date"
                    value={editingSalary.effective_date}
                    onChange={(e) => setEditingSalary({...editingSalary, effective_date: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-reason">סיבה</Label>
                  <Input
                    id="edit-reason"
                    value={editingSalary.reason || ''}
                    onChange={(e) => setEditingSalary({...editingSalary, reason: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-notes">הערות</Label>
                  <Textarea
                    id="edit-notes"
                    value={editingSalary.notes || ''}
                    onChange={(e) => setEditingSalary({...editingSalary, notes: e.target.value})}
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleEditSalary}>
                    שמור שינויים
                  </Button>
                  <Button variant="outline" onClick={() => setEditingSalary(null)}>
                    ביטול
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
