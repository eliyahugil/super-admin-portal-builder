
import React from 'react';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved': return 'bg-green-100 text-green-800';
    case 'rejected': return 'bg-red-100 text-red-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'approved': return <CheckCircle className="h-4 w-4" />;
    case 'rejected': return <AlertCircle className="h-4 w-4" />;
    default: return <Clock className="h-4 w-4" />;
  }
};

export const getStatusLabel = (status: string) => {
  switch (status) {
    case 'approved': return 'אושר';
    case 'rejected': return 'נדחה';
    case 'pending': return 'ממתין';
    default: return 'הוגש';
  }
};
