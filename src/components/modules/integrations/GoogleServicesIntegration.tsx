
import React from 'react';
import { GoogleServicesContainer } from './google-services/GoogleServicesContainer';

interface GoogleServicesIntegrationProps {
  businessId: string;
}

export const GoogleServicesIntegration: React.FC<GoogleServicesIntegrationProps> = ({ businessId }) => {
  return <GoogleServicesContainer businessId={businessId} />;
};
