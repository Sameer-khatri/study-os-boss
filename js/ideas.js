/* ===================================================================
   IDEAS VAULT v2 — "The Neural Chamber"
   Complete logic: particles, CRUD, drawer, search, brain map, Learn This
   =================================================================== */

const IV_KEY = 'boss_ideas_vault';

const IV_CATEGORIES = [
  { id:'build',   emoji:'🚀', label:'Build',   color:'#7C3AED' },
  { id:'learn',   emoji:'💡', label:'Learn',   color:'#06B6D4' },
  { id:'explore', emoji:'🌍', label:'Explore', color:'#10B981' },
  { id:'random',  emoji:'⚡', label:'Random',  color:'#F59E0B' },
  { id:'goals',   emoji:'🎯', label:'Goals',   color:'#EF4444' },
  { id:'people',  emoji:'👥', label:'People',  color:'#EC4899' },
  { id:'money',   emoji:'💰', label:'Money',   color:'#84CC16' },
];

const CAT_DOMAIN_MAP = {
  build:'tech', learn:'tech', explore:'world',
  random:'other', goals:'career', people:'career', money:'career',
};

const COLOR_SWATCHES = ['#7C3AED','#06B6D4','#10B981','#F59E0B','#EF4444','#EC4899','#84CC16','#3B82F6'];

// ── State ────────────────────────────────────────────────── //
let _ivCat       = 'all';
let _ivSearch    = '';
let _ivView      = 'grid';
let _ivDrawerId  = null;
let _ivEditMode  = false;
let _ivCapTags   = [];
let _ivParticles = null;
let _ivD3Loaded  = false;
let _ivCustomColor = COLOR_SWATCHES[0];

// ── UUID ─────────────────────────────────────────────────── //
function ivUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random()*16|0;
    return (c==='x' ? r : (r&0x3|0x8)).toString(16);
  });
}

// ── Storage ──────────────────────────────────────────────── //
function ivLoad() {
  try {
    const raw = localStorage.getItem(IV_KEY);
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return { version:'2.0', ideas:[], custom_categories:[], stats:{ total:0, this_week:0, hot_count:0, learn_this_count:0 } };
}
function ivSave(data) {
  try {
    localStorage.setItem(IV_KEY, JSON.stringify(data));
    return true;
  } catch(e) {
    ivShowError('Couldn\'t save. Storage full.');
    return false;
  }
}
function ivGetIdeas() { return ivLoad().ideas; }
function ivGetAllCats(data) {
  return [...IV_CATEGORIES, ...(data?.custom_categories || [])];
}

// ── Time utils ───────────────────────────────────────────── //
function ivTimeAgo(iso) {
  if (!iso) return '';
  const s = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s/60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m/60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h/24);
  if (d < 7) return `${d}d ago`;
  return `${Math.floor(d/7)}w ago`;
}
function ivIsThisWeek(iso) {
  return iso && (Date.now() - new Date(iso)) < 7*86400*1000;
}

// ═══════════════════════════════════════════════════════════
//  OPEN / CLOSE
// ═══════════════════════════════════════════════════════════

function openIdeasVault() {
  const overlay = document.getElementById('ideas-overlay');
  if (!overlay) return;
  overlay.style.display = 'block';
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => {
    overlay.classList.add('active');
    overlay.classList.remove('hiding');
    initIdeasVault();
  });
}

function closeIdeasVault() {
  const overlay = document.getElementById('ideas-overlay');
  if (!overlay) return;
  overlay.classList.remove('active');
  overlay.classList.add('hiding');
  document.body.style.overflow = '';
  ivStopParticles();
  setTimeout(() => {
    overlay.style.display = 'none';
    overlay.classList.remove('hiding');
  }, 400);
}

function initIdeasVault() {
  ivInitParticles();
  ivRenderCategoryBar();
  ivRenderGrid();
  ivUpdateStats();
  ivInitCapture();
  ivInitKeyboard();
  setTimeout(() => document.getElementById('iv-quick-input')?.focus(), 300);
}

// ═══════════════════════════════════════════════════════════
//  PERFORMANCE GUARD + PARTICLE SYSTEM
// ═══════════════════════════════════════════════════════════

function ivShouldRunParticles() {
  const memory = navigator.deviceMemory;
  const cores  = navigator.hardwareConcurrency || 2;
  if (memory && memory < 2) return false;
  if (cores < 4) return 'reduced';
  return 'full';
}

