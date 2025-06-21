
import { 
  Calendar, 
  Mail, 
  HardDrive, 
  Map, 
  Users, 
  Video
} from 'lucide-react';
import { GoogleService } from './types';

export const createGoogleServices = (events: any[]): GoogleService[] => [
  {
    id: 'calendar',
    name: 'Google Calendar',
    icon: Calendar,
    description: 'ניהול אירועים ומשמרות',
    status: 'connected',
    lastSync: '5 דקות',
    dataCount: events.length
  },
  {
    id: 'gmail',
    name: 'Gmail',
    icon: Mail,
    description: 'שליחת התראות ועדכונים',
    status: 'connected',
    lastSync: '10 דקות',
    dataCount: 0
  },
  {
    id: 'drive',
    name: 'Google Drive',
    icon: HardDrive,
    description: 'שמירת מסמכים וקבצים',
    status: 'connected',
    lastSync: '2 שעות',
    dataCount: 0
  },
  {
    id: 'maps',
    name: 'Google Maps',
    icon: Map,
    description: 'מיקום סניפים וניווט',
    status: 'connected',
    lastSync: 'אתמול',
    dataCount: 0
  },
  {
    id: 'contacts',
    name: 'Google Contacts',
    icon: Users,
    description: 'ניהול אנשי קשר',
    status: 'pending',
    lastSync: 'לא סונכרן',
    dataCount: 0
  },
  {
    id: 'meet',
    name: 'Google Meet',
    icon: Video,
    description: 'פגישות וידאו',
    status: 'error',
    lastSync: 'שגיאה',
    dataCount: 0
  }
];
