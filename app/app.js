// Leonida Platinum Route — a story-ordered trophy guide and tracker for GTA VI.
// Loads the official 55-trophy list from data/trophies.json, draws the district
// map with one pin per trophy in route order, and saves progress in localStorage.
const STORAGE_KEY = 'leonida-platinum-route-v2';
const DEMO_EARNED = [2, 44, 3, 4, 8, 5, 9, 10, 11, 6, 12, 13, 22];

const CHAPTER_COLORS = {
  1: '#0f766e', 2: '#3a8a5f', 3: '#b98a2f', 4: '#d24e2a', 5: '#7c5cbf',
  6: '#2e7fb8', 7: '#8c2f39', 8: '#6b7c8c', 9: '#a67c00',
};
const GRADE_COLORS = {
  platinum: '#7fa8c9', gold: '#d4af37', silver: '#9aa5b1', bronze: '#c98b5e',
};
const DISTRICTS = {
  'Mount Kalina': [340, 170], 'Ambrosia': [590, 150], 'North Vice': [1010, 200],
  'Vice City': [900, 460], 'Ocean Beach': [1010, 530], 'VCIA': [830, 580],
  'Port Gellhorn': [190, 400], 'Grassrivers': [340, 510], 'Leonida Bay': [680, 320],
  'Leonida Keys': [830, 655], 'Downtown': [830, 330],
};
const KIND_LABELS = {
  story: 'Story', side: 'Stranger', activity: 'Activity', collectible: 'Collectible',
  outlaw: 'Outlaw', exploration: 'Exploration', misc: 'Loose end',
};

const params = new URLSearchParams(location.search);
let earned = loadProgress();
if (params.get('demo') === '1' && !localStorage.getItem(STORAGE_KEY)) {
  earned = new Set(DEMO_EARNED);
  saveProgress();
}

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies.slice().sort((a, b) => a.stop - b.stop);
const byId = new Map(trophies.map((t) => [t.id, t]));
const chapters = doc.chapters;

const $ = (id) => document.getElementById(id);
const views = ['map', 'route', 'trophies', 'tracker', 'detail'];

function loadProgress() {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'));
  } catch {
    return new Set();
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned]));
}

function toggleEarned(id) {
  if (earned.has(id)) earned.delete(id);
  else earned.add(id);
  saveProgress();
  renderAll();
}

function nextStop() {
  return trophies.find((t) => !earned.has(t.id)) ?? null;
}

function gradeDot(t) {
  return `<span class="grade-dot" style="background:${GRADE_COLORS[t.grade]}" title="${t.grade}"></span>`;
}

function badges(t) {
  const parts = [`<span class="badge grade-${t.grade}">${t.grade}</span>`];
  parts.push(`<span class="badge">${KIND_LABELS[t.kind] ?? t.kind}</span>`);
  if (t.missable) parts.push('<span class="badge missable">Missable</span>');
  if (earned.has(t.id)) parts.push('<span class="badge earned-badge">Earned</span>');
  return parts.join('');
}

function spoilerHidden(t) {
  return $('spoilers').checked && t.kind === 'story' && !earned.has(t.id);
}

function renderHeader() {
  const count = earned.size;
  $('earned-count').textContent = count;
  $('meter-fill').style.width = `${(count / trophies.length) * 100}%`;
  const next = nextStop();
  $('next-up').textContent = next
    ? `Next stop: ${next.stop}. ${next.name} — ${chapters[next.chapter - 1].title}`
    : 'Route complete — platinum earned!';
}

function renderDistrictMap() {
  const pins = $('pins');
  const perDistrict = {};
  let html = '';
  for (const t of trophies) {
    const center = DISTRICTS[t.district] ?? DISTRICTS['Vice City'];
    const idx = perDistrict[t.district] ?? 0;
    perDistrict[t.district] = idx + 1;
    const col = idx % 5;
    const row = Math.floor(idx / 5);
    const x = center[0] + (col - 2) * 27;
    const y = center[1] + (row - 1) * 27;
    html += `<g class="pin${earned.has(t.id) ? ' earned' : ''}" data-id="${t.id}">`
      + `<circle cx="${x}" cy="${y}" r="13" fill="${CHAPTER_COLORS[t.chapter]}"></circle>`
      + `<text x="${x}" y="${y + 4}" font-size="11">${t.stop}</text>`
      + `<title>Stop ${t.stop}: ${t.name} (${chapters[t.chapter - 1].title})</title></g>`;
  }
  pins.innerHTML = html;
  pins.querySelectorAll('.pin').forEach((g) => {
    g.addEventListener('click', () => { location.hash = `#/trophy/${g.dataset.id}`; });
  });
  $('legend').innerHTML = chapters.map((c) =>
    `<span><i style="background:${CHAPTER_COLORS[c.n]}"></i>Ch ${c.n} · ${c.title}</span>`).join('');
}