function ivInitParticles() {
  const mode = ivShouldRunParticles();
  const overlay = document.getElementById('ideas-overlay');
  const canvas  = document.getElementById('iv-canvas');
  if (!canvas) return;

  if (!mode) {
    overlay?.classList.add('no-particles');
    canvas.style.display = 'none';
    return;
  }

  overlay?.classList.remove('no-particles');
  canvas.style.display = 'block';

  const COUNT = mode === 'full' ? 60 : 25;
  const ctx = canvas.getContext('2d');
  let W, H, dots, animId;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Mobile: cap at 25
  const finalCount = window.innerWidth < 768 ? 25 : COUNT;
  dots = Array.from({ length: finalCount }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    vx: (Math.random() - 0.5) * 0.45,
    vy: (Math.random() - 0.5) * 0.45,
    r: 1.5 + Math.random() * 1.0,
    op: 0.4 + Math.random() * 0.3,
  }));

  function draw() {
    if (!canvas.isConnected) return;
    ctx.clearRect(0, 0, W, H);
    for (const d of dots) {
      d.x += d.vx; d.y += d.vy;
      if (d.x < 0 || d.x > W) d.vx *= -1;
      if (d.y < 0 || d.y > H) d.vy *= -1;
    }
    // Connections
    for (let i = 0; i < dots.length; i++) {
      for (let j = i+1; j < dots.length; j++) {
        const dx = dots[i].x - dots[j].x;
        const dy = dots[i].y - dots[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 140) {
          ctx.beginPath();
          ctx.moveTo(dots[i].x, dots[i].y);
          ctx.lineTo(dots[j].x, dots[j].y);
          ctx.strokeStyle = `rgba(124,58,237,${(1 - dist/140) * 0.12})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
    // Dots
    for (const d of dots) {
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(124,58,237,${d.op})`;
      ctx.fill();
    }
    animId = requestAnimationFrame(draw);
  }
  draw();

  // Tab visibility pause/resume
  function onVisChange() {
    if (document.hidden) { cancelAnimationFrame(animId); }
    else { draw(); }
  }
  document.addEventListener('visibilitychange', onVisChange);
  _ivParticles = { animId: () => animId, stop: () => { cancelAnimationFrame(animId); document.removeEventListener('visibilitychange', onVisChange); } };
}

function ivStopParticles() {
  if (_ivParticles) { _ivParticles.stop(); _ivParticles = null; }
}

// ═══════════════════════════════════════════════════════════
//  CATEGORY BAR
// ═══════════════════════════════════════════════════════════

function ivRenderCategoryBar() {
  const bar = document.getElementById('iv-cat-bar');
  if (!bar) return;
  const data = ivLoad();
  const allCats = ivGetAllCats(data);
  const ideas = data.ideas;

  const countFor = (id) => id === 'all' ? ideas.filter(i => i.status !== 'archived').length
    : ideas.filter(i => i.category === id && i.status !== 'archived').length;

  bar.innerHTML = `
    <button class="iv-pill ${_ivCat==='all'?'active':''}" onclick="ivSetCat('all')">
      ✦ All <span class="iv-pill-count">${countFor('all')}</span>
    </button>
    ${allCats.map(c => `
      <button class="iv-pill ${_ivCat===c.id?'active':''}"
              style="${_ivCat===c.id?`background:${c.color};border-color:${c.color};`:''}"
              onclick="ivSetCat('${c.id}')">
        ${c.emoji} ${c.label} <span class="iv-pill-count">${countFor(c.id)}</span>
      </button>
    `).join('')}
    <button class="iv-pill iv-pill-add" onclick="ivOpenCatModal()">＋ Add</button>
  `;
}

function ivSetCat(id) {
  _ivCat = id;
  ivRenderCategoryBar();
  ivRenderGrid();
}

// ═══════════════════════════════════════════════════════════
//  STATS
// ═══════════════════════════════════════════════════════════

function ivUpdateStats() {
  const data = ivLoad();
  const ideas = data.ideas;
  const active = ideas.filter(i => i.status !== 'archived');
  const thisWeek = active.filter(i => ivIsThisWeek(i.created_at)).length;
  const hot = active.filter(i => i.status === 'hot').length;

  const el = document.getElementById('iv-topbar-stats');
  if (el) el.innerHTML = `<strong>${active.length}</strong> ideas · <strong>${thisWeek}</strong> this week · <strong>${hot}</strong>🔥`;

  // Update custom cat select in capture bar
  const sel = document.getElementById('iv-capture-cat');
  if (sel) {
    const allCats = ivGetAllCats(data);
    sel.innerHTML = allCats.map(c => `<option value="${c.id}">${c.emoji} ${c.label}</option>`).join('');
  }
}

// ═══════════════════════════════════════════════════════════
//  CARD GRID
// ═══════════════════════════════════════════════════════════

function ivRenderGrid() {
  const grid = document.getElementById('iv-card-grid');
  if (!grid) return;

  const data = ivLoad();
  let ideas = [...data.ideas];

  // Filter archived from non-all views
  if (_ivCat === 'all') {
    // Show all, but archived last
    ideas.sort((a,b) => (a.status==='archived'?1:0) - (b.status==='archived'?1:0));
  } else {
    ideas = ideas.filter(i => i.category === _ivCat && i.status !== 'archived');
  }

  // Search
  if (_ivSearch) {
    const q = _ivSearch.toLowerCase();
    ideas = ideas.filter(i =>
      (i.title||'').toLowerCase().includes(q) ||
      (i.content||'').toLowerCase().includes(q) ||
      (i.tags||[]).some(t => t.toLowerCase().includes(q))
    );
  }

  if (ideas.length === 0) {
    grid.innerHTML = `
      <div class="iv-empty-state">
        <span class="iv-empty-icon">🧠</span>
        <div class="iv-empty-title">
          ${_ivCat === 'all' ? 'Your mind is empty.' : `Nothing in ${ivGetCatById(_ivCat)?.emoji||''} ${ivGetCatById(_ivCat)?.label||_ivCat} yet.`}
        </div>
        <div class="iv-empty-sub">
          ${_ivCat === 'all' ? "That's temporary.\nWhat are you thinking right now?" : 'Capture something.'}
        </div>
      </div>
    `;
    return;
  }

  grid.innerHTML = ideas.map(i => ivBuildCard(i, data)).join('');
}

function ivBuildCard(idea, data) {
  const cat = ivGetCatById(idea.category, data) || { emoji:'💭', color:'#64748B', label:'Uncategorized' };
  const codexBadge = idea.learn_this?.flagged
    ? `<div class="ic2-codex-badge">📚 In Codex</div>` : '';

  return `
    <div class="idea-card"
         data-id="${idea.id}"
         data-status="${idea.status||'raw'}"
         style="border-left-color:${cat.color};"
         onclick="ivCardClick(event, '${idea.id}')">
      <div class="ic2-meta">
        <span class="ic2-cat">${cat.emoji} ${cat.label}</span>
        <span>${ivTimeAgo(idea.created_at)}</span>
      </div>
      ${idea.title ? `<div class="ic2-title">${escIV(idea.title)}</div>` : ''}
      <div class="ic2-content">${escIV(idea.content||'')}</div>
      ${(idea.tags||[]).length ? `
        <div class="ic2-tags">${idea.tags.map(t=>`<span class="ic2-tag">#${escIV(t)}</span>`).join(' ')}</div>
      ` : ''}
      ${codexBadge}
      <div class="ic2-actions">
        <button class="ic2-learn-btn" onclick="event.stopPropagation();ivLearnThisCard('${idea.id}', this)">📚 Learn This</button>
        <button class="ic2-menu-btn" onclick="event.stopPropagation();ivQuickStatus('${idea.id}')">⋮</button>
      </div>
    </div>
  `;
}

function ivCardClick(e, id) {
  if (e.target.classList.contains('ic2-learn-btn') || e.target.classList.contains('ic2-menu-btn')) return;
  ivOpenDrawer(id);
}

function escIV(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function ivGetCatById(id, data) {
  const d = data || ivLoad();
  return [...IV_CATEGORIES, ...(d.custom_categories||[])].find(c => c.id === id);
}

// Quick status cycle from ⋮ menu
function ivQuickStatus(id) {
  const statuses = ['raw','hot','planned','done','archived'];
  const data = ivLoad();
  const idea = data.ideas.find(i=>i.id===id);
  if (!idea) return;
  const cur = statuses.indexOf(idea.status||'raw');
  idea.status = statuses[(cur+1) % statuses.length];
  idea.updated_at = new Date().toISOString();
  ivSave(data);
  ivRenderGrid();
  ivUpdateStats();
  ivToast(`Status → ${idea.status}`);
}

// Add a new card to top of grid with animation
function ivPrependCard(idea) {
  const grid = document.getElementById('iv-card-grid');
  if (!grid) return;

  // Remove empty state if present
  const empty = grid.querySelector('.iv-empty-state');
  if (empty) empty.remove();

  const data = ivLoad();
  const el = document.createElement('div');
  el.innerHTML = ivBuildCard(idea, data);
  const card = el.firstElementChild;
  card.classList.add('entering');
  grid.insertBefore(card, grid.firstChild);
  card.addEventListener('animationend', () => card.classList.remove('entering'), { once: true });
}

// ═══════════════════════════════════════════════════════════
//  QUICK CAPTURE
// ═══════════════════════════════════════════════════════════

function ivInitCapture() {
  const input = document.getElementById('iv-quick-input');
  if (!input) return;

  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 160) + 'px';
    const meta = document.getElementById('iv-capture-meta');
    if (meta) meta.classList.toggle('visible', input.value.length > 0);
  });

  input.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      ivSaveIdea();
    }
    if (e.key === 'Escape') {
      input.value = '';
      input.style.height = '';
      _ivCapTags = [];
      ivRenderCapTags();
      document.getElementById('iv-capture-meta')?.classList.remove('visible');
    }
  });
}

