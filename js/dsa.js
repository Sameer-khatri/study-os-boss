/* ============================================================
   DSA Story Forge — Logic Engine
   Handles: CRUD, solve-level logic, spaced repetition,
            gamification, LeetCode URL parse, pattern analytics
   ============================================================ */

// ── Constants ─────────────────────────────────────────────── //
const DSA_KEY = 'boss_dsa_forge';

const SOLVE_LEVELS = {
  WARRIOR:   { emoji: '💪', label: 'Warrior',   cls: 'dsa-badge-warrior' },
  FIGHTER:   { emoji: '🟡', label: 'Fighter',   cls: 'dsa-badge-fighter' },
  LEARNER:   { emoji: '🟠', label: 'Learner',   cls: 'dsa-badge-learner' },
  ASSISTED:  { emoji: '🔵', label: 'Assisted',  cls: 'dsa-badge-assisted' },
  REBUILDER: { emoji: '🔴', label: 'Rebuilder', cls: 'dsa-badge-rebuilder' },
};
const LEVEL_ORDER = ['REBUILDER','ASSISTED','LEARNER','FIGHTER','WARRIOR'];

const PATTERNS = [
  'Arrays & Hashing','Two Pointers','Sliding Window','Stack','Binary Search',
  'Linked List','Trees','Tries','Heap / Priority Queue','Backtracking',
  'Graphs — BFS','Graphs — DFS','Dynamic Programming — 1D','Dynamic Programming — 2D',
  'Greedy','Intervals','Bit Manipulation','Math & Geometry','Divide & Conquer',
  'Recursion','Segment Tree','Union Find'
];

const BADGES_DEF = [
  { id:'first-blood',     emoji:'🏹', label:'First Blood',     desc:'Solve your first problem.' },
  { id:'pattern-hunter',  emoji:'⚡', label:'Pattern Hunter',  desc:'Solve 5 problems in one pattern.' },
  { id:'the-thinker',     emoji:'🧠', label:'The Thinker',     desc:'10 WARRIOR-level solves.' },
  { id:'the-scholar',     emoji:'📖', label:'The Scholar',     desc:'Complete all 5 chapters on 20 problems.' },
  { id:'revisor',         emoji:'🔁', label:'Revisor',         desc:'Revise 10 problems.' },
  { id:'pattern-master',  emoji:'🗺️', label:'Pattern Master',  desc:'Solve at least 1 problem in 15 patterns.' },
  { id:'boss-slayer',     emoji:'💀', label:'Boss Slayer',     desc:'Solve a Hard problem at WARRIOR level.' },
  { id:'week-warrior',    emoji:'🔥', label:'Week Warrior',    desc:'7-day solving streak.' },
];

const REVISION_INTERVALS = { 1:1, 2:3, 3:7, 4:14, 5:30 };

// ── State ─────────────────────────────────────────────────── //
let dsaCurrentSubscreen = 'war-room';
let dsaViewingProblemId = null;
let dsaForgeEditId      = null;
let dsaFilterDiff       = 'all';
let dsaFilterPattern    = 'all';
let dsaFilterLevel      = 'all';
let dsaSearchQuery      = '';
let dsaSortOrder        = 'recent';
let dsaAttemptCount     = 1;
let dsaSelectedDiff     = '';
let dsaSelectedLang     = 'python';

// ── Storage ───────────────────────────────────────────────── //
function dsaLoad() {
  try {
    const raw = localStorage.getItem(DSA_KEY);
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return {
    version: '1.0',
    last_updated: new Date().toISOString(),
    streak: { current: 0, longest: 0, last_activity: null },
    badges_earned: [],
    problems: []
  };
}
function dsaSave(data) {
  data.last_updated = new Date().toISOString();
  localStorage.setItem(DSA_KEY, JSON.stringify(data));
}
function dsaGetProblems() { return dsaLoad().problems; }

// ── UUID ──────────────────────────────────────────────────── //
function dsaUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random()*16|0;
    return (c==='x'?r:(r&0x3|0x8)).toString(16);
  });
}

// ── Decision Tree ─────────────────────────────────────────── //
function assignSolveLevel(hintUsed, conceptLearned, studiedSolution) {
  if (studiedSolution)             return 'REBUILDER';
  if (!conceptLearned && !hintUsed) return 'WARRIOR';
  if (!conceptLearned && hintUsed)  return 'FIGHTER';
  if (conceptLearned  && !hintUsed) return 'LEARNER';
  if (conceptLearned  && hintUsed)  return 'ASSISTED';
  return 'LEARNER';
}

// ── Spaced Repetition ─────────────────────────────────────── //
function daysBetween(dateStr, now) {
  const d1 = new Date(dateStr);
  const d2 = now || new Date();
  return Math.floor((d2 - d1) / 86400000);
}
function isDueForRevision(problem) {
  const daysSolved = daysBetween(problem.date_solved);
  const score = problem.revision.revisit_score || 1;
  const interval = REVISION_INTERVALS[score] || 7;
  // Also check last revised
  if (problem.revision.last_revised) {
    const daysSinceRevised = daysBetween(problem.revision.last_revised);
    return daysSinceRevised >= interval;
  }
  return daysSolved >= interval;
}

// ── Streak ─────────────────────────────────────────────────── //
function updateStreak(data) {
  const today = new Date().toISOString().slice(0,10);
  if (!data.streak.last_activity) {
    data.streak.current = 1;
    data.streak.last_activity = today;
    return;
  }
  const last = data.streak.last_activity;
  const diff = daysBetween(last);
  if (diff === 0) return; // already counted today
  if (diff === 1) {
    data.streak.current++;
  } else {
    data.streak.current = 1;
  }
  data.streak.last_activity = today;
  if (data.streak.current > data.streak.longest) {
    data.streak.longest = data.streak.current;
  }
}

// ── Badge Check ────────────────────────────────────────────── //
function checkBadges(data) {
  const problems = data.problems;
  const earned = data.badges_earned;
  const newBadges = [];

  function earn(id) {
    if (!earned.includes(id)) {
      earned.push(id);
      newBadges.push(id);
    }
  }

  if (problems.length >= 1) earn('first-blood');

  // Pattern hunter: 5 in one pattern
  const patternCounts = {};
  problems.forEach(p => {
    patternCounts[p.pattern] = (patternCounts[p.pattern]||0)+1;
  });
  if (Object.values(patternCounts).some(c => c>=5)) earn('pattern-hunter');

  // The Thinker: 10 warriors
  if (problems.filter(p => p.solve_level==='WARRIOR').length >= 10) earn('the-thinker');

  // The Scholar: 20 problems with all 5 chapters filled
  const fullStories = problems.filter(p =>
    p.story.my_understanding && p.story.first_instinct && p.story.english_logic &&
    p.story.solution_code && p.story.real_world_connection
  );
  if (fullStories.length >= 20) earn('the-scholar');

  // Revisor: 10 total revisions
  const totalRevisions = problems.reduce((s,p) => s + (p.revision.revision_count||0), 0);
  if (totalRevisions >= 10) earn('revisor');

  // Pattern master: 15 unique patterns
  if (Object.keys(patternCounts).length >= 15) earn('pattern-master');

  // Boss Slayer
  if (problems.some(p => p.difficulty==='Hard' && p.solve_level==='WARRIOR')) earn('boss-slayer');

  // Week Warrior
  if (data.streak.current >= 7) earn('week-warrior');

  return newBadges;
}

// ── Solve Level Promotion ──────────────────────────────────── //
function tryPromote(problem) {
  if (problem.revision.revisit_score < 5) return false;
  const cur = LEVEL_ORDER.indexOf(problem.solve_level);
  if (cur < LEVEL_ORDER.length - 1) {
    problem.solve_level = LEVEL_ORDER[cur+1];
    return true;
  }
  return false;
}