function renderRoute() {
  const host = $('chapters');
  host.replaceChildren();
  for (const c of chapters) {
    const stops = trophies.filter((t) => t.chapter === c.n);
    const done = stops.filter((t) => earned.has(t.id)).length;
    const section = document.createElement('div');
    section.className = 'chapter';
    section.innerHTML = `<div class="chapter-head"><div><h3>Chapter ${c.n} — ${c.title}</h3>`
      + `<p>${c.blurb}</p></div><span class="chapter-count">${done} / ${stops.length} earned</span></div>`;
    const list = document.createElement('ul');
    list.className = 'stops';
    for (const t of stops) {
      const li = document.createElement('li');
      const hidden = spoilerHidden(t);
      li.innerHTML = `<span class="stop-num${earned.has(t.id) ? ' done' : ''}" style="background:${CHAPTER_COLORS[t.chapter]}">${t.stop}</span>`
        + `<span><span class="stop-name">${hidden ? 'Hidden story trophy' : t.name}</span>`
        + `${t.missable ? ' <span class="flag">MISSABLE</span>' : ''}<br>`
        + `<span class="stop-sub">${hidden ? 'Earn it to reveal the name.' : t.description}</span></span>`
        + `<span class="stop-meta">${gradeDot(t)}${t.grade} · ${t.difficulty} · ${t.time}</span>`;
      li.addEventListener('click', () => { location.hash = `#/trophy/${t.id}`; });
      list.append(li);
    }
    section.append(list);
    host.append(section);
  }
}

function filteredTrophies() {
  const q = $('search').value.trim().toLowerCase();
  const kind = $('kind').value;
  const grade = $('grade').value;
  const missableOnly = $('missable-only').checked;
  return trophies.filter((t) => {
    if (kind !== 'all' && t.kind !== kind) return false;
    if (grade !== 'all' && t.grade !== grade) return false;
    if (missableOnly && !t.missable) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))) return false;
    return true;
  });
}

function renderTrophyList() {
  const list = filteredTrophies();
  $('result-count').textContent = `Showing ${list.length} of 55 trophies · ${earned.size} earned`;
  const host = $('trophy-list');
  host.replaceChildren();
  for (const t of list) {
    const hidden = spoilerHidden(t);
    const card = document.createElement('article');
    card.className = `trophy-card${earned.has(t.id) ? ' earned' : ''}`;
    card.innerHTML = `<div class="card-top"><h3>Stop ${t.stop} — ${hidden ? 'Hidden story trophy' : t.name}</h3>`
      + `<span class="badges">${badges(t)}</span></div>`
      + `<p class="desc">${hidden ? 'A story trophy. Earn it to reveal its name and description.' : t.description}</p>`
      + (hidden ? '' : `<p class="guide">${t.guide}</p>`
        + `<p class="sources">Difficulty: ${t.difficulty} · Time: ${t.time} · District: ${t.district} · Chapter ${t.chapter} — ${chapters[t.chapter - 1].title}</p>`);
    card.addEventListener('click', () => { location.hash = `#/trophy/${t.id}`; });
    host.append(card);
  }
}

function renderDetail(id) {
  const t = byId.get(id);
  const host = $('detail');
  if (!t) {
    host.innerHTML = '<p>That stop is not on the route.</p>';
    return;
  }
  const hidden = spoilerHidden(t);
  const prev = trophies.find((x) => x.stop === t.stop - 1) ?? null;
  const next = trophies.find((x) => x.stop === t.stop + 1) ?? null;
  const chapter = chapters[t.chapter - 1];
  host.innerHTML = `<div class="detail-head"><div><p class="kicker">Stop ${t.stop} of 55 · Chapter ${t.chapter} — ${chapter.title}</p>`
    + `<h2>${hidden ? 'Hidden story trophy' : t.name}</h2>`
    + `<p class="desc">${hidden ? 'A story trophy. Earn it to reveal its name and description.' : t.description}</p>`
    + `<p class="detail-meta">${gradeDot(t)} ${t.grade} · ${KIND_LABELS[t.kind] ?? t.kind} · ${t.district} · Difficulty: ${t.difficulty} · Time: ${t.time}${t.missable ? ' · Missable — set it up deliberately' : ''}</p></div>`
    + `<span class="badges">${badges(t)}</span></div>`
    + (hidden
      ? '<p class="detail-guide">Spoilers are hidden until this story trophy is earned. Open it from the map or the route once you have it, or turn spoilers off in the All Trophies tab.</p>'
      : `<div class="detail-guide"><p>${t.guide}</p></div>`
        + `<p class="detail-sources">Sources: the official trophy list (Exophase) for the name, description and grade; PSNProfiles for the PSN count where one is shown. The guide is our own reading of the official description, not yet checked in the game. ${t.missable ? 'Missable means the moment can pass or the attempt can fail — set it up again or replay the mission.' : ''}</p>`)
    + `<div class="detail-actions">`
    + `<button type="button" class="${earned.has(t.id) ? 'earned-btn' : 'primary'}" id="detail-toggle">${earned.has(t.id) ? 'Earned — tap to unmark' : 'Mark as earned'}</button>`
    + `<button type="button" id="detail-back">Back to the route</button>`
    + (prev ? `<button type="button" id="detail-prev">← Stop ${prev.stop}: ${prev.name}</button>` : '')
    + (next ? `<button type="button" id="detail-next">Stop ${next.stop}: ${next.name} →</button>` : '')
    + '</div>';
  $('detail-toggle').addEventListener('click', () => toggleEarned(t.id));
  $('detail-back').addEventListener('click', () => { location.hash = '#/route'; });
  if (prev) $('detail-prev').addEventListener('click', () => { location.hash = `#/trophy/${prev.id}`; });
  if (next) $('detail-next').addEventListener('click', () => { location.hash = `#/trophy/${next.id}`; });
}