function ivRenderCapTags() {
  const row = document.getElementById('iv-captags-row');
  if (!row) return;
  const pills = _ivCapTags.map(t =>
    `<span class="iv-capinline-tag">#${escIV(t)}<button onclick="ivRemoveCapTag('${escIV(t)}')">×</button></span>`
  ).join('');
  const existing = row.querySelectorAll('.iv-capinline-tag');
  existing.forEach(e => e.remove());
  row.insertAdjacentHTML('afterbegin', pills);
}
function ivRemoveCapTag(t) {
  _ivCapTags = _ivCapTags.filter(x => x !== t);
  ivRenderCapTags();
}
function ivCapTagKeydown(e) {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault();
    const val = e.target.value.replace(/^#+/, '').trim();
    if (val && !_ivCapTags.includes(val)) _ivCapTags.push(val);
    e.target.value = '';
    ivRenderCapTags();
  }
}

function ivSaveIdea() {
  const input = document.getElementById('iv-quick-input');
  const content = input?.value?.trim();
  if (!content) return;

  const cat = document.getElementById('iv-capture-cat')?.value || 'random';
  const data = ivLoad();

  const idea = {
    id: ivUUID(),
    title: '',
    content,
    category: cat,
    tags: [..._ivCapTags],
    status: 'raw',
    learn_this: null,
    notes: '',
    related_ideas: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  data.ideas.unshift(idea);
  data.stats = ivComputeStats(data);
  if (!ivSave(data)) return;

  // Reset input
  input.value = '';
  input.style.height = '';
  _ivCapTags = [];
  ivRenderCapTags();
  document.getElementById('iv-capture-meta')?.classList.remove('visible');
  input.focus();

  // Animate new card into grid
  if (_ivView === 'grid') ivPrependCard(idea);
  ivRenderCategoryBar();
  ivUpdateStats();
  ivSynapseEffect();
  return idea.id;
}

function ivSynapseEffect() {
  const bar = document.querySelector('.iv-capture-bar');
  if (!bar) return;
  const el = document.createElement('div');
  el.className = 'iv-synapse-burst';
  document.getElementById('ideas-overlay').appendChild(el);
  setTimeout(() => el.remove(), 700);
}

// ═══════════════════════════════════════════════════════════
//  LEARN THIS
// ═══════════════════════════════════════════════════════════

function ivLearnThisCard(id, btn) {
  // Ripple on button
  btn?.classList.add('ripple');
  setTimeout(() => btn?.classList.remove('ripple'), 400);

  // Flash card border cyan
  const card = document.querySelector(`.idea-card[data-id="${id}"]`);
  if (card) {
    const orig = card.style.borderColor;
    card.style.borderColor = '#06B6D4';
    card.style.boxShadow = '0 0 16px rgba(6,182,212,0.4)';
    setTimeout(() => {
      card.style.borderColor = orig;
      card.style.boxShadow = '';
    }, 350);
  }

  const draftId = ivLearnThis(id);
  if (!draftId) return;

  // Toast with "Open in Codex" — does NOT auto-navigate
  ivToast('📚 Added to Codex as a draft', draftId);
  ivRenderGrid();
}

function ivLearnThis(ideaId) {
  const data = ivLoad();
  const idea = data.ideas.find(i => i.id === ideaId);
  if (!idea) return null;

  const codexRaw = localStorage.getItem('boss_knowledge_log');
  const codexData = codexRaw ? JSON.parse(codexRaw) : { version:'1.0', streak:{current:0,longest:0,last_log_date:null}, entries:[], stats:{} };

  const draftId = ivUUID();
  codexData.drafts = codexData.drafts || [];
  codexData.drafts.push({
    id: draftId,
    title: idea.title || idea.content.slice(0, 60) + (idea.content.length > 60 ? '...' : ''),
    domain: CAT_DOMAIN_MAP[idea.category] || 'other',
    content: {
      what_learned: '',
      why_matters: idea.content,
      real_example: '',
      source: 'Ideas Vault',
    },
    mastery_score: 1,
    status: 'draft',
    from_idea_id: idea.id,
    created_at: new Date().toISOString(),
  });
  localStorage.setItem('boss_knowledge_log', JSON.stringify(codexData));

  // Update idea
  idea.status = 'planned';
  idea.learn_this = {
    flagged: true,
    codex_draft_id: draftId,
    flagged_at: new Date().toISOString(),
  };
  idea.updated_at = new Date().toISOString();
  data.stats = ivComputeStats(data);
  ivSave(data);

  return draftId;
}

// Called from drawer
function ivLearnThisDrawer() {
  if (!_ivDrawerId) return;
  const draftId = ivLearnThis(_ivDrawerId);
  ivToast('📚 Added to Codex as a draft', draftId);
  ivCloseDrawer();
  ivRenderGrid();
  ivRenderCategoryBar();
  ivUpdateStats();
}

function ivLearnThisCapture() {
  const id = ivSaveIdea();
  if (id) {
    const draftId = ivLearnThis(id);
    if (draftId) {
      ivToast('📚 Idea captured & added to Codex!', draftId);
      // Let's re-render to show the cyan border / codex badge on the new grid card immediately
      ivRenderGrid(); 
    }
  }
}

// ═══════════════════════════════════════════════════════════
//  SIDE DRAWER
// ═══════════════════════════════════════════════════════════

function ivOpenDrawer(id) {
  _ivDrawerId = id;
  _ivEditMode = false;
  const drawer  = document.getElementById('iv-side-drawer');
  const backdrop = document.getElementById('iv-drawer-backdrop');
  drawer?.classList.add('open');
  backdrop?.classList.add('active');
  ivRenderDrawer(id);
}

function ivCloseDrawer() {
  _ivDrawerId = null;
  _ivEditMode = false;
  document.getElementById('iv-side-drawer')?.classList.remove('open');
  document.getElementById('iv-drawer-backdrop')?.classList.remove('active');
}

function ivBackdropClick() {
  ivCloseDrawer();
}

function ivRenderDrawer(id) {
  const box = document.getElementById('iv-drawer-content');
  if (!box) return;
  const data = ivLoad();
  const idea = data.ideas.find(i => i.id === id);
  if (!idea) return;

  const cat = ivGetCatById(idea.category, data) || { emoji:'💭', color:'#64748B', label:'Uncategorized' };
  const linked = (idea.related_ideas||[]).map(rid => {
    const rel = data.ideas.find(i => i.id === rid);
    return rel ? `<span class="iv-related-chip">${rel.title||rel.content.slice(0,20)}<button onclick="ivUnlink('${id}','${rid}')">×</button></span>` : '';
  }).join('');

  box.innerHTML = `
    <div class="iv-drawer-topbar">
      <button class="iv-drawer-close" onclick="ivCloseDrawer()">← Close</button>
      <button class="iv-drawer-edit-btn ${_ivEditMode?'active':''}" id="iv-edit-toggle" onclick="ivToggleEdit()">
        ${_ivEditMode ? '✓ Editing' : '✏️ Edit'}
      </button>
    </div>

    <div class="iv-drawer-meta-row">
      <span class="iv-drawer-cat-dot" style="background:${cat.color};"></span>
      ${cat.emoji} ${cat.label} · ${ivTimeAgo(idea.created_at)}
    </div>

    <div class="iv-drawer-title"
         id="iv-d-title"
         ${_ivEditMode ? 'contenteditable="true"' : ''}
         >${escIV(idea.title||'Untitled Idea')}</div>

    <div class="iv-drawer-content-text"
         id="iv-d-content"
         ${_ivEditMode ? 'contenteditable="true"' : ''}
         >${escIV(idea.content||'')}</div>

    <div class="iv-drawer-divider"></div>

    <div class="iv-drawer-label">Tags</div>
    <div class="iv-drawer-tags-wrap" id="iv-d-tags">
      ${(idea.tags||[]).map(t=>`<span class="iv-dtag">#${escIV(t)}</span>`).join('')}
      ${_ivEditMode ? `<input class="iv-dtag-add-input" placeholder="#tag" onkeydown="ivDrawerTagKey(event,'${id}')">` : ''}
    </div>

    ${_ivEditMode ? `
    <div class="iv-drawer-label">Category</div>
    <select class="iv-drawer-select" id="iv-d-cat">
      ${[...IV_CATEGORIES, ...(data.custom_categories||[])].map(c =>
        `<option value="${c.id}" ${idea.category===c.id?'selected':''}>${c.emoji} ${c.label}</option>`
      ).join('')}
    </select>` : ''}

    <div class="iv-drawer-label">Status</div>
    <select class="iv-drawer-select" id="iv-d-status" ${_ivEditMode ? '' : ''} onchange="ivDrawerStatusChange('${id}', this.value)">
      <option value="raw"      ${idea.status==='raw'?'selected':''}>💭 Raw Idea</option>
      <option value="hot"      ${idea.status==='hot'?'selected':''}>🔥 Hot — Pursue</option>
      <option value="planned"  ${idea.status==='planned'?'selected':''}>📋 Planned</option>
      <option value="done"     ${idea.status==='done'?'selected':''}>✅ Done</option>
      <option value="archived" ${idea.status==='archived'?'selected':''}>❄️ Archived</option>
    </select>

    <div class="iv-drawer-label">📎 Notes</div>
    <textarea class="iv-drawer-notes" id="iv-d-notes" placeholder="Expand on this idea...">${escIV(idea.notes||'')}</textarea>

    <div class="iv-drawer-divider"></div>
    <div class="iv-drawer-label">🔗 Related Ideas</div>
    <input class="iv-related-search" placeholder="Search your ideas..." oninput="ivDrawerRelatedSearch('${id}', this.value)">
    <div class="iv-related-results" id="iv-related-results"></div>
    <div class="iv-related-linked">${linked}</div>

    <div class="iv-drawer-divider"></div>
    <div class="iv-drawer-actions">
      ${idea.learn_this?.flagged
        ? `<div class="ic2-codex-badge" style="margin-bottom:8px;font-size:13px;">📚 Already in Codex</div>`
        : `<button class="iv-daction-learn" onclick="ivLearnThisDrawer()">📚 Learn This → Send to Codex</button>`}
      <button class="iv-daction-hot" onclick="ivDrawerPromoteHot('${id}')">
        ${idea.status === 'hot' ? '💭 Unmark Hot' : '🔥 Mark as Hot'}
      </button>
      <button class="iv-daction-delete" onclick="ivDrawerShowDelete()">🗑️ Delete</button>
      <div id="iv-delete-confirm-zone"></div>
    </div>

    ${_ivEditMode ? `
    <div class="iv-drawer-save-row">
      <button class="iv-drawer-save-btn" onclick="ivSaveDrawer('${id}')">Save Changes</button>
      <button class="iv-drawer-cancel-btn" onclick="ivToggleEdit()">Cancel</button>
    </div>` : ''}
  `;
}

function ivToggleEdit() {
  _ivEditMode = !_ivEditMode;
  if (_ivDrawerId) ivRenderDrawer(_ivDrawerId);
}

function ivDrawerStatusChange(id, status) {
  const data = ivLoad();
  const idea = data.ideas.find(i=>i.id===id);
  if (!idea) return;
  idea.status = status;
  idea.updated_at = new Date().toISOString();
  ivSave(data);
  ivRenderGrid();
  ivUpdateStats();
}

function ivDrawerPromoteHot(id) {
  const data = ivLoad();
  const idea = data.ideas.find(i=>i.id===id);
  if (!idea) return;
  idea.status = idea.status === 'hot' ? 'raw' : 'hot';
  idea.updated_at = new Date().toISOString();
  ivSave(data);
  ivRenderGrid();
  ivRenderCategoryBar();
  ivUpdateStats();
  ivCloseDrawer();
  ivToast(idea.status === 'hot' ? '🔥 Marked as Hot!' : 'Unmarked Hot.');
}

function ivSaveDrawer(id) {
  const data = ivLoad();
  const idea = data.ideas.find(i=>i.id===id);
  if (!idea) return;

  const titleEl   = document.getElementById('iv-d-title');
  const contentEl = document.getElementById('iv-d-content');
  const catEl     = document.getElementById('iv-d-cat');
  const notesEl   = document.getElementById('iv-d-notes');

  if (titleEl) idea.title = titleEl.textContent.trim();
  if (contentEl) idea.content = contentEl.textContent.trim();
  if (catEl) idea.category = catEl.value;
  if (notesEl) idea.notes = notesEl.value;
  idea.updated_at = new Date().toISOString();
  ivSave(data);

  _ivEditMode = false;
  ivRenderGrid();
  ivRenderCategoryBar();
  ivUpdateStats();
  ivRenderDrawer(id);
  ivToast('✅ Saved!');
}

function ivDrawerTagKey(e, id) {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault();
    const val = e.target.value.replace(/^#+/, '').trim();
    if (!val) return;
    const data = ivLoad();
    const idea = data.ideas.find(i => i.id === id);
    if (!idea) return;
    idea.tags = idea.tags || [];
    if (!idea.tags.includes(val)) idea.tags.push(val);
    ivSave(data);
    e.target.value = '';
    ivRenderDrawer(id);
  }
}

function ivDrawerRelatedSearch(id, q) {
  const res = document.getElementById('iv-related-results');
  if (!res) return;
  if (!q.trim()) { res.innerHTML = ''; return; }
  const data = ivLoad();
  const idea = data.ideas.find(i=>i.id===id);
  const matches = data.ideas
    .filter(i => i.id !== id && !(idea?.related_ideas||[]).includes(i.id))
    .filter(i => (i.title+i.content).toLowerCase().includes(q.toLowerCase()))
    .slice(0, 6);

  res.innerHTML = matches.map(m => `
    <div class="iv-related-result-item" onclick="ivLinkIdea('${id}','${m.id}')">
      💭 ${escIV((m.title||m.content).slice(0,40))}
    </div>
  `).join('') || `<div style="font-size:12px;color:#64748B;padding:6px 10px;">No matches</div>`;
}

function ivLinkIdea(id, relId) {
  const data = ivLoad();
  const idea = data.ideas.find(i=>i.id===id);
  if (!idea) return;
  idea.related_ideas = idea.related_ideas || [];
  if (!idea.related_ideas.includes(relId)) idea.related_ideas.push(relId);
  ivSave(data);
  ivRenderDrawer(id);
}
function ivUnlink(id, relId) {
  const data = ivLoad();
  const idea = data.ideas.find(i=>i.id===id);
  if (!idea) return;
  idea.related_ideas = (idea.related_ideas||[]).filter(r=>r!==relId);
  ivSave(data);
  ivRenderDrawer(id);
}

function ivDrawerShowDelete() {
  const zone = document.getElementById('iv-delete-confirm-zone');
  if (!zone) return;
  zone.innerHTML = `
    <div class="iv-delete-confirm">
      <p>Are you sure? This can't be undone.</p>
      <div class="iv-delete-confirm-row">
        <button class="iv-delete-yes" onclick="ivDeleteIdea('${_ivDrawerId}')">Yes, delete</button>
        <button class="iv-delete-cancel" onclick="document.getElementById('iv-delete-confirm-zone').innerHTML=''">Cancel</button>
      </div>
    </div>
  `;
}

function ivDeleteIdea(id) {
  const data = ivLoad();
  data.ideas = data.ideas.filter(i => i.id !== id);
  data.stats = ivComputeStats(data);
  ivSave(data);
  ivCloseDrawer();
  ivRenderGrid();
  ivRenderCategoryBar();
  ivUpdateStats();
  ivToast('🗑️ Deleted.');
}

// ═══════════════════════════════════════════════════════════
//  SEARCH
// ═══════════════════════════════════════════════════════════

function ivOpenSearch() {
  const bar = document.querySelector('.iv-top-bar');
  const field = document.getElementById('iv-search-field');
  if (!bar || !field) return;
  bar.classList.add('search-open');
  field.style.display = 'block';
  field.focus();
}

function ivSearch(val) {
  _ivSearch = val;
  ivRenderGrid();
}

function ivSearchKeydown(e) {
  if (e.key === 'Escape') ivCloseSearch();
}

function ivCloseSearch() {
  const bar = document.querySelector('.iv-top-bar');
  const field = document.getElementById('iv-search-field');
  if (!bar || !field) return;
  bar.classList.remove('search-open');
  _ivSearch = '';
  field.value = '';
  ivRenderGrid();
}

// ═══════════════════════════════════════════════════════════
//  TOP BAR ACTIONS
// ═══════════════════════════════════════════════════════════

function ivSetView(v) {
  _ivView = v;
  document.querySelectorAll('.iv-view-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.view === v);
  });
  const grid = document.getElementById('iv-card-grid');
  const mapWrap = document.getElementById('iv-brainmap-wrap');
  if (v === 'grid') {
    if (grid) grid.style.opacity = '0';
    if (mapWrap) mapWrap.classList.remove('active');
    setTimeout(() => { if (grid) { grid.style.transition='opacity 0.25s'; grid.style.opacity='1'; } }, 10);
    ivRenderGrid();
  } else {
    if (grid) { grid.style.transition='opacity 0.25s'; grid.style.opacity='0'; }
    setTimeout(() => {
      if (mapWrap) mapWrap.classList.add('active');
      ivRenderBrainMap();
    }, 260);
  }
}

function ivFocusCapture() {
  const input = document.getElementById('iv-quick-input');
  input?.focus();
  const bar = document.querySelector('.iv-capture-bar');
  if (bar) {
    bar.classList.remove('pulsing');
    requestAnimationFrame(() => bar.classList.add('pulsing'));
    bar.addEventListener('animationend', () => bar.classList.remove('pulsing'), { once:true });
  }
}

// ═══════════════════════════════════════════════════════════
//  BRAIN MAP (D3)
// ═══════════════════════════════════════════════════════════

function ivRenderBrainMap() {
  const wrap = document.getElementById('iv-brainmap-wrap');
  const svgEl = document.getElementById('iv-brainmap-svg');
  if (!wrap || !svgEl) return;

  const ideas = ivGetIdeas().filter(i => i.status !== 'archived');
  const data  = ivLoad();

  if (typeof d3 === 'undefined') {
    // Try dynamic load
    ivLoadD3(() => ivRenderBrainMap());
    svgEl.innerHTML = `<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#64748B" font-size="14" font-family="Space Grotesk, sans-serif">Loading Brain Map...</text>`;
    return;
  }

  // Clear
  const svg = d3.select('#iv-brainmap-svg');
  svg.selectAll('*').remove();

  const W = wrap.clientWidth || window.innerWidth;
  const H = wrap.clientHeight || (window.innerHeight - 104);
  svg.attr('viewBox', `0 0 ${W} ${H}`);

  if (ideas.length === 0) {
    svg.append('text')
      .attr('x', W/2).attr('y', H/2)
      .attr('dominant-baseline','middle').attr('text-anchor','middle')
      .attr('fill','#64748B').attr('font-size','14').attr('font-family','Space Grotesk, sans-serif')
      .text('No ideas yet. Capture something.');
    return;
  }

  // Nodes + Links (related_ideas)
  const nodes = ideas.map(i => ({
    id: i.id,
    title: i.title || i.content.slice(0,30),
    category: i.category,
    status: i.status,
    timeAgo: ivTimeAgo(i.created_at),
    content: i.content,
    radius: i.status === 'hot' ? 18 : i.status === 'planned' ? 14 : 10,
  }));

  const links = [];
  ideas.forEach(i => {
    (i.related_ideas||[]).forEach(rel => {
      if (ideas.find(x=>x.id===rel)) {
        links.push({ source: i.id, target: rel });
      }
    });
  });

  // SVG defs (glow filter for hot)
  const defs = svg.append('defs');
  const filter = defs.append('filter').attr('id','iv-hot-glow').attr('x','-50%').attr('y','-50%').attr('width','200%').attr('height','200%');
  filter.append('feGaussianBlur').attr('stdDeviation','4').attr('result','blur');
  const merge = filter.append('feMerge');
  merge.append('feMergeNode').attr('in','blur');
  merge.append('feMergeNode').attr('in','SourceGraphic');

  const sim = d3.forceSimulation(nodes)
    .force('charge', d3.forceManyBody().strength(-150))
    .force('link', d3.forceLink(links).id(d=>d.id).distance(120))
    .force('center', d3.forceCenter(W/2, H/2))
    .force('collision', d3.forceCollide(d => d.radius + 8));

  const link = svg.append('g')
    .selectAll('line')
    .data(links)
    .enter().append('line')
    .attr('stroke','rgba(124,58,237,0.25)')
    .attr('stroke-width', 1);

  const nodeGroup = svg.append('g')
    .selectAll('g')
    .data(nodes)
    .enter().append('g')
    .attr('cursor','pointer')
    .on('click', (event, d) => ivOpenDrawer(d.id))
    .on('mouseenter', (event, d) => ivShowNodeTooltip(event, d))
    .on('mouseleave', () => ivHideNodeTooltip())
    .call(d3.drag()
      .on('start', (event,d) => { if (!event.active) sim.alphaTarget(0.3).restart(); d.fx=d.x; d.fy=d.y; })
      .on('drag', (event,d) => { d.fx=event.x; d.fy=event.y; })
      .on('end', (event,d) => { if (!event.active) sim.alphaTarget(0); d.fx=null; d.fy=null; })
    );

  // Outer glow ring for hot
  nodeGroup.filter(d => d.status === 'hot')
    .append('circle')
    .attr('r', d => d.radius + 6)
    .attr('fill', 'rgba(245,158,11,0.15)')
    .attr('filter','url(#iv-hot-glow)');

  // Cyan ring for Codex-flagged (planned)
  nodeGroup.filter(d => d.status === 'planned')
    .append('circle')
    .attr('r', d => d.radius + 4)
    .attr('fill', 'none')
    .attr('stroke', '#06B6D4')
    .attr('stroke-width', 1.5)
    .attr('opacity', 0.6);

  // Main dot
  nodeGroup.append('circle')
    .attr('r', d => d.radius)
    .attr('fill', d => {
      const c = ivGetCatById(d.category, data);
      return c ? c.color : '#7C3AED';
    })
    .attr('opacity', d => d.status === 'archived' ? 0.3 : 0.85);

  // Label
  nodeGroup.append('text')
    .attr('dy', d => d.radius + 14)
    .attr('text-anchor','middle')
    .attr('font-size', 10)
    .attr('font-family','Space Grotesk, sans-serif')
    .attr('fill','rgba(241,245,249,0.7)')
    .text(d => d.title.slice(0,18) + (d.title.length > 18 ? '…' : ''));

  sim.on('tick', () => {
    link
      .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
    nodeGroup.attr('transform', d => `translate(${Math.max(20,Math.min(W-20,d.x))},${Math.max(20,Math.min(H-20,d.y))})`);
  });
}

