
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Archive, RotateCcw } from 'lucide-react';

interface ArchiveManagementProps {
  title: string;
  activeContent: React.ReactNode;
  archivedContent: React.ReactNode;
  activeCount?: number;
  archivedCount?: number;
  entityNamePlural: string;
}

export const ArchiveManagement: React.FC<ArchiveManagementProps> = ({
  title,
  activeContent,
  archivedContent,
  activeCount = 0,
  archivedCount = 0,
  entityNamePlural
}) => {
  const [activeTab, setActiveTab] = useState('active');

  return (
    <Card dir="rtl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Archive className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl">
          <TabsList className="grid w-full grid-cols-2" dir="rtl">
            <TabsTrigger value="active" className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              {entityNamePlural} פעילים ({activeCount})
            </TabsTrigger>
            <TabsTrigger value="archived" className="flex items-center gap-2">
              <Archive className="h-4 w-4" />
              ארכיון ({archivedCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            {activeContent}
          </TabsContent>

          <TabsContent value="archived" className="mt-6">
            {archivedContent}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
