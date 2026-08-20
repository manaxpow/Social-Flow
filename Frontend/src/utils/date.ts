import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.locale("vi");

/**
 * Formats a date string or Date object into a relative time string (e.g., "5 phút trước")
 * based on Asia/Ho_Chi_Minh timezone.
 */
export const formatRelativeTime = (date?: string | Date | null): string => {
  if (!date) return "";
  return dayjs.utc(date).tz("Asia/Ho_Chi_Minh").fromNow();
};

/**
 * Alias for formatRelativeTime specifically for post creation dates.
 */
export const formatPostDate = formatRelativeTime;

export default dayjs;