function ivLoadD3(cb) {
  if (typeof d3 !== 'undefined') { cb(); return; }
  const s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js';
  s.onload = cb;
  s.onerror = () => {
    const wrap = document.getElementById('iv-brainmap-wrap');
    if (wrap) wrap.innerHTML = `
      <div class="iv-brainmap-fallback">
        <div>Brain Map unavailable.</div>
        <button onclick="ivSetView('grid')" class="iv-new-btn" style="margin-top:8px;">Switch to Grid</button>
      </div>`;
  };
  document.head.appendChild(s);
}

// Tooltip
function ivShowNodeTooltip(event, d) {
  const tip = document.getElementById('iv-node-tooltip');
  if (!tip) return;
  tip.style.display = 'block';
  tip.querySelector('.iv-node-tooltip-title').textContent = d.title;
  tip.querySelector('.iv-node-tooltip-meta').textContent = `${d.category} · ${d.timeAgo}`;
  tip.querySelector('.iv-node-tooltip-content').textContent = d.content.slice(0, 80) + (d.content.length > 80 ? '…' : '');
  // Viewport-aware positioning
  const x = Math.min(event.clientX + 12, window.innerWidth - 240);
  const y = Math.min(event.clientY + 12, window.innerHeight - 120);
  tip.style.left = x + 'px';
  tip.style.top  = y + 'px';
}
function ivHideNodeTooltip() {
  const tip = document.getElementById('iv-node-tooltip');
  if (tip) tip.style.display = 'none';
}

