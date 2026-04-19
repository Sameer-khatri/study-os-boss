
let currentSubject = "";
let currentTopic = "";
let currentMode = "teach";

let currentQuizState = null;
let currentBossState = null;

function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(() => el.style.display = 'none', 3000);
}

async function openDiagnostics() {
  document.getElementById('diag-modal').style.display = 'flex';
  document.getElementById('diag-content').innerHTML = '<div style="padding:40px;text-align:center;"><div class="spinner"></div> Running diagnostics...</div>';
  if(typeof showDiagnosticReport === 'function') {
    const html = await showDiagnosticReport();
    document.getElementById('diag-content').innerHTML = html;
  } else {
    document.getElementById('diag-content').innerHTML = '<span style="color:red">Diagnostics function missing!</span>';
  }
}

function closeDiagnostics() {
  document.getElementById('diag-modal').style.display = 'none';
}

document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();
  
  const d = new Date();
  document.getElementById("current-date").textContent = d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  
  const diffDays = 30;
  const daysEl = document.getElementById("days-left");
  daysEl.textContent = diffDays;
  document.getElementById("stat-days").textContent = diffDays;
  daysEl.style.color = "var(--color-success)";

  document.getElementById("semester-info").textContent = "Sem 4, Year 2";
  
  renderDashboard();
  renderSidebar();
  renderProgressPage();
  
  // Background Diagnostics
  if(typeof runDiagnostics === 'function') {
    runDiagnostics().then(res => {
      const dot = document.getElementById('status-dot');
      if(res && res.failed > 0) {
        dot.style.background = 'var(--color-danger)';
        showToast("⚠️ System issue detected. Click status dot for details.");
      } else {
        dot.style.background = 'var(--color-success)';
      }
    });
  }
});

function nav(screenId, subjShort = null, topicName = null, mode = null) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(`${screenId}-screen`).classList.add('active');
  
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  if (screenId === 'dashboard') document.querySelectorAll('.nav-item')[0].classList.add('active');
  if (screenId === 'subject') document.querySelectorAll('.nav-item')[1].classList.add('active');
  if (screenId === 'progress') document.querySelectorAll('.nav-item')[2].classList.add('active');
  if (screenId === 'study') document.querySelectorAll('.nav-item')[3].classList.add('active');

  if (subjShort) currentSubject = subjShort;
  if (topicName) currentTopic = topicName;
  if (mode) setMode(mode);

  if (screenId === 'subject') loadSubjectInfo(subjShort);
  if (screenId === 'study') initStudyRoom();
}

function renderDashboard() {
  const container = document.getElementById("dashboard-subjects");
  container.innerHTML = "";
  if(typeof getAllProgress !== 'function' || !SUBJECTS) return;
  const stats = getAllProgress();
  let totalDone = 0;
  let totalTopics = 0;

  SUBJECTS.forEach(sub => {
    const stat = stats[sub.short] || {done:0, total:0, percentage:0, pending:0, highDone:0, highTotal:0};
    totalDone += stat.done;
    totalTopics += stat.total;
    const percent = stat.percentage;

    let col = "var(--color-primary)"; 
    if (percent > 0 && percent < 100) col = "var(--color-warning)"; 
    if (percent === 100 && percent !== 0) col = "var(--color-success)"; 

    const div = document.createElement("div");
    div.className = "card subject-card";
    div.style.borderLeftColor = col;
    div.innerHTML = `
      <div>
        <div class="flex justify-between items-start mb-2">
          <h3 class="font-bold text-lg">${sub.name}</h3>
          <span class="badge badge-blue">${sub.short}</span>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar-fill" style="width: ${percent}%; background-color: ${percent > 0 && percent < 100 ? 'var(--color-primary)' : col};"></div>
        </div>
        <div class="text-sm text-muted mb-4">
          ${stat.done} topics done &middot; ${stat.pending} pending &middot; ${stat.highDone}/${stat.highTotal} high priority done
        </div>
      </div>
      <div class="flex gap-2">
        <button class="btn btn-outline" onclick="nav('subject', '${sub.short}')">View Subject</button>
        <button class="btn btn-primary" onclick="nav('study', '${sub.short}', '', 'teach')">Quick Start &rarr;</button>
      </div>
    `;
    container.appendChild(div);
  });

  document.getElementById("stat-topics").textContent = `${totalDone}/${totalTopics}`;
  const overPercent = totalTopics ? Math.round((totalDone/totalTopics)*100) : 0;
  document.getElementById("stat-readiness").textContent = `${overPercent}%`;
  document.getElementById("stat-subCount").textContent = SUBJECTS.length;
}

