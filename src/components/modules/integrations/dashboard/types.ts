
export interface DataSummary {
  totalEvents: number;
  upcomingEvents: number;
  totalContacts: number;
  filesStored: number;
  emailsSent: number;
  lastSyncTime: string;
}

export interface StatsItem {
  title: string;
  value: number;
  icon: any;
  color: string;
  bgColor: string;
}

export interface ActivityItem {
  type: string;
  action: string;
  details: string;
  time: string;
  icon: any;
}
