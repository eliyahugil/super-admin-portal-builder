
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Star, Clock, Filter } from 'lucide-react';
import { IsraeliHoliday } from '@/hooks/useIsraeliHolidaysFromHebcal';
import { ShabbatTimes } from '@/hooks/useShabbatTimesFromHebcal';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const combinedEvents = useMemo(() => {
    const events = [
      ...holidays.map(holiday => ({
        id: `holiday-${holiday.date}`,
        date: holiday.date,
        title: holiday.hebrewName,
        type: 'holiday' as const,
        category: holiday.type,
        isWorkingDay: holiday.isWorkingDay,
        data: holiday
      })),
      ...shabbatTimes.map(shabbat => ({
        id: `shabbat-${shabbat.date}`,
        date: shabbat.date,
        title: `שבת${shabbat.parsha ? ` - פרשת ${shabbat.parsha}` : ''}`,
        type: 'shabbat' as const,
        category: 'שבת',
        isWorkingDay: false,
        candleLighting: shabbat.candleLighting,
        havdalah: shabbat.havdalah,
        data: shabbat
      }))
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return events;
  }, [holidays, shabbatTimes]);

  // Filter events by type
  const filteredEvents = useMemo(() => {
    if (typeFilter === 'all') return combinedEvents;
    
    if (typeFilter === 'shabbat') {
      return combinedEvents.filter(event => event.type === 'shabbat');
    }
    
    return combinedEvents.filter(event => 
      event.type === 'holiday' && event.category === typeFilter
    );
  }, [combinedEvents, typeFilter]);

  const getTypeColor = (type: string, category: string) => {
    if (type === 'shabbat') return 'bg-purple-100 text-purple-800';
    
    switch (category) {
      case 'חג': return 'bg-green-100 text-green-800';
      case 'מועד': return 'bg-blue-100 text-blue-800';
      case 'יום זיכרון': return 'bg-gray-100 text-gray-800';
      case 'יום עצמאות': return 'bg-blue-100 text-blue-800';
      case 'צום': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string, category: string) => {
    if (type === 'shabbat') return <Star className="h-3 w-3" />;
    
    switch (category) {
      case 'חג':
      case 'מועד':
        return <Star className="h-3 w-3" />;
      case 'יום זיכרון':
      case 'יום עצמאות':
      case 'צום':
        return <Calendar className="h-3 w-3" />;
      default:
        return <Calendar className="h-3 w-3" />;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const dayOfWeek = date.toLocaleDateString('he-IL', { weekday: 'long' });
    
    if (isMobile) {
      return {
        full: date.toLocaleDateString('he-IL', {
          day: 'numeric',
          month: 'short'
        }),
        dayOfWeek: dayOfWeek
      };
    }
    return {
      full: date.toLocaleDateString('he-IL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      dayOfWeek: dayOfWeek
    };
  };

  const getHolidayTimes = (event: any) => {
    if (event.type === 'shabbat') {
      return {
        entry: event.candleLighting || null,
        exit: event.havdalah || null
      };
    }
    // For holidays, we can use typical Jewish holiday times
    // Entry is typically at sunset (similar to candle lighting)
    // Exit is typically after nightfall (similar to havdalah)
    const eventDate = new Date(event.date);
    const fridayBefore = new Date(eventDate);
    fridayBefore.setDate(eventDate.getDate() - ((eventDate.getDay() + 2) % 7));
    
    // Find Shabbat times for reference
    const nearbyShabbat = shabbatTimes.find(s => 
      Math.abs(new Date(s.date).getTime() - eventDate.getTime()) < 7 * 24 * 60 * 60 * 1000
    );
    
    return {
      entry: nearbyShabbat?.candleLighting || null,
      exit: nearbyShabbat?.havdalah || null
    };
  };

  // Get unique categories for filter options
  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    types.add('שבת');
    holidays.forEach(holiday => types.add(holiday.type));
    return Array.from(types).sort();
  }, [holidays]);

  // Mobile layout
  if (isMobile) {
    return (
      <div className={`space-y-3 p-3 h-full overflow-y-auto ${className}`} dir="rtl">
        {/* Filter Section */}
        <Card className="shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium">סינון לפי סוג:</span>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל הסוגים ({combinedEvents.length})</SelectItem>
                <SelectItem value="shabbat">שבת ({shabbatTimes.length})</SelectItem>
                {availableTypes.filter(type => type !== 'שבת').map(type => (
                  <SelectItem key={type} value={type}>
                    {type} ({holidays.filter(h => h.type === type).length})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Statistics Cards - Mobile optimized */}
        <div className="grid grid-cols-2 gap-2">
          <Card className="shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-green-600" />
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">
                    {holidays.filter(h => h.type === 'חג').length}
                  </div>
                  <div className="text-xs text-gray-600">חגים</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">
                    {holidays.filter(h => h.type === 'מועד').length}
                  </div>
                  <div className="text-xs text-gray-600">מועדים</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-purple-600" />
                <div className="text-right">
                  <div className="text-lg font-bold text-purple-600">{shabbatTimes.length}</div>
                  <div className="text-xs text-gray-600">שבתות</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-orange-600" />
                <div className="text-right">
                  <div className="text-lg font-bold text-orange-600">{filteredEvents.length}</div>
                  <div className="text-xs text-gray-600">מוצגים</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile Events List - Improved spacing and scrolling */}
        <Card className="flex-1 shadow-sm">
          <CardHeader className="pb-2 px-3 pt-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {typeFilter === 'all' ? 'כל האירועים' : `${typeFilter} (${filteredEvents.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-8 text-gray-500 px-3">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">אין אירועים מסוג זה</p>
              </div>
            ) : (
              <div className="space-y-1 px-3 pb-3">
                {filteredEvents.map((event) => {
                  const dateInfo = formatDate(event.date);
                  const times = getHolidayTimes(event);
                  
                  return (
                    <Card key={event.id} className="bg-gray-50 border border-gray-200">
                      <CardContent className="p-3">
                        <div className="space-y-2">
                          {/* Header with type and date */}
                          <div className="flex items-center justify-between">
                            <Badge className={`text-xs ${getTypeColor(event.type, event.category)} flex items-center gap-1`}>
                              {getTypeIcon(event.type, event.category)}
                              <span>{event.category}</span>
                            </Badge>
                            <div className="text-left">
                              <div className="text-xs font-medium text-gray-900">{dateInfo.full}</div>
                              <div className="text-xs text-gray-600">{dateInfo.dayOfWeek}</div>
                            </div>
                          </div>
                          
                          {/* Event title */}
                          <div className="font-medium text-sm text-gray-900">{event.title}</div>
                          
                          {/* Times and details */}
                          <div className="space-y-1">
                            {times.entry && (
                              <div className="flex items-center gap-1 text-xs text-gray-600">
                                <Clock className="h-3 w-3" />
                                <span>כניסה: {times.entry}</span>
                              </div>
                            )}
                            {times.exit && (
                              <div className="flex items-center gap-1 text-xs text-gray-600">
                                <Star className="h-3 w-3" />
                                <span>יציאה: {times.exit}</span>
                              </div>
                            )}
                            
                            {event.type === 'holiday' && (
                              <Badge 
                                variant="secondary" 
                                className={`text-xs w-fit ${event.isWorkingDay ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}
                              >
                                {event.isWorkingDay ? 'יום עבודה' : 'לא יום עבודה'}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Desktop layout - keep existing code with filter
  return (
    <div className={`space-y-6 ${className}`} dir="rtl">
      {/* Filter Section */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium">סינון לפי סוג:</span>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל הסוגים ({combinedEvents.length})</SelectItem>
                <SelectItem value="shabbat">שבת ({shabbatTimes.length})</SelectItem>
                {availableTypes.filter(type => type !== 'שבת').map(type => (
                  <SelectItem key={type} value={type}>
                    {type} ({holidays.filter(h => h.type === type).length})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {holidays.filter(h => h.type === 'חג').length}
                </div>
                <div className="text-sm text-gray-600">חגים</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {holidays.filter(h => h.type === 'מועד').length}
                </div>
                <div className="text-sm text-gray-600">מועדים</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-purple-600">{shabbatTimes.length}</div>
                <div className="text-sm text-gray-600">שבתות</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold text-orange-600">{filteredEvents.length}</div>
                <div className="text-sm text-gray-600">מוצגים</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Desktop Events Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {typeFilter === 'all' ? 'כל האירועים' : `${typeFilter} (${filteredEvents.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>אין אירועים מסוג זה</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">תאריך</TableHead>
                    <TableHead className="text-right">יום</TableHead>
                    <TableHead className="text-right">אירוע</TableHead>
                    <TableHead className="text-right">סוג</TableHead>
                    <TableHead className="text-right">שעות</TableHead>
                    <TableHead className="text-right">פרטים</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event) => {
                    const dateInfo = formatDate(event.date);
                    const times = getHolidayTimes(event);
                    
                    return (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">
                          {dateInfo.full}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {dateInfo.dayOfWeek}
                        </TableCell>
                        <TableCell>{event.title}</TableCell>
                        <TableCell>
                          <Badge className={getTypeColor(event.type, event.category)}>
                            {getTypeIcon(event.type, event.category)}
                            <span className="mr-1">{event.category}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1 text-xs">
                            {times.entry && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>כניסה: {times.entry}</span>
                              </div>
                            )}
                            {times.exit && (
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3" />
                                <span>יציאה: {times.exit}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {event.type === 'holiday' && (
                            <Badge 
                              variant="secondary" 
                              className={event.isWorkingDay ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}
                            >
                              {event.isWorkingDay ? 'יום עבודה' : 'לא יום עבודה'}
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