function renderSidebar() {
  const container = document.getElementById("sidebar-subjects");
  container.innerHTML = "";
  if(!SUBJECTS) return;
  SUBJECTS.forEach(sub => {
    const div = document.createElement("div");
    div.className = "quick-item";
    div.innerHTML = `
      <span style="display:flex; align-items:center; gap:0.5rem; cursor:pointer;" onclick="nav('subject', '${sub.short}')">
        <div class="dot" style="background: var(--color-primary);"></div>
        ${sub.short}
      </span>
      <span class="badge badge-blue" style="font-size:0.6rem; padding: 0.1rem 0.4rem;">${sub.short}</span>
    `;
    container.appendChild(div);
  });
}

function escapeQuotes(str) {
  return str.replace(/'/g, "'").replace(/"/g, '&quot;');
}

function loadSubjectInfo(short) {
  if(!SUBJECTS) return;
  const sub = SUBJECTS.find(s => s.short === short);
  if(!sub) return;
  document.getElementById("subj-breadcrumb").textContent = sub.name;
  document.getElementById("subj-title").textContent = sub.name;
  document.getElementById("subj-badge").textContent = short;

  const prog = getProgress(short);
  
  let totalTopics = 0;
  let doneCount = 0;
  const tList = document.getElementById('subj-topics-list');
  tList.innerHTML = '';
  
  sub.units.forEach(unit => {
    tList.innerHTML += `<div class="text-xs text-muted mb-2 mt-6 font-bold uppercase" style="letter-spacing: 0.05em;">${unit.name}</div>`;
    
    if (unit.topics.length === 0) {
      tList.innerHTML += `<div class="text-sm text-muted mb-4">No topics loaded for this unit.</div>`;
    }
    
    unit.topics.forEach((t, i) => {
      totalTopics++;
      const isDone = !!prog[t.name];
      if (isDone) doneCount++;
      
      const bColor = t.priority === 'HIGH' ? 'red' : t.priority === 'LOW' ? 'green' : 'amber';
      const cColor = isDone ? 'var(--color-success)' : 'var(--text-muted)';
      const cIcon = isDone ? 'check-circle' : 'circle';
      const cStyles = isDone ? 'text-decoration: line-through; opacity: 0.7;' : '';
      
      tList.innerHTML += `
        <div class="topic-row">
          <div class="flex items-center gap-4">
            <i data-lucide="${cIcon}" style="color: ${cColor}; width:18px; height:18px; cursor:pointer;" onclick="toggleTopicStatus('${short}', '${escapeQuotes(t.name)}')"></i>
            <span class="font-semibold" style="${cStyles}">${t.name}</span>
            <span class="badge badge-${bColor}">${t.priority}</span>
          </div>
          <button class="btn btn-outline" style="padding: 0.25rem 0.75rem;" onclick="nav('study', '${short}', '${escapeQuotes(t.name)}', 'teach')">Study</button>
        </div>
      `;
    });
  });
  
  lucide.createIcons();

  document.getElementById('subj-topic-count').textContent = totalTopics;
  document.getElementById('subj-done-count').textContent = doneCount;
  document.getElementById('subj-pend-count').textContent = totalTopics - doneCount;
  const pct = totalTopics ? Math.round((doneCount/totalTopics)*100) : 0;
  document.getElementById('subj-circle-text').textContent = `${pct}%`;
  document.getElementById('subj-circle').style.background = `conic-gradient(var(--color-primary) ${pct}%, #f3f4f6 0)`;
}

window.toggleTopicStatus = function(short, topicName) {
  const prog = getProgress(short);
  if (prog[topicName]) {
    markPending(short, topicName);
  } else {
    markDone(short, topicName);
  }
  loadSubjectInfo(short);
  renderDashboard();
  renderProgressPage();
}

function renderProgressPage() {
  const tbody = document.getElementById("progress-tbody");
  tbody.innerHTML = "";
  if(typeof getAllProgress !== 'function') return;
  const stats = getAllProgress();
  
  SUBJECTS.forEach(sub => {
    const stat = stats[sub.short] || {percentage:0, done:0, pending:0};
    const pct = stat.percentage;
    let pctClass = pct > 50 ? 'text-success' : 'text-warning';
    if(pct === 0) pctClass = '';

    tbody.innerHTML += `
      <tr>
        <td class="font-semibold">${sub.name} <span class="badge badge-blue ml-2">${sub.short}</span></td>
        <td>
          <div class="progress-bar-container" style="width: 150px; margin:0;">
            <div class="progress-bar-fill" style="width: ${pct}%; background-color: var(--color-primary);"></div>
          </div>
        </td>
        <td>${stat.done}</td>
        <td>${stat.pending}</td>
        <td class="font-bold" style="color: ${pct>50?'var(--color-success)':'var(--color-warning)'}">${pct}%</td>
      </tr>
    `;
  });

  const grid = document.getElementById("contrib-grid");
  grid.innerHTML = "";
  const cols = ['#f3f4f6', '#bfdbfe', '#3b82f6', '#1d4ed8'];
  for(let i=0; i<28; i++) {
    const d = document.createElement('div');
    d.className = 'contrib-cell';
    d.style.background = cols[Math.floor(Math.random()*cols.length)];
    grid.appendChild(d);
  }
}

