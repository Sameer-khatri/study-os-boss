/* ============================================================
   Knowledge Log — "The Codex"
   Logic: CRUD, spaced repetition, revision mode, streak,
          domain analytics, mastery system, gold particles
   ============================================================ */

// ── Constants ─────────────────────────────────────────────── //
const KL_KEY = 'boss_knowledge_log';

const KNOWLEDGE_DOMAINS = [
  { id:'all',     emoji:'📚', label:'All',     color:'#E8C547' },
  { id:'tech',    emoji:'💻', label:'Tech',    color:'#7C3AED' },
  { id:'dsa',     emoji:'🧠', label:'DSA',     color:'#06B6D4' },
  { id:'math',    emoji:'📐', label:'Math',    color:'#F59E0B' },
  { id:'design',  emoji:'🎨', label:'Design',  color:'#EC4899' },
  { id:'career',  emoji:'💼', label:'Career',  color:'#10B981' },
  { id:'world',   emoji:'🌍', label:'World',   color:'#3B82F6' },
  { id:'health',  emoji:'💪', label:'Health',  color:'#EF4444' },
  { id:'reading', emoji:'📖', label:'Reading', color:'#84CC16' },
  { id:'other',   emoji:'⚡', label:'Other',   color:'#64748B' },
];

const KL_REVISION_INTERVALS = { 1:1, 2:2, 3:4, 4:10, 5:21 };

// ── State ─────────────────────────────────────────────────── //
let klCurrentDomain  = 'all';
let klSearchQuery    = '';
let klEditingId      = null;
let klReadingId      = null;
let klRevisionId     = null;
let klEntryMastery   = 3;
let klNewEntryTags   = [];

// ── Storage ───────────────────────────────────────────────── //
function klLoad() {
  const defaultData = {
    version:'1.0',
    streak:{ current:0, longest:0, last_log_date:null },
    entries:[],
    stats:{ total_entries:0, mastered:0, total_revisions:0 }
  };
  try {
    const raw = localStorage.getItem(KL_KEY);
    if (!raw) return defaultData;
    
    let parsed = JSON.parse(raw);
    
    // Legacy support: if it's just an array, wrap it in the object structure
    if (Array.isArray(parsed)) {
      console.warn("Codex: Migrating legacy array data to object structure.");
      const data = { ...defaultData, entries: parsed };
      data.stats.total_entries = parsed.length;
      return data;
    }
    
    // Ensure critical properties exist
    if (!parsed || !parsed.entries) return defaultData;
    
    return parsed;
  } catch(e) {
    console.error("Codex Load Error:", e);
    return defaultData;
  }
}
function klSave(data) { localStorage.setItem(KL_KEY, JSON.stringify(data)); }
function klGetEntries() { return klLoad().entries; }

function klUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random()*16|0; return (c==='x'?r:(r&0x3|0x8)).toString(16);
  });
}
function klDaysBetween(iso) {
  if (!iso) return 999;
  return Math.floor((Date.now()-new Date(iso))/86400000);
}
function klTimeAgo(iso) {
  if (!iso) return 'Never';
  const d = klDaysBetween(iso);
  if (d===0) return 'today';
  if (d===1) return '1d ago';
  if (d<7) return `${d}d ago`;
  return `${Math.floor(d/7)}w ago`;
}
function klFmtDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
}

// ── Open/Close Overlay ────────────────────────────────────── //
function openKnowledgeLog() {
  const overlay = document.getElementById('knowledge-overlay');
  if (!overlay) return;
  overlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => {
    overlay.classList.add('active');
    initKnowledgeLog();
  });
}
function closeKnowledgeLog() {
  const overlay = document.getElementById('knowledge-overlay');
  if (!overlay) return;
  overlay.classList.remove('active');
  overlay.style.opacity = '0';
  overlay.style.transform = 'perspective(1200px) rotateY(90deg)';
  setTimeout(() => {
    overlay.style.display = 'none';
    overlay.style.opacity = '';
    overlay.style.transform = '';
    document.body.style.overflow = '';
  }, 420);
}

// ── Init ──────────────────────────────────────────────────── //
function initKnowledgeLog() {
  renderKLHeader();
  renderKLDomains();
  renderKLFeed();
  renderKLSidebar();
}