// ═══════════════════════════════════════════════════════════
//  CUSTOM CATEGORY MODAL
// ═══════════════════════════════════════════════════════════

function ivOpenCatModal() {
  _ivCustomColor = COLOR_SWATCHES[0];
  const modal = document.getElementById('iv-cat-modal');
  if (!modal) return;
  modal.classList.add('open');
  const swatches = modal.querySelectorAll('.iv-color-swatch');
  swatches.forEach((s,i) => {
    s.style.background = COLOR_SWATCHES[i];
    s.classList.toggle('selected', i === 0);
    s.onclick = () => {
      _ivCustomColor = COLOR_SWATCHES[i];
      swatches.forEach((x,j) => x.classList.toggle('selected', j===i));
    };
  });
}

function ivCloseCatModal() {
  document.getElementById('iv-cat-modal')?.classList.remove('open');
}

function ivAddCustomCat() {
  const data = ivLoad();
  if ((data.custom_categories||[]).length >= 12) { ivToast('Max 12 custom categories.'); return; }
  const emoji = document.getElementById('iv-cat-emoji')?.value?.trim() || '💫';
  const label = document.getElementById('iv-cat-name')?.value?.trim();
  if (!label) { ivToast('Enter a category name.'); return; }
  const id = label.toLowerCase().replace(/\s+/g,'_').replace(/[^a-z0-9_]/g,'');
  data.custom_categories = data.custom_categories || [];
  if (data.custom_categories.find(c=>c.id===id)) { ivToast('Category already exists.'); return; }
  data.custom_categories.push({ id, emoji, label, color: _ivCustomColor });
  ivSave(data);
  ivCloseCatModal();
  ivRenderCategoryBar();
  ivUpdateStats();
  ivToast(`✨ Category "${label}" added!`);
}

