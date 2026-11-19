// Calendar maths and post rules. Pure functions, used by the app and the tests.

export const STATUSES = ['draft', 'review', 'approved', 'published'];
export const STATUS_LABEL = { draft: 'Draft', review: 'In review', approved: 'Approved', published: 'Published' };
export const CAPTION_LIMIT = 2200; // Instagram caption limit

const pad = n => String(n).padStart(2, '0');

/** Local date as YYYY-MM-DD (not UTC, so late-night posts stay on the right day). */
export const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

/**
 * Every date shown in a Monday-first month grid: leading days from the
 * previous month, the month itself, and trailing days to finish the last week.
 */
export function monthGrid(year, month) {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Math.ceil((offset + daysInMonth) / 7) * 7;
  const start = addDays(first, -offset);
  return Array.from({ length: cells }, (_, i) => {
    const d = addDays(start, i);
    return { date: iso(d), day: d.getDate(), inMonth: d.getMonth() === month };
  });
}

/** Posts on one day, earliest first. */
export const postsOn = (posts, date) => posts.filter(p => p.date === date).sort((a, b) => a.time.localeCompare(b.time));

/**
 * Move a post to a new date. A published post moved into the future can no
 * longer count as published, so it goes back to approved.
 */
export function reschedule(post, date, today) {
  const next = { ...post, date };
  if (next.status === 'published' && date > today) next.status = 'approved';
  return next;
}

/** Client decision from the approval queue. */
export const decide = (post, approved) => ({ ...post, status: approved ? 'approved' : 'draft' });

export function validatePost(p) {
  if (!p.caption || !p.caption.trim()) return 'Write a caption.';
  if (p.caption.length > CAPTION_LIMIT) return `Captions can be at most ${CAPTION_LIMIT} characters.`;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.date)) return 'Pick a date.';
  if (!/^\d{2}:\d{2}$/.test(p.time)) return 'Pick a time.';
  if (!STATUSES.includes(p.status)) return 'Choose a status.';
  return '';
}

export function monthCounts(posts, yearMonth) {
  const inMonth = posts.filter(p => p.date.slice(0, 7) === yearMonth);
  const c = { total: inMonth.length };
  STATUSES.forEach(s => (c[s] = inMonth.filter(p => p.status === s).length));
  return c;
}
