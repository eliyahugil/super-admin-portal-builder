import * as Dialog from '@radix-ui/react-dialog';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { useUpsertEmployee, EmployeeUpsertInput } from './hooks/useUpsertEmployee';
import { useToast } from '@/hooks/use-toast';

const schema = z.object({
  id: z.string().uuid().optional(),
  first_name: z.string().min(1, 'שדה חובה'),
  last_name: z.string().min(1, 'שדה חובה'),
  phone: z.string().min(7, 'מספר טלפון לא תקין'),
  email: z.string().email('אימייל לא תקין').optional().or(z.literal('').transform(() => undefined)),
  employee_id: z.string().optional(),
  id_number: z.string().optional(),
  employee_type: z.enum(['permanent', 'temporary', 'youth', 'contractor']),
  is_active: z.boolean().default(true),
  notes: z.string().optional(),
  main_branch_id: z.string().uuid().optional(),
});

export type EmployeeFormValues = z.infer<typeof schema>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: Partial<EmployeeFormValues>;
  initialBranchIds?: string[];
};

export const EmployeeEditDialog: React.FC<Props> = ({ open, onOpenChange, initialValues, initialBranchIds = [] }) => {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      is_active: true,
      employee_type: 'permanent',
      ...initialValues,
    },
  });

  const { mutateAsync, isPending } = useUpsertEmployee(() => {
    onOpenChange(false);
    reset();
  });

  const [branchIds, setBranchIds] = React.useState<string[]>(initialBranchIds);
  const { data: branches = [] } = require('@/hooks/useBranchesData');

  const onSubmit = async (values: EmployeeFormValues) => {
    try {
      const payload: EmployeeUpsertInput = {
        ...values,
        email: values.email && values.email.length > 0 ? values.email : undefined,
        branchIds,
      } as EmployeeUpsertInput;
      await mutateAsync(payload);
      toast({ title: 'נשמר בהצלחה', description: 'פרטי העובד עודכנו', duration: 2000 });
    } catch (e: any) {
      toast({ title: 'שמירה נכשלה', description: e?.message ?? 'שגיאה לא ידועה', variant: 'destructive' });
    }
  };

  const loading = isSubmitting || isPending;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content
          className="fixed z-[60] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-[640px] bg-card text-card-foreground border border-border rounded-2xl shadow-lg focus:outline-none"
          onEscapeKeyDown={(e) => e.stopPropagation()}
          aria-label="טופס עובד"
          data-testid="employee-dialog"
        >
          <div className="p-4 md:p-6" dir="rtl">
            <div className="flex items-center justify-between mb-4">
              <Dialog.Title className="text-lg font-semibold">{initialValues?.id ? 'עריכת עובד' : 'יצירת עובד חדש'}</Dialog.Title>
              <Dialog.Close asChild>
                <Button variant="ghost" size="sm" aria-label="סגור דיאלוג">
                  ✕
                </Button>
              </Dialog.Close>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div className="flex flex-col">
                <label className="text-sm text-muted-foreground mb-1">שם פרטי</label>
                <input {...register('first_name')} className="h-10 px-3 rounded-md bg-background text-foreground border border-input focus:outline-none focus:ring-2 focus:ring-primary" data-testid="input-first-name" />
                {errors.first_name?.message && (
                  <span className="text-destructive text-xs mt-1">{String(errors.first_name.message)}</span>
                )}
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-muted-foreground mb-1">שם משפחה</label>
                <input {...register('last_name')} className="h-10 px-3 rounded-md bg-background text-foreground border border-input focus:outline-none focus:ring-2 focus:ring-primary" data-testid="input-last-name" />
                {errors.last_name?.message && (
                  <span className="text-destructive text-xs mt-1">{String(errors.last_name.message)}</span>
                )}
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-muted-foreground mb-1">טלפון</label>
                <input {...register('phone')} className="h-10 px-3 rounded-md bg-background text-foreground border border-input focus:outline-none focus:ring-2 focus:ring-primary" data-testid="input-phone" />
                {errors.phone?.message && (
                  <span className="text-destructive text-xs mt-1">{String(errors.phone.message)}</span>
                )}
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-muted-foreground mb-1">אימייל</label>
                <input {...register('email')} className="h-10 px-3 rounded-md bg-background text-foreground border border-input focus:outline-none focus:ring-2 focus:ring-primary" data-testid="input-email" />
                {errors.email?.message && (
                  <span className="text-destructive text-xs mt-1">{String(errors.email.message)}</span>
                )}
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-muted-foreground mb-1">מס׳ עובד</label>
                <input {...register('employee_id')} className="h-10 px-3 rounded-md bg-background text-foreground border border-input focus:outline-none focus:ring-2 focus:ring-primary" data-testid="input-employee-id" />
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-muted-foreground mb-1">תעודת זהות</label>
                <input {...register('id_number')} className="h-10 px-3 rounded-md bg-background text-foreground border border-input focus:outline-none focus:ring-2 focus:ring-primary" data-testid="input-id-number" />
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-muted-foreground mb-1">סוג עובד</label>
                <select {...register('employee_type')} className="h-10 px-3 rounded-md bg-background text-foreground border border-input focus:outline-none focus:ring-2 focus:ring-primary z-50" data-testid="input-employee-type">
                  <option value="permanent">קבוע</option>
                  <option value="temporary">זמני</option>
                  <option value="youth">נוער</option>
                  <option value="contractor">קבלן</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-muted-foreground mb-1">סטטוס</label>
                <select {...register('is_active', { setValueAs: (v) => (v === 'true' || v === true) }) as any} className="h-10 px-3 rounded-md bg-background text-foreground border border-input focus:outline-none focus:ring-2 focus:ring-primary z-50" data-testid="input-status">
                  <option value="true">פעיל</option>
                  <option value="false">לא פעיל</option>
                </select>
              </div>

              <div className="md:col-span-2 flex flex-col">
                <label className="text-sm text-muted-foreground mb-1">הערות</label>
                <textarea rows={4} {...register('notes')} className="px-3 py-2 rounded-md bg-background text-foreground border border-input focus:outline-none focus:ring-2 focus:ring-primary" data-testid="input-notes" />
              </div>

              {/* שיוך לסניפים (מרובה) */}
              <div className="md:col-span-2 flex flex-col">
                <label className="text-sm text-muted-foreground mb-1">שיוך לסניפים (אופציונלי)</label>
                {/* eslint-disable-next-line @typescript-eslint/no-var-requires */}
                {(() => {
                  const { useBranchesData } = require('@/hooks/useBranchesData');
                  const { data: bs = [] } = useBranchesData();
                  const items = bs.map((b: any) => ({ id: b.id as string, name: b.name as string }));
                  const Comp = require('@/components/inputs/BranchesMultiSelect').default as React.FC<any>;
                  return <Comp branches={items} value={branchIds} onChange={setBranchIds} data-testid="select-branches" />;
                })()}
              </div>

              <div className="md:col-span-2 flex justify-start gap-2 pt-2">
                <Button type="submit" disabled={loading} loading={loading} data-testid="save-button" aria-label="שמור">שמור</Button>
                <Dialog.Close asChild>
                  <Button type="button" variant="ghost" aria-label="בטל">בטל</Button>
                </Dialog.Close>
              </div>
            </form>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
