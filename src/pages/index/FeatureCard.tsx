
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon }) => (
  <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-blue-500">
    <CardHeader className="text-center pb-4">
      <div className="text-4xl mb-2">{icon}</div>
      <CardTitle className="text-xl font-bold text-gray-900">
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <CardDescription className="text-gray-600 text-center leading-relaxed">
        {description}
      </CardDescription>
    </CardContent>
  </Card>
);
