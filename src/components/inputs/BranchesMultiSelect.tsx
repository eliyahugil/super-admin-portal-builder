import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';

type Branch = { id: string; name: string };

type Props = {
  branches: Branch[];
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  'data-testid'?: string;
};

const BranchesMultiSelect: React.FC<Props> = ({
  branches,
  value,
  onChange,
  placeholder = 'בחר סניפים',
  disabled,
  'data-testid': testId = 'select-branches',
}) => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const t = q.trim();
    if (!t) return branches;
    return branches.filter((b) => b.name.toLowerCase().includes(t.toLowerCase()));
  }, [branches, q]);

  const toggle = (id: string) => {
    if (value.includes(id)) onChange(value.filter((x) => x !== id));
    else onChange([...value, id]);
  };

  const summary = useMemo(() => {
    if (!value.length) return placeholder;
    if (value.length <= 2) {
      const names = value
        .map((id) => branches.find((b) => b.id === id)?.name)
        .filter(Boolean)
        .join(', ');
      return names || `${value.length} נבחרו`;
    }
    return `${value.length} נבחרו`;
  }, [value, branches, placeholder]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          size="default"
          disabled={disabled}
          data-testid={testId}
          aria-label="בחר סניפים"
          className="justify-between w-full"
        >
          <span className="truncate text-foreground">{summary}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" className="ms-2">
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={6} className="w-[min(92vw,320px)] p-2 bg-card border border-border z-50">
        <div dir="rtl" className="flex flex-col gap-2" data-testid={`${testId}-content`}>
          <Input
            placeholder="חפש סניף…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            data-testid={`${testId}-search`}
          />
          <div className="max-h-64 overflow-auto pr-1">
            {filtered.map((b) => {
              const checked = value.includes(b.id);
              return (
                <label
                  key={b.id}
                  className="flex items-center gap-2 p-2 rounded-xl hover:bg-accent cursor-pointer"
                  data-testid={`branch-option-${b.id}`}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggle(b.id)}
                    aria-label={`בחר ${b.name}`}
                  />
                  <span className="text-foreground">{b.name}</span>
                </label>
              );
            })}
            {!filtered.length && (
              <div className="text-muted-foreground text-sm p-2">לא נמצאו סניפים תואמים</div>
            )}
          </div>
          {!!value.length && (
            <div className="flex items-center justify-between pt-1">
              <Button variant="ghost" size="sm" onClick={() => onChange([])} data-testid={`${testId}-clear`}>
                נקה בחירה
              </Button>
              <Button variant="primary" size="sm" onClick={() => setOpen(false)} data-testid={`${testId}-apply`}>
                סגור
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default BranchesMultiSelect;