function renderTracker() {
  const count = earned.size;
  $('tracker-count').textContent = count;
  $('tracker-meter').style.width = `${(count / trophies.length) * 100}%`;
  const remaining = trophies.filter((t) => !earned.has(t.id));
  const next = remaining[0] ?? null;
  $('tracker-summary').textContent = next
    ? `${remaining.length} to go. Next stop: ${next.stop}. ${next.name} (${chapters[next.chapter - 1].title}).`
    : 'Every stop earned — the platinum is yours.';
  $('chapter-bars').innerHTML = chapters.map((c) => {
    const stops = trophies.filter((t) => t.chapter === c.n);
    const done = stops.filter((t) => earned.has(t.id)).length;
    const pct = Math.round((done / stops.length) * 100);
    return `<div class="chapter-bar"><div class="bar-label"><span>Chapter ${c.n} — ${c.title}</span><span>${done}/${stops.length}</span></div>`
      + `<div class="meter"><div class="meter-fill" style="width:${pct}%"></div></div></div>`;
  }).join('');
  $('remaining-list').innerHTML = remaining.length
    ? `<ul class="mini-list">${remaining.map((t) => `<li>Stop ${t.stop} — ${t.name}</li>`).join('')}</ul>`
    : '<p>Nothing left — route complete.</p>';
  $('earned-list').innerHTML = earned.size
    ? `<ul class="mini-list">${trophies.filter((t) => earned.has(t.id)).map((t) => `<li class="done">Stop ${t.stop} — ${t.name}</li>`).join('')}</ul>`
    : '<p>No stops earned yet. Start at stop 1.</p>';
}

function showView(name, arg) {
  for (const v of views) $(`view-${v}`).hidden = v !== name;
  for (const v of ['map', 'route', 'trophies', 'tracker']) {
    $(`tab-${v}`).classList.toggle('active', v === name || (name === 'detail' && v === 'route'));
  }
  if (name === 'detail') renderDetail(Number(arg));
}

function route() {
  const hash = location.hash || '#/map';
  const parts = hash.replace(/^#\//, '').split('/');
  if (parts[0] === 'trophy' && parts[1]) showView('detail', parts[1]);
  else if (views.includes(parts[0])) showView(parts[0]);
  else showView('map');
}

function renderAll() {
  renderHeader();
  renderDistrictMap();
  renderRoute();
  renderTrophyList();
  renderTracker();
  route();
}

for (const v of ['map', 'route', 'trophies', 'tracker']) {
  $(`tab-${v}`).addEventListener('click', () => { location.hash = `#/${v}`; });
}
$('start-route').addEventListener('click', () => {
  const next = nextStop();
  location.hash = next ? `#/trophy/${next.id}` : '#/tracker';
});
for (const id of ['search', 'kind', 'grade', 'missable-only', 'spoilers']) {
  $(id).addEventListener('input', renderTrophyList);
  $(id).addEventListener('change', () => { renderTrophyList(); renderRoute(); });
}
$('spoilers').addEventListener('change', renderRoute);

$('export').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify({ app: 'leonida-platinum-route', earned: [...earned] }, null, 2)], { type: 'application/json' }));
  a.download = 'leonida-platinum-route-progress.json';
  a.click();
});
$('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const names = new Set(trophies.map((t) => t.name));
    const ids = (data.earned ?? data).filter((n) => names.has(n)).map((n) => trophies.find((t) => t.name === n).id);
    earned = new Set(ids);
    saveProgress();
    renderAll();
  } catch {
    alert('That file is not a valid progress export.');
  }
});
$('reset').addEventListener('click', () => {
  if (confirm('Clear all earned stops?')) {
    earned = new Set();
    saveProgress();
    renderAll();
  }
});

window.addEventListener('hashchange', route);
renderAll();
