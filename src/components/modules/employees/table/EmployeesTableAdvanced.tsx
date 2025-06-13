
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmployeesTableRow } from './EmployeesTableRow';
import { useEmployeesTableLogic } from './useEmployeesTableLogic';
import { EmployeesTableFilters } from './EmployeesTableFilters';
import { Button } from '@/components/ui/button';
import { Plus, Download } from 'lucide-react';

export const EmployeesTableAdvanced: React.FC = () => {
  const {
    employees,
    filteredEmployees,
    loading,
    search,
    setSearch,
    filterType,
    setFilterType,
    filterStatus,
    setFilterStatus,
    handleCreateEmployee,
    handleTokenSent,
  } = useEmployeesTableLogic();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>רשימת עובדים מתקדמת</span>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">
            רשימת עובדים מתקדמת ({filteredEmployees.length})
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              יצוא לאקסל
            </Button>
            <Button onClick={handleCreateEmployee}>
              <Plus className="h-4 w-4 mr-1" />
              הוסף עובד
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Filters */}
          <EmployeesTableFilters
            search={search}
            onSearchChange={setSearch}
            filterType={filterType}
            onFilterTypeChange={setFilterType}
            filterStatus={filterStatus}
            onFilterStatusChange={setFilterStatus}
          />

          {/* Stats Summary */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {employees.filter(e => e.is_active).length}
              </div>
              <div className="text-sm text-blue-600">עובדים פעילים</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {employees.filter(e => e.employee_type === 'permanent').length}
              </div>
              <div className="text-sm text-green-600">עובדים קבועים</div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {employees.filter(e => e.employee_type === 'temporary').length}
              </div>
              <div className="text-sm text-orange-600">עובדים זמניים</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {employees.filter(e => e.weekly_tokens?.some(t => t.is_active)).length}
              </div>
              <div className="text-sm text-purple-600">עם טוקנים פעילים</div>
            </div>
          </div>

          {/* Table */}
          {filteredEmployees.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>{search || filterType !== 'all' || filterStatus !== 'all' ? 'לא נמצאו עובדים התואמים לחיפוש' : 'אין עובדים רשומים במערכת'}</p>
              {(!search && filterType === 'all' && filterStatus === 'all') && (
                <Button onClick={handleCreateEmployee} className="mt-4">
                  הוסף עובד ראשון
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      עובד
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      פרטי קשר
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      סטטוס וסוג
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      סניף
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      פרטי עבודה
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      סטטיסטיקות
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      פעולות
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEmployees.map((employee) => (
                    <EmployeesTableRow
                      key={employee.id}
                      employee={employee}
                      onTokenSent={handleTokenSent}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