function setMode(mode) {
  currentMode = mode;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  const tabs = Array.from(document.querySelectorAll('.tab'));
  const idx = ['teach','quiz','boss','story'].indexOf(mode);
  if(idx > -1) tabs[idx].classList.add('active');

  const msgMap = {
    story: "🎭 Ready to hear a story?",
    quiz: "📝 Ready for a 5-question quiz?",
    boss: "⚔️ Ready to fight the Boss?",
    teach: "📖 Ready to learn?"
  };

  document.getElementById("study-msg").textContent = msgMap[mode] || msgMap['teach'];
  document.getElementById("study-boss-ui").style.display = mode === 'boss' ? 'flex' : 'none';
  if(mode === 'boss') {
    document.getElementById("boss-hp-container").innerHTML = `
BOSS - ${currentTopic} Overlord
HP [████████████████████] 100/100

YOU
HP [████████████████████] 100/100`;
  }

  document.getElementById("study-placeholder").style.display = 'flex';
  document.getElementById("study-chat").style.display = 'none';
  document.getElementById("study-chat").innerHTML = '';
  document.getElementById("study-input").style.display = 'none';
}

function initStudyRoom() {
  document.getElementById("study-subj-name").textContent = currentSubject || "Subject";
  document.getElementById("study-badge").textContent = currentSubject || "SHORT";
  document.getElementById("study-topic-name").textContent = currentTopic || "Topic";
  setMode(currentMode);
}

function markDoneFromStudy() {
  if(typeof markDone === 'function' && currentSubject && currentTopic) {
    markDone(currentSubject, currentTopic);
    loadSubjectInfo(currentSubject);
    renderDashboard();
    renderProgressPage();
    showToast(`✅ ${currentTopic} marked as complete!`);
    setTimeout(() => nav('subject', currentSubject), 1500);
  }
}

function addAgentMsg(txt, isHtml=false) {
  const div = document.createElement("div");
  div.className = "msg agent";
  if(isHtml) div.innerHTML = txt;
  else div.innerHTML = txt.replace(/n/g, '<br>');
  document.getElementById("study-chat").appendChild(div);
  document.getElementById("study-chat").scrollTop = document.getElementById("study-chat").scrollHeight;
}

// ---------------------------------
// AI Integration Parsers and Loops
// ---------------------------------

async function startSession() {
  if(!currentTopic) return;
  const subj = SUBJECTS.find(s=>s.short===currentSubject)?.name || currentSubject;

  document.getElementById("study-placeholder").style.display = 'none';
  document.getElementById("study-chat").style.display = 'flex';
  document.getElementById("study-input").style.display = 'none';
  document.getElementById("study-chat").innerHTML = '';
  
  const msgMap = {
    story: "🎭 Crafting your story...",
    quiz: "📝 Preparing questions...",
    boss: "⚔️ Summoning the boss...",
    teach: "📖 Loading lesson..."
  };
  addAgentMsg(`<div id="loading-msg"><div class="spinner"></div> ${msgMap[currentMode]}</div>`, true);

  try {
    let res = "";
    if (currentMode === 'story') {
      res = await getStory(currentTopic, subj);
      finishStandardMode(res);
    } else if (currentMode === 'teach') {
      res = await getTeach(currentTopic, subj);
      finishStandardMode(res);
    } else if (currentMode === 'quiz') {
      res = await getQuiz(currentTopic, subj);
      parseQuiz(res);
    } else if (currentMode === 'boss') {
      res = await getBossFight(currentTopic, subj);
      parseBoss(res);
    }
  } catch(e) {
    document.getElementById("loading-msg").innerHTML = `❌ Error: ${e.message}. See diagnostics.`;
  }
}

