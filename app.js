import { STATUS_LABEL, iso, monthGrid, postsOn, reschedule, decide, validatePost, monthCounts } from './src/calendar.js';

const KEY = 'postboard.v1';
const BRANDS = [
  { id: 'zivoire', name: 'Zivoire', color: '#ff8a65' },
  { id: 'cafe', name: 'Brew Lane Café', color: '#f6c453' },
  { id: 'fit', name: 'Pulse Gym', color: '#7aa7ff' }
];

const todayIso = () => iso(new Date());

/* ---------- sample plan for the current month ---------- */
function seed() {
  const base = new Date(); base.setDate(1);
  const on = day => iso(new Date(base.getFullYear(), base.getMonth(), day));
  const t = todayIso();
  const p = (id, brand, day, time, platform, format, caption) => {
    const date = on(day);
    const status = date < t ? 'published' : ({ 0: 'draft', 1: 'approved', 2: 'review', 3: 'approved' })[id % 4];
    return { id, brand, date, time, platform, format, caption, status };
  };
  return {
    posts: [
      p(1, 'zivoire', 2, '19:00', 'Instagram', 'Reel', 'Unboxing the gold foil ring set. Every piece arrives as a gift ✨'),
      p(2, 'cafe', 3, '08:30', 'Instagram', 'Single image', 'Monday starts with a flat white. Buy one, get the second half price until 11.'),
      p(3, 'fit', 4, '06:00', 'TikTok', 'Reel', '30-second core finisher you can do anywhere.'),
      p(4, 'zivoire', 6, '20:00', 'TikTok', 'Reel', '316L vs 304 steel: why our jewellery does not fade.'),
      p(5, 'cafe', 8, '16:00', 'Facebook', 'Carousel', 'New winter menu: cinnamon latte, gajar halwa cake, hot chocolate.'),
      p(6, 'fit', 9, '18:00', 'Instagram', 'Carousel', 'Member transformation: 12 weeks, 9 kg down.'),
      p(7, 'zivoire', 11, '19:30', 'Instagram', 'Carousel', 'Gift guide: five pieces under Rs 1,000.'),
      p(8, 'cafe', 13, '09:00', 'Instagram', 'Story', 'Poll: which pastry should we bake next?'),
      p(9, 'fit', 15, '07:00', 'Instagram', 'Reel', 'Coach tip: progressive overload explained in 40 seconds.'),
      p(10, 'zivoire', 16, '20:00', 'Instagram', 'Reel', 'Launch sale ends tonight. Use code ZIVOIRE10 for 10% off.'),
      p(11, 'cafe', 18, '12:00', 'TikTok', 'Reel', 'Behind the bar: how we pull the perfect espresso.'),
      p(12, 'fit', 19, '18:30', 'Facebook', 'Single image', 'Ramadan timings: open 9 pm to 2 am.'),
      p(13, 'zivoire', 20, '19:00', 'Instagram', 'Reel', 'Styling the heart diamond necklace three ways.'),
      p(14, 'cafe', 22, '08:00', 'Instagram', 'Carousel', 'Meet our baristas.'),
      p(15, 'fit', 23, '06:30', 'TikTok', 'Reel', 'Beginner leg day, no machines needed.'),
      p(16, 'zivoire', 24, '20:30', 'Facebook', 'Carousel', 'Customer reviews of the week.'),
      p(17, 'cafe', 26, '17:00', 'Instagram', 'Reel', 'Latte art challenge with our regulars.'),
      p(18, 'fit', 27, '19:00', 'Instagram', 'Story', 'Free trial week sign-up link.'),
      p(19, 'zivoire', 28, '19:00', 'TikTok', 'Reel', 'Packing your orders: the Zivoire gift bag.'),
      p(20, 'fit', 2, '07:00', 'Instagram', 'Story', 'New month, new goals. Share yours.'),
      p(21, 'cafe', 6, '13:00', 'Instagram', 'Reel', 'Lunch combo of the week.'),
      p(22, 'zivoire', 9, '21:00', 'Instagram', 'Story', 'Sneak peek: new earrings drop Friday.'),
      p(23, 'cafe', 16, '10:00', 'Facebook', 'Single image', 'Weekend brunch is back.'),
      p(24, 'fit', 18, '19:00', 'Instagram', 'Carousel', 'Five habits our top members share.'),
      p(25, 'zivoire', 22, '19:00', 'Instagram', 'Reel', 'Daisy ring set: stack it your way.'),
      p(26, 'cafe', 25, '08:30', 'Instagram', 'Single image', 'Rainy day special: hot chocolate.'),
      p(27, 'fit', 29, '08:00', 'TikTok', 'Reel', 'Sunday stretch routine.'),
      p(28, 'zivoire', 30, '20:00', 'Facebook', 'Carousel', 'Month recap and your favourite pieces.')
    ]
  };
}

