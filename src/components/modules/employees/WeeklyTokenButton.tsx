
import React from 'react';
import { Button } from '@/components/ui/button';
import { useWeeklyToken } from './weekly-token/useWeeklyToken';
import { TokenActionDropdown } from './weekly-token/TokenActionDropdown';
import { LinkActionsDropdown } from './weekly-token/LinkActionsDropdown';
import { RevokeTokenDialog } from './weekly-token/RevokeTokenDialog';
import { TokenStatus } from './weekly-token/TokenStatus';
import { TokenURLsDisplay } from './weekly-token/TokenURLsDisplay';
import { WeeklyTokenButtonProps } from './weekly-token/types';
import { ExternalLink } from 'lucide-react';

export const WeeklyTokenButton: React.FC<WeeklyTokenButtonProps> = ({
  phone,
  employeeName,
  employeeId,
  compact = false,
}) => {
  const {
    tokenData,
    isLoading,
    loading,
    revoking,
    settings,
    handleSendWhatsApp,
    handleCopyLink,
    handleOpenLink,
    handleRevokeToken,
  } = useWeeklyToken(employeeId, employeeName, phone);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-500">טוען טוכן...</span>
      </div>
    );
  }

  if (!tokenData) {
    return (
      <div className="text-sm text-red-600">
        שגיאה ביצירת טוכן
      </div>
    );
  }

  const isExpired = new Date(tokenData.expires_at) < new Date();
  const isActive = tokenData.is_active && !isExpired;

  if (compact) {
    return (
      <div className="flex gap-2">
        <Button
          onClick={() => handleOpenLink(false)}
          size="sm"
          className="flex items-center gap-2"
          title="פתח טופס הגשת משמרות"
        >
          <ExternalLink className="h-4 w-4" />
          פתח טופס
        </Button>
        
        <TokenActionDropdown
          loading={loading}
          phone={phone}
          isActive={isActive}
          useAPI={settings?.use_whatsapp_api || false}
          onSendWhatsApp={handleSendWhatsApp}
        />
        
        <LinkActionsDropdown
          compact={true}
          onOpenLink={handleOpenLink}
          onCopyLink={handleCopyLink}
        />

        {isActive && (
          <RevokeTokenDialog
            employeeName={employeeName}
            revoking={revoking}
            compact={true}
            onRevokeToken={handleRevokeToken}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <TokenStatus tokenData={tokenData} />
      
      <div className="flex gap-2">
        <Button
          onClick={() => handleOpenLink(false)}
          size="sm"
          className="flex items-center gap-2"
          title="פתח טופס הגשת משמרות"
        >
          <ExternalLink className="h-4 w-4" />
          פתח טופס
        </Button>
        
        <TokenActionDropdown
          loading={loading}
          phone={phone}
          isActive={isActive}
          useAPI={settings?.use_whatsapp_api || false}
          onSendWhatsApp={handleSendWhatsApp}
        />
        
        <LinkActionsDropdown
          onOpenLink={handleOpenLink}
          onCopyLink={handleCopyLink}
        />

        {isActive && (
          <RevokeTokenDialog
            employeeName={employeeName}
            revoking={revoking}
            onRevokeToken={handleRevokeToken}
          />
        )}
      </div>
      
      <TokenURLsDisplay tokenData={tokenData} />
    </div>
  );
};