function finishStandardMode(resText) {
  const lm = document.getElementById("loading-msg");
  if(lm) lm.remove();
  addAgentMsg(resText, false);
  const btnDiv = document.createElement("div");
  btnDiv.innerHTML = `<button class="btn btn-outline" style="margin-right:10px" onclick="setMode('quiz'); startSession()">Quiz Me Now</button> <button class="btn btn-primary" onclick="markDoneFromStudy()">Mark Done ✓</button>`;
  document.getElementById("study-chat").appendChild(btnDiv);
}

function parseQuiz(raw) {
  const lm = document.getElementById("loading-msg");
  if(lm) lm.remove();
  
  const s = raw.split('---ANSWERS---');
  if(s.length < 2) {
      addAgentMsg(`❌ Failed to parse quiz format.`, false);
      return;
  }
  
  const qMatches = [...s[0].matchAll(/Q(d+):s*(.*?)(?=(Qd+:|$))/gs)];
  const aMatches = [...s[1].matchAll(/A(d+):s*(.*?)(?=(Ad+:|$))/gs)];
  
  let questions = [];
  for(let i=0; i<qMatches.length; i++) {
      let t = qMatches[i][2].trim();
      let typeM = t.match(/TYPE:s*(.*)/i);
      let optM = t.match(/OPTIONS:s*(.*)/is);
      
      let ansMatch = aMatches.find(m => m[1] === qMatches[i][1]);
      questions.push({
          text: t.split(/TYPE:/i)[0].trim(),
          type: typeM ? typeM[1].trim().split('n')[0] : 'ONELINER',
          options: optM ? optM[1].trim() : "",
          answer: ansMatch ? ansMatch[2].trim() : ""
      });
  }
  
  currentQuizState = { questions, qIndex: 0, score: 0 };
  renderQuizQuestion();
}

function renderQuizQuestion() {
  const qs = currentQuizState;
  const chat = document.getElementById("study-chat");
  
  if(qs.qIndex >= qs.questions.length) {
      let msg = qs.score === qs.questions.length ? "PERFECT! Topic mastered!" : qs.score >= 3 ? "Good! Review weak points." : "Need more practice. Try again.";
      addAgentMsg(`🏁 Quiz Finished! Score: ${qs.score}/${qs.questions.length}n${msg}`, false);
      const btnDiv = document.createElement("div");
      btnDiv.innerHTML = `<button class="btn btn-outline" style="margin-right:10px" onclick="startSession()">Try Again</button> <button class="btn btn-primary" onclick="markDoneFromStudy()">Mark Done ✓</button>`;
      chat.appendChild(btnDiv);
      document.getElementById('study-input').style.display = 'none';
      return;
  }
  
  let q = qs.questions[qs.qIndex];
  let html = `<b>Question ${qs.qIndex+1}/${qs.questions.length}</b><br>${q.text}`;
  
  if(q.type.includes('MCQ')) {
      html += `<div style="margin-top:10px">
        <button class="btn btn-outline" style="margin:2px" onclick="window.submitInput('A')">A</button>
        <button class="btn btn-outline" style="margin:2px" onclick="window.submitInput('B')">B</button>
        <button class="btn btn-outline" style="margin:2px" onclick="window.submitInput('C')">C</button>
        <button class="btn btn-outline" style="margin:2px" onclick="window.submitInput('D')">D</button>
      </div>`;
      document.getElementById('study-input').style.display = 'none';
  } else {
      document.getElementById('study-input').style.display = 'flex';
      document.getElementById('chat-msg').focus();
  }
  
  addAgentMsg(html, true);
}

function parseBoss(raw) {
  const lm = document.getElementById("loading-msg");
  if(lm) lm.remove();
  
  const s = raw.split('---ANSWERS---');
  if(s.length < 2) {
      addAgentMsg(`❌ Failed to parse boss format.`, false);
      return;
  }
  
  const qMatches = [...s[0].matchAll(/Q(d+):s*(.*?)(?=(Qd+:|$))/gs)];
  const aMatches = [...s[1].matchAll(/A(d+):s*(.*?)(?=(Ad+:|$))/gs)];
  
  let questions = [];
  for(let i=0; i<qMatches.length; i++) {
      let ansMatch = aMatches.find(m => m[1] === qMatches[i][1]);
      questions.push({
          text: qMatches[i][2].trim(),
          answer: ansMatch ? ansMatch[2].trim() : ""
      });
  }
  
  currentBossState = { questions, qIndex: 0, bossHP: 100, userHP: 100 };
  document.getElementById("study-boss-ui").style.display = 'flex';
  renderBossHP();
  
  document.getElementById('study-input').style.display = 'flex';
  document.getElementById('chat-msg').focus();
  renderBossQuestion();
}

