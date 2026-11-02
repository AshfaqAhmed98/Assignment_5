"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { eventTypes, type EventType } from "@/lib/events";

export default function EventTypeSelect({
  id,
  name,
  defaultValue = "",
  placeholder = "Choose a type",
}: {
  id: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  const initialValue = eventTypes.find((type) => type === defaultValue) ?? "";
  const [value, setValue] = useState<EventType | "">(initialValue);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(eventTypes.findIndex((type) => type === initialValue), 0),
  );
  const [isInvalid, setIsInvalid] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selectedIndex = eventTypes.findIndex((type) => type === value);

  function chooseType(type: EventType) {
    setValue(type);
    setActiveIndex(eventTypes.findIndex((option) => option === type));
    setIsInvalid(false);
    setIsOpen(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      setIsOpen(true);
      setActiveIndex((index) =>
        (index + direction + eventTypes.length) % eventTypes.length,
      );
      return;
    }

    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex(event.key === "Home" ? 0 : eventTypes.length - 1);
      return;
    }

    if (event.key === "Escape") {
      setIsOpen(false);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (isOpen) {
        const activeType = eventTypes[activeIndex];
        if (activeType) {
          chooseType(activeType);
        }
      } else {
        setActiveIndex(selectedIndex < 0 ? 0 : selectedIndex);
        setIsOpen(true);
      }
    }
  }

  return (
    <div
      className="event-type-dropdown mt-2"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsOpen(false);
        }
      }}
    >
      <select
        aria-hidden="true"
        className="sr-only"
        name={name}
        required
        tabIndex={-1}
        value={value}
        onChange={() => {}}
        onInvalid={(event) => {
          event.preventDefault();
          setIsInvalid(true);
          setIsOpen(true);
          triggerRef.current?.focus();
        }}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {eventTypes.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={`${id}-options`}
        aria-activedescendant={
          isOpen ? `${id}-option-${activeIndex}` : undefined
        }
        aria-required="true"
        aria-invalid={isInvalid}
        aria-describedby={isInvalid ? `${id}-error` : undefined}
        className={`event-type-trigger w-full ${
          isInvalid ? "event-type-trigger-invalid" : ""
        }`}
        onClick={() => {
          setIsOpen((open) => {
            if (!open) {
              setActiveIndex(selectedIndex < 0 ? 0 : selectedIndex);
            }
            return !open;
          });
        }}
        onKeyDown={handleKeyDown}
      >
        <span className={value ? "" : "event-type-placeholder"}>
          {value || placeholder}
        </span>
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`size-4 shrink-0 transition-transform ${
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
      <ul
        id={`${id}-options`}
        role="listbox"
        aria-labelledby={id}
        className="event-type-options"
        data-open={isOpen}
      >
        {eventTypes.map((type, index) => (
          <li
            key={type}
            id={`${id}-option-${index}`}
            role="option"
            aria-selected={value === type}
            className={`event-type-option ${
              activeIndex === index ? "event-type-option-active" : ""
            }`}
            onMouseDown={(event) => event.preventDefault()}
            onMouseEnter={() => setActiveIndex(index)}
            onClick={() => chooseType(type)}
          >
            <span>{type}</span>
            {value === type && (
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="size-4 text-violet-300"
              >
                <path
                  fillRule="evenodd"
                  d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.25 7.313a1 1 0 0 1-1.42.003L3.29 9.314a1 1 0 0 1 1.42-1.407l4.04 4.08 6.54-6.592a1 1 0 0 1 1.414-.105Z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </li>
        ))}
      </ul>
      {isInvalid && (
        <p id={`${id}-error`} className="event-type-error" role="alert">
          Choose an event type.
        </p>
      )}
    </div>
  );
}