// ═══════════════════════════════════════════════════════════
//  STATS + HELPERS
// ═══════════════════════════════════════════════════════════

function ivComputeStats(data) {
  const active = data.ideas.filter(i=>i.status!=='archived');
  return {
    total: active.length,
    this_week: active.filter(i=>ivIsThisWeek(i.created_at)).length,
    hot_count: active.filter(i=>i.status==='hot').length,
    learn_this_count: active.filter(i=>i.learn_this?.flagged).length,
  };
}

// ═══════════════════════════════════════════════════════════
//  ERROR STATE
// ═══════════════════════════════════════════════════════════

function ivShowError(msg) {
  const existing = document.querySelector('.iv-error-banner');
  if (existing) existing.remove();
  const banner = document.createElement('div');
  banner.className = 'iv-error-banner';
  banner.innerHTML = `⚠️ ${msg} <button onclick="this.parentElement.remove()">✕</button>`;
  document.getElementById('ideas-overlay')?.appendChild(banner);
  setTimeout(() => banner.remove(), 5000);
}

// ═══════════════════════════════════════════════════════════
//  TOAST
// ═══════════════════════════════════════════════════════════

function ivToast(msg, codexDraftId) {
  const el = document.getElementById('iv-toast');
  if (!el) return;

  if (codexDraftId) {
    el.innerHTML = `
      <div class="iv-toast-row">
        <span>${msg}</span>
        <button class="iv-toast-open" onclick="ivToastOpenCodex()">Open in Codex →</button>
        <button class="iv-toast-dismiss" onclick="ivHideToast()">✕</button>
      </div>`;
    el._codexDraftId = codexDraftId;
  } else {
    el.innerHTML = `<div class="iv-toast-row"><span>${msg}</span><button class="iv-toast-dismiss" onclick="ivHideToast()">✕</button></div>`;
  }

  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => ivHideToast(), 4000);
}
function ivHideToast() {
  document.getElementById('iv-toast')?.classList.remove('show');
}
function ivToastOpenCodex() {
  ivHideToast();
  closeIdeasVault();
  setTimeout(() => openKnowledgeLog(), 450);
}