function renderBossHP() {
  const bs = currentBossState;
  const b = Math.max(0, bs.bossHP);
  const u = Math.max(0, bs.userHP);
  document.getElementById('boss-hp-container').innerHTML = `
BOSS - ${currentTopic} Overlord
HP [${'█'.repeat(Math.round(b/5)).padEnd(20,' ')}] ${b}/100

YOU
HP [${'█'.repeat(Math.round(u/5)).padEnd(20,' ')}] ${u}/100`;
}

function renderBossQuestion() {
  const bs = currentBossState;
  if(bs.bossHP <= 0) {
      addAgentMsg(`⚔️ VICTORY! ${currentTopic} DEFEATED!`, false);
      const btnDiv = document.createElement("div");
      btnDiv.innerHTML = `<button class="btn btn-primary" onclick="markDoneFromStudy()">Mark Done ✓</button>`;
      document.getElementById("study-chat").appendChild(btnDiv);
      document.getElementById('study-input').style.display = 'none';
      return;
  }
  if(bs.userHP <= 0 || bs.qIndex >= bs.questions.length) {
      addAgentMsg(`💀 DEFEATED! Study more and retry.`, false);
      const btnDiv = document.createElement("div");
      btnDiv.innerHTML = `<button class="btn btn-outline" onclick="startSession()">Try Again</button>`;
      document.getElementById("study-chat").appendChild(btnDiv);
      document.getElementById('study-input').style.display = 'none';
      return;
  }
  
  addAgentMsg(`⚔️ <b>Boss Attack:</b> ${bs.questions[bs.qIndex].text}`, true);
}

window.submitInput = function(val) {
   let iv = val || document.getElementById('chat-msg').value;
   if(!iv.trim()) return;
   
   const div = document.createElement("div");
   div.className = "msg student";
   div.textContent = iv;
   document.getElementById("study-chat").appendChild(div);
   
   document.getElementById('chat-msg').value = '';
   document.getElementById('study-chat").scrollTop = document.getElementById("study-chat").scrollHeight;
   
   if(currentMode === 'quiz') {
       evalQuiz(iv);
   } else if (currentMode === 'boss') {
       evalBoss(iv);
   }
}

function handleEnter(e) {
  if (e.key === 'Enter') submitInput();
}

function evalQuiz(inputVal) {
   const qs = currentQuizState;
   let q = qs.questions[qs.qIndex];
   
   let ans = q.answer.toLowerCase();
   let iv = inputVal.toLowerCase();
   
   let correct = false;
   if(q.type.includes('MCQ')) {
       correct = ans.startsWith(iv) || ans.includes(` ${iv})`) || ans.includes(`(${iv})`);
       if(iv === 'a' && ans.includes('a)')) correct = true;
       if(iv === 'b' && ans.includes('b)')) correct = true;
       if(iv === 'c' && ans.includes('c)')) correct = true;
       if(iv === 'd' && ans.includes('d)')) correct = true;
   } else {
       correct = iv.includes(ans) || ans.includes(iv);
   }
   
   if(correct) {
      qs.score++;
      addAgentMsg(`✅ Correct! Answer: ${q.answer}`, false);
   } else {
      addAgentMsg(`❌ Wrong! Correct answer was: ${q.answer}`, false);
   }
   
   qs.qIndex++;
   setTimeout(renderQuizQuestion, 1000);
}

function evalBoss(inputVal) {
   const bs = currentBossState;
   let q = bs.questions[bs.qIndex];
   
   let ans = q.answer.toLowerCase();
   let iv = inputVal.toLowerCase();
   
   let ansWords = ans.split(' ').filter(w=>w.length>3);
   let matches = ansWords.filter(w=>iv.includes(w));
   let correct = false;
   if(ansWords.length>0 && matches.length >= ansWords.length/3) correct = true;
   else if (iv.includes(ans) || ans.includes(iv)) correct = true;
   
   let bUi = document.getElementById('boss-hp-container');
   if(correct) {
      bs.bossHP -= 20;
      addAgentMsg(`Boss: "Impossible! You know too much!"n(Boss loses 20HP)`, false);
      bUi.style.boxShadow = "0 0 20px #10b981";
   } else {
      bs.userHP -= 20;
      addAgentMsg(`Boss: "Ha! Is that all you know?"nCorrect was: ${q.answer}n(You lose 20HP)`, false);
      bUi.style.boxShadow = "0 0 20px #ef4444";
   }
   setTimeout(() => bUi.style.boxShadow = "none", 500);
   
   renderBossHP();
   bs.qIndex++;
   setTimeout(renderBossQuestion, 1500);
}
