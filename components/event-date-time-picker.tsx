"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const popupWidth = 320;
const hours = Array.from({ length: 24 }, (_, hour) =>
  String(hour).padStart(2, "0"),
);
const minutes = Array.from({ length: 60 }, (_, minute) =>
  String(minute).padStart(2, "0"),
);

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTodayKey() {
  return toDateKey(new Date());
}

function formatSelectedDate(dateKey: string) {
  if (!dateKey) {
    return "Select a date";
  }

  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getInitialMonth(defaultValue: string) {
  const [datePart] = defaultValue.split("T");
  const todayKey = getTodayKey();
  if (!datePart || datePart < todayKey) {
    return new Date();
  }

  const [year, month, day] = datePart.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}

export default function EventDateTimePicker({
  id,
  name,
  defaultValue = "",
}: {
  id: string;
  name: string;
  defaultValue?: string;
}) {
  const [date, setDate] = useState(defaultValue.split("T")[0] ?? "");
  const [time, setTime] = useState(defaultValue.split("T")[1] ?? "18:00");
  const [month, setMonth] = useState(() => getInitialMonth(defaultValue));
  const [today] = useState(getTodayKey);
  const [isDateInvalid, setIsDateInvalid] = useState(false);
  const [focusedDay, setFocusedDay] = useState(() => {
    const initialDate = defaultValue.split("T")[0] ?? "";
    return initialDate && initialDate >= getTodayKey()
      ? initialDate
      : getTodayKey();
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isTimeOpen, setIsTimeOpen] = useState(false);
  const [popupStyle, setPopupStyle] = useState<CSSProperties>({});
  const [timePopupStyle, setTimePopupStyle] = useState<CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const timeTriggerRef = useRef<HTMLButtonElement>(null);
  const timePopupRef = useRef<HTMLDivElement>(null);

  const selectedDateTime = date ? `${date}T${time}` : "";
  const [selectedHour, selectedMinute] = time.split(":");
  const monthLabel = month.toLocaleDateString("en", {
    month: "long",
    year: "numeric",
  });
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const daysInMonth = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
  ).getDate();
  const days = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
  while (days.length % 7 !== 0) {
    days.push(null);
  }

  useLayoutEffect(() => {
    if (!isOpen) {
      return;
    }

    function updatePopupPosition() {
      const trigger = triggerRef.current;
      const popup = popupRef.current;
      if (!trigger || !popup) {
        return;
      }

      const rect = trigger.getBoundingClientRect();
      const width = Math.min(popupWidth, window.innerWidth - 24);
      const left = Math.max(
        12,
        Math.min(rect.left, window.innerWidth - width - 12),
      );
      const popupHeight = popup.getBoundingClientRect().height;
      const below = rect.bottom + 8;
      const top =
        below + popupHeight <= window.innerHeight - 12
          ? below
          : Math.max(12, rect.top - popupHeight - 8);

      setPopupStyle({ left, top, width });
    }

    updatePopupPosition();
    window.addEventListener("resize", updatePopupPosition);
    window.addEventListener("scroll", updatePopupPosition, true);
    return () => {
      window.removeEventListener("resize", updatePopupPosition);
      window.removeEventListener("scroll", updatePopupPosition, true);
    };
  }, [isOpen, month]);

  useLayoutEffect(() => {
    if (!isTimeOpen) {
      return;
    }

    function updateTimePopupPosition() {
      const trigger = timeTriggerRef.current;
      const popup = timePopupRef.current;
      if (!trigger || !popup) {
        return;
      }

      const rect = trigger.getBoundingClientRect();
      const width = Math.min(280, window.innerWidth - 24);
      const left = Math.max(
        12,
        Math.min(rect.right - width, window.innerWidth - width - 12),
      );
      const popupHeight = popup.getBoundingClientRect().height;
      const below = rect.bottom + 8;
      const top =
        below + popupHeight <= window.innerHeight - 12
          ? below
          : Math.max(12, rect.top - popupHeight - 8);

      setTimePopupStyle({ left, top, width });
    }

    updateTimePopupPosition();
    window.addEventListener("resize", updateTimePopupPosition);
    window.addEventListener("scroll", updateTimePopupPosition, true);
    return () => {
      window.removeEventListener("resize", updateTimePopupPosition);
      window.removeEventListener("scroll", updateTimePopupPosition, true);
    };
  }, [isTimeOpen]);

  useEffect(() => {
    if (!isOpen && !isTimeOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;
      if (
        target instanceof Node &&
        !triggerRef.current?.contains(target) &&
        !popupRef.current?.contains(target) &&
        !timeTriggerRef.current?.contains(target) &&
        !timePopupRef.current?.contains(target)
      ) {
        setIsOpen(false);
        setIsTimeOpen(false);
      }
    }

    function handleEscape(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        setIsTimeOpen(false);
        if (isTimeOpen) {
          timeTriggerRef.current?.focus();
        } else {
          triggerRef.current?.focus();
        }
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, isTimeOpen]);

  useEffect(() => {
    if (isOpen) {
      popupRef.current
        ?.querySelector<HTMLButtonElement>(".event-calendar-day[tabindex='0']")
        ?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isTimeOpen) {
      timePopupRef.current
        ?.querySelector<HTMLButtonElement>(".event-time-option-selected")
        ?.focus();
    }
  }, [isTimeOpen]);

  function moveMonth(offset: number) {
    const nextMonth = new Date(
      month.getFullYear(),
      month.getMonth() + offset,
      1,
    );
    setMonth(nextMonth);
    setFocusedDay(toDateKey(nextMonth));
  }

  function moveFocusByDays(dayKey: string, offset: number) {
    const [year, monthNumber, day] = dayKey.split("-").map(Number);
    const nextDate = new Date(year, monthNumber - 1, day + offset);
    const nextDateKey = toDateKey(nextDate);
    setFocusedDay(nextDateKey);
    setMonth(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1));
    requestAnimationFrame(() => {
      popupRef.current
        ?.querySelector<HTMLButtonElement>(
          `.event-calendar-day[data-calendar-day="${nextDateKey}"]`,
        )
        ?.focus();
    });
  }

  function handleDayKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    dayKey: string,
  ) {
    const offsets: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
    };
    const offset = offsets[event.key];
    if (offset !== undefined) {
      event.preventDefault();
      moveFocusByDays(dayKey, offset);
    }
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setIsOpen(true);
    }
  }

  function updateTimePart(part: "hour" | "minute", value: string) {
    const [hour = "18", minute = "00"] = time.split(":");
    setTime(part === "hour" ? `${value}:${minute}` : `${hour}:${value}`);
  }

  function handleTimeOptionKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    values: string[],
    value: string,
    part: "hour" | "minute",
  ) {
    const currentIndex = values.indexOf(value);
    let nextIndex = currentIndex;
    if (event.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % values.length;
    } else if (event.key === "ArrowUp") {
      nextIndex = (currentIndex - 1 + values.length) % values.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = values.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    const nextValue = values[nextIndex];
    if (!nextValue) {
      return;
    }
    updateTimePart(part, nextValue);
    requestAnimationFrame(() => {
      timePopupRef.current
        ?.querySelector<HTMLButtonElement>(
          `.event-time-option[data-${part}="${nextValue}"]`,
        )
        ?.focus();
    });
  }

  const isViewingCurrentMonth =
    today !== "" &&
    month.getFullYear() === Number(today.slice(0, 4)) &&
    month.getMonth() === Number(today.slice(5, 7)) - 1;

  return (
    <div className="event-date-time-picker mt-2">
      <div className="flex items-center gap-2">
        <button
          ref={triggerRef}
          id={id}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-controls={`${id}-calendar`}
          aria-describedby={isDateInvalid ? `${id}-error` : undefined}
          className={`event-date-trigger min-w-0 flex-1 ${
            isDateInvalid ? "event-date-trigger-invalid" : ""
          }`}
          onClick={() => setIsOpen((open) => !open)}
          onKeyDown={handleTriggerKeyDown}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-5 shrink-0 text-violet-300"
          >
            <path d="M8 3v3m8-3v3M4.5 9.5h15M6 5h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
            <path d="m9 15 2 2 4-4" />
          </svg>
          <span className={date ? "truncate text-white" : "truncate text-white/50"}>
            {formatSelectedDate(date)}
          </span>
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`size-4 shrink-0 text-white/55 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          >
            <path
              fillRule="evenodd"
              d="M5.22 7.47a.75.75 0 0 1 1.06 0L10 11.19l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 8.53a.75.75 0 0 1 0-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <button
          ref={timeTriggerRef}
          type="button"
          aria-label="Choose event time"
          aria-haspopup="dialog"
          aria-expanded={isTimeOpen}
          aria-controls={`${id}-time-options`}
          className="event-time-field flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-[#111019] px-3 text-white"
          onClick={() => {
            setIsOpen(false);
            setIsTimeOpen((open) => !open);
          }}
          onKeyDown={(event) => {
            if (
              event.key === "ArrowDown" ||
              event.key === "Enter" ||
              event.key === " "
            ) {
              event.preventDefault();
              setIsTimeOpen(true);
            }
          }}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4 text-cyan-300"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
          <span className="event-time-value">{time}</span>
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`event-time-chevron size-3.5 text-white/50 transition-transform ${
              isTimeOpen ? "rotate-180" : ""
            }`}
          >
            <path
              fillRule="evenodd"
              d="M5.22 7.47a.75.75 0 0 1 1.06 0L10 11.19l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 8.53a.75.75 0 0 1 0-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
      <input
        aria-hidden="true"
        className="sr-only"
        style={{
          position: "fixed",
          width: 1,
          height: 1,
          opacity: 0,
          pointerEvents: "none",
        }}
        name={name}
        type="datetime-local"
        required
        tabIndex={-1}
        value={selectedDateTime}
        onChange={() => {}}
        onInvalid={(event) => {
          event.preventDefault();
          setIsDateInvalid(true);
          setIsOpen(true);
          triggerRef.current?.focus();
        }}
      />
      {isOpen &&
        createPortal(
          <div
            ref={popupRef}
            id={`${id}-calendar`}
            role="dialog"
            aria-label="Choose event date"
            className="event-calendar-popup"
            style={popupStyle}
          >
            <div className="event-calendar-header">
              <div>
                <p className="event-calendar-eyebrow">EVENT DATE</p>
                <p className="event-calendar-selected">
                  {date ? formatSelectedDate(date) : "Choose a day to begin"}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  aria-label="Previous month"
                  disabled={isViewingCurrentMonth}
                  className="event-calendar-nav"
                  onClick={() => moveMonth(-1)}
                >
                  <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M12.78 4.22a.75.75 0 0 1 0 1.06L8.06 10l4.72 4.72a.75.75 0 1 1-1.06 1.06l-5.25-5.25a.75.75 0 0 1 0-1.06l5.25-5.25a.75.75 0 0 1 1.06 0Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="Next month"
                  className="event-calendar-nav"
                  onClick={() => moveMonth(1)}
                >
                  <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M7.22 4.22a.75.75 0 0 1 1.06 0l5.25 5.25a.75.75 0 0 1 0 1.06l-5.25 5.25a.75.75 0 1 1-1.06-1.06L11.94 10 7.22 5.28a.75.75 0 0 1 0-1.06Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <h3 className="event-calendar-month">{monthLabel}</h3>
            <div className="event-calendar-grid" role="grid" aria-label={monthLabel}>
              {weekDays.map((day) => (
                <span key={day} className="event-calendar-weekday" role="columnheader">
                  {day}
                </span>
              ))}
              {days.map((day, index) => {
                if (day === null) {
                  return (
                    <span
                      key={`blank-${index}`}
                      className="event-calendar-blank"
                      aria-hidden="true"
                    />
                  );
                }

                const dayKey = toDateKey(
                  new Date(month.getFullYear(), month.getMonth(), day),
                );
                const isSelected = dayKey === date;
                const isToday = dayKey === today;
                const isPast = today !== "" && dayKey < today;

                return (
                  <button
                    key={dayKey}
                    data-calendar-day={dayKey}
                    type="button"
                    role="gridcell"
                    tabIndex={focusedDay === dayKey ? 0 : -1}
                    aria-label={new Date(
                      month.getFullYear(),
                      month.getMonth(),
                      day,
                    ).toLocaleDateString("en", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                    aria-selected={isSelected}
                    disabled={isPast}
                    className={`event-calendar-day ${
                      isSelected ? "event-calendar-day-selected" : ""
                    } ${isToday ? "event-calendar-day-today" : ""}`}
                    onFocus={() => setFocusedDay(dayKey)}
                    onKeyDown={(event) => handleDayKeyDown(event, dayKey)}
                    onClick={() => {
                      setDate(dayKey);
                      setIsDateInvalid(false);
                      setFocusedDay(dayKey);
                      setIsOpen(false);
                      triggerRef.current?.focus();
                    }}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
            <div className="event-calendar-footer">
              <span>Choose today or a future date</span>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  triggerRef.current?.focus();
                }}
                className="event-calendar-done"
              >
                Done
              </button>
            </div>
          </div>,
          document.body,
        )}
      {isTimeOpen &&
        createPortal(
          <div
            ref={timePopupRef}
            id={`${id}-time-options`}
            role="dialog"
            aria-label="Choose event time"
            className="event-time-popup"
            style={timePopupStyle}
          >
            <div className="event-time-popup-header">
              <div>
                <p className="event-calendar-eyebrow">EVENT TIME</p>
                <p className="event-calendar-selected">
                  {date ? formatSelectedDate(date) : "Select a date first"}
                </p>
              </div>
              <span className="event-time-preview">{time}</span>
            </div>
            <div className="event-time-columns">
              <div className="event-time-column-wrap">
                <p className="event-time-column-label">HOUR</p>
                <div
                  className="event-time-column"
                  role="listbox"
                  aria-label="Hour"
                  aria-activedescendant={`${id}-hour-${selectedHour}`}
                >
                  {hours.map((hour) => (
                    <button
                      key={hour}
                      id={`${id}-hour-${hour}`}
                      type="button"
                      role="option"
                      aria-selected={hour === selectedHour}
                      tabIndex={hour === selectedHour ? 0 : -1}
                      data-hour={hour}
                      className={`event-time-option ${
                        hour === selectedHour
                          ? "event-time-option-selected"
                          : ""
                      }`}
                      onClick={() => updateTimePart("hour", hour)}
                      onKeyDown={(event) =>
                        handleTimeOptionKeyDown(
                          event,
                          hours,
                          selectedHour ?? "18",
                          "hour",
                        )
                      }
                    >
                      {hour}
                    </button>
                  ))}
                </div>
              </div>
              <div className="event-time-column-wrap">
                <p className="event-time-column-label">MINUTE</p>
                <div
                  className="event-time-column"
                  role="listbox"
                  aria-label="Minute"
                  aria-activedescendant={`${id}-minute-${selectedMinute}`}
                >
                  {minutes.map((minute) => (
                    <button
                      key={minute}
                      id={`${id}-minute-${minute}`}
                      type="button"
                      role="option"
                      aria-selected={minute === selectedMinute}
                      tabIndex={minute === selectedMinute ? 0 : -1}
                      data-minute={minute}
                      className={`event-time-option ${
                        minute === selectedMinute
                          ? "event-time-option-selected"
                          : ""
                      }`}
                      onClick={() => updateTimePart("minute", minute)}
                      onKeyDown={(event) =>
                        handleTimeOptionKeyDown(
                          event,
                          minutes,
                          selectedMinute ?? "00",
                          "minute",
                        )
                      }
                    >
                      {minute}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="event-calendar-footer">
              <span>24-hour local time</span>
              <button
                type="button"
                onClick={() => {
                  setIsTimeOpen(false);
                  timeTriggerRef.current?.focus();
                }}
                className="event-calendar-done"
              >
                Done
              </button>
            </div>
          </div>,
          document.body,
        )}
      {isDateInvalid && (
        <p id={`${id}-error`} className="event-calendar-error" role="alert">
          Choose an event date.
        </p>
      )}
    </div>
  );
}
