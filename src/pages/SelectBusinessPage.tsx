import React from 'react';
import { BusinessSwitcher } from '@/components/layout/BusinessSwitcher';

export const SelectBusinessPage: React.FC = () => {
  return (
    <main className="max-w-2xl mx-auto p-6" dir="rtl" data-testid="select-business-page">
      <header className="mb-6">
        <h1 className="text-2xl font-bold" data-testid="page-title">בחר עסק לעבודה</h1>
        <p className="text-muted-foreground mt-1">יש לבחור עסק פעיל כדי להמשיך למסכי העסק</p>
      </header>
      <section>
        <BusinessSwitcher />
      </section>
    </main>
  );
}

export default SelectBusinessPage;
