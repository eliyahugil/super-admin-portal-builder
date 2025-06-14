
import React from "react";

const WEEKDAYS = [
  { value: 0, label: "ראשון" },
  { value: 1, label: "שני" },
  { value: 2, label: "שלישי" },
  { value: 3, label: "רביעי" },
  { value: 4, label: "חמישי" },
  { value: 5, label: "שישי" },
  { value: 6, label: "שבת" },
];

interface WeekdaySelectorProps {
  selectedWeekdays: number[];
  onChange: (days: number[]) => void;
  disabled?: boolean;
}

export const WeekdaySelector: React.FC<WeekdaySelectorProps> = ({
  selectedWeekdays,
  onChange,
  disabled,
}) => {
  const handleToggle = (day: number) => {
    if (selectedWeekdays.includes(day)) {
      onChange(selectedWeekdays.filter((d) => d !== day));
    } else {
      onChange([...selectedWeekdays, day]);
    }
  };

  return (
    <div>
      <div className="text-sm text-gray-600 font-medium mb-1">
        ימים חוזרים (ניתן לבחור כמה שרוצים)
      </div>
      <div className="flex flex-wrap gap-2">
        {WEEKDAYS.map((day) => {
          const isSelected = selectedWeekdays.includes(day.value);
          return (
            <button
              type="button"
              key={day.value}
              className={
                `px-3 py-2 rounded-xl border font-semibold transition-colors 
                ${isSelected
                  ? "bg-blue-700 text-white border-blue-700 shadow-sm"
                  : "bg-white text-blue-700 border-blue-300 hover:bg-blue-50"}
                ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                `
              }
              onClick={() => handleToggle(day.value)}
              disabled={disabled}
              tabIndex={0}
              aria-pressed={isSelected}
              style={{
                minWidth: 58,
              }}
            >
              {day.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