// ── LeetCode URL Parser ────────────────────────────────────── //
function parseLCURL(url) {
  const match = url.match(/leetcode\.com\/problems\/([a-z0-9-]+)/i);
  if (!match) return null;
  const slug = match[1];
  const name = slug.split('-').map(w => w[0].toUpperCase()+w.slice(1)).join(' ');
  return { slug, name };
}

// ── CRUD ───────────────────────────────────────────────────── //
function dsaAddProblem(problemData) {
  const data = dsaLoad();
  const id = dsaUUID();
  const problem = {
    id,
    lc_number: parseInt(problemData.lc_number)||null,
    lc_url: problemData.lc_url||'',
    lc_slug: problemData.lc_slug||'',
    title: problemData.title||'Untitled Problem',
    difficulty: problemData.difficulty||'Medium',
    pattern: problemData.pattern||'Arrays & Hashing',
    date_solved: new Date().toISOString(),
    solve_level: problemData.solve_level||'WARRIOR',
    story: {
      my_understanding: problemData.my_understanding||'',
      first_instinct: problemData.first_instinct||'',
      english_logic: problemData.english_logic||'',
      solution_code: problemData.solution_code||'',
      solution_language: problemData.solution_language||'python',
      real_world_connection: problemData.real_world_connection||''
    },
    battle: {
      stuck_point: problemData.stuck_point||'',
      aha_moment: problemData.aha_moment||'',
      concept_learned: problemData.concept_learned||null
    },
    meta: {
      hint_used: !!problemData.hint_used,
      hint_source: problemData.hint_source||null,
      studied_solution: !!problemData.studied_solution,
      time_taken_mins: parseInt(problemData.time_taken_mins)||0,
      attempts: parseInt(problemData.attempts)||1,
      time_complexity: problemData.time_complexity||'',
      space_complexity: problemData.space_complexity||'',
      related_problems: []
    },
    revision: {
      revisit_score: 3,
      last_revised: null,
      revision_count: 0,
      revision_history: []
    }
  };
  data.problems.unshift(problem);
  updateStreak(data);
  const newBadges = checkBadges(data);
  dsaSave(data);
  if (newBadges.length > 0) {
    newBadges.forEach(bid => {
      const b = BADGES_DEF.find(x => x.id===bid);
      if (b) setTimeout(() => dsaToast(`🏆 Achievement Unlocked: ${b.emoji} ${b.label}!`), 500);
    });
  }
  return id;
}

function dsaDeleteProblem(id) {
  const data = dsaLoad();
  data.problems = data.problems.filter(p => p.id !== id);
  dsaSave(data);
}

function dsaUpdateRevisitScore(id, score) {
  const data = dsaLoad();
  const p = data.problems.find(x => x.id===id);
  if (!p) return;
  p.revision.revisit_score = score;
  p.revision.last_revised  = new Date().toISOString();
  p.revision.revision_count = (p.revision.revision_count||0)+1;
  p.revision.revision_history.push({ date: new Date().toISOString(), score_given: score });
  updateStreak(data);
  const promoted = tryPromote(p);
  const newBadges = checkBadges(data);
  dsaSave(data);
  if (promoted) {
    dsaToast(`🎉 Problem promoted to ${p.solve_level}!`);
    setTimeout(() => {
      const el = document.querySelector(`[data-problem-id="${id}"]`);
      if (el) el.classList.add('dsa-promoted');
    }, 100);
  }
  if (newBadges.length > 0) {
    newBadges.forEach(bid => {
      const b = BADGES_DEF.find(x => x.id===bid);
      if (b) setTimeout(() => dsaToast(`🏆 ${b.emoji} ${b.label} unlocked!`), 700);
    });
  }
}

// ── Render Helpers ─────────────────────────────────────────── //
function renderSolveBadge(level) {
  if (!level) return '';
  const l = SOLVE_LEVELS[level];
  if (!l) return '';
  return `<span class="dsa-badge ${l.cls}">${l.emoji} ${l.label}</span>`;
}
function renderDiffBadge(diff) {
  const cls = diff==='Easy'?'dsa-badge-easy':diff==='Medium'?'dsa-badge-medium':'dsa-badge-hard';
  return `<span class="dsa-badge ${cls}">${diff||'?'}</span>`;
}
function renderStars(score) {
  let s = '';
  for(let i=1;i<=5;i++) s += i<=score ? '★' : '☆';
  return `<span class="dsa-stars">${s}</span>`;
}
function timeAgo(isoStr) {
  if (!isoStr) return '';
  const diff = daysBetween(isoStr);
  if (diff===0) return 'today';
  if (diff===1) return '1 day ago';
  return `${diff} days ago`;
}
function patternLabel(p) { return p; }

// ── DSA Toast ─────────────────────────────────────────────── //
function dsaToast(msg) {
  const el = document.getElementById('dsa-toast');
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
  clearTimeout(el._t);
  el._t = setTimeout(() => el.style.display='none', 3500);
}

// ── Sub-screen Navigation ──────────────────────────────────── //
function dsaNav(subscreen) {
  dsaCurrentSubscreen = subscreen;
  document.querySelectorAll('.dsa-subscreen').forEach(s => s.classList.remove('dsa-active'));
  const el = document.getElementById(`dsa-${subscreen}`);
  if (el) el.classList.add('dsa-active');
  // Re-render the active screen
  switch(subscreen) {
    case 'war-room':    renderWarRoom();     break;
    case 'forge':       renderForge();       break;
    case 'scroll':      renderScroll();      break;
    case 'story-view':  renderStoryView();   break;
    case 'arena':       renderArena();       break;
  }
}

// ── WAR ROOM (Dashboard) ───────────────────────────────────── //
function renderWarRoom() {
  const data    = dsaLoad();
  const probs   = data.problems;

  // Stats
  const totalSolved   = probs.length;
  const warriorCount  = probs.filter(p=>p.solve_level==='WARRIOR').length;
  const uniquePatterns = [...new Set(probs.map(p=>p.pattern))].length;
  const streak         = data.streak.current;

  document.getElementById('dsa-stat-solved').textContent   = totalSolved;
  document.getElementById('dsa-stat-warriors').textContent = warriorCount;
  document.getElementById('dsa-stat-patterns').textContent = `${uniquePatterns}/22`;
  document.getElementById('dsa-stat-streak').textContent   = `🔥 ${streak}d`;

  // Date
  const dateEl = document.getElementById('dsa-war-room-date');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'});
  }

  // Revision due
  renderRevisionDue(data);

  // Pattern grid
  renderPatternGrid(probs);

  // Recent battles
  renderRecentBattles(probs);

  // Badges
  renderEarnedBadges(data);
}

