import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Copy, 
  Eye, 
  EyeOff, 
  Calendar, 
  Users, 
  ExternalLink,
  Settings,
  Trash2 
} from 'lucide-react';
import { useEmployeeRegistrationTokens } from '@/hooks/useEmployeeRegistrationTokens';
import { CreateRegistrationTokenDialog } from './CreateRegistrationTokenDialog';
import { RegistrationTokenStats } from './RegistrationTokenStats';
import { WhatsAppTokenShare } from './WhatsAppTokenShare';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export const EmployeeRegistrationTokens: React.FC = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [revealedTokens, setRevealedTokens] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const {
    tokens,
    isLoading,
    createToken,
    isCreating,
    updateToken,
    isUpdating,
    deleteToken,
    isDeleting,
    getPublicTokenUrl,
  } = useEmployeeRegistrationTokens();

  const copyTokenUrl = (token: string) => {
    const url = getPublicTokenUrl(token);
    navigator.clipboard.writeText(url);
    toast({
      title: 'הצלחה',
      description: 'קישור הטוקן הועתק ללוח',
    });
  };

  const toggleTokenVisibility = (tokenId: string) => {
    const newRevealed = new Set(revealedTokens);
    if (newRevealed.has(tokenId)) {
      newRevealed.delete(tokenId);
    } else {
      newRevealed.add(tokenId);
    }
    setRevealedTokens(newRevealed);
  };

  const toggleTokenStatus = (tokenId: string, currentStatus: boolean) => {
    updateToken({
      tokenId,
      updates: { is_active: !currentStatus }
    });
  };

  const handleDeleteToken = (tokenId: string) => {
    deleteToken(tokenId);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">טוקני הוספת עובדים</h2>
          <p className="text-muted-foreground">
            צור טוקנים ציבוריים שיאפשרו לעובדים חדשים להירשם למערכת
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateDialog(true)}
          disabled={isCreating}
        >
          <Plus className="h-4 w-4 mr-2" />
          יצירת טוקן חדש
        </Button>
      </div>

      {/* Statistics */}
      <RegistrationTokenStats />

      {/* Tokens List */}
      <div className="grid gap-4">
        {tokens.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="space-y-4">
              <Users className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">אין טוקנים</h3>
                <p className="text-muted-foreground">
                  צור טוקן ראשון כדי לאפשר לעובדים חדשים להירשם
                </p>
              </div>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                יצירת טוקן ראשון
              </Button>
            </div>
          </Card>
        ) : (
          tokens.map((token) => (
            <Card key={token.id} className="border-l-4 border-l-primary">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{token.title}</CardTitle>
                    {token.description && (
                      <p className="text-sm text-muted-foreground">
                        {token.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={token.is_active ? 'default' : 'secondary'}
                    >
                      {token.is_active ? 'פעיל' : 'לא פעיל'}
                    </Badge>
                    {token.expires_at && new Date(token.expires_at) < new Date() && (
                      <Badge variant="destructive">פג תוקף</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Token Display */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">טוקן:</label>
                  <div className="flex items-center gap-2">
                    <code className="bg-muted px-3 py-2 rounded text-sm flex-1">
                      {revealedTokens.has(token.id) 
                        ? token.token 
                        : '*'.repeat(token.token.length)
                      }
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleTokenVisibility(token.id)}
                    >
                      {revealedTokens.has(token.id) ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyTokenUrl(token.token)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(getPublicTokenUrl(token.token), '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <WhatsAppTokenShare 
                    token={token} 
                    getPublicTokenUrl={getPublicTokenUrl} 
                  />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="bg-muted p-3 rounded">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="font-medium">הרשמות</span>
                    </div>
                    <div className="text-lg font-bold">
                      {token.current_registrations}
                      {token.max_registrations && (
                        <span className="text-sm text-muted-foreground">
                          /{token.max_registrations}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="bg-muted p-3 rounded">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="font-medium">תוקף</span>
                    </div>
                    <div className="text-sm">
                      {token.expires_at 
                        ? format(new Date(token.expires_at), 'dd/MM/yyyy', { locale: he })
                        : 'ללא הגבלה'
                      }
                    </div>
                  </div>

                  <div className="bg-muted p-3 rounded">
                    <div className="text-sm text-muted-foreground">נוצר</div>
                    <div className="text-sm">
                      {format(new Date(token.created_at), 'dd/MM/yyyy', { locale: he })}
                    </div>
                  </div>

                  <div className="bg-muted p-3 rounded">
                    <div className="text-sm text-muted-foreground">עודכן</div>
                    <div className="text-sm">
                      {format(new Date(token.updated_at), 'dd/MM/yyyy', { locale: he })}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={token.is_active ? "destructive" : "default"}
                    onClick={() => toggleTokenStatus(token.id, token.is_active)}
                    disabled={isUpdating}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    {token.is_active ? 'השבת' : 'הפעל'}
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        מחק
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>מחיקת טוקן</AlertDialogTitle>
                        <AlertDialogDescription>
                          האם אתה בטוח שברצונך למחוק את הטוקן "{token.title}"?
                          פעולה זו תמחק גם את כל בקשות הרישום הקשורות לטוקן זה.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>ביטול</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteToken(token.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          מחק
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Token Dialog */}
      <CreateRegistrationTokenDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onTokenCreated={() => setShowCreateDialog(false)}
      />
    </div>
  );
};