export function getKoreanMonthWeek(dateString: string): string {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '';

  // 1. Find the Thursday of the given week (Monday-based)
  // getDay(): 0=Sun, 1=Mon, ..., 6=Sat
  // Convert to 0=Mon, ..., 6=Sun
  const dayOfWeek = (d.getDay() + 6) % 7;
  const thursday = new Date(d);
  thursday.setDate(d.getDate() - dayOfWeek + 3);

  // 2. The Target Month is determined by that Thursday
  const targetYear = thursday.getFullYear();
  const targetMonth = thursday.getMonth() + 1; // 1-12

  // 3. Find the first Thursday of the Target Month
  const firstThursday = new Date(targetYear, targetMonth - 1, 1);
  while (firstThursday.getDay() !== 4) { // 4 is Thursday
    firstThursday.setDate(firstThursday.getDate() + 1);
  }

  // 4. Calculate week number (difference in weeks between the two Thursdays + 1)
  const diffDays = Math.round((thursday.getTime() - firstThursday.getTime()) / (86400000));
  const weekNumber = Math.round(diffDays / 7) + 1;

  return `${targetMonth}월 ${weekNumber}주차`;
}