function renderRevisionDue(data) {
  const probs   = data.problems;
  const due     = probs.filter(p => isDueForRevision(p)).slice(0,5);
  const el      = document.getElementById('dsa-revision-due-list');
  if (!el) return;

  if (due.length === 0) {
    el.innerHTML = `<div class="dsa-text-muted dsa-text-sm" style="padding:8px 0;">Nothing due. You're on top of it. ⚔️</div>`;
    document.getElementById('dsa-revision-count').textContent = '0';
    return;
  }
  document.getElementById('dsa-revision-count').textContent = due.length;
  el.innerHTML = due.map(p => {
    const days = daysBetween(p.revision.last_revised || p.date_solved);
    return `
      <div class="dsa-revision-item">
        <span>${p.lc_number ? `#${p.lc_number} ` : ''}${p.title}</span>
        <div style="display:flex;gap:0.5rem;align-items:center;">
          ${renderSolveBadge(p.solve_level)}
          <span class="dsa-text-muted dsa-text-xs">${days}d</span>
          <button class="dsa-btn dsa-btn-ghost dsa-btn-sm" onclick="dsaStartRevision('${p.id}')">Revise</button>
        </div>
      </div>
    `;
  }).join('');
}

function renderPatternGrid(probs) {
  const el = document.getElementById('dsa-pattern-grid-content');
  if (!el) return;
  const maxProblems = probs.length || 1;

  // Count by pattern & dominant level
  const pMap = {};
  probs.forEach(p => {
    if (!pMap[p.pattern]) pMap[p.pattern] = { count:0, levels:{} };
    pMap[p.pattern].count++;
    pMap[p.pattern].levels[p.solve_level] = (pMap[p.pattern].levels[p.solve_level]||0)+1;
  });

  el.innerHTML = PATTERNS.map(pat => {
    const info = pMap[pat] || { count:0, levels:{} };
    const pct  = Math.round((info.count / Math.max(maxProblems, 10)) * 100);
    let dominantEmoji = '○';
    if (info.count > 0) {
      const topLevel = Object.entries(info.levels).sort((a,b)=>b[1]-a[1])[0][0];
      dominantEmoji = SOLVE_LEVELS[topLevel]?.emoji || '○';
    }
    const barWidth = Math.min(pct * 2, 100);
    return `
      <div class="dsa-pattern-row" onclick="filterByPattern('${pat}')">
        <span class="dsa-pattern-name" title="${pat}">${pat}</span>
        <div class="dsa-pattern-bar-track">
          <div class="dsa-pattern-bar-fill" style="width:${barWidth}%"></div>
        </div>
        <span class="dsa-pattern-count">${info.count} ${dominantEmoji}</span>
      </div>
    `;
  }).join('');
}

function filterByPattern(pat) {
  dsaFilterPattern = pat;
  dsaNav('scroll');
}

function renderRecentBattles(probs) {
  const el    = document.getElementById('dsa-recent-battles');
  if (!el) return;
  const recent = [...probs].slice(0,5);
  if (recent.length === 0) {
    el.innerHTML = `<div class="dsa-empty"><div class="dsa-empty-icon">⚔️</div><div class="dsa-empty-title">The forge is cold.</div><div class="dsa-empty-sub">Time to heat it up.</div></div>`;
    return;
  }
  el.innerHTML = recent.map(p => `
    <div class="dsa-recent-item" data-level="${p.solve_level}" style="border-left-color:${levelColor(p.solve_level)};" onclick="viewProblem('${p.id}')">
      <span class="dsa-recent-title">${p.lc_number?`#${p.lc_number} `:''}${p.title}</span>
      ${renderDiffBadge(p.difficulty)}
      ${renderSolveBadge(p.solve_level)}
      <span class="dsa-recent-meta">${timeAgo(p.date_solved)}</span>
    </div>
  `).join('');
}

function renderEarnedBadges(data) {
  const el = document.getElementById('dsa-earned-badges');
  if (!el) return;
  if (data.badges_earned.length === 0) {
    el.innerHTML = `<span class="dsa-text-muted dsa-text-sm">No badges yet. Start forging.</span>`;
    return;
  }
  el.innerHTML = data.badges_earned.map(bid => {
    const b = BADGES_DEF.find(x=>x.id===bid);
    if (!b) return '';
    return `<div class="dsa-earned-badge" title="${b.desc}">${b.emoji} ${b.label}</div>`;
  }).join('');
}

function levelColor(level) {
  const map = { WARRIOR:'#22c55e', FIGHTER:'#eab308', LEARNER:'#f97316', ASSISTED:'#3b82f6', REBUILDER:'#ef4444' };
  return map[level] || '#2a2d3e';
}

// ── THE FORGE (New Problem Entry) ──────────────────────────── //
function renderForge() {
  const el = document.getElementById('dsa-forge-content');
  if (!el) return;
  dsaForgeEditId  = null;
  dsaSelectedDiff = '';
  dsaAttemptCount = 1;
  dsaSelectedLang = 'python';

  el.innerHTML = `
    <button class="dsa-back-btn" onclick="dsaNav('war-room')">← Back to War Room</button>

    <!-- Progress Steps -->
    <div class="dsa-progress-steps" id="dsa-forge-steps">
      ${['ID','Think','Logic','Code','Real'].map((l,i)=>`
        <div class="dsa-step" id="dsa-step-${i}">
          <div class="dsa-step-circle">${i+1}</div>
          <div class="dsa-step-label">${l}</div>
        </div>
        ${i<4?'<div class="dsa-step-line" id="dsa-step-line-'+i+'"></div>':''}
      `).join('')}
    </div>

    <!-- Block 1: Identity -->
    <div class="dsa-chapter-card dsa-mb-3">
      <div class="dsa-chapter-num">Identity</div>
      <div class="dsa-chapter-title">⚔️ New Battle Log</div>

      <div class="dsa-forge-identity">
        <div class="dsa-form-group">
          <label class="dsa-form-label">Problem Title</label>
          <input id="dsa-f-title" class="dsa-form-input" placeholder="e.g. Trapping Rain Water" oninput="dsaUpdateSteps()">
        </div>
        <div class="dsa-form-group">
          <label class="dsa-form-label">LeetCode #</label>
          <input id="dsa-f-lcnum" class="dsa-form-input" type="number" placeholder="42">
        </div>
      </div>
      <div class="dsa-form-group dsa-mb-3">
        <label class="dsa-form-label">LeetCode URL</label>
        <div style="display:flex;gap:8px;">
          <input id="dsa-f-url" class="dsa-form-input" placeholder="https://leetcode.com/problems/trapping-rain-water/" oninput="dsaAutoParseURL(this.value)">
          <button class="dsa-btn dsa-btn-ghost" onclick="openLCURL()" title="Open in LeetCode">↗</button>
        </div>
      </div>
      <div class="dsa-mb-3">
        <div class="dsa-form-label dsa-mb-2">Difficulty</div>
        <div class="dsa-diff-row">
          <button class="dsa-diff-btn" id="dsa-diff-Easy"   onclick="selectDiff('Easy')">Easy</button>
          <button class="dsa-diff-btn" id="dsa-diff-Medium" onclick="selectDiff('Medium')">Medium — Boss Level</button>
          <button class="dsa-diff-btn" id="dsa-diff-Hard"   onclick="selectDiff('Hard')">Hard — Boss Level ☠️</button>
        </div>
      </div>
      <div class="dsa-form-group">
        <label class="dsa-form-label">Weapon (Pattern)</label>
        <select id="dsa-f-pattern" class="dsa-form-select">
          ${PATTERNS.map(p=>`<option value="${p}">${p}</option>`).join('')}
        </select>
      </div>
    </div>

    <!-- Block 2: The Story (5 Chapters) -->
    ${[
      { id:'my_understanding', num:1, chapter:'What I Read', prompt:'Forget the problem statement. What is this problem actually asking you to do? Write it like you\'re explaining to a 10-year-old.' },
      { id:'first_instinct',  num:2, chapter:'My First Instinct', prompt:'What was your FIRST thought when you read this? Even if it was wrong. Even if it was "I have no idea". Write it.' },
      { id:'english_logic',   num:3, chapter:'The English Logic', prompt:'Before writing any code — write the solution in English. Step by step. No syntax. Just logic.' },
    ].map(c=>`
      <div class="dsa-chapter-card dsa-mb-3" id="dsa-chapter-card-${c.num}">
        <div class="dsa-chapter-num">Chapter ${c.num}</div>
        <div class="dsa-chapter-title">${c.chapter}</div>
        <div class="dsa-chapter-prompt">${c.prompt}</div>
        <textarea id="dsa-f-${c.id}" class="dsa-form-textarea" rows="4" placeholder="" oninput="dsaUpdateSteps()"></textarea>
      </div>
    `).join('')}

    <!-- Chapter 4: Code -->
    <div class="dsa-chapter-card dsa-mb-3" id="dsa-chapter-card-4">
      <div class="dsa-chapter-num">Chapter 4</div>
      <div class="dsa-chapter-title">The Code</div>
      <div class="dsa-chapter-prompt">Now translate your English logic directly into code. Line by line.</div>
      <div style="display:flex;justify-content:flex-end;margin-bottom:8px;">
        <select id="dsa-f-lang" class="dsa-form-select" style="width:auto;" onchange="dsaSelectedLang=this.value">
          ${['python','java','cpp','javascript'].map(l=>`<option value="${l}">${l.charAt(0).toUpperCase()+l.slice(1)}</option>`).join('')}
        </select>
      </div>
      <textarea id="dsa-f-code" class="dsa-form-textarea dsa-code-block" rows="10" placeholder="# Write your code here..." oninput="dsaUpdateSteps()" style="font-family:'JetBrains Mono','Fira Code',monospace;font-size:13px;"></textarea>
    </div>

    <!-- Chapter 5: Real World -->
    <div class="dsa-chapter-card dsa-mb-3" id="dsa-chapter-card-5">
      <div class="dsa-chapter-num">Chapter 5</div>
      <div class="dsa-chapter-title">The Real World</div>
      <div class="dsa-chapter-prompt">Where does this pattern exist in the real world? Don't just say "arrays are used in databases". Make it a story.</div>
      <textarea id="dsa-f-real_world" class="dsa-form-textarea" rows="4" oninput="dsaUpdateSteps()"></textarea>
    </div>

    <!-- Block 3: Battle Report -->
    <div class="dsa-chapter-card dsa-mb-3">
      <div class="dsa-chapter-num">Battle Report</div>
      <div class="dsa-chapter-title">🗡️ Where You Bled</div>

      <div class="dsa-form-group dsa-mb-3">
        <label class="dsa-form-label">Where I Got Stuck</label>
        <div class="dsa-chapter-prompt dsa-text-xs">What was the wall you hit? The exact moment your thinking broke down. Be specific.</div>
        <textarea id="dsa-f-stuck" class="dsa-form-textarea" rows="3"></textarea>
      </div>
      <div class="dsa-form-group dsa-mb-3">
        <label class="dsa-form-label">The Aha Moment ⚡</label>
        <div class="dsa-chapter-prompt dsa-text-xs">One sentence. What was the single insight that unlocked this problem?</div>
        <input id="dsa-f-aha" class="dsa-form-input" placeholder="Moving the taller bar can never increase the area.">
      </div>
      <div class="dsa-form-group" id="dsa-concept-group" style="display:none;">
        <label class="dsa-form-label">Concept Learned</label>
        <div class="dsa-chapter-prompt dsa-text-xs">Summarize the concept in your own words NOW.</div>
        <textarea id="dsa-f-concept" class="dsa-form-textarea" rows="3"></textarea>
      </div>
    </div>

    <!-- Block 4: Metadata + Solve Level -->
    <div class="dsa-chapter-card dsa-mb-3">
      <div class="dsa-chapter-num">Metadata</div>
      <div class="dsa-chapter-title">📊 Battle Stats</div>

      <div class="dsa-toggle-row">
        <div>
          <div class="dsa-toggle-label">Hint Used?</div>
          <div class="dsa-text-xs dsa-text-muted">Did you look at the hint or a hint resource?</div>
        </div>
        <label class="dsa-toggle">
          <input type="checkbox" id="dsa-f-hint" onchange="dsaUpdateSolveLevel()">
          <div class="dsa-toggle-track"></div>
        </label>
      </div>
      <div id="dsa-hint-source-row" style="display:none;padding:8px 0;">
        <input id="dsa-f-hint-source" class="dsa-form-input" placeholder="Hint source (LeetCode hint, YouTube, friend...)">
      </div>
      <div class="dsa-toggle-row">
        <div>
          <div class="dsa-toggle-label">Studied the Concept First?</div>
          <div class="dsa-text-xs dsa-text-muted">Did you not know this pattern before?</div>
        </div>
        <label class="dsa-toggle">
          <input type="checkbox" id="dsa-f-concept-learned" onchange="dsaUpdateSolveLevel()">
          <div class="dsa-toggle-track"></div>
        </label>
      </div>
      <div class="dsa-toggle-row">
        <div>
          <div class="dsa-toggle-label">Studied the Solution?</div>
          <div class="dsa-text-xs dsa-text-muted">You had to look at the full solution.</div>
        </div>
        <label class="dsa-toggle">
          <input type="checkbox" id="dsa-f-studied" onchange="dsaUpdateSolveLevel()">
          <div class="dsa-toggle-track"></div>
        </label>
      </div>

      <div class="dsa-divider"></div>

      <div class="dsa-forge-row">
        <div class="dsa-form-group">
          <label class="dsa-form-label">Time Taken (mins)</label>
          <input id="dsa-f-time" class="dsa-form-input" type="number" placeholder="45">
        </div>
        <div class="dsa-form-group">
          <label class="dsa-form-label">Attempts</label>
          <div class="dsa-stepper">
            <button onclick="adjustAttempts(-1)">−</button>
            <span id="dsa-attempt-display">1</span>
            <button onclick="adjustAttempts(1)">+</button>
          </div>
        </div>
        <div class="dsa-form-group">
          <div style="display:flex;gap:8px;">
            <div>
              <label class="dsa-form-label">Time Complexity</label>
              <input id="dsa-f-tc" class="dsa-form-input" placeholder="O(n)">
            </div>
            <div>
              <label class="dsa-form-label">Space</label>
              <input id="dsa-f-sc" class="dsa-form-input" placeholder="O(1)">
            </div>
          </div>
        </div>
      </div>

      <!-- Solve Level Display -->
      <div class="dsa-divider"></div>
      <div class="dsa-form-label">Solve Level (Auto-Assigned)</div>
      <div class="dsa-solve-level-display" id="dsa-solve-level-display" style="background:rgba(34,197,94,0.1);color:#22c55e;">
        💪 WARRIOR
      </div>
    </div>

    <!-- Save Button -->
    <div style="display:flex;justify-content:flex-end;gap:0.75rem;margin-top:1rem;padding-bottom:2rem;">
      <button class="dsa-btn dsa-btn-ghost" onclick="dsaNav('war-room')">Cancel</button>
      <button class="dsa-btn dsa-btn-primary" onclick="dsaSaveProblem()">💾 Save to Forge</button>
    </div>
  `;

  // Hook hint toggle
  document.getElementById('dsa-f-hint').addEventListener('change', function() {
    document.getElementById('dsa-hint-source-row').style.display = this.checked ? 'block' : 'none';
    dsaUpdateSolveLevel();
  });
  document.getElementById('dsa-f-concept-learned').addEventListener('change', function() {
    document.getElementById('dsa-concept-group').style.display = this.checked ? 'block' : 'none';
    dsaUpdateSolveLevel();
  });
}

function selectDiff(diff) {
  dsaSelectedDiff = diff;
  ['Easy','Medium','Hard'].forEach(d => {
    const btn = document.getElementById(`dsa-diff-${d}`);
    if (btn) btn.className = `dsa-diff-btn${d===diff?' selected-'+d.toLowerCase():''}`;
  });
}

function openLCURL() {
  const url = document.getElementById('dsa-f-url')?.value;
  if (url) window.open(url, '_blank');
}

function dsaAutoParseURL(url) {
  const parsed = parseLCURL(url);
  if (!parsed) return;
  const titleEl = document.getElementById('dsa-f-title');
  if (titleEl && !titleEl.value) titleEl.value = parsed.name;
}

function adjustAttempts(delta) {
  dsaAttemptCount = Math.max(1, dsaAttemptCount + delta);
  const el = document.getElementById('dsa-attempt-display');
  if (el) el.textContent = dsaAttemptCount;
}

function dsaUpdateSolveLevel() {
  const hintUsed        = document.getElementById('dsa-f-hint')?.checked || false;
  const conceptLearned  = document.getElementById('dsa-f-concept-learned')?.checked || false;
  const studiedSolution = document.getElementById('dsa-f-studied')?.checked || false;
  const level = assignSolveLevel(hintUsed, conceptLearned, studiedSolution);

  const colors = {
    WARRIOR:   { bg:'rgba(34,197,94,0.1)',  color:'#22c55e', text:'💪 WARRIOR' },
    FIGHTER:   { bg:'rgba(234,179,8,0.1)',  color:'#eab308', text:'🟡 FIGHTER' },
    LEARNER:   { bg:'rgba(249,115,22,0.1)', color:'#f97316', text:'🟠 LEARNER' },
    ASSISTED:  { bg:'rgba(59,130,246,0.1)', color:'#3b82f6', text:'🔵 ASSISTED' },
    REBUILDER: { bg:'rgba(239,68,68,0.1)',  color:'#ef4444', text:'🔴 REBUILDER' },
  };
  const c = colors[level];
  const el = document.getElementById('dsa-solve-level-display');
  if (el) {
    el.style.background = c.bg;
    el.style.color      = c.color;
    el.textContent      = c.text;
  }
  return level;
}

function dsaUpdateSteps() {
  const vals = [
    document.getElementById('dsa-f-title')?.value,
    document.getElementById('dsa-f-my_understanding')?.value,
    document.getElementById('dsa-f-english_logic')?.value,
    document.getElementById('dsa-f-code')?.value,
    document.getElementById('dsa-f-real_world')?.value,
  ];
  vals.forEach((v, i) => {
    const step = document.getElementById(`dsa-step-${i}`);
    const line = document.getElementById(`dsa-step-line-${i}`);
    const allPrev = vals.slice(0,i).every(x=>x&&x.trim());
    if (v && v.trim()) {
      step?.classList.add('done');
      step?.classList.remove('current');
      line?.classList.add('done');
    } else if (allPrev) {
      step?.classList.add('current');
      step?.classList.remove('done');
    } else {
      step?.classList.remove('done','current');
      line?.classList.remove('done');
    }
  });
}

function dsaSaveProblem() {
  const title = document.getElementById('dsa-f-title')?.value?.trim();
  if (!title) { dsaToast('⚠️ Enter a problem title first.'); return; }
  if (!dsaSelectedDiff) { dsaToast('⚠️ Select a difficulty level.'); return; }

  const url  = document.getElementById('dsa-f-url')?.value?.trim()||'';
  const slug = parseLCURL(url)?.slug || '';

  const hintUsed       = document.getElementById('dsa-f-hint')?.checked||false;
  const conceptLearned = document.getElementById('dsa-f-concept-learned')?.checked||false;
  const studiedSol     = document.getElementById('dsa-f-studied')?.checked||false;
  const level = assignSolveLevel(hintUsed, conceptLearned, studiedSol);

  const data = {
    lc_number: document.getElementById('dsa-f-lcnum')?.value,
    lc_url:    url,
    lc_slug:   slug,
    title,
    difficulty: dsaSelectedDiff,
    pattern:    document.getElementById('dsa-f-pattern')?.value,
    solve_level: level,
    my_understanding:   document.getElementById('dsa-f-my_understanding')?.value?.trim()||'',
    first_instinct:     document.getElementById('dsa-f-first_instinct')?.value?.trim()||'',
    english_logic:      document.getElementById('dsa-f-english_logic')?.value?.trim()||'',
    solution_code:      document.getElementById('dsa-f-code')?.value?.trim()||'',
    solution_language:  dsaSelectedLang,
    real_world_connection: document.getElementById('dsa-f-real_world')?.value?.trim()||'',
    stuck_point:    document.getElementById('dsa-f-stuck')?.value?.trim()||'',
    aha_moment:     document.getElementById('dsa-f-aha')?.value?.trim()||'',
    concept_learned: conceptLearned ? document.getElementById('dsa-f-concept')?.value?.trim()||null : null,
    hint_used:      hintUsed,
    hint_source:    document.getElementById('dsa-f-hint-source')?.value?.trim()||null,
    studied_solution: studiedSol,
    time_taken_mins: document.getElementById('dsa-f-time')?.value,
    attempts:    dsaAttemptCount,
    time_complexity: document.getElementById('dsa-f-tc')?.value?.trim()||'',
    space_complexity: document.getElementById('dsa-f-sc')?.value?.trim()||'',
  };

  const id = dsaAddProblem(data);
  dsaToast('⚔️ Battle logged! Problem saved to the Forge.');
  setTimeout(() => {
    dsaViewingProblemId = id;
    dsaNav('story-view');
  }, 800);
}

// ── THE SCROLL (Problem Library) ──────────────────────────── //
function renderScroll() {
  const el = document.getElementById('dsa-scroll-content');
  if (!el) return;

  // Build filter/search UI
  el.innerHTML = `
    <button class="dsa-back-btn" onclick="dsaNav('war-room')">← War Room</button>

    <!-- Search -->
    <div class="dsa-filters dsa-mb-3">
      <input id="dsa-search" class="dsa-search-input" placeholder="🔍 Search by name, concept, aha moment..." value="${dsaSearchQuery}" oninput="dsaSearchQuery=this.value;applyScrollFilters()">
    </div>

    <!-- Filters -->
    <div class="dsa-filters dsa-mb-3">
      <span class="dsa-text-xs dsa-text-muted" style="margin-right:4px;">Difficulty:</span>
      ${['all','Easy','Medium','Hard'].map(d=>`
        <button class="dsa-filter-btn ${dsaFilterDiff===d?'active':''}" onclick="setScrollFilter('diff','${d}')">${d==='all'?'All':d}</button>
      `).join('')}
      <span class="dsa-text-xs dsa-text-muted" style="margin-left:8px;margin-right:4px;">Pattern:</span>
      <select id="dsa-filter-pattern" class="dsa-select" onchange="setScrollFilter('pattern',this.value)">
        <option value="all" ${dsaFilterPattern==='all'?'selected':''}>All Patterns</option>
        ${PATTERNS.map(p=>`<option value="${p}" ${dsaFilterPattern===p?'selected':''}>${p}</option>`).join('')}
      </select>
      <span class="dsa-text-xs dsa-text-muted" style="margin-left:8px;margin-right:4px;">Level:</span>
      <select id="dsa-filter-level" class="dsa-select" onchange="setScrollFilter('level',this.value)">
        <option value="all" ${dsaFilterLevel==='all'?'selected':''}>All Levels</option>
        ${Object.entries(SOLVE_LEVELS).map(([k,v])=>`<option value="${k}" ${dsaFilterLevel===k?'selected':''}>${v.emoji} ${v.label}</option>`).join('')}
      </select>
      <span class="dsa-text-xs dsa-text-muted" style="margin-left:8px;margin-right:4px;">Sort:</span>
      <select id="dsa-filter-sort" class="dsa-select" onchange="dsaSortOrder=this.value;applyScrollFilters()">
        <option value="recent" ${dsaSortOrder==='recent'?'selected':''}>Recent</option>
        <option value="difficulty" ${dsaSortOrder==='difficulty'?'selected':''}>Difficulty</option>
        <option value="level" ${dsaSortOrder==='level'?'selected':''}>Solve Level</option>
      </select>
    </div>

    <!-- Problem list -->
    <div id="dsa-problem-list" class="dsa-problem-list"></div>
  `;
  applyScrollFilters();
}

function setScrollFilter(type, val) {
  if (type==='diff')    dsaFilterDiff    = val;
  if (type==='pattern') dsaFilterPattern = val;
  if (type==='level')   dsaFilterLevel   = val;
  applyScrollFilters();
  // Update active classes for diff buttons
  document.querySelectorAll('.dsa-filter-btn').forEach(b => {
    b.classList.toggle('active', b.textContent.trim()===(dsaFilterDiff==='all'?'All':dsaFilterDiff));
  });
}

function applyScrollFilters() {
  let probs = dsaGetProblems();

  // Filter
  if (dsaFilterDiff !== 'all')    probs = probs.filter(p=>p.difficulty===dsaFilterDiff);
  if (dsaFilterPattern !== 'all') probs = probs.filter(p=>p.pattern===dsaFilterPattern);
  if (dsaFilterLevel !== 'all')   probs = probs.filter(p=>p.solve_level===dsaFilterLevel);

  // Search
  const q = dsaSearchQuery.toLowerCase();
  if (q) {
    probs = probs.filter(p =>
      p.title.toLowerCase().includes(q) ||
      (p.battle.aha_moment||'').toLowerCase().includes(q) ||
      (p.battle.concept_learned||'').toLowerCase().includes(q) ||
      (p.story.my_understanding||'').toLowerCase().includes(q)
    );
  }

  // Sort
  if (dsaSortOrder==='difficulty') {
    const dOrder = { Easy:0, Medium:1, Hard:2 };
    probs.sort((a,b)=>dOrder[a.difficulty]-dOrder[b.difficulty]);
  } else if (dsaSortOrder==='level') {
    probs.sort((a,b)=>LEVEL_ORDER.indexOf(a.solve_level)-LEVEL_ORDER.indexOf(b.solve_level));
  }

  const el = document.getElementById('dsa-problem-list');
  if (!el) return;

  if (probs.length === 0) {
    el.innerHTML = `<div class="dsa-empty"><div class="dsa-empty-icon">📜</div><div class="dsa-empty-title">No battles match your filters.</div><div class="dsa-empty-sub">Try changing the filters or log a new battle.</div></div>`;
    return;
  }

  el.innerHTML = probs.map(p => `
    <div class="dsa-problem-card" data-level="${p.solve_level}" data-problem-id="${p.id}" onclick="viewProblem('${p.id}')">
      <div class="dsa-problem-top">
        <div>
          <div class="dsa-problem-title">${p.lc_number?`#${p.lc_number} `:''}${p.title}</div>
          <div style="display:flex;gap:6px;align-items:center;margin-top:4px;">
            ${renderDiffBadge(p.difficulty)}
            <span class="dsa-text-xs dsa-text-muted">${p.pattern}</span>
            <span class="dsa-text-xs dsa-text-muted">•</span>
            <span class="dsa-text-xs dsa-text-muted">${timeAgo(p.date_solved)}</span>
          </div>
        </div>
        ${renderSolveBadge(p.solve_level)}
      </div>
      ${p.battle.aha_moment ? `<div class="dsa-problem-aha">"${p.battle.aha_moment}"</div>` : ''}
      <div class="dsa-problem-bottom">
        ${renderStars(p.revision.revisit_score)}
        ${p.meta.time_taken_mins?`<span class="dsa-problem-meta-item">⏱ ${p.meta.time_taken_mins} min</span>`:''}
        ${p.meta.attempts?`<span class="dsa-problem-meta-item">🔁 ${p.meta.attempts} attempts</span>`:''}
      </div>
      <div class="dsa-problem-actions" onclick="event.stopPropagation()">
        <button class="dsa-btn dsa-btn-ghost dsa-btn-sm" onclick="viewProblem('${p.id}')">Read the full story</button>
        <button class="dsa-btn dsa-btn-primary dsa-btn-sm" onclick="dsaStartRevision('${p.id}')">Revise Now ⚔️</button>
        ${p.lc_url ? `<a class="dsa-lc-link" href="${p.lc_url}" target="_blank">LeetCode ↗</a>` : ''}
      </div>
    </div>
  `).join('');
}

// ── STORY VIEW ────────────────────────────────────────────── //
function viewProblem(id) {
  dsaViewingProblemId = id;
  dsaNav('story-view');
}

function renderStoryView() {
  const el = document.getElementById('dsa-story-content');
  if (!el) return;
  const data = dsaLoad();
  const p = data.problems.find(x=>x.id===dsaViewingProblemId);
  if (!p) {
    el.innerHTML = `<div class="dsa-empty"><div class="dsa-empty-icon">❌</div><div class="dsa-empty-title">Problem not found.</div></div>`;
    return;
  }

  el.innerHTML = `
    <button class="dsa-back-btn" onclick="dsaNav('scroll')">← Back to The Scroll</button>

    <div class="dsa-story-layout">
      <!-- Left: Story -->
      <div>
        <div class="dsa-flex-between dsa-mb-4">
          <div>
            <h2 style="font-size:1.4rem;font-weight:700;color:var(--dsa-text);">${p.lc_number?`#${p.lc_number} `:''}${p.title}</h2>
            <div style="display:flex;gap:8px;align-items:center;margin-top:6px;">
              ${renderDiffBadge(p.difficulty)}
              ${renderSolveBadge(p.solve_level)}
              <span class="dsa-text-xs dsa-text-muted">Weapon: ${p.pattern}</span>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end;">
            ${p.lc_url ? `<a class="dsa-lc-link" href="${p.lc_url}" target="_blank">Open on LeetCode ↗</a>` : ''}
            <button class="dsa-btn dsa-btn-danger dsa-btn-sm" onclick="dsaConfirmDelete('${p.id}')">🗑 Delete</button>
          </div>
        </div>

        ${[
          { key:'my_understanding', title:'Chapter 1 — What I Read' },
          { key:'first_instinct',   title:'Chapter 2 — My First Instinct' },
          { key:'english_logic',    title:'Chapter 3 — The English Logic' },
        ].map(c=>`
          <div class="dsa-story-chapter">
            <div class="dsa-story-chapter-title">${c.title}</div>
            <div class="dsa-story-chapter-body">${(p.story[c.key]||'<em>Not filled in.</em>').replace(/\n/g,'<br>')}</div>
          </div>
          <div class="dsa-divider"></div>
        `).join('')}

        <div class="dsa-story-chapter">
          <div class="dsa-story-chapter-title">Chapter 4 — The Code (${p.story.solution_language||''})</div>
          <pre class="dsa-code-block">${escHtml(p.story.solution_code||'# No code recorded.')}</pre>
        </div>
        <div class="dsa-divider"></div>

        <div class="dsa-story-chapter">
          <div class="dsa-story-chapter-title">Chapter 5 — The Real World</div>
          <div class="dsa-story-chapter-body">${(p.story.real_world_connection||'Not filled in.').replace(/\n/g,'<br>')}</div>
        </div>
        <div class="dsa-divider"></div>

        <!-- Battle Report -->
        <div class="dsa-chapter-card">
          <div class="dsa-chapter-num">Battle Report</div>
          <div class="dsa-chapter-title" style="margin-bottom:1rem;">🗡️ Where the Blood Was Spilled</div>
          ${p.battle.stuck_point ? `
            <div class="dsa-mb-3">
              <div class="dsa-story-chapter-title">Where I Got Stuck</div>
              <div class="dsa-story-chapter-body">${p.battle.stuck_point.replace(/\n/g,'<br>')}</div>
            </div>
          ` : ''}
          ${p.battle.aha_moment ? `
            <div class="dsa-mb-3">
              <div class="dsa-story-chapter-title">⚡ The Aha Moment</div>
              <div class="dsa-problem-aha" style="font-size:1rem;">"${p.battle.aha_moment}"</div>
            </div>
          ` : ''}
          ${p.battle.concept_learned ? `
            <div>
              <div class="dsa-story-chapter-title">Concept Learned</div>
              <div class="dsa-story-chapter-body">${p.battle.concept_learned.replace(/\n/g,'<br>')}</div>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- Right: Sidebar -->
      <div class="dsa-story-sidebar">
        <!-- Metadata -->
        <div class="dsa-card">
          <div class="dsa-section-title">Battle Stats</div>
          ${[
            ['Date',        timeAgo(p.date_solved)],
            ['Time',        p.meta.time_taken_mins ? `${p.meta.time_taken_mins} min` : '—'],
            ['Attempts',    p.meta.attempts||1],
            ['Hint Used',   p.meta.hint_used ? 'Yes' : 'No'],
            ['Time Complexity', p.meta.time_complexity||'—'],
            ['Space Complexity', p.meta.space_complexity||'—'],
            ['Revisions',   p.revision.revision_count||0],
          ].map(([k,v])=>`
            <div class="dsa-meta-row">
              <span class="dsa-meta-key">${k}</span>
              <span class="dsa-meta-val">${v}</span>
            </div>
          `).join('')}
        </div>

        <!-- Revisit Score -->
        <div class="dsa-card">
          <div class="dsa-section-title">Revisit Score</div>
          ${renderStars(p.revision.revisit_score)}
          <div class="dsa-star-input" id="dsa-star-input-${p.id}">
            ${[1,2,3,4,5].map(n=>`
              <button class="dsa-star-btn ${n<=p.revision.revisit_score?'filled':''}" onclick="setRevisitScore('${p.id}',${n})">${n<=p.revision.revisit_score?'★':'☆'}</button>
            `).join('')}
          </div>
          <div class="dsa-text-xs dsa-text-muted dsa-mt-4">Last revised: ${p.revision.last_revised ? timeAgo(p.revision.last_revised) : 'Never'}</div>
        </div>

        <!-- Solve Again button -->
        <button class="dsa-btn dsa-btn-primary" style="width:100%;" onclick="dsaOpenSolveAgain('${p.id}')">
          ⚔️ Solve Again
        </button>
      </div>
    </div>
  `;
}

function setRevisitScore(id, score) {
  dsaUpdateRevisitScore(id, score);
  // Re-render star input inline
  const container = document.getElementById(`dsa-star-input-${id}`);
  if (container) {
    container.querySelectorAll('.dsa-star-btn').forEach((btn, i) => {
      btn.className = `dsa-star-btn ${i+1<=score?'filled':''}`;
      btn.textContent = i+1<=score?'★':'☆';
    });
  }
  dsaToast(`Revisit score updated to ${score} ⭐`);
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function dsaConfirmDelete(id) {
  openDSAModal(`
    <h3 style="margin-bottom:1rem;">Delete this battle log?</h3>
    <p style="color:var(--dsa-muted);margin-bottom:1.5rem;">This cannot be undone. The story will be lost forever.</p>
    <div style="display:flex;gap:0.75rem;justify-content:flex-end;">
      <button class="dsa-btn dsa-btn-ghost" onclick="closeDSAModal()">Cancel</button>
      <button class="dsa-btn dsa-btn-danger" onclick="dsaDeleteAndReturn('${id}')">Delete</button>
    </div>
  `);
}
function dsaDeleteAndReturn(id) {
  dsaDeleteProblem(id);
  closeDSAModal();
  dsaToast('Battle log deleted.');
  dsaNav('scroll');
}

// ── SOLVE AGAIN Modal ──────────────────────────────────────── //
function dsaOpenSolveAgain(id) {
  const data = dsaLoad();
  const p = data.problems.find(x=>x.id===id);
  if (!p) return;

  openDSAModal(`
    <h3 style="margin-bottom:0.25rem;">Revision Mode</h3>
    <h4 style="font-weight:600;color:var(--dsa-muted);margin-bottom:1.5rem;">${p.title}</h4>
    <p style="color:var(--dsa-muted);font-size:0.875rem;margin-bottom:1rem;">Without looking at your solution, solve this again.</p>

    <div class="dsa-form-group dsa-mb-3">
      <label class="dsa-form-label">English Logic</label>
      <textarea id="dsa-revision-logic" class="dsa-form-textarea" rows="5" placeholder="Write your logic in plain English..."></textarea>
    </div>
    <div class="dsa-form-group dsa-mb-3">
      <label class="dsa-form-label">Code</label>
      <textarea id="dsa-revision-code" class="dsa-form-textarea dsa-code-block" rows="8" style="font-family:'JetBrains Mono',monospace;font-size:13px;" placeholder="# Write from memory..."></textarea>
    </div>

    <button class="dsa-btn dsa-btn-primary" style="width:100%;margin-bottom:1rem;" onclick="showRevisionComparison('${id}')">Compare with my original solution</button>
  `);
}

function showRevisionComparison(id) {
  const data = dsaLoad();
  const p = data.problems.find(x=>x.id===id);
  if (!p) return;

  const myLogic = document.getElementById('dsa-revision-logic')?.value||'';
  const myCode  = document.getElementById('dsa-revision-code')?.value||'';

  openDSAModal(`
    <h3 style="margin-bottom:1.5rem;">How did it go?</h3>

    <div class="dsa-grid-2 dsa-mb-4" style="font-size:0.82rem;">
      <div>
        <div class="dsa-story-chapter-title">Your revision attempt</div>
        <pre style="background:#0d1117;padding:10px;border-radius:6px;font-size:12px;color:#e6edf3;overflow:auto;max-height:200px;white-space:pre-wrap;">${escHtml(myCode)||escHtml(myLogic)||'(nothing written)'}</pre>
      </div>
      <div>
        <div class="dsa-story-chapter-title">Original solution</div>
        <pre style="background:#0d1117;padding:10px;border-radius:6px;font-size:12px;color:#e6edf3;overflow:auto;max-height:200px;white-space:pre-wrap;">${escHtml(p.story.solution_code||'(no code recorded)')}</pre>
      </div>
    </div>

    <div class="dsa-form-label dsa-mb-2">Rate this revision</div>
    <div class="dsa-revision-score-row">
      ${[
        [1,'★ Forgot everything'],
        [2,'★★ Remembered bits'],
        [3,'★★★ Got it with effort'],
        [4,'★★★★ Mostly smooth'],
        [5,'★★★★★ Crushed it'],
      ].map(([s,l])=>`
        <button class="dsa-rev-score-btn" onclick="setRevisitScoreFromModal('${id}',${s})">${l}</button>
      `).join('')}
    </div>
  `);
}

function setRevisitScoreFromModal(id, score) {
  dsaUpdateRevisitScore(id, score);
  closeDSAModal();
  dsaToast(`⚔️ Revision complete! Score: ${score}/5`);
  renderStoryView(); // refresh
}

function dsaStartRevision(id) {
  dsaViewingProblemId = id;
  dsaOpenSolveAgain(id);
}

// ── ARENA (Pattern Analytics) ──────────────────────────────── //
function renderArena() {
  const el = document.getElementById('dsa-arena-content');
  if (!el) return;
  const probs = dsaGetProblems();

  // Compute per-pattern stats
  const stats = {};
  PATTERNS.forEach(p => stats[p] = { count:0, times:[], levels:{}, problems:[] });
  probs.forEach(p => {
    if (!stats[p.pattern]) return;
    stats[p.pattern].count++;
    stats[p.pattern].problems.push(p);
    if (p.meta.time_taken_mins) stats[p.pattern].times.push(p.meta.time_taken_mins);
    stats[p.pattern].levels[p.solve_level] = (stats[p.pattern].levels[p.solve_level]||0)+1;
  });

  const activePatterns = PATTERNS.filter(p=>stats[p].count>0);

  el.innerHTML = `
    <button class="dsa-back-btn" onclick="dsaNav('war-room')">← War Room</button>
    <h2 style="font-size:1.2rem;font-weight:700;color:var(--dsa-text);margin-bottom:1.5rem;">🗺️ The Arena — Pattern Analytics</h2>

    <!-- Radar / Spider Chart -->
    <div class="dsa-card dsa-mb-4">
      <div class="dsa-section-title">Pattern Radar</div>
      <div class="dsa-radar-container">
        <canvas id="dsa-radar-canvas" width="420" height="420" class="dsa-radar-canvas"></canvas>
      </div>
      <div class="dsa-text-xs dsa-text-muted" style="text-align:center;margin-top:8px;">
        Score = (Warriors×5 + Fighters×4 + Learners×3 + Assisted×2 + Rebuilders×1) weighted by count
      </div>
    </div>

    ${activePatterns.length === 0 ? `
      <div class="dsa-empty">
        <div class="dsa-empty-icon">🛡️</div>
        <div class="dsa-empty-title">No battles recorded yet.</div>
        <div class="dsa-empty-sub">Start logging problems to see your pattern analytics.</div>
      </div>
    ` : activePatterns.map(pat => {
      const s = stats[pat];
      const maxCount = Math.max(...Object.values(stats).map(x=>x.count), 1);
      const avgTime = s.times.length ? Math.round(s.times.reduce((a,b)=>a+b,0)/s.times.length) : null;
      const levelWeights = { WARRIOR:5, FIGHTER:4, LEARNER:3, ASSISTED:2, REBUILDER:1 };
      const score = s.count ? Object.entries(s.levels).reduce((acc,[l,c])=>acc+c*(levelWeights[l]||1),0)/s.count : 0;
      const hardest = s.problems.filter(p=>p.difficulty==='Hard').sort((a,b)=>new Date(b.date_solved)-new Date(a.date_solved))[0];
      const easiest = s.problems.filter(p=>p.difficulty==='Easy').sort((a,b)=>new Date(b.date_solved)-new Date(a.date_solved))[0];
      const trend = score > 3.5 ? '↑ Getting stronger' : score > 2.5 ? '→ Holding steady' : '↓ Needs attention';

      return `
        <div class="dsa-arena-pattern-block">
          <div class="dsa-flex-between">
            <div class="dsa-arena-pattern-name">${pat}</div>
            <div class="dsa-text-xs dsa-text-muted">${s.count} problem${s.count!==1?'s':''} • ${trend}</div>
          </div>
          <div style="margin:10px 0;">
            ${Object.entries(SOLVE_LEVELS).map(([level, meta])=>{
              const cnt = s.levels[level]||0;
              const pct = s.count ? Math.round(cnt/s.count*100) : 0;
              const colors = { WARRIOR:'#22c55e', FIGHTER:'#eab308', LEARNER:'#f97316', ASSISTED:'#3b82f6', REBUILDER:'#ef4444' };
              return `
                <div class="dsa-level-bar-row">
                  <span class="dsa-level-bar-label">${meta.emoji} ${meta.label}</span>
                  <div class="dsa-level-bar-track">
                    <div class="dsa-level-bar-fill" style="width:${pct}%;background:${colors[level]};"></div>
                  </div>
                  <span class="dsa-level-bar-count">${cnt}</span>
                </div>
              `;
            }).join('')}
          </div>
          <div style="display:flex;gap:1.5rem;font-size:0.78rem;color:var(--dsa-muted);flex-wrap:wrap;">
            ${avgTime ? `<span>⏱ Avg time: ${avgTime} min</span>` : ''}
            ${hardest ? `<span>💀 Hardest: ${hardest.title}</span>` : ''}
            ${easiest ? `<span>✅ Easiest: ${easiest.title}</span>` : ''}
          </div>
        </div>
      `;
    }).join('')}
  `;

  // Draw radar after DOM update
  setTimeout(() => drawRadarChart(stats), 50);
}

function drawRadarChart(stats) {
  const canvas = document.getElementById('dsa-radar-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const cx = W/2, cy = H/2, R = Math.min(W,H)/2 - 40;
  const levelWeights = { WARRIOR:5, FIGHTER:4, LEARNER:3, ASSISTED:2, REBUILDER:1 };

  // Use top 10 patterns for readability
  const topPatterns = PATTERNS.slice(0, 12);
  const N = topPatterns.length;
  const angleStep = (2*Math.PI)/N;

  // Compute scores (0-10)
  const scores = topPatterns.map(p => {
    const s = stats[p];
    if (!s || !s.count) return 0;
    const raw = Object.entries(s.levels).reduce((acc,[l,c])=>acc+c*(levelWeights[l]||1),0)/s.count;
    return Math.min(10, s.count + raw);
  });
  const maxScore = Math.max(...scores, 1);

  ctx.clearRect(0, 0, W, H);

  // Draw grid rings
  for (let ring=1; ring<=5; ring++) {
    const r = (R*ring)/5;
    ctx.beginPath();
    for (let i=0; i<N; i++) {
      const angle = i*angleStep - Math.PI/2;
      const x = cx + r*Math.cos(angle);
      const y = cy + r*Math.sin(angle);
      i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
    }
    ctx.closePath();
    ctx.strokeStyle = 'rgba(42,45,62,0.8)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Draw spokes
  topPatterns.forEach((_,i)=>{
    const angle = i*angleStep - Math.PI/2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx+R*Math.cos(angle), cy+R*Math.sin(angle));
    ctx.strokeStyle = 'rgba(42,45,62,0.6)';
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  // Draw radar polygon
  ctx.beginPath();
  scores.forEach((s,i)=>{
    const r = (s/maxScore)*R;
    const angle = i*angleStep - Math.PI/2;
    const x = cx + r*Math.cos(angle);
    const y = cy + r*Math.sin(angle);
    i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
  });
  ctx.closePath();
  ctx.fillStyle = 'rgba(59,111,232,0.2)';
  ctx.fill();
  ctx.strokeStyle = '#3B6FE8';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Draw dots
  scores.forEach((s,i)=>{
    const r = (s/maxScore)*R;
    const angle = i*angleStep - Math.PI/2;
    ctx.beginPath();
    ctx.arc(cx+r*Math.cos(angle), cy+r*Math.sin(angle), 4, 0, 2*Math.PI);
    ctx.fillStyle = '#3B6FE8';
    ctx.fill();
  });

  // Draw labels
  ctx.fillStyle = '#8b8fa8';
  ctx.font = '10px Inter, sans-serif';
  ctx.textAlign = 'center';
  topPatterns.forEach((p,i)=>{
    const angle = i*angleStep - Math.PI/2;
    const x = cx + (R+20)*Math.cos(angle);
    const y = cy + (R+20)*Math.sin(angle);
    // Short label
    const short = p.split(' ')[0] + (p.split(' ').length>1?' '+p.split(' ')[1]:'');
    ctx.fillText(short.length>12?short.slice(0,11)+'…':short, x, y+4);
  });
}

// ── Modal Helpers ──────────────────────────────────────────── //
function openDSAModal(html) {
  const overlay = document.getElementById('dsa-modal-overlay');
  const box     = document.getElementById('dsa-modal-box');
  if (!overlay||!box) return;
  box.innerHTML = `<button id="dsa-modal-close" onclick="closeDSAModal()">×</button>${html}`;
  overlay.classList.add('open');
}
function closeDSAModal() {
  document.getElementById('dsa-modal-overlay')?.classList.remove('open');
}

// ── Entry point — called by BOSS nav() ────────────────────── //
function initDSAForge() {
  dsaNav('war-room');
}
