
import { QuickTemplate } from './types';

export const QUICK_TEMPLATES: QuickTemplate[] = [
  { name: 'משמרת בוקר', start_time: '07:00', end_time: '15:00', shift_type: 'morning' },
  { name: 'משמרת צהריים', start_time: '15:00', end_time: '23:00', shift_type: 'afternoon' },
  { name: 'משמרת ערב', start_time: '17:00', end_time: '01:00', shift_type: 'evening' },
  { name: 'משמרת לילה', start_time: '23:00', end_time: '07:00', shift_type: 'night' }
];
