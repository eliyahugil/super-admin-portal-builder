import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { Calendar, RefreshCw, Settings, CheckCircle, XCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { GoogleCalendarEventsList } from './GoogleCalendarEventsList';
import { GoogleOAuthSetup } from './GoogleOAuthSetup';

interface GoogleCalendarIntegrationProps {
  businessId: string;
}

export const GoogleCalendarIntegration: React.FC<GoogleCalendarIntegrationProps> = ({ businessId }) => {
  const { 
    integrations, 
    oauthTokens, 
    events, 
    loading, 
    saveIntegration, 
    syncCalendar, 
    isSaving, 
    isSyncing 
  } = useGoogleCalendar(businessId);
  
  const [editingIntegration, setEditingIntegration] = useState<any>(null);
  const [showOAuthSetup, setShowOAuthSetup] = useState(false);

  const handleSaveIntegration = (formData: any) => {
    saveIntegration(formData);
    setEditingIntegration(null);
  };

  const handleSync = (integrationId: string) => {
    syncCalendar(integrationId);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-800 gap-1">
            <CheckCircle className="h-3 w-3" />
            פעיל
          </Badge>
        );
      case 'paused':
        return (
          <Badge variant="secondary" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            מושהה
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            שגיאה
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSyncDirectionLabel = (direction: string) => {
    switch (direction) {
      case 'import_only':
        return 'ייבוא בלבד';
      case 'export_only':
        return 'ייצוא בלבד';
      case 'bidirectional':
        return 'דו כיווני';
      default:
        return direction;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            טוען אינטגרציות Google Calendar...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Google Calendar
          </CardTitle>
          <CardDescription>
            סנכרן אירועים עם Google Calendar שלך
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* OAuth Setup Section */}
          {(!oauthTokens.length || showOAuthSetup) && (
            <div className="border rounded-lg p-4 bg-blue-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">הגדרת אימות Google</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowOAuthSetup(!showOAuthSetup)}
                >
                  <Settings className="h-4 w-4 mr-1" />
                  הגדר אימות
                </Button>
              </div>
              {showOAuthSetup && (
                <GoogleOAuthSetup businessId={businessId} />
              )}
            </div>
          )}

          {/* Existing Integrations */}
          {integrations.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium">לוחות שנה מחוברים</h3>
              {integrations.map((integration) => (
                <div key={integration.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{integration.calendar_name}</h4>
                      <p className="text-sm text-gray-600">
                        {integration.calendar_description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(integration.sync_status)}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSync(integration.id)}
                        disabled={isSyncing}
                      >
                        <RefreshCw className={`h-4 w-4 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
                        סנכרן
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingIntegration(integration)}
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        הגדרות
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-xs">כיוון סנכרון</Label>
                      <p className="font-medium">
                        {getSyncDirectionLabel(integration.sync_direction)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs">סנכרון אחרון</Label>
                      <p className="font-medium">
                        {integration.last_sync_at ? 
                          new Date(integration.last_sync_at).toLocaleString('he-IL') : 
                          'לא סונכרן'
                        }
                      </p>
                    </div>
                  </div>

                  {integration.sync_error_message && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                      <strong>שגיאה:</strong> {integration.sync_error_message}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add New Calendar Button */}
          {oauthTokens.length > 0 && (
            <Button
              onClick={() => setEditingIntegration({})}
              className="w-full"
              variant="outline"
            >
              <Calendar className="h-4 w-4 mr-2" />
              הוסף לוח שנה
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Integration Form Modal */}
      {editingIntegration && (
        <GoogleCalendarIntegrationForm
          integration={editingIntegration}
          onSave={handleSaveIntegration}
          onCancel={() => setEditingIntegration(null)}
          isSaving={isSaving}
        />
      )}

      {/* Events List */}
      {events.length > 0 && (
        <GoogleCalendarEventsList events={events} />
      )}
    </div>
  );
};

// Integration Form Component
interface GoogleCalendarIntegrationFormProps {
  integration: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  isSaving: boolean;
}

const GoogleCalendarIntegrationForm: React.FC<GoogleCalendarIntegrationFormProps> = ({
  integration,
  onSave,
  onCancel,
  isSaving
}) => {
  const [formData, setFormData] = useState({
    google_calendar_id: integration.google_calendar_id || '',
    calendar_name: integration.calendar_name || '',
    calendar_description: integration.calendar_description || '',
    sync_enabled: integration.sync_enabled !== undefined ? integration.sync_enabled : true,
    sync_direction: integration.sync_direction || 'bidirectional',
    ...integration
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {integration.id ? 'עריכת אינטגרציית לוח שנה' : 'הוספת לוח שנה חדש'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="calendar_name">שם לוח השנה</Label>
            <Input
              id="calendar_name"
              value={formData.calendar_name}
              onChange={(e) => setFormData({ ...formData, calendar_name: e.target.value })}
              placeholder="שם לוח השנה"
              required
            />
          </div>

          <div>
            <Label htmlFor="google_calendar_id">Google Calendar ID</Label>
            <Input
              id="google_calendar_id"
              value={formData.google_calendar_id}
              onChange={(e) => setFormData({ ...formData, google_calendar_id: e.target.value })}
              placeholder="your-calendar@gmail.com"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              ניתן למצוא ב-Google Calendar Settings
            </p>
          </div>

          <div>
            <Label htmlFor="calendar_description">תיאור</Label>
            <Textarea
              id="calendar_description"
              value={formData.calendar_description}
              onChange={(e) => setFormData({ ...formData, calendar_description: e.target.value })}
              placeholder="תיאור אופציונלי"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="sync_direction">כיוון סנכרון</Label>
            <Select
              value={formData.sync_direction}
              onValueChange={(value) => setFormData({ ...formData, sync_direction: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bidirectional">דו כיווני</SelectItem>
                <SelectItem value="import_only">ייבוא בלבד</SelectItem>
                <SelectItem value="export_only">ייצוא בלבד</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="sync_enabled"
              checked={formData.sync_enabled}
              onCheckedChange={(checked) => setFormData({ ...formData, sync_enabled: checked })}
            />
            <Label htmlFor="sync_enabled">הפעל סנכרון אוטומטי</Label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'שומר...' : 'שמור'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              ביטול
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
