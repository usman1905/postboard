import { test } from 'node:test';
import assert from 'node:assert/strict';
import { iso, monthGrid, postsOn, reschedule, decide, validatePost, monthCounts } from '../src/calendar.js';

test('grid starts on Monday and covers whole weeks', () => {
  const g = monthGrid(2026, 10); // November 2026 starts on a Sunday
  assert.equal(g.length % 7, 0);
  assert.equal(new Date(g[0].date + 'T00:00').getDay(), 1);
  assert.equal(g.filter(c => c.inMonth).length, 30);
  assert.equal(g.find(c => c.inMonth).date, '2026-11-01');
});

test('a month starting on Monday has no leading days', () => {
  const g = monthGrid(2026, 5); // June 2026
  assert.equal(g[0].date, '2026-06-01');
  assert.equal(g.length, 35);
});

test('iso uses local date parts', () => {
  assert.equal(iso(new Date(2026, 0, 5, 23, 30)), '2026-01-05');
});

test('posts on a day are sorted by time', () => {
  const posts = [{ id: 1, date: '2026-11-02', time: '19:00' }, { id: 2, date: '2026-11-02', time: '07:00' }, { id: 3, date: '2026-11-03', time: '08:00' }];
  assert.deepEqual(postsOn(posts, '2026-11-02').map(p => p.id), [2, 1]);
});

test('moving a published post into the future makes it approved again', () => {
  const p = { id: 1, date: '2026-11-01', status: 'published' };
  assert.equal(reschedule(p, '2026-11-30', '2026-11-18').status, 'approved');
  assert.equal(reschedule(p, '2026-11-05', '2026-11-18').status, 'published');
  assert.equal(p.date, '2026-11-01', 'original post is not mutated');
});

test('approval decisions', () => {
  assert.equal(decide({ status: 'review' }, true).status, 'approved');
  assert.equal(decide({ status: 'review' }, false).status, 'draft');
});

test('post validation', () => {
  const ok = { caption: 'Hello', date: '2026-11-20', time: '19:00', status: 'draft' };
  assert.equal(validatePost(ok), '');
  assert.match(validatePost({ ...ok, caption: '  ' }), /caption/);
  assert.match(validatePost({ ...ok, caption: 'x'.repeat(2201) }), /2200/);
  assert.match(validatePost({ ...ok, status: 'live' }), /status/);
});

test('month counts by status', () => {
  const posts = [{ date: '2026-11-01', status: 'published' }, { date: '2026-11-09', status: 'review' }, { date: '2026-12-01', status: 'draft' }];
  assert.deepEqual(monthCounts(posts, '2026-11'), { total: 2, draft: 0, review: 1, approved: 0, published: 1 });
});