// ── Header Stats ──────────────────────────────────────────── //
function renderKLHeader() {
  const data = klLoad();
  const entries = data.entries;
  const mastered = entries.filter(e => e.status === 'mastered').length;
  const total = entries.length;
  const streak = data.streak.current;

  const totalRevisions = entries.reduce((s,e) => s+(e.revision_count||0), 0);

  const el = document.getElementById('kl-header-stats');
  if (el) el.innerHTML = `
    <span class="kl-streak-chip">🔥 <strong>${streak}</strong>-day streak</span>
    <span class="kl-streak-chip">⚡ <strong>${total}</strong> total concepts</span>
    <span class="kl-streak-chip">🏆 <strong>${mastered}</strong> mastered</span>
    <span class="kl-streak-chip">🔁 <strong>${totalRevisions}</strong> revisions</span>
  `;
}

// ── Domain Filter ─────────────────────────────────────────── //
function renderKLDomains() {
  const bar = document.getElementById('kl-domain-bar');
  if (!bar) return;
  const entries = klGetEntries();

  bar.innerHTML = KNOWLEDGE_DOMAINS.map(d => {
    const count = d.id === 'all' ? entries.length : entries.filter(e=>e.domain===d.id).length;
    return `
      <button class="kl-domain-pill ${klCurrentDomain===d.id?'active':''}"
              onclick="klSetDomain('${d.id}')">
        ${d.emoji} ${d.label} <span style="opacity:0.6;font-size:0.68rem;font-family:'Space Mono',monospace;">${count}</span>
      </button>
    `;
  }).join('');
}

function klSetDomain(id) {
  klCurrentDomain = id;
  renderKLDomains();
  renderKLFeed();
}

// ── Entry Feed ────────────────────────────────────────────── //
function renderKLFeed() {
  const feed = document.getElementById('kl-feed-list');
  if (!feed) return;
  let entries = klGetEntries();

  if (klCurrentDomain !== 'all') entries = entries.filter(e=>e.domain===klCurrentDomain);
  if (klSearchQuery) {
    const q = klSearchQuery.toLowerCase();
    entries = entries.filter(e =>
      (e.title||'').toLowerCase().includes(q) ||
      (e.content?.what_learned||'').toLowerCase().includes(q) ||
      (e.tags||[]).some(t=>t.toLowerCase().includes(q))
    );
  }

  if (entries.length === 0) {
    feed.innerHTML = `
      <div class="kl-empty">
        <div class="kl-empty-icon">📖</div>
        <div class="kl-empty-title">The Codex is empty.</div>
        <p style="color:#6B7280;font-size:0.85rem;">Everything you learn, preserved forever.</p>
      </div>`;
    return;
  }

  feed.innerHTML = entries.map(e => buildKLCard(e)).join('');
}

function buildKLCard(entry) {
  const domain = KNOWLEDGE_DOMAINS.find(d => d.id === entry.domain) || KNOWLEDGE_DOMAINS[KNOWLEDGE_DOMAINS.length-1];
  const masteryPct = ((entry.mastery_score||1)/5)*100;
  const isMastered = entry.status === 'mastered';
  const isNew = klDaysBetween(entry.created_at) < 1;

  return `
    <div class="knowledge-card ${isMastered?'mastered':''} ${isNew?'new-entry':''}"
         data-entry-id="${entry.id}">
      <div class="kc-meta-row">
        <div class="kc-domain-tag">
          <span class="kc-dot" style="background:${domain.color};"></span>
          ${domain.emoji} ${domain.label}
          ${entry.tags?.length ? `· ${entry.tags.slice(0,2).map(t=>'#'+t).join(' ')}` : ''}
        </div>
        <span class="kc-date">${klFmtDate(entry.created_at)}</span>
      </div>
      <div class="kc-divider"></div>
      <div class="kc-title">${escKL(entry.title||'Untitled Entry')}</div>
      <div class="kc-preview">${escKL(entry.content?.what_learned||'')}</div>
      ${entry.tags?.length ? `
        <div class="kc-tags">${entry.tags.map(t=>`<span class="kc-tag">#${escKL(t)}</span>`).join('')}</div>
      ` : ''}
      <div class="kc-divider"></div>
      <div class="kc-bottom">
        <div class="kc-mastery">
          <div class="kc-mastery-bar-track">
            <div class="kc-mastery-bar-fill" style="width:${masteryPct}%;${isMastered?'background:#4ADEAA;':''}"></div>
          </div>
          <span class="kc-mastery-label">${entry.mastery_score||1}/5 ${isMastered?'✦ Mastered':''}</span>
        </div>
        <span class="kc-revised">Revised ${klTimeAgo(entry.last_revised)}</span>
      </div>
      <div class="kc-actions">
        <button class="kc-action-btn primary" onclick="klOpenReading('${entry.id}')">📖 Read Full Entry</button>
        <button class="kc-action-btn" onclick="klOpenRevision('${entry.id}')">⚡ Quick Revise</button>
      </div>
    </div>
  `;
}

