// Progress Agent Helper Functions

const PROGRESS_KEY_PREFIX = 'studyos_prog_';

// Initialize subject if missing
function initProgress(short) {
  const key = PROGRESS_KEY_PREFIX + short;
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, JSON.stringify({}));
  }
}

// Mark a topic as done
function markDone(short, topicName) {
  initProgress(short);
  const key = PROGRESS_KEY_PREFIX + short;
  const progress = JSON.parse(localStorage.getItem(key));
  progress[topicName] = true;
  localStorage.setItem(key, JSON.stringify(progress));
}

// Mark a topic as pending
function markPending(short, topicName) {
  initProgress(short);
  const key = PROGRESS_KEY_PREFIX + short;
  const progress = JSON.parse(localStorage.getItem(key));
  progress[topicName] = false;
  localStorage.setItem(key, JSON.stringify(progress));
}

// Get subject progress object state
function getProgress(short) {
  const key = PROGRESS_KEY_PREFIX + short;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : {};
}

// Get aggregated progress for all subjects
function getAllProgress() {
  const stats = {};
  SUBJECTS.forEach(sub => {
    const prog = getProgress(sub.short);
    
    let totalTopics = 0;
    let doneCount = 0;
    let highPrioDone = 0;
    let highPrioTotal = 0;
    
    sub.units.forEach(unit => {
      unit.topics.forEach(topic => {
        totalTopics++;
        const isDone = !!prog[topic.name];
        if (isDone) doneCount++;
        
        if (topic.priority === "HIGH") {
          highPrioTotal++;
          if (isDone) highPrioDone++;
        }
      });
    });
    
    const percentage = totalTopics === 0 ? 0 : Math.round((doneCount / totalTopics) * 100);
    
    stats[sub.short] = {
      total: totalTopics,
      done: doneCount,
      pending: totalTopics - doneCount,
      percentage: percentage,
      highDone: highPrioDone,
      highTotal: highPrioTotal
    };
  });
  return stats;
}

// Reset an entire subject's progress
function resetSubject(short) {
  const key = PROGRESS_KEY_PREFIX + short;
  localStorage.setItem(key, JSON.stringify({}));
}

function learnFromError(context, error, fix) {
  const lessons = JSON.parse(
    localStorage.getItem('studyos_lessons') || '[]'
  );
  
  const existing = lessons.find(l => l.context === context);
  
  if (existing) {
    existing.count++;
    existing.lastSeen = new Date().toISOString();
    existing.fixes.push(fix);
  } else {
    lessons.push({
      context: context,
      error: error,
      fixes: [fix],
      count: 1,
      firstSeen: new Date().toISOString(),
      lastSeen: new Date().toISOString()
    });
  }
  
  localStorage.setItem('studyos_lessons', JSON.stringify(lessons));
}

function checkPastLessons(context) {
  const lessons = JSON.parse(
    localStorage.getItem('studyos_lessons') || '[]'
  );
  return lessons.find(l => l.context === context);
}

