
import React from 'react';

interface ActivityItem {
  title: string;
  description: string;
  time: string;
  type: string;
}

interface RecentActivityCardProps {
  activities: ActivityItem[];
}

export const RecentActivityCard: React.FC<RecentActivityCardProps> = ({ activities }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'employee':
        return '👥';
      case 'shift':
        return '📅';
      case 'request':
        return '📝';
      case 'attendance':
        return '✅';
      case 'system':
        return '⚙️';
      default:
        return '📋';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'employee':
        return 'bg-blue-50 border-l-blue-400';
      case 'shift':
        return 'bg-purple-50 border-l-purple-400';
      case 'request':
        return 'bg-orange-50 border-l-orange-400';
      case 'attendance':
        return 'bg-green-50 border-l-green-400';
      case 'system':
        return 'bg-gray-50 border-l-gray-400';
      default:
        return 'bg-gray-50 border-l-gray-400';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6" dir="rtl">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800">פעילות אחרונה</h3>
        <p className="text-gray-600 text-sm mt-1">עדכונים ופעילות בעסק (נתונים אמיתיים)</p>
      </div>
      
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div 
            key={index} 
            className={`border-l-4 p-4 rounded-lg ${getActivityColor(activity.type)}`}
          >
            <div className="flex items-start space-x-3 space-x-reverse">
              <div className="text-2xl">{getActivityIcon(activity.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {activity.title}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {activity.description}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  {activity.time}
                </p>
              </div>
            </div>
          </div>
        ))}
        {activities.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📊</div>
            <p>אין פעילות אחרונה</p>
          </div>
        )}
      </div>
    </div>
  );
};
