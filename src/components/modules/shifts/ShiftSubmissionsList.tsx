import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Calendar, CheckCircle, AlertCircle, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { he } from 'date-fns/locale';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { useIsMobile } from '@/hooks/use-mobile';

export const ShiftSubmissionsList: React.FC = () => {
  const { businessId } = useCurrentBusiness();
  const isMobile = useIsMobile();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!businessId) return;

      setIsLoading(true);
      try {
        const supabase = createClient('https://xmhmztipuvzmwgbcovch.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtaG16dGlwdXZ6bXdnYmNvdmNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMjkzODIsImV4cCI6MjA2NDcwNTM4Mn0.QEugxUTGlJ1rnG8ddf3E6BIpNaiqwkp2ml7MbiUfY9c');
        
        // Fetch submissions by joining with employees table to filter by business_id
        const { data, error } = await supabase
          .from('shift_submissions')
          .select(`
            *,
            employees!inner(
              id,
              first_name,
              last_name,
              business_id
            )
          `)
          .eq('employees.business_id', businessId)
          .order('submitted_at', { ascending: false });

        if (error) {
          console.error('Error fetching shift submissions:', error);
          setError(error);
        } else {
          console.log('Fetched submissions:', data);
          setSubmissions(data || []);
        }
      } catch (err) {
        console.error('Error:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmissions();
  }, [businessId]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
          <AlertCircle className="w-3 h-3 ml-1" />
          הוגש
        </Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">
          <CheckCircle className="w-3 h-3 ml-1" />
          אושר
        </Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800">
          <AlertCircle className="w-3 h-3 ml-1" />
          דחוי
        </Badge>;
      default:
        return <Badge variant="outline" className="border-muted-foreground/20">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy', { locale: he });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy HH:mm', { locale: he });
    } catch {
      return dateString;
    }
  };

  const toggleCardExpansion = (submissionId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(submissionId)) {
        newSet.delete(submissionId);
      } else {
        newSet.add(submissionId);
      }
      return newSet;
    });
  };

  // Mobile compact view component
  const MobileSubmissionCard = ({ submission }: { submission: any }) => {
    const shifts = Array.isArray(submission.shifts) ? submission.shifts : [];
    const isExpanded = expandedCards.has(submission.id);
    
    return (
      <div className="bg-card border border-border rounded-lg shadow-sm mb-3 overflow-hidden">
        {/* Header - always visible */}
        <div 
          className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => toggleCardExpansion(submission.id)}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-primary" />
              </div>
              <span className="font-semibold text-foreground truncate">
                {submission.employees?.first_name && submission.employees?.last_name 
                  ? `${submission.employees.first_name} ${submission.employees.last_name}`
                  : 'עובד אנונימי'
                }
              </span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {getStatusBadge(submission.status)}
              <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(submission.week_start_date)} - {formatDate(submission.week_end_date)}</span>
            </div>
            <Badge variant="outline" className="text-xs px-2 py-1 bg-muted/50">
              {shifts.length} משמרות
            </Badge>
          </div>
        </div>

        {/* Expandable content */}
        {isExpanded && (
          <div className="border-t bg-muted/20 p-4 space-y-4 animate-accordion-down">
            {/* Submission time */}
            <div className="text-sm text-muted-foreground flex items-center gap-2 pb-2 border-b border-border/50">
              <Clock className="h-4 w-4" />
              <span>הוגש: {formatDateTime(submission.submitted_at)}</span>
            </div>

            {/* Shifts */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-foreground border-b border-border/50 pb-1">משמרות נבחרות</h4>
              {shifts.map((shift: any, index: number) => (
                <div key={index} className="bg-card border border-border rounded-md p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-foreground">{formatDate(shift.date)}</span>
                    <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                      {shift.start_time} - {shift.end_time}
                    </span>
                  </div>
                  
                  {shift.branch_preference && (
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="text-blue-600">📍</span>
                      <span>{shift.branch_preference}</span>
                    </div>
                  )}
                  
                  {shift.role_preference && (
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="text-purple-600">👔</span>
                      <span>{shift.role_preference}</span>
                    </div>
                  )}
                  
                  {shift.notes && (
                    <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded border border-border/50 leading-relaxed">
                      <span className="text-green-600">💬</span> {shift.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* General notes */}
            {submission.notes && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-foreground border-b border-border/50 pb-1">הערות כלליות</h4>
                <div className="bg-card border border-border p-3 rounded-md">
                  <p className="text-sm text-foreground leading-relaxed">
                    {submission.notes}
                  </p>
                </div>
              </div>
            )}

            {/* Morning availability */}
            {Array.isArray(submission.optional_morning_availability) && submission.optional_morning_availability.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-foreground border-b border-border/50 pb-1">זמינות בוקר אופציונלית</h4>
                <div className="flex gap-2 flex-wrap">
                  {submission.optional_morning_availability.map((day: any) => (
                    <Badge key={day} variant="outline" className="text-xs px-2 py-1 bg-orange-50 text-orange-700 border-orange-200">
                      יום {day}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">טוען הגשות...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
        <p className="text-destructive">שגיאה בטעינת ההגשות</p>
      </div>
    );
  }

  if (!submissions || submissions.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground">אין הגשות עדיין</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className={`flex items-center justify-between mb-6 ${isMobile ? 'px-4' : 'px-2'}`}>
        <h2 className={`font-bold text-foreground ${isMobile ? 'text-xl' : 'text-2xl'}`}>
          הגשות משמרות
        </h2>
        <Badge variant="outline" className="text-sm px-3 py-1 bg-primary/10 text-primary border-primary/20">
          {submissions.length} הגשות
        </Badge>
      </div>

      {/* Content */}
      <div className={isMobile ? 'px-4' : 'px-2'}>
        {isMobile ? (
          // Mobile view - compact cards
          <div className="space-y-3">
            {submissions.map((submission: any) => (
              <MobileSubmissionCard key={submission.id} submission={submission} />
            ))}
          </div>
        ) : (
          // Desktop view - original layout
          <div className="grid gap-4">
            {submissions.map((submission: any) => {
              const shifts = Array.isArray(submission.shifts) ? submission.shifts : [];
              const morningAvailability = Array.isArray(submission.optional_morning_availability) 
                ? submission.optional_morning_availability 
                : [];

              return (
                <Card key={submission.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-5 w-5" />
                        {submission.employees?.first_name && submission.employees?.last_name 
                          ? `${submission.employees.first_name} ${submission.employees.last_name}`
                          : 'עובד אנונימי'
                        }
                      </CardTitle>
                      {getStatusBadge(submission.status)}
                    </div>
                    <CardDescription className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        שבוע {formatDate(submission.week_start_date)} - {formatDate(submission.week_end_date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        הוגש: {formatDateTime(submission.submitted_at)}
                      </span>
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium mb-2">משמרות נבחרות ({shifts.length}):</h4>
                        <div className="grid gap-2">
                          {shifts.map((shift: any, index: number) => (
                            <div key={index} className="bg-muted p-3 rounded-lg text-sm">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">{formatDate(shift.date)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <span>{shift.start_time} - {shift.end_time}</span>
                                </div>
                              </div>
                              
                              {shift.branch_preference && (
                                <div className="mt-1 text-muted-foreground">
                                  📍 {shift.branch_preference}
                                </div>
                              )}
                              
                              {shift.role_preference && (
                                <div className="mt-1 text-muted-foreground">
                                  👔 {shift.role_preference}
                                </div>
                              )}
                              
                              {shift.notes && (
                                <div className="mt-1 text-muted-foreground">
                                  💬 {shift.notes}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {submission.notes && (
                        <div>
                          <h4 className="font-medium mb-1">הערות כלליות:</h4>
                          <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                            {submission.notes}
                          </p>
                        </div>
                      )}

                      {morningAvailability.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-1">זמינות בוקר אופציונלית:</h4>
                          <div className="flex gap-1 flex-wrap">
                            {morningAvailability.map((day: any) => (
                              <Badge key={day} variant="outline" className="text-xs">
                                יום {day}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};