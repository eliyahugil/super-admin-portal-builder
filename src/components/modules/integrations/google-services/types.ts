
export interface GoogleService {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  status: 'connected' | 'pending' | 'error';
  lastSync: string;
  dataCount: number;
}
