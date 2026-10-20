/**
 * Date determination helper for booking slips across BRYME platform.
 * Enables clear distinction between fresh Today slips and outdated/archived Yesterday slips.
 */

export const CURRENT_DATE_STR = '2026-10-20';
export const YESTERDAY_DATE_STR = '2026-10-19';

export function isTodayCode(item) {
  if (!item) return false;
  if (item.isToday === true) return true;
  if (item.assignedDate === CURRENT_DATE_STR) return true;
  
  if (typeof item.dropTime === 'string') {
    const dt = item.dropTime.toLowerCase();
    if (dt.includes('today') || dt.includes('just now')) return true;
    if (dt.includes('yesterday') || dt.includes('oct 19') || dt.includes('oct 18') || dt.includes('oct 17')) return false;
  }

  if (item.createdAt && typeof item.createdAt === 'number') {
    const ageHours = (Date.now() - item.createdAt) / (1000 * 60 * 60);
    if (ageHours < 24) return true;
  }

  // Default to today for newly generated items without explicit date
  return Boolean(item.isNew);
}

export function formatCodeDateBadge(item) {
  const isToday = isTodayCode(item);
  if (isToday) {
    return {
      label: '🟢 Today, Oct 20',
      isToday: true,
      badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
    };
  }

  const raw = item?.assignedDate || item?.dropTime || YESTERDAY_DATE_STR;
  const label = raw.includes('Yesterday') || raw === YESTERDAY_DATE_STR ? '🕒 Yesterday, Oct 19' : `🕒 ${raw}`;

  return {
    label,
    isToday: false,
    badgeClass: 'bg-slate-200 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700/60'
  };
}
