"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const indonesianMonthMap: Record<string, number> = {
  januari: 0,
  februari: 1,
  maret: 2,
  april: 3,
  mei: 4,
  juni: 5,
  juli: 6,
  agustus: 7,
  september: 8,
  oktober: 9,
  november: 10,
  desember: 11,
};

type DatePickerFieldProps = {
  id: string;
  name?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  touched?: boolean;
};

function isValidDate(date: Date) {
  return !Number.isNaN(date.getTime());
}

function parseDateValue(value?: string) {
  if (!value) return null;

  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const date = new Date(`${value}T00:00:00`);
    return isValidDate(date) ? date : null;
  }

  const idMatch = value.trim().match(/^(\d{1,2})\s+([A-Za-zÀ-ÿ]+)\s+(\d{4})$/);
  if (idMatch) {
    const [, dayText, monthText, yearText] = idMatch;
    const monthIndex = indonesianMonthMap[monthText.toLowerCase()];
    if (monthIndex !== undefined) {
      const date = new Date(Number(yearText), monthIndex, Number(dayText));
      return isValidDate(date) ? date : null;
    }
  }

  const nativeDate = new Date(value);
  return isValidDate(nativeDate) ? nativeDate : null;
}

function toDate(value?: string) {
  return parseDateValue(value);
}

function toInputValue(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(value?: string) {
  if (!value) return "Pilih tanggal";

  const date = parseDateValue(value);
  if (!date) {
    return value;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function buildCalendarDays(monthDate: Date, selectedValue?: string) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startIndex = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const selectedDate = toDate(selectedValue);

  const days: Array<{
    key: string;
    day: number;
    muted: boolean;
    value: string;
    active: boolean;
  }> = [];

  for (let index = 0; index < 42; index += 1) {
    const dayNumber = index - startIndex + 1;

    if (dayNumber <= 0) {
      const date = new Date(year, month - 1, prevMonthDays + dayNumber);
      days.push({
        key: `prev-${index}`,
        day: date.getDate(),
        muted: true,
        value: toInputValue(date),
        active: false,
      });
      continue;
    }

    if (dayNumber > daysInMonth) {
      const date = new Date(year, month + 1, dayNumber - daysInMonth);
      days.push({
        key: `next-${index}`,
        day: date.getDate(),
        muted: true,
        value: toInputValue(date),
        active: false,
      });
      continue;
    }

    const date = new Date(year, month, dayNumber);
    const active =
      selectedDate !== null && toInputValue(date) === toInputValue(selectedDate);

    days.push({
      key: `current-${index}`,
      day: dayNumber,
      muted: false,
      value: toInputValue(date),
      active,
    });
  }

  return days;
}

export function DatePickerField({
  id,
  name,
  label,
  value,
  onChange,
  error,
  touched,
}: DatePickerFieldProps) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => toDate(value) ?? new Date());
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const calendarDays = useMemo(
    () => buildCalendarDays(viewDate, value),
    [value, viewDate],
  );

  function applyValue(nextValue: string) {
    onChange(nextValue);
    setViewDate(toDate(nextValue) ?? new Date());
    setOpen(false);
  }

  return (
    <div className="date-picker-field" ref={wrapperRef}>
      {label ? (
        <label className="neo-label" htmlFor={id}>
          {label}
        </label>
      ) : null}
      {name ? <input type="hidden" name={name} value={value} /> : null}
      <button
        id={id}
        type="button"
        className="date-input-shell"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <span className="date-input-icon">
          <Calendar size={16} />
        </span>
        <span className="date-input-text">{formatDisplayDate(value)}</span>
      </button>

      {open ? (
        <div className="date-picker-popover" role="dialog" aria-label={label}>
          <div className="date-preview-header">
            <button
              type="button"
              className="date-nav-button"
              onClick={() =>
                setViewDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))
              }
              aria-label="Bulan sebelumnya"
            >
              <ChevronLeft size={16} />
            </button>
            <p>
              {new Intl.DateTimeFormat("en-US", {
                month: "long",
                year: "numeric",
              }).format(viewDate)}
            </p>
            <button
              type="button"
              className="date-nav-button"
              onClick={() =>
                setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))
              }
              aria-label="Bulan berikutnya"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="date-preview-grid date-preview-weekdays">
            {weekDays.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="date-preview-grid">
            {calendarDays.map((item) => (
              <button
                key={item.key}
                type="button"
                className={[
                  "date-preview-day",
                  item.muted ? "is-muted" : "",
                  item.active ? "is-active" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => applyValue(item.value)}
              >
                {item.day}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {touched && error ? <p className="neo-field-error">{error}</p> : null}
    </div>
  );
}