function escKL(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── Sidebar ───────────────────────────────────────────────── //
function renderKLSidebar() {
  const data = klLoad();
  const entries = data.entries;
  const today = new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'});
  const loggedToday = entries.filter(e => klDaysBetween(e.created_at)===0).length;

  // Today
  const todayEl = document.getElementById('kl-sidebar-today');
  if (todayEl) todayEl.innerHTML = `
    <div class="kl-today-date">${new Date().toLocaleDateString('en-US',{weekday:'long'})}</div>
    <div class="kl-today-sub">${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</div>
    <div style="font-size:0.78rem;color:#6B7280;margin-bottom:10px;">Logged today: <strong style="color:#E8C547;">${loggedToday}</strong></div>
    <button class="kl-btn kl-btn-primary" style="width:100%;font-size:0.8rem;padding:8px;" onclick="klOpenNewEntry()">+ Log Something</button>
  `;

  // Revision due
  const due = entries.filter(e => klRevisionDue(e)).slice(0,5);
  const revEl = document.getElementById('kl-sidebar-revise');
  if (revEl) {
    if (due.length === 0) {
      revEl.innerHTML = `<div style="color:#6B7280;font-size:0.78rem;">Nothing due. You're a scholar. 📚</div>`;
    } else {
      revEl.innerHTML = due.map(e => {
        const days = e.last_revised ? klDaysBetween(e.last_revised) : klDaysBetween(e.created_at);
        return `
          <div class="kl-revision-item" onclick="klOpenRevision('${e.id}')">
            <span class="kl-revision-name">${escKL((e.title||'').slice(0,24))}${(e.title||'').length>24?'…':''}</span>
            <span class="kl-revision-days">${days}d</span>
          </div>
        `;
      }).join('');
    }
  }

  // Mastered
  const mastered = entries.filter(e => e.status==='mastered').slice(0,5);
  const mastEl = document.getElementById('kl-sidebar-mastered');
  if (mastEl) {
    mastEl.innerHTML = mastered.length
      ? mastered.map(e=>`<div class="kl-mastered-item">${escKL((e.title||'').slice(0,22))}</div>`).join('')
      : `<div style="color:#6B7280;font-size:0.78rem;">Master your first concept!</div>`;
  }

  // Domain breakdown
  const domEl = document.getElementById('kl-sidebar-domains');
  if (domEl) {
    const domCounts = {};
    entries.forEach(e => { domCounts[e.domain] = (domCounts[e.domain]||0)+1; });
    const maxCount = Math.max(...Object.values(domCounts), 1);
    const sorted = Object.entries(domCounts).sort((a,b)=>b[1]-a[1]).slice(0,5);
    domEl.innerHTML = sorted.map(([id, cnt]) => {
      const d = KNOWLEDGE_DOMAINS.find(x=>x.id===id);
      if (!d) return '';
      return `
        <div class="kl-domain-stat">
          <span class="kl-domain-stat-label">${d.emoji} ${d.label}</span>
          <div class="kl-domain-stat-bar-track">
            <div class="kl-domain-stat-fill" style="width:${Math.round(cnt/maxCount*100)}%;background:${d.color};"></div>
          </div>
          <span class="kl-domain-stat-count">${cnt}</span>
        </div>
      `;
    }).join('') || `<div style="color:#6B7280;font-size:0.78rem;">No entries yet.</div>`;
  }
}

function klRevisionDue(entry) {
  const score = entry.mastery_score || 1;
  const interval = KL_REVISION_INTERVALS[score] || 4;
  const daysSince = klDaysBetween(entry.last_revised || entry.created_at);
  return daysSince >= interval;
}

// ── Streak ────────────────────────────────────────────────── //
function klUpdateStreak(data) {
  const today = new Date().toISOString().slice(0,10);
  if (!data.streak.last_log_date) {
    data.streak.current = 1;
    data.streak.last_log_date = today;
    return;
  }
  const last = data.streak.last_log_date;
  const diff = klDaysBetween(last + 'T00:00:00Z');
  if (diff === 0) return;
  if (diff === 1) { data.streak.current++; }
  else            { data.streak.current = 1; }
  data.streak.last_log_date = today;
  if (data.streak.current > data.streak.longest) data.streak.longest = data.streak.current;
}

// ── New Entry Modal ───────────────────────────────────────── //
function klOpenNewEntry(editId) {
  klEditingId = editId || null;
  klEntryMastery = 3;
  klNewEntryTags = [];

  const modal = document.getElementById('kl-entry-modal');
  if (!modal) return;
  modal.classList.add('open');

  let existing = null;
  if (editId) {
    existing = klGetEntries().find(e=>e.id===editId);
    if (existing) klEntryMastery = existing.mastery_score || 3;
  }

  const box = document.getElementById('kl-entry-box');
  if (!box) return;

  box.innerHTML = `
    <div class="kl-modal-header">
      <h2>${editId ? '✏️ Edit Entry' : '📖 What did you learn?'}</h2>
      <button class="kl-modal-close" onclick="klCloseEntry()">×</button>
    </div>

    <div class="kl-entry-meta-row">
      <select id="kl-e-domain" class="kl-entry-select">
        ${KNOWLEDGE_DOMAINS.filter(d=>d.id!=='all').map(d=>
          `<option value="${d.id}" ${existing?.domain===d.id?'selected':''}>${d.emoji} ${d.label}</option>`
        ).join('')}
      </select>
      <input id="kl-e-tags" class="kl-entry-tags-input" placeholder="#tag1 #tag2" value="${existing?.tags?.map(t=>'#'+t).join(' ')||''}">
    </div>

    <div class="kl-entry-title-box">
      <input id="kl-e-title" class="kl-entry-title-input"
             placeholder="Give this entry a title..."
             value="${escKL(existing?.title||'')}">
    </div>

    <div class="kl-entry-field">
      <div class="kl-entry-field-label">What I Learned *</div>
      <div class="kl-entry-field-sub">The actual knowledge, explained clearly in your own words.</div>
      <textarea id="kl-e-what" class="kl-entry-textarea required"
                placeholder="The key insight is...">${escKL(existing?.content?.what_learned||'')}</textarea>
    </div>

    <div class="kl-entry-field">
      <div class="kl-entry-field-label">Why It Matters</div>
      <div class="kl-entry-field-sub">Where will I use this? How does it change how I work?</div>
      <textarea id="kl-e-why" class="kl-entry-textarea"
                placeholder="This changes how I...">${escKL(existing?.content?.why_matters||'')}</textarea>
    </div>

    <div class="kl-entry-field">
      <div class="kl-entry-field-label">Real-World Example</div>
      <div class="kl-entry-field-sub">Give one concrete example of this in action.</div>
      <textarea id="kl-e-example" class="kl-entry-textarea"
                placeholder="Before: ... After: ...">${escKL(existing?.content?.real_example||'')}</textarea>
    </div>

    <div class="kl-entry-field">
      <div class="kl-entry-field-label">Source</div>
      <textarea id="kl-e-source" class="kl-entry-textarea" rows="2" style="min-height:60px;"
                placeholder="YouTube / Article / Book / Course / Experience...">${escKL(existing?.content?.source||'')}</textarea>
    </div>

    <div class="kl-entry-divider"></div>
    <div class="kl-entry-field">
      <div class="kl-entry-field-label">Initial Mastery</div>
      <div class="kl-entry-field-sub">How well do you understand this RIGHT NOW?</div>
      <div class="kl-mastery-selector" id="kl-mastery-sel">
        ${[1,2,3,4,5].map(n=>`
          <button class="kl-mastery-btn ${n===klEntryMastery?'selected':''}"
                  onclick="klSelectMastery(${n})">${n}</button>
        `).join('')}
      </div>
    </div>

    <div class="kl-entry-divider"></div>
    <div style="display:flex;gap:10px;justify-content:flex-end;">
      <button class="kl-btn kl-btn-ghost" onclick="klCloseEntry()">Cancel</button>
      <button class="kl-btn kl-btn-primary" onclick="klSaveEntry()">Save Entry ✦</button>
    </div>
  `;
}

function klSelectMastery(n) {
  klEntryMastery = n;
  document.querySelectorAll('.kl-mastery-btn').forEach((btn, i) => {
    btn.classList.toggle('selected', i+1===n);
  });
}

function klCloseEntry() {
  const modal = document.getElementById('kl-entry-modal');
  if (modal) modal.classList.remove('open');
  klEditingId = null;
}

function klSaveEntry() {
  const title   = document.getElementById('kl-e-title')?.value?.trim();
  const what    = document.getElementById('kl-e-what')?.value?.trim();
  if (!what) { klToast('⚠️ "What I Learned" is required.'); return; }

  const domain  = document.getElementById('kl-e-domain')?.value || 'tech';
  const why     = document.getElementById('kl-e-why')?.value?.trim()||'';
  const example = document.getElementById('kl-e-example')?.value?.trim()||'';
  const source  = document.getElementById('kl-e-source')?.value?.trim()||'';
  const tagsRaw = document.getElementById('kl-e-tags')?.value||'';
  const tags = tagsRaw.match(/#(\w+)/g)?.map(t=>t.slice(1)) || [];

  const data = klLoad();

  if (klEditingId) {
    const entry = data.entries.find(e=>e.id===klEditingId);
    if (entry) {
      entry.title   = title || 'Untitled Entry';
      entry.domain  = domain;
      entry.tags    = tags;
      entry.content = { what_learned:what, why_matters:why, real_example:example, source };
      entry.mastery_score = klEntryMastery;
    }
  } else {
    const entry = {
      id: klUUID(),
      title: title || 'Untitled Entry',
      domain,
      tags,
      content: { what_learned:what, why_matters:why, real_example:example, source },
      mastery_score: klEntryMastery,
      created_at: new Date().toISOString(),
      last_revised: null,
      revision_count: 0,
      revision_history: [],
      status: 'active',
    };
    data.entries.unshift(entry);
    klUpdateStreak(data);
    data.stats.total_entries = data.entries.length;
  }
  klSave(data);

  klCloseEntry();
  renderKLFeed();
  renderKLSidebar();
  renderKLHeader();
  renderKLDomains();

  // Gold particle burst
  klGoldBurst();
  klToast('✦ Entry saved to The Codex!');

  // Mark new-entry badge
  setTimeout(() => {
    const first = document.querySelector('.knowledge-card');
    if (first) {
      first.classList.add('new-entry');
      setTimeout(() => first.classList.remove('new-entry'), 24*3600*1000);
    }
  }, 100);
}

// ── Full Entry Reading View ───────────────────────────────── //
function klOpenReading(id) {
  klReadingId = id;
  const modal = document.getElementById('kl-reading-modal');
  if (!modal) return;
  modal.classList.add('open');
  renderKLReading(id);
}
function klCloseReading() {
  const modal = document.getElementById('kl-reading-modal');
  if (modal) modal.classList.remove('open');
  klReadingId = null;
  // Close revision panel too
  const revPanel = document.getElementById('kl-revision-panel');
  if (revPanel) revPanel.classList.remove('open');
}

function renderKLReading(id) {
  const box = document.getElementById('kl-reading-content');
  if (!box) return;
  const entry = klGetEntries().find(e=>e.id===id);
  if (!entry) return;

  const domain = KNOWLEDGE_DOMAINS.find(d=>d.id===entry.domain) || KNOWLEDGE_DOMAINS[KNOWLEDGE_DOMAINS.length-1];
  const masteryPct = ((entry.mastery_score||1)/5)*100;
  const isMastered = entry.status === 'mastered';

  box.innerHTML = `
    <div class="kl-reading-topbar">
      <button class="kl-reading-back" onclick="klCloseReading()">← Back to Codex</button>
      <div class="kl-reading-actions">
        <button class="kl-btn kl-btn-ghost" style="font-size:0.8rem;padding:6px 12px;" onclick="klOpenNewEntry('${id}')">✏️ Edit</button>
        <button class="kl-btn" style="background:rgba(239,68,68,0.1);color:#EF4444;border:1px solid rgba(239,68,68,0.2);font-size:0.8rem;padding:6px 12px;" onclick="klDeleteEntry('${id}')">🗑️ Delete</button>
      </div>
    </div>

    <div class="kl-reading-divider"></div>
    <div class="kl-reading-meta">
      <span class="kc-dot" style="background:${domain.color};display:inline-block;width:7px;height:7px;border-radius:50%;margin-right:4px;"></span>
      ${domain.emoji} ${domain.label}  ·  ${klFmtDate(entry.created_at)}  ·  Last revised ${klTimeAgo(entry.last_revised)}
    </div>

    <div class="kl-reading-title">${escKL(entry.title||'Untitled Entry')}</div>
    <div class="kl-reading-title-underline"></div>

    ${entry.content?.what_learned ? `
      <div class="kl-reading-section-label">What I Learned</div>
      <div class="kl-reading-section-divider"></div>
      <div class="kl-reading-body">${escKL(entry.content.what_learned)}</div>
    ` : ''}

    ${entry.content?.why_matters ? `
      <div class="kl-reading-section-label">Why It Matters</div>
      <div class="kl-reading-section-divider"></div>
      <div class="kl-reading-body">${escKL(entry.content.why_matters)}</div>
    ` : ''}

    ${entry.content?.real_example ? `
      <div class="kl-reading-section-label">Real-World Example</div>
      <div class="kl-reading-section-divider"></div>
      <div class="kl-reading-body">${escKL(entry.content.real_example)}</div>
    ` : ''}

    ${entry.content?.source ? `
      <div class="kl-reading-section-label">Source</div>
      <div class="kl-reading-section-divider"></div>
      <div class="kl-reading-body" style="color:#6B7280;font-size:0.85rem;">${escKL(entry.content.source)}</div>
    ` : ''}

    <div class="kl-reading-divider"></div>
    ${entry.tags?.length ? `<div class="kl-reading-tags">${entry.tags.map(t=>`<span class="kl-reading-tag">#${escKL(t)}</span>`).join('')}</div>` : ''}

    <div style="margin:16px 0;">
      <span style="font-size:0.78rem;color:#6B7280;font-family:'Space Mono',monospace;">MASTERY LEVEL: </span>
      <div class="kl-reading-mastery-bar-track">
        <div class="kl-reading-mastery-bar-fill" style="width:${masteryPct}%;${isMastered?'background:#4ADEAA;':''}"></div>
      </div>
      <span style="font-size:0.82rem;color:#E8C547;font-family:'Space Mono',monospace;">${entry.mastery_score||1}/5${isMastered?' ✦ Mastered':''}</span>
    </div>
    ${entry.revision_history?.length ? `
      <div class="kl-revision-history">
        Revision history: ${entry.revision_history.map(r=>`${new Date(r.date).toLocaleDateString('en-US',{month:'short',day:'numeric'})} (${r.score_after})`).join(' → ')}
      </div>
    ` : ''}

    <div style="margin-top:24px;">
      <button class="kl-btn" style="background:rgba(232,197,71,0.12);border:1px solid rgba(232,197,71,0.3);color:#E8C547;font-weight:700;padding:12px 28px;font-size:0.9rem;"
              onclick="klOpenRevision('${id}', true)">⚡ Start Quick Revision</button>
    </div>

    <!-- Revision panel (inline) -->
    <div id="kl-revision-panel">
      <div class="kl-revision-title">⚡ Revision Mode — ${escKL(entry.title||'Untitled')}</div>
      <p style="color:#6B7280;font-size:0.85rem;margin-bottom:16px;">Without looking at the content above — what do you remember about this?</p>
      <textarea id="kl-recall-area" class="kl-revision-recall-area" placeholder="Write everything you remember..."></textarea>
      <button class="kl-reveal-btn" onclick="klReveal('${id}')">Reveal & Compare</button>
      <div id="kl-score-section" style="display:none;">
        <div style="margin-top:20px;font-size:0.85rem;font-weight:600;color:#FAFAFA;margin-bottom:8px;">How well did you remember?</div>
        <div class="kl-score-row">
          ${[
            [1,'😵 Forgot'],
            [2,'😐 Bits'],
            [3,'🙂 Most'],
            [4,'😊 Almost all'],
            [5,'🔥 Perfect'],
          ].map(([s,l])=>`<button class="kl-score-btn" onclick="klScoreRevision('${id}',${s})">${l}</button>`).join('')}
        </div>
      </div>
    </div>
  `;
}

function klOpenRevision(id, inline) {
  klRevisionId = id;
  if (inline) {
    const panel = document.getElementById('kl-revision-panel');
    if (panel) { panel.classList.add('open'); panel.scrollIntoView({behavior:'smooth'}); }
    return;
  }
  // Open reading view first, then revision
  klOpenReading(id);
  setTimeout(() => {
    const panel = document.getElementById('kl-revision-panel');
    if (panel) { panel.classList.add('open'); panel.scrollIntoView({behavior:'smooth'}); }
  }, 300);
}

function klReveal(id) {
  const section = document.getElementById('kl-score-section');
  if (section) section.style.display = 'block';
  const btn = document.querySelector('.kl-reveal-btn');
  if (btn) btn.style.display = 'none';
  klToast('Compare your answer with the entry above ☝️');
}

function klScoreRevision(id, score) {
  const data = klLoad();
  const entry = data.entries.find(e=>e.id===id);
  if (!entry) return;

  const prevScore = entry.mastery_score || 1;
  entry.mastery_score = score;
  entry.last_revised = new Date().toISOString();
  entry.revision_count = (entry.revision_count||0)+1;
  entry.revision_history = entry.revision_history || [];
  entry.revision_history.push({ date:new Date().toISOString(), score_before:prevScore, score_after:score });
  data.stats.total_revisions = (data.stats.total_revisions||0)+1;

  // Promote to mastered if score reaches 5
  if (score >= 5 && entry.status !== 'mastered') {
    entry.status = 'mastered';
    data.stats.mastered = (data.stats.mastered||0)+1;
    klToast('✦ Entry mastered! Gold status unlocked.');
    klGoldBurst();
  } else {
    klToast(`Revision scored: ${score}/5`);
  }

  klSave(data);
  klCloseReading();
  renderKLFeed();
  renderKLSidebar();
  renderKLHeader();
}

function klDeleteEntry(id) {
  if (!confirm('Delete this entry from The Codex?')) return;
  const data = klLoad();
  data.entries = data.entries.filter(e=>e.id!==id);
  data.stats.total_entries = data.entries.length;
  klSave(data);
  klCloseReading();
  renderKLFeed();
  renderKLSidebar();
  renderKLHeader();
  renderKLDomains();
  klToast('Entry deleted.');
}

// ── Gold Particle Burst ─────────────────────────────────────//
function klGoldBurst() {
  const colors = ['#E8C547','#FFD700','#FFA500','#4ADEAA'];
  for (let i=0; i<16; i++) {
    const el = document.createElement('div');
    el.className = 'kl-gold-particle';
    const tx = (Math.random()-0.5)*200;
    const ty = (Math.random()-1)*150;
    el.style.setProperty('--tx', tx+'px');
    el.style.setProperty('--ty', ty+'px');
    el.style.background = colors[Math.floor(Math.random()*colors.length)];
    el.style.left = (window.innerWidth/2 + (Math.random()-0.5)*100) + 'px';
    el.style.top  = (window.innerHeight/2 + (Math.random()-0.5)*100) + 'px';
    el.style.animationDelay = (Math.random()*0.3) + 's';
    document.getElementById('knowledge-overlay')?.appendChild(el);
    setTimeout(() => el.remove(), 1200);
  }
}

// ── Search ────────────────────────────────────────────────── //
function klSearch(q) {
  klSearchQuery = q;
  renderKLFeed();
}

// ── Toast ─────────────────────────────────────────────────── //
function klToast(msg) {
  const el = document.getElementById('kl-toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 3000);
}
