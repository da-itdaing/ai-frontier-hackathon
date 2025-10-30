import * as React from "react";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";

export type DateRange = { from?: Date; to?: Date };

function format(date?: Date) {
  if (!date) return "";
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function DateRangeField({
  value,
  onChange,
  placeholder = "기간 선택",
}: {
  value: DateRange;
  onChange: (v: DateRange) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const label = value?.from && value?.to ? `${format(value.from)} ~ ${format(value.to)}` : placeholder;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start text-left font-normal">
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={value?.from ?? new Date()}
          selected={value}
          onSelect={(range: any) => {
            const v = range as DateRange;
            onChange(v);
            if (v?.from && v?.to) setOpen(false);
          }}
          numberOfMonths={1}
        />
      </PopoverContent>
    </Popover>
  );
}

export function dateRangeToText(value: DateRange): string | undefined {
  if (!value?.from || !value?.to) return undefined;
  return `${format(value.from)} ~ ${format(value.to)}`;
}
