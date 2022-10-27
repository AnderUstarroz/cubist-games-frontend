import { format, addDays } from "date-fns";

export const format_time = (date: Date) => {
  const today = new Date();
  const day = format(date, "yyyy-MM-dd");
  if (format(today, "yyyy-MM-dd") === day) {
    return format(date, "'Today', hh:mm aa");
  }
  if (format(addDays(today, 1), "yyyy-MM-dd") === day) {
    return format(date, "'Tomorrow', hh:mm aa");
  }
  return format(date, "MMM dd, hh:mm aa");
};
