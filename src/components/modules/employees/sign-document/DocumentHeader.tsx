
import React from 'react';

interface DocumentHeaderProps {
  title: string;
  subtitle: string;
}

export const DocumentHeader: React.FC<DocumentHeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
      <p className="text-gray-600">{subtitle}</p>
    </div>
  );
};
