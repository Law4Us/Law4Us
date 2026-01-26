"use client";

import * as React from "react";
import * as Popover from "@radix-ui/react-popover";
import { DayPicker } from "react-day-picker";
import { he } from "react-day-picker/locale";
import { format, parse, isValid } from "date-fns";
import { he as heLocale } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

interface DatePickerProps {
  id?: string;
  value?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

export function DatePicker({
  id,
  value,
  onChange,
  onBlur,
  placeholder = "בחר תאריך",
  error,
  disabled,
  minDate,
  maxDate,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Parse the string value to Date
  const selectedDate = React.useMemo(() => {
    if (!value) return undefined;
    const parsed = parse(value, "yyyy-MM-dd", new Date());
    return isValid(parsed) ? parsed : undefined;
  }, [value]);

  // Default month to show (selected date or 25 years ago for birth dates)
  const defaultMonth = React.useMemo(() => {
    if (selectedDate) return selectedDate;
    if (maxDate && maxDate <= new Date()) {
      const defaultYear = new Date();
      defaultYear.setFullYear(defaultYear.getFullYear() - 25);
      return defaultYear;
    }
    return new Date();
  }, [selectedDate, maxDate]);

  // Handle date selection
  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onChange(format(date, "yyyy-MM-dd"));
    }
    setIsOpen(false);
  };

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          id={id}
          disabled={disabled}
          onBlur={onBlur}
          aria-expanded={isOpen}
          className={cn(
            "flex w-full items-center justify-between rounded-input bg-neutral-100 px-4 py-3",
            "text-body-sm font-medium text-neutral-900",
            "shadow-input transition-smooth",
            "focus-visible:outline-none focus-visible:shadow-input-focus",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "shadow-input-error focus-visible:shadow-input-error",
            !selectedDate && "text-neutral-900/40 font-normal"
          )}
        >
          <span>
            {selectedDate
              ? format(selectedDate, "dd/MM/yyyy", { locale: heLocale })
              : placeholder}
          </span>
          <CalendarIcon className="h-5 w-5 text-neutral-600" />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className={cn(
            "z-50 bg-white rounded-xl shadow-lg border-2 border-neutral-light p-4",
            "animate-scale-in",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[side=bottom]:slide-in-from-top-2",
            "data-[side=top]:slide-in-from-bottom-2"
          )}
          sideOffset={8}
          align="start"
          side="bottom"
          avoidCollisions={true}
          collisionPadding={16}
        >
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            locale={he}
            dir="rtl"
            defaultMonth={defaultMonth}
            fromDate={minDate}
            toDate={maxDate}
            captionLayout="dropdown"
            startMonth={new Date(1920, 0)}
            endMonth={new Date()}
            classNames={{
              root: "rdp-root",
              months: "flex flex-col",
              month: "space-y-4",
              month_caption: "flex justify-between items-center gap-2 mb-4",
              caption_label: "text-body font-semibold hidden",
              dropdowns: "flex gap-2 justify-center order-2",
              dropdown: cn(
                "bg-white border border-neutral-200 rounded-lg px-3 py-2",
                "text-body-sm focus:outline-none focus:ring-2 focus:ring-primary",
                "cursor-pointer"
              ),
              nav: "contents",
              button_previous: cn(
                "h-8 w-8 bg-neutral-50 hover:bg-neutral-100 rounded-lg",
                "flex items-center justify-center order-3",
                "focus:outline-none focus:ring-2 focus:ring-primary",
                "border border-neutral-200 transition-colors"
              ),
              button_next: cn(
                "h-8 w-8 bg-neutral-50 hover:bg-neutral-100 rounded-lg",
                "flex items-center justify-center order-1",
                "focus:outline-none focus:ring-2 focus:ring-primary",
                "border border-neutral-200 transition-colors"
              ),
              chevron: "w-4 h-4 text-neutral-600",
              weekdays: "flex mb-2",
              weekday:
                "text-neutral-600 rounded-md w-10 font-normal text-sm text-center",
              week: "flex w-full mt-1",
              day: "text-center text-sm p-0",
              day_button: cn(
                "h-10 w-10 p-0 font-normal rounded-lg",
                "hover:bg-primary/10 hover:text-primary",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              ),
              selected:
                "bg-primary text-white hover:bg-primary-dark hover:text-white rounded-lg",
              today: "bg-neutral-100 text-neutral-900 rounded-lg",
              outside: "text-neutral-400 opacity-50",
              disabled: "text-neutral-400 opacity-50 cursor-not-allowed",
              hidden: "invisible",
            }}
            components={{
              Chevron: ({ orientation }) =>
                orientation === "left" ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                ),
            }}
          />

          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
