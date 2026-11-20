// Leonida Platinum Route: a story-ordered journey map over the 55 official GTA VI trophies.
// Data: app/data/trophies.json (official names, descriptions, grades; our own guides) and
// app/data/chapters.json (the 9 chapters of the route). Progress lives in localStorage.
const KEY = 'leonida-platinum-route-v2';
const DEMO_EARNED = [2, 3, 4, 8, 44, 16, 20, 21, 46, 35, 42, 52, 53];
const view = document.getElementById('view');
const searchEl = document.getElementById('search');
const kindEl = document.getElementById('kind');
const gradeEl = document.getElementById('grade');
const spoilersEl = document.getElementById('spoilers');
const hideEarnedEl = document.getElementById('hideEarned');

const data = await (await fetch('data/trophies.json')).json();
const chaptersData = await (await fetch('data/chapters.json')).json();
const trophies = data.trophies;
const chapters = chaptersData.chapters;
const byId = new Map(trophies.map((t) => [t.id, t]));
const chapterOf = new Map();
for (const c of chapters) for (const id of c.trophies) chapterOf.set(id, c);

let earned = new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]'));
if (new URLSearchParams(location.search).has('demo') && earned.size === 0) {
  earned = new Set(DEMO_EARNED);
  save();
}

function save() {
  localStorage.setItem(KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

function gradeTag(t) {
  return `<span class="tag ${t.grade}">${t.grade}</span>`;
}
function kindTag(t) {
  if (t.kind === t.grade) return '';
  return `<span class="tag kind">${t.kind}</span>`;
}
function missableTag(t) {
  return t.missable ? '<span class="tag missable">⚠ missable</span>' : '';
}
function hiddenTag(t) {
  return t.hidden ? '<span class="tag hidden">hidden on PSN</span>' : '';
}
function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function spoilerHidden(t) {
  return spoilersEl.checked && t.kind === 'story' && !earned.has(t.id);
}
function trophyName(t) {
  return spoilerHidden(t) ? 'Hidden story trophy — earn it to reveal its name' : esc(t.name);
}
function trophyDesc(t) {
  return spoilerHidden(t) ? 'Its name and description stay hidden until you earn it.' : esc(t.description);
}

function updateProgress() {
  const total = trophies.length;
  const missableLeft = trophies.filter((t) => t.missable && !earned.has(t.id)).length;
  document.getElementById('progressCount').textContent = `${earned.size} / ${total}`;
  document.getElementById('progressBar').style.width = `${Math.round((earned.size / total) * 100)}%`;
  document.getElementById('progressText').textContent = `${earned.size} earned · ${missableLeft} missable left · ${total - earned.size} to go`;
}

function sourceLinks() {
  const ex = document.createElement('a');
  ex.href = data.sources.exophase;
  ex.textContent = 'Exophase (official list)';
  ex.target = '_blank';
  ex.rel = 'noopener';
  const ps = document.createElement('a');
  ps.href = data.sources.psnprofiles;
  ps.textContent = 'PSNProfiles';
  ps.target = '_blank';
  ps.rel = 'noopener';
  return [ex, ps];
}

function trophyRow(t) {
  const row = document.createElement('div');
  row.className = 'row' + (earned.has(t.id) ? ' earned' : '');
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.id);
  box.setAttribute('aria-label', `Earned: ${t.name}`);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.id);
    else earned.delete(t.id);
    save();
    render();
  });
  const body = document.createElement('div');
  body.className = 'body';
  const name = document.createElement('div');
  name.className = 'name';
  const link = document.createElement('a');
  link.href = `#/trophy/${t.id}`;
  link.innerHTML = trophyName(t);
  name.append(link);
  const desc = document.createElement('div');
  desc.className = 'desc';
  desc.innerHTML = trophyDesc(t);
  const tags = document.createElement('div');
  tags.innerHTML = gradeTag(t) + kindTag(t) + missableTag(t) + hiddenTag(t) +
    `<span class="tag kind">Ch ${t.chapter}</span><span class="tag kind">${esc(t.difficulty)} · ${esc(t.time)}</span>`;
  const guide = document.createElement('div');
  guide.className = 'guide';
  guide.textContent = spoilerHidden(t) ? '' : t.guide;
  body.append(name, desc, tags, guide);
  row.append(box, body);
  return row;
}

function filtered(list) {
  const q = searchEl.value.trim().toLowerCase();
  return list.filter((t) => {
    if (kindEl.value === 'missable' && !t.missable) return false;
    if (kindEl.value === 'online') return false;
    if (kindEl.value !== 'all' && kindEl.value !== 'missable' && kindEl.value !== 'online' && t.kind !== kindEl.value) return false;
    if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
    if (hideEarnedEl.checked && earned.has(t.id)) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.guide.toLowerCase().includes(q))) return false;
    return true;
  });
}

