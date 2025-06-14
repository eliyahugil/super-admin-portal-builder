
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Search, 
  Filter, 
  FileText, 
  Download, 
  Calendar,
  User,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

interface EmployeeFile {
  id: string;
  employee_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  uploaded_at: string;
  employee: {
    first_name: string;
    last_name: string;
    employee_id: string;
  };
}

interface GroupedFiles {
  employee: {
    id: string;
    first_name: string;
    last_name: string;
    employee_id: string;
  };
  files: EmployeeFile[];
}

export const EmployeeFilesManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('');
  const [expandedEmployees, setExpandedEmployees] = useState<Set<string>>(new Set());
  const { businessId } = useCurrentBusiness();

  const { data: employeeFiles, isLoading } = useQuery({
    queryKey: ['employee-files-management', businessId, searchTerm, dateFilter, fileTypeFilter],
    queryFn: async () => {
      if (!businessId) return [];

      let query = supabase
        .from('employee_files')
        .select(`
          *,
          employee:employees(
            id,
            first_name,
            last_name,
            employee_id
          )
        `)
        .eq('business_id', businessId)
        .order('uploaded_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!businessId,
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeLabel = (fileType: string) => {
    if (fileType.includes('pdf')) return 'PDF';
    if (fileType.includes('image')) return 'תמונה';
    if (fileType.includes('document') || fileType.includes('word')) return 'מסמך';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'גיליון';
    return 'קובץ';
  };

  const handleDownload = async (file: EmployeeFile) => {
    try {
      const { data, error } = await supabase.storage
        .from('employee-files')
        .download(file.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const toggleEmployeeExpansion = (employeeId: string) => {
    const newExpanded = new Set(expandedEmployees);
    if (newExpanded.has(employeeId)) {
      newExpanded.delete(employeeId);
    } else {
      newExpanded.add(employeeId);
    }
    setExpandedEmployees(newExpanded);
  };

  // Group files by employee
  const groupedFiles: GroupedFiles[] = React.useMemo(() => {
    if (!employeeFiles) return [];

    const grouped = employeeFiles.reduce((acc, file) => {
      if (!file.employee) return acc;

      const employeeId = file.employee.id;
      const existing = acc.find(group => group.employee.id === employeeId);

      if (existing) {
        existing.files.push(file);
      } else {
        acc.push({
          employee: file.employee,
          files: [file]
        });
      }

      return acc;
    }, [] as GroupedFiles[]);

    // Apply filters
    return grouped.filter(group => {
      const employeeName = `${group.employee.first_name} ${group.employee.last_name}`.toLowerCase();
      const employeeId = group.employee.employee_id?.toLowerCase() || '';
      
      const matchesSearch = !searchTerm || 
        employeeName.includes(searchTerm.toLowerCase()) ||
        employeeId.includes(searchTerm.toLowerCase()) ||
        group.files.some(file => file.file_name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesDate = !dateFilter || 
        group.files.some(file => {
          const fileDate = format(new Date(file.uploaded_at), 'yyyy-MM-dd');
          return fileDate === dateFilter;
        });

      const matchesFileType = !fileTypeFilter ||
        group.files.some(file => file.file_type.includes(fileTypeFilter));

      return matchesSearch && matchesDate && matchesFileType;
    }).sort((a, b) => a.employee.first_name.localeCompare(b.employee.first_name));
  }, [employeeFiles, searchTerm, dateFilter, fileTypeFilter]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8" dir="rtl">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">קבצי עובדים</h1>
        <p className="text-gray-600">ניהול וצפייה בקבצים של כל העובדים</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            סינון וחיפוש
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">חיפוש לפי שם עובד או קובץ</label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="חפש עובד או קובץ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">סינון לפי תאריך העלאה</label>
              <div className="relative">
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">סוג קובץ</label>
              <select
                value={fileTypeFilter}
                onChange={(e) => setFileTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">כל הסוגים</option>
                <option value="pdf">PDF</option>
                <option value="image">תמונות</option>
                <option value="document">מסמכים</option>
                <option value="excel">גיליונות</option>
              </select>
            </div>
          </div>

          {(searchTerm || dateFilter || fileTypeFilter) && (
            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setDateFilter('');
                  setFileTypeFilter('');
                }}
              >
                נקה סינונים
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="mb-6">
        <div className="text-sm text-gray-600">
          נמצאו {groupedFiles.length} עובדים עם {groupedFiles.reduce((sum, group) => sum + group.files.length, 0)} קבצים
        </div>
      </div>

      {/* Employee Files Groups */}
      <div className="space-y-4">
        {groupedFiles.map((group) => {
          const isExpanded = expandedEmployees.has(group.employee.id);
          
          return (
            <Card key={group.employee.id} className="overflow-hidden">
              <CardHeader 
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleEmployeeExpansion(group.employee.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {group.employee.first_name.charAt(0)}{group.employee.last_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <h3 className="font-semibold text-lg">
                        {group.employee.first_name} {group.employee.last_name}
                      </h3>
                      {group.employee.employee_id && (
                        <p className="text-sm text-gray-600">
                          מזהה עובד: {group.employee.employee_id}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {group.files.length} קבצים
                    </Badge>
                    
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0">
                  <div className="border-t pt-4">
                    {group.files.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        אין קבצים עבור עובד זה
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {group.files.map((file) => (
                          <Card key={file.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <FileText className="h-8 w-8 text-blue-600 flex-shrink-0" />
                                <Badge variant="outline" className="text-xs">
                                  {getFileTypeLabel(file.file_type)}
                                </Badge>
                              </div>
                              
                              <h4 className="font-medium text-sm mb-2 truncate" title={file.file_name}>
                                {file.file_name}
                              </h4>
                              
                              <div className="space-y-1 text-xs text-gray-500 mb-3">
                                <div>גודל: {formatFileSize(file.file_size)}</div>
                                <div>
                                  הועלה: {format(new Date(file.uploaded_at), 'dd/MM/yyyy', { locale: he })}
                                </div>
                              </div>
                              
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full"
                                onClick={() => handleDownload(file)}
                              >
                                <Download className="h-3 w-3 ml-1" />
                                הורד
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {groupedFiles.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">אין קבצים</h3>
            <p className="text-gray-600">
              {searchTerm || dateFilter || fileTypeFilter 
                ? 'לא נמצאו קבצים התואמים לסינון'
                : 'לא הועלו עדיין קבצים במערכת'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
