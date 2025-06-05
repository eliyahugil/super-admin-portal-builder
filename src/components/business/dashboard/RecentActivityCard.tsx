
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
  return (
    <div className="bg-white rounded-2xl shadow-md p-6" dir="rtl">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800">פעילות אחרונה</h3>
        <p className="text-gray-600 text-sm mt-1">עדכונים ופעילות בעסק (נתונים אמיתיים)</p>
      </div>
      
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start space-x-3 space-x-reverse p-3 bg-gray-50 rounded-xl">
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
        ))}
      </div>
    </div>
  );
};