async function runDiagnostics() {
  const results = {
    timestamp: new Date().toISOString(),
    tests: [],
    passed: 0,
    failed: 0,
    fixes_applied: []
  };

  // TEST 1: Backend API connection
  try {
    const res = await fetch('/api/study', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: 'Diagnostic', topic: 'Connection Test', mode: 'teach' })
    });
    if (res.ok) {
      results.tests.push({ name: "Study API", status: "PASS" });
      results.passed++;
    } else {
      throw new Error(`Server returned ${res.status}`);
    }
  } catch(e) {
    results.tests.push({
      name: "Study API",
      status: "FAIL",
      error: e.message,
      fix: "Check if node server.js is running"
    });
    results.failed++;
  }

  // TEST 2: SUBJECTS data loaded
  try {
    if (typeof SUBJECTS === 'undefined') 
      throw new Error("SUBJECTS not defined");
    if (SUBJECTS.length !== 5) 
      throw new Error("Expected 5 subjects");
    const totalTopics = SUBJECTS.reduce((acc, s) => acc + s.units.reduce((a, u) => a + u.topics.length, 0), 0);
    results.tests.push({
      name: "Subjects data",
      status: "PASS",
      info: `${SUBJECTS.length} subjects, ${totalTopics} topics`
    });
    results.passed++;
  } catch(e) {
    results.tests.push({
      name: "Subjects data",
      status: "FAIL",
      error: e.message,
      fix: "Reload subjects.js"
    });
    results.failed++;
    results.fixes_applied.push("Suggested page reload");
  }

  // TEST 3: localStorage working
  try {
    localStorage.setItem("test_key", "test_val");
    const val = localStorage.getItem("test_key");
    if (val !== "test_val") throw new Error("Read/write mismatch");
    localStorage.removeItem("test_key");
    results.tests.push({ name: "localStorage", status: "PASS" });
    results.passed++;
  } catch(e) {
    results.tests.push({
      name: "localStorage",
      status: "FAIL",
      error: e.message,
      fix: "Browser storage blocked"
    });
    results.failed++;
  }

  // TEST 4: Progress data integrity
  try {
    SUBJECTS.forEach(s => {
      const key = PROGRESS_KEY_PREFIX + s.short;
      const data = localStorage.getItem(key);
      if (data) JSON.parse(data);
    });
    results.tests.push({ name: "Progress data", status: "PASS" });
    results.passed++;
  } catch(e) {
    results.tests.push({
      name: "Progress data",
      status: "FAIL",
      error: "Corrupted progress data",
      fix: "Auto-resetting corrupted entries"
    });
    results.failed++;
    SUBJECTS.forEach(s => {
      try {
        const key = PROGRESS_KEY_PREFIX + s.short;
        JSON.parse(localStorage.getItem(key) || '{}');
      } catch {
        localStorage.removeItem(PROGRESS_KEY_PREFIX + s.short);
        results.fixes_applied.push(`Reset corrupted: ${s.short}`);
      }
    });
  }

  // TEST 5: Core UI functions exist
  const fns = ['nav', 'startSession', 'quickStart', 'setMode'];
  const missing = fns.filter(f => typeof window[f] !== 'function');
  if (missing.length === 0) {
    results.tests.push({ name: "Core Interface", status: "PASS" });
    results.passed++;
  } else {
    results.tests.push({
      name: "Core Interface",
      status: "FAIL",
      error: `Missing: ${missing.join(', ')}`,
      fix: "index.html scripts not loaded correctly"
    });
    results.failed++;
  }

  // Save diagnostic log
  const logs = JSON.parse(localStorage.getItem('studyos_logs') || '[]');
  logs.unshift(results);
  if (logs.length > 20) logs.pop();
  localStorage.setItem('studyos_logs', JSON.stringify(logs));

  return results;
}

async function showDiagnosticReport() {
  const results = await runDiagnostics();
  
  const color = results.failed === 0 ? '#16a34a' : '#dc2626';
  const icon = results.failed === 0 ? '✅' : '❌';
    
  let html = `
  <div style="font-family:Inter,sans-serif;padding:20px;max-width:500px">
    <h2 style="color:${color}">${icon} System Diagnostics</h2>
    <p style="color:#6b7280">${results.timestamp}</p>
    <div style="margin:16px 0">
  `;
  
  results.tests.forEach(t => {
    const c = t.status==='PASS' ? '#16a34a' : '#dc2626';
    const i = t.status==='PASS' ? '✅' : '❌';
    html += `
      <div style="padding:10px;border:1px solid #e5e7eb;border-radius:8px;margin-bottom:8px">
        <div style="display:flex;justify-content:space-between">
          <strong>${t.name}</strong>
          <span style="color:${c}">${i} ${t.status}</span>
        </div>
        ${t.error ? `<p style="color:#dc2626;font-size:13px;margin:4px 0">Error: ${t.error}</p>` : ''}
        ${t.fix ? `<p style="color:#d97706;font-size:13px;margin:4px 0">Fix: ${t.fix}</p>` : ''}
        ${t.info ? `<p style="color:#6b7280;font-size:13px;margin:4px 0">${t.info}</p>` : ''}
      </div>
    `;
  });

  if (results.fixes_applied.length > 0) {
    html += `
      <div style="background:#fef3c7;padding:10px;border-radius:8px;margin-top:8px">
        <strong>🔧 Auto-fixes applied:</strong>
        <ul style="margin:4px 0;padding-left:16px">
          ${results.fixes_applied.map(f => `<li>${f}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  html += `
    <div style="margin-top:16px;padding:12px;border-radius:8px;background:${results.failed===0 ? '#f0fdf4' : '#fef2f2'}">
      <strong>${results.passed}/5 tests passed</strong>
      ${results.failed > 0 ? 
        '<p style="color:#dc2626;margin:4px 0">Check fixes above and reload page.</p>'
        : '<p style="color:#16a34a;margin:4px 0">All systems operational!</p>'
      }
    </div>
  </div>`;
  
  return html;
}