let db;
try { db = JSON.parse(localStorage.getItem(KEY)) || seed(); } catch { db = seed(); }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch { /* ignore */ } };
let month = new Date(); month.setDate(1);
const active = new Set(BRANDS.map(b => b.id));

const $ = s => document.querySelector(s);
const brandOf = id => BRANDS.find(b => b.id === id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const visible = () => db.posts.filter(p => active.has(p.brand));

/* ---------- brand filter ---------- */
function renderChips() {
  $('#brandChips').innerHTML = BRANDS.map(b => `<button class="chip${active.has(b.id) ? ' on' : ''}" data-brand="${b.id}" aria-pressed="${active.has(b.id)}"><i style="background:${b.color}"></i>${b.name}</button>`).join('');
}
$('#brandChips').addEventListener('click', e => {
  const c = e.target.closest('[data-brand]'); if (!c) return;
  const id = c.dataset.brand;
  if (active.has(id) && active.size > 1) active.delete(id); else active.add(id);
  render();
});

/* ---------- calendar ---------- */
function renderCalendar() {
  $('#monthTitle').textContent = month.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  const t = todayIso();
  const posts = visible();
  let html = '';
  for (const cell of monthGrid(month.getFullYear(), month.getMonth())) {
    const key = cell.date, list = postsOn(posts, key);
    html += `<div class="day${cell.inMonth ? '' : ' out'}${key === t ? ' today' : ''}" data-date="${key}">
      <span class="day__n">${cell.day}</span>
      ${list.slice(0, 3).map(p => `<div class="post" draggable="true" data-id="${p.id}" style="--c:${brandOf(p.brand).color}" title="${esc(brandOf(p.brand).name + ' · ' + p.platform + ' ' + p.format + ' · ' + STATUS_LABEL[p.status])}"><i class="st st--${p.status}"></i><time>${p.time}</time><span>${esc(p.caption)}</span></div>`).join('')}
      ${list.length > 3 ? `<span class="more">+${list.length - 3} more</span>` : ''}
    </div>`;
  }
  $('#cal').innerHTML = html;
}

/* drag and drop to reschedule */
let dragId = null;
$('#cal').addEventListener('dragstart', e => { const p = e.target.closest('.post'); if (!p) return; dragId = +p.dataset.id; p.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; });
$('#cal').addEventListener('dragend', () => { dragId = null; document.querySelectorAll('.drop').forEach(d => d.classList.remove('drop')); });
$('#cal').addEventListener('dragover', e => { const d = e.target.closest('.day'); if (!d || dragId == null) return; e.preventDefault(); document.querySelectorAll('.drop').forEach(x => x !== d && x.classList.remove('drop')); d.classList.add('drop'); });
$('#cal').addEventListener('drop', e => {
  const d = e.target.closest('.day'); if (!d || dragId == null) return; e.preventDefault();
  const i = db.posts.findIndex(x => x.id === dragId);
  const p = (db.posts[i] = reschedule(db.posts[i], d.dataset.date, todayIso()));
  save(); render(); toast('Rescheduled to ' + new Date(p.date + 'T00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }));
});
$('#cal').addEventListener('click', e => {
  const post = e.target.closest('.post');
  if (post) { openDialog(db.posts.find(p => p.id === +post.dataset.id)); return; }
  const day = e.target.closest('.day'); if (day) openDialog(null, day.dataset.date);
});

/* ---------- side panel ---------- */
function renderSide() {
  const c = monthCounts(visible(), iso(month).slice(0, 7));
  $('#stats').innerHTML = [['Posts this month', c.total], ['Published', c.published], ['Approved', c.approved], ['Need approval', c.review]]
    .map(([k, v]) => `<div class="stat"><span>${k}</span><b>${v}</b></div>`).join('');
  const queue = visible().filter(p => p.status === 'review').sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  $('#queue').innerHTML = queue.map(p => `<li class="q"><div class="q__top"><span class="q__dot" style="background:${brandOf(p.brand).color}"></span><b>${brandOf(p.brand).name}</b>${p.platform} · ${new Date(p.date + 'T00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} ${p.time}</div><p>${esc(p.caption)}</p><div class="q__actions"><button class="approve" data-approve="${p.id}">Approve</button><button class="changes" data-changes="${p.id}">Request changes</button></div></li>`).join('') || '<li class="empty">Nothing waiting. All caught up.</li>';
}
$('#queue').addEventListener('click', e => {
  const a = e.target.closest('[data-approve]'), c = e.target.closest('[data-changes]');
  const btn = a || c; if (!btn) return;
  const id = +(btn.dataset.approve || btn.dataset.changes);
  const i = db.posts.findIndex(x => x.id === id); db.posts[i] = decide(db.posts[i], !!a);
  save(); render(); toast(a ? 'Approved and scheduled' : 'Sent back to draft with changes requested');
});

/* ---------- post dialog ---------- */
const dialog = $('#postDialog'), form = $('#postForm');
let editing = null;
$('#brandSel').innerHTML = BRANDS.map(b => `<option value="${b.id}">${b.name}</option>`).join('');
function openDialog(post, date) {
  editing = post; form.reset();
  $('#dialogTitle').textContent = post ? 'Edit post' : 'New post';
  $('#deletePostBtn').hidden = !post;
  const v = post || { brand: [...active][0], platform: 'Instagram', format: 'Reel', status: 'draft', date: date || todayIso(), time: '19:00', caption: '' };
  Object.entries(v).forEach(([k, val]) => { if (form.elements[k]) form.elements[k].value = val; });
  updateCount(); dialog.showModal();
}
const updateCount = () => ($('#count').textContent = `${form.caption.value.length} / 2200`);
form.caption.addEventListener('input', updateCount);
form.addEventListener('submit', e => {
  const f = Object.fromEntries(new FormData(form));
  const err = validatePost(f);
  if (err) { e.preventDefault(); toast(err); return; }
  if (editing) Object.assign(editing, f);
  else db.posts.push({ id: Math.max(0, ...db.posts.map(p => p.id)) + 1, ...f });
  active.add(f.brand); save(); render(); toast(editing ? 'Post updated' : 'Post added to the calendar');
});
$('#deletePostBtn').addEventListener('click', () => { db.posts = db.posts.filter(p => p !== editing); save(); dialog.close(); render(); toast('Post deleted'); });
dialog.addEventListener('click', e => { if (e.target.matches('[data-close]')) dialog.close(); });
$('#newPostBtn').addEventListener('click', () => openDialog(null));

/* ---------- month navigation ---------- */
$('#prevBtn').addEventListener('click', () => { month.setMonth(month.getMonth() - 1); render(); });
$('#nextBtn').addEventListener('click', () => { month.setMonth(month.getMonth() + 1); render(); });
$('#todayBtn').addEventListener('click', () => { month = new Date(); month.setDate(1); render(); });

let tt;
function toast(m) { const el = $('#toast'); el.textContent = m; el.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => el.classList.remove('show'), 1800); }
function render() { renderChips(); renderCalendar(); renderSide(); }
render();