function renderMap() {
  view.innerHTML = `<h2>The map of Leonida</h2>
  <p class="lede">Nine chapters, one road. Each pin is a chapter of the route; tap a pin or a chapter card to see its trophies in story order. The map is drawn by this guide — no Rockstar artwork.</p>
  <div class="mapWrap"><svg viewBox="0 0 1000 700" role="img" aria-label="Illustrated map of Leonida with nine chapter pins">
  <rect x="0" y="0" width="1000" height="700" fill="#f3e9c8"/>
  <path d="M0,120 C180,60 320,180 470,140 C640,95 780,190 1000,120 L1000,0 L0,0 Z" fill="#bcd6e8"/>
  <path d="M0,560 C200,500 350,620 520,560 C700,500 850,600 1000,540 L1000,700 L0,700 Z" fill="#bcd6e8"/>
  <path d="M120,700 C200,520 160,380 260,300 C340,240 300,120 420,60" fill="none" stroke="#d9c98f" stroke-width="14"/>
  <path d="M260,300 C420,340 560,260 700,300 C820,330 880,260 960,300" fill="none" stroke="#d9c98f" stroke-width="14"/>
  <path d="M420,60 C460,220 380,420 520,560" fill="none" stroke="#d9c98f" stroke-width="10"/>
  <text class="district" x="620" y="180">VICE CITY</text>
  <text class="district" x="820" y="380">OCEAN BEACH</text>
  <text class="district" x="480" y="640">LEONIDA KEYS</text>
  <text class="district" x="120" y="260">PORT GELLHORN</text>
  <text class="district" x="700" y="520">AMBROSIA</text>
  <text class="district" x="330" y="90">MOUNT KALAGA</text>
  <text class="district" x="240" y="560">GRASSRIVERS</text>
  <text class="legend" x="20" y="690">Drawn map — districts placed for the route, not to scale.</text>
  ${chapters.map((c) => {
    const done = c.trophies.filter((id) => earned.has(id)).length;
    return `<a href="#/route" class="pin${done === c.trophies.length ? ' done' : ''}"><g transform="translate(${c.map.x},${c.map.y})"><circle r="17"/><text y="5">${c.id}</text><title>Chapter ${c.id}: ${esc(c.name)} — ${done}/${c.trophies.length} earned</title></g></a>`;
  }).join('')}
  </svg></div>
  <div class="chapters" id="chapterCards"></div>`;
  const cards = document.getElementById('chapterCards');
  for (const c of chapters) {
    const done = c.trophies.filter((id) => earned.has(id)).length;
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<h3><a href="#/route">Ch ${c.id} · ${esc(c.name)}</a></h3>
      <p class="muted">${esc(c.district)} · ${done}/${c.trophies.length} earned</p>
      <p>${esc(c.goal)}</p>`;
    cards.append(card);
  }
}

function renderRoute() {
  view.innerHTML = `<h2>The route — 9 chapters in story order</h2>
  <p class="lede">Play the chapters in order. Story trophies come first; collectibles, activities and heists follow; the platinum closes the road. Use the filters above to narrow any chapter's list.</p><div id="chapters"></div>`;
  const host = document.getElementById('chapters');
  for (const c of chapters) {
    const done = c.trophies.filter((id) => earned.has(id)).length;
    const sec = document.createElement('section');
    sec.innerHTML = `<h3>Chapter ${c.id} — ${esc(c.name)} <span class="muted">(${esc(c.district)} · ${done}/${c.trophies.length})</span></h3>
      <p class="lede">${esc(c.goal)} ${esc(c.note)}</p>`;
    const list = document.createElement('div');
    list.className = 'list';
    for (const t of filtered(c.trophies.map((id) => byId.get(id)))) list.append(trophyRow(t));
    if (!list.children.length) list.innerHTML = '<div class="empty">No trophies in this chapter match the current filters.</div>';
    sec.append(list);
    host.append(sec);
  }
}

function renderTracker() {
  const list = filtered(trophies);
  const demo = new URLSearchParams(location.search).has('demo');
  view.innerHTML = `<h2>Tracker — ${earned.size} of ${trophies.length} earned</h2>
  ${demo ? '<p class="lede"><strong>Demo progress:</strong> 13 trophies are pre-ticked so you can see the tracker at work. Use Reset progress below to start from zero.</p>' : ''}
  <p class="lede">Tick trophies off as you earn them; progress is saved in this browser. Export a backup file, or import one to restore it on another device. Spoiler mode hides story trophies until earned.</p><div class="list" id="tlist"></div>`;
  const host = document.getElementById('tlist');
  if (kindEl.value === 'online') {
    host.innerHTML = '<div class="empty">No online trophies in the official list — every one of the 55 is earned in single-player. The online filter is here because the rules ask for it.</div>';
  }
  for (const t of list) host.append(trophyRow(t));
  if (!list.length && kindEl.value !== 'online') host.innerHTML = '<div class="empty">No trophies match the current filters.</div>';
}

function renderMissable() {
  const list = filtered(trophies.filter((t) => t.missable));
  view.innerHTML = `<h2>Missable trophies — ${list.length} flagged</h2>
  <p class="lede">Flags are built from the official descriptions: these trophies need a specific setup, a partner, a choice, or a one-time moment. They are watch-outs, not confirmed misses — the game is new and nothing here has been checked in play yet. Read each guide before you start its job.</p><div class="list" id="mlist"></div>`;
  const host = document.getElementById('mlist');
  for (const t of list) host.append(trophyRow(t));
  if (!list.length) host.innerHTML = '<div class="empty">No missable trophies match the current filters.</div>';
}

function renderRoadmap() {
  view.innerHTML = `<h2>Roadmap to the platinum</h2>
  <p class="lede">Built from the official descriptions. Roughly 60+ hours for the full route.</p>
  <ol class="steps">
  ${chapters.map((c) => {
    const done = c.trophies.filter((id) => earned.has(id)).length;
    return `<li><strong>Chapter ${c.id} — ${esc(c.name)}</strong> (${done}/${c.trophies.length} earned): ${esc(c.goal)}</li>`;
  }).join('')}
  </ol>
  <p class="lede">Finish the story chapters first, then the stranger strands, then activities and collectibles, then heists and money. Save the 100% completion trophy for last — it needs everything else done.</p>`;
}

function renderDetail(id) {
  const t = byId.get(id);
  if (!t) { location.hash = '#/map'; return; }
  const c = chapterOf.get(id);
  view.innerHTML = '';
  const d = document.createElement('div');
  d.className = 'detail';
  const h = document.createElement('h2');
  h.innerHTML = trophyName(t);
  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.innerHTML = gradeTag(t) + kindTag(t) + missableTag(t) + hiddenTag(t) +
    `<span class="tag kind">Chapter ${t.chapter} — ${esc(c ? c.name : '')}</span><span class="tag kind">${esc(t.difficulty)} · about ${esc(t.time)}</span>`;
  const desc = document.createElement('p');
  desc.className = 'desc';
  desc.innerHTML = `<strong>Official description:</strong> ${trophyDesc(t)}`;
  const guide = document.createElement('p');
  guide.className = 'guide';
  guide.textContent = spoilerHidden(t) ? '' : t.guide;
  const src = document.createElement('p');
  src.className = 'sources';
  src.textContent = 'Sources: ';
  const [ex, ps] = sourceLinks();
  src.append(ex, document.createTextNode(' for the official name, description and grade; '), ps, document.createTextNode(' for the grade and PSN progress target; our own advice from the official description, not yet checked in the game.'));
  const actions = document.createElement('p');
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.textContent = earned.has(t.id) ? '✓ Earned — mark as not earned' : 'Mark as earned';
  toggle.addEventListener('click', () => { earned.has(t.id) ? earned.delete(t.id) : earned.add(t.id); save(); render(); });
  const back = document.createElement('a');
  back.href = '#/route';
  back.textContent = '← Back to the route';
  back.style.marginLeft = '12px';
  actions.append(toggle, back);
  const nextIds = c ? c.trophies : [];
  const pos = nextIds.indexOf(id);
  let next = null;
  if (pos >= 0 && pos + 1 < nextIds.length) {
    const nextT = byId.get(nextIds[pos + 1]);
    next = document.createElement('p');
    const nextLink = document.createElement('a');
    nextLink.href = `#/trophy/${nextT.id}`;
    nextLink.textContent = `Next in Chapter ${t.chapter}: ${spoilerHidden(nextT) ? 'hidden story trophy' : nextT.name} →`;
    next.append(nextLink);
  }
  d.append(h, meta, desc, guide, src, actions);
  if (next) d.append(next);
  view.append(d);
}

function render() {
  updateProgress();
  const hash = location.hash || '#/map';
  const m = hash.match(/^#\/trophy\/(\d+)$/);
  document.querySelectorAll('.tabs a').forEach((a) => a.classList.toggle('active', hash.startsWith('#/' + a.dataset.view)));
  if (m) { renderDetail(Number(m[1])); return; }
  if (hash === '#/route') renderRoute();
  else if (hash === '#/tracker') renderTracker();
  else if (hash === '#/missable') renderMissable();
  else if (hash === '#/roadmap') renderRoadmap();
  else renderMap();
}

document.getElementById('exportBtn').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify({ app: 'leonida-platinum-route', earned: [...earned].sort((x, y) => x - y) }, null, 2)], { type: 'application/json' }));
  a.download = 'leonida-platinum-route-progress.json';
  a.click();
});
document.getElementById('importFile').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    const ids = Array.isArray(parsed) ? parsed : parsed.earned;
    const next = new Set(ids.filter((n) => byId.has(n)));
    earned = next;
    save();
    render();
  } catch { alert('That file is not a progress export from this guide.'); }
});
document.getElementById('resetBtn').addEventListener('click', () => {
  if (confirm('Clear all earned trophies?')) { earned = new Set(); save(); render(); }
});
for (const el of [searchEl, kindEl, gradeEl, spoilersEl, hideEarnedEl]) el.addEventListener('input', render);
window.addEventListener('hashchange', render);
render();
