import { Link } from 'react-router-dom';
import { useFridges } from '../hooks/useFridges';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function FridgesPage() {
  const { data: fridges = [], isLoading, error } = useFridges();

  return (
    <div className="p-6" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">מקררים ומקפיאים</h1>
        <Link to="/fridges/new">
          <Button>+ מקרר חדש</Button>
        </Link>
      </div>

      {isLoading && <div className="text-muted-foreground">טוען...</div>}
      {error && <div className="text-destructive">{(error as Error).message}</div>}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-3 text-start text-sm font-semibold">שם</th>
                <th className="p-3 text-start text-sm font-semibold">סוג</th>
                <th className="p-3 text-start text-sm font-semibold">מיקום</th>
                <th className="p-3 text-start text-sm font-semibold">טווח תקין</th>
                <th className="p-3 text-start text-sm font-semibold">סטטוס</th>
                <th className="p-3 text-start text-sm font-semibold">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {fridges.map((f) => (
                <tr key={f.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3 text-sm">{f.name}</td>
                  <td className="p-3 text-sm">{f.type}</td>
                  <td className="p-3 text-sm">{f.location || '-'}</td>
                  <td className="p-3 text-sm">{f.min_temp}°C – {f.max_temp}°C</td>
                  <td className="p-3 text-sm">
                    <span className={`px-2 py-1 rounded-lg text-xs ${f.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600'}`}>
                      {f.is_active ? 'פעיל' : 'מכובה'}
                    </span>
                  </td>
                  <td className="p-3 text-sm">
                    <Link to={`/fridges/${f.id}`} className="text-primary hover:underline">
                      צפייה
                    </Link>
                  </td>
                </tr>
              ))}
              {fridges.length === 0 && !isLoading && (
                <tr>
                  <td className="p-6 text-center text-muted-foreground" colSpan={6}>
                    אין מקררים פעילים
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