// ═══════════════════════════════════════════════════════════
//  KEYBOARD SHORTCUTS
// ═══════════════════════════════════════════════════════════

function ivInitKeyboard() {
  // Remove old listener if any
  if (window._ivKeyListener) document.removeEventListener('keydown', window._ivKeyListener);

  window._ivKeyListener = function(e) {
    const overlay = document.getElementById('ideas-overlay');
    if (!overlay || !overlay.classList.contains('active')) return;
    const tag = document.activeElement?.tagName;
    const isTyping = ['INPUT','TEXTAREA'].includes(tag) || document.activeElement?.contentEditable === 'true';

    // Escape — close drawer or search
    if (e.key === 'Escape') {
      if (_ivDrawerId) { ivCloseDrawer(); return; }
      if (document.querySelector('.iv-top-bar.search-open')) { ivCloseSearch(); return; }
      if (document.querySelector('.iv-cat-modal.open')) { ivCloseCatModal(); return; }
      if (!isTyping) { closeIdeasVault(); }
      return;
    }

    if (isTyping) return; // Don't intercept other shortcuts when typing

    // / — focus capture bar
    if (e.key === '/') { e.preventDefault(); ivFocusCapture(); return; }
    // Ctrl+K — open search
    if ((e.ctrlKey||e.metaKey) && e.key === 'k') { e.preventDefault(); ivOpenSearch(); return; }
    // G — grid view
    if (e.key === 'g' || e.key === 'G') { ivSetView('grid'); return; }
    // M — map view
    if (e.key === 'm' || e.key === 'M') { ivSetView('brainmap'); return; }
  };

  document.addEventListener('keydown', window._ivKeyListener);
}

// Capture bar / shortcut
function ivCapKeydown(e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    ivSaveIdea();
  }
  if (e.key === 'Escape') {
    e.target.value = '';
    e.target.style.height = '';
    _ivCapTags = [];
    ivRenderCapTags();
    document.getElementById('iv-capture-meta')?.classList.remove('visible');
  }
}
function ivCapInput(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  document.getElementById('iv-capture-meta')?.classList.toggle('visible', el.value.length > 0);
}
