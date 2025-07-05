import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar, Star, Clock } from 'lucide-react';
import { IsraeliHoliday } from '@/hooks/useIsraeliHolidaysFromHebcal';
import { ShabbatTimes } from '@/hooks/useShabbatTimesFromHebcal';
import { ScrollArea } from '@/components/ui/scroll-area';

interface HolidaysAndFestivalsTableProps {
  holidays: IsraeliHoliday[];
  shabbatTimes: ShabbatTimes[];
  className?: string;
}

export const HolidaysAndFestivalsTable: React.FC<HolidaysAndFestivalsTableProps> = ({
  holidays,
  shabbatTimes,
  className = ''
}) => {
  const combinedEvents = React.useMemo(() => {
    const events: Array<{
      date: string;
      type: 'holiday' | 'shabbat';
      hebrewName: string;
      englishName?: string;
      category: string;
      isWorkingDay?: boolean;
      candleLighting?: string;
      havdalah?: string;
      parsha?: string;
    }> = [];

    // הוספת חגים
    holidays.forEach(holiday => {
      events.push({
        date: holiday.date,
        type: 'holiday',
        hebrewName: holiday.hebrewName,
        englishName: holiday.name,
        category: holiday.type,
        isWorkingDay: holiday.isWorkingDay
      });
    });

    // הוספת זמני שבת
    shabbatTimes.forEach(shabbat => {
      const date = new Date(shabbat.date);
      const dayOfWeek = date.getDay();
      
      // הוספה רק אם יש נתונים משמעותיים
      if (shabbat.candleLighting || shabbat.havdalah) {
        events.push({
          date: shabbat.date,
          type: 'shabbat',
          hebrewName: dayOfWeek === 5 ? 'כניסת שבת' : dayOfWeek === 6 ? 'יציאת שבת' : 'שבת',
          category: 'זמני שבת',
          candleLighting: shabbat.candleLighting,
          havdalah: shabbat.havdalah,
          parsha: shabbat.parsha
        });
      }
    });

    // סידור לפי תאריך
    return events.sort((a, b) => a.date.localeCompare(b.date));
  }, [holidays, shabbatTimes]);

  const getTypeIcon = (type: string, category: string) => {
    if (type === 'shabbat') return <Star className="h-4 w-4 text-blue-600" />;
    
    switch (category) {
      case 'חג':
      case 'מועד':
        return <Star className="h-4 w-4 text-green-600" />;
      case 'יום זיכרון':
        return <Calendar className="h-4 w-4 text-gray-600" />;
      case 'יום עצמאות':
        return <Star className="h-4 w-4 text-blue-600" />;
      case 'צום':
        return <Calendar className="h-4 w-4 text-purple-600" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeBadgeColor = (type: string, category: string) => {
    if (type === 'shabbat') return 'bg-blue-100 text-blue-800';
    
    switch (category) {
      case 'חג':
      case 'מועד':
        return 'bg-green-100 text-green-800';
      case 'יום זיכרון':
        return 'bg-gray-100 text-gray-800';
      case 'יום עצמאות':
        return 'bg-blue-100 text-blue-800';
      case 'צום':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('he-IL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    return time.length === 5 ? time : time;
  };

  return (
    <Card className={className} dir="rtl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          חגים ומועדים וזמני שבת
        </CardTitle>
        <p className="text-sm text-gray-600">
          רשימת החגים, המועדים וזמני השבת הקרובים (נתונים מ-Hebcal.com API)
        </p>
      </CardHeader>
      <CardContent>
        {combinedEvents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            אין נתונים זמינים כרגע
          </div>
        ) : (
          <ScrollArea className="h-96">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">תאריך</TableHead>
                  <TableHead className="text-right">שם</TableHead>
                  <TableHead className="text-right">קטגורייה</TableHead>
                  <TableHead className="text-right">פרטים נוספים</TableHead>
                  <TableHead className="text-right">יום עבודה</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {combinedEvents.map((event, index) => (
                  <TableRow key={`${event.date}-${index}`} className="hover:bg-gray-50">
                    <TableCell className="text-right">
                      <div className="text-sm font-medium">
                        {formatDate(event.date)}
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        {getTypeIcon(event.type, event.category)}
                        <div>
                          <div className="font-medium">{event.hebrewName}</div>
                          {event.englishName && (
                            <div className="text-xs text-gray-500">{event.englishName}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getTypeBadgeColor(event.type, event.category)}`}
                      >
                        {event.category}
                      </Badge>
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <div className="space-y-1">
                        {event.candleLighting && (
                          <div className="flex items-center gap-1 text-xs text-purple-700 justify-end">
                            <span>{formatTime(event.candleLighting)}</span>
                            <Clock className="h-3 w-3" />
                            <span>הדלקת נרות</span>
                          </div>
                        )}
                        {event.havdalah && (
                          <div className="flex items-center gap-1 text-xs text-blue-700 justify-end">
                            <span>{formatTime(event.havdalah)}</span>
                            <Star className="h-3 w-3" />
                            <span>צאת שבת</span>
                          </div>
                        )}
                        {event.parsha && (
                          <div className="text-xs text-gray-600">
                            פרשת {event.parsha}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-right">
                      {event.type === 'holiday' && (
                        <Badge 
                          variant={event.isWorkingDay ? "default" : "secondary"}
                          className={`text-xs ${
                            event.isWorkingDay 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {event.isWorkingDay ? 'יום עבודה' : 'לא יום עבודה'}
                        </Badge>
                      )}
                      {event.type === 'shabbat' && (
                        <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                          שבת
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
        
        {/* סטטיסטיקות */}
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {holidays.length}
              </div>
              <div className="text-xs text-gray-600">חגים ומועדים</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {shabbatTimes.length}
              </div>
              <div className="text-xs text-gray-600">זמני שבת</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {holidays.filter(h => !h.isWorkingDay).length}
              </div>
              <div className="text-xs text-gray-600">לא ימי עבודה</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {combinedEvents.length}
              </div>
              <div className="text-xs text-gray-600">סה"כ אירועים</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
