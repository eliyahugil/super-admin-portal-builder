
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
        {WEEKDAYS.map((day) => (
          <button
            type="button"
            key={day.value}
            className={`px-3 py-2 rounded-xl border bg-white transition-colors
              ${selectedWeekdays.includes(day.value) ? "bg-blue-600 text-white" : "text-gray-700 border-gray-300"}
              ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            `}
            onClick={() => handleToggle(day.value)}
            disabled={disabled}
          >
            {day.label}
          </button>
        ))}
      </div>
    </div>
  );
};
