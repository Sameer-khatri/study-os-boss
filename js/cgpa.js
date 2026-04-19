// CGPA Intelligence Engine Logic

// Grading System configuration (10-point scale)
function scoreToGradePoint(score) {
  if (score >= 90) return { grade: "S",  gp: 10 };
  if (score >= 80) return { grade: "A+", gp: 9  };
  if (score >= 70) return { grade: "A",  gp: 8  };
  if (score >= 60) return { grade: "B+", gp: 7  };
  if (score >= 50) return { grade: "B",  gp: 6  };
  if (score >= 45) return { grade: "C",  gp: 5  };
  if (score >= 40) return { grade: "P",  gp: 4  };
  return { grade: "F", gp: 0 };
}

// Compute scaled marks to out of 100 for a subject
function computeSubjectScore(mst1_raw, mst2_raw, internal, external_raw) {
  const mst1  = mst1_raw  !== null && mst1_raw !== '' ? (Number(mst1_raw) / 30) * 15 : 0;
  const mst2  = mst2_raw  !== null && mst2_raw !== '' ? (Number(mst2_raw) / 30) * 15 : 0;
  const ext   = external_raw !== null && external_raw !== '' ? (Number(external_raw) / 100) * 60 : 0;
  const intr  = internal !== null && internal !== '' ? Number(internal) : 0;
  return mst1 + mst2 + ext + intr;
}

function externalNeededForGrade(targetScore, mst1_raw, mst2_raw, internal) {
  const mst1  = mst1_raw  !== null && mst1_raw !== '' ? (Number(mst1_raw) / 30) * 15 : 0;
  const mst2  = mst2_raw  !== null && mst2_raw !== '' ? (Number(mst2_raw) / 30) * 15 : 0;
  const intr  = internal !== null && internal !== '' ? Number(internal) : 0;
  const already = mst1 + mst2 + intr;
  const neededScaled = targetScore - already;
  const neededRaw = (neededScaled / 60) * 100;
  return Math.max(0, Math.min(100, Math.ceil(neededRaw)));
}

// Global state
let semesterData = {
    name: "Sem 4, Year 2",
    total_credits: 0,
    subjects: [],
    cgpa: { projected: 0, scenario: "Realistic" },
    pareto: { vital_credit_pct: 0, vital_subjects: [], trivial_subjects: [] }
};

// UI Initialization
function initCgpaEngine() {
    loadCgpaData();
    if(semesterData.subjects.length === 0) {
        addSubjectRow(); // empty row
    } else {
        renderInputRows();
        analyzeCGPA(false); // Don't switch display immediately
    }
}

// Data loading / processing
function loadCgpaData() {
    const saved = localStorage.getItem('boss_cgpa');
    if (saved) {
        try {
            semesterData = JSON.parse(saved);
        } catch (e) { console.error("Failed to parse boss_cgpa", e); }
    }
}

function saveCgpaData() {
    localStorage.setItem('boss_cgpa', JSON.stringify(semesterData));
}

function useCurrentSemester() {
    const currentSem = [
        { name: "Theory of Computation", code: "TOC", credits: 4, type: "theory", mst1_raw: "", mst2_raw: "", internal: "", external_target: 70 },
        { name: "Discrete Structures", code: "DS", credits: 4, type: "theory", mst1_raw: "", mst2_raw: "", internal: "", external_target: 70 },
        { name: "Analysis & Design of Algorithms", code: "ADA", credits: 3, type: "theory", mst1_raw: "", mst2_raw: "", internal: "", external_target: 70 },
        { name: "Database Security", code: "DBS", credits: 3, type: "theory", mst1_raw: "", mst2_raw: "", internal: "", external_target: 70 },
        { name: "Statistical Methods", code: "STATS", credits: 3, type: "theory", mst1_raw: "", mst2_raw: "", internal: "", external_target: 70 },
        { name: "Technical Writing", code: "TWIS", credits: 2, type: "theory", mst1_raw: "", mst2_raw: "", internal: "", external_target: 70 },
        { name: "OS Lab", code: "OS Lab", credits: 1, type: "lab", mst1_raw: "", mst2_raw: "", internal: "", external_target: 90 },
        { name: "ADA Lab", code: "ADA Lab", credits: 1, type: "lab", mst1_raw: "", mst2_raw: "", internal: "", external_target: 90 },
        { name: "DBS Lab", code: "DBS Lab", credits: 1, type: "lab", mst1_raw: "", mst2_raw: "", internal: "", external_target: 90 },
        { name: "SPSS Lab", code: "SPSS Lab", credits: 1, type: "lab", mst1_raw: "", mst2_raw: "", internal: "", external_target: 90 }
    ];
    
    semesterData.subjects = currentSem.map(s => buildSubjectObject(s));
    renderInputRows();
}

function addSubjectRow() {
    const rowId = 'sub_' + Math.random().toString(36).substr(2, 9);
    semesterData.subjects.push({
        id: rowId, name: "", code: "", credits: 3, type: "theory", marks: { mst1_raw: "", mst2_raw: "", internal: "", external_target: 70 }
    });
    renderInputRows();
}

function buildSubjectObject(data) {
    return {
        id: 'sub_' + Math.random().toString(36).substr(2, 9),
        name: data.name,
        code: data.code,
        credits: data.credits,
        type: data.type,
        marks: {
            mst1_raw: data.mst1_raw,
            mst2_raw: data.mst2_raw,
            internal: data.internal,
            external_target: data.external_target
        },
        computed: {}
    };
}

function renderInputRows() {
    const container = document.getElementById("cgpa-subjects-input");
    container.innerHTML = "";
    
    semesterData.subjects.forEach((sub, index) => {
        const div = document.createElement("div");
        div.className = "subject-row";
        div.innerHTML = `
            <input type="text" placeholder="Subject Name" value="${sub.name}" onchange="updateSub(${index}, 'name', this.value)">
            <input type="text" placeholder="Code" value="${sub.code}" onchange="updateSub(${index}, 'code', this.value)">
            <select onchange="updateSub(${index}, 'credits', parseInt(this.value))">
                <option value="1" ${sub.credits === 1 ? 'selected' : ''}>1 Cr</option>
                <option value="2" ${sub.credits === 2 ? 'selected' : ''}>2 Cr</option>
                <option value="3" ${sub.credits === 3 ? 'selected' : ''}>3 Cr</option>
                <option value="4" ${sub.credits === 4 ? 'selected' : ''}>4 Cr</option>
            </select>
            <select onchange="updateSub(${index}, 'type', this.value)">
                <option value="theory" ${sub.type === 'theory' ? 'selected' : ''}>Theory</option>
                <option value="lab" ${sub.type === 'lab' ? 'selected' : ''}>Lab</option>
            </select>
            <input type="number" placeholder="MST1 /30" min="0" max="30" value="${sub.marks.mst1_raw}" onchange="updateSubMarks(${index}, 'mst1_raw', this.value)">
            <input type="number" placeholder="MST2 /30" min="0" max="30" value="${sub.marks.mst2_raw}" onchange="updateSubMarks(${index}, 'mst2_raw', this.value)">
            <input type="number" placeholder="Int /10" min="0" max="10" value="${sub.marks.internal}" onchange="updateSubMarks(${index}, 'internal', this.value)">
            <button class="remove-row-btn" onclick="removeSub(${index})"><i data-lucide="trash-2" style="width: 18px; height: 18px;"></i></button>
        `;
        container.appendChild(div);
    });
    lucide.createIcons();
}

window.updateSub = function(idx, field, val) { semesterData.subjects[idx][field] = val; saveCgpaData(); };
window.updateSubMarks = function(idx, field, val) { semesterData.subjects[idx].marks[field] = val; saveCgpaData(); };
window.removeSub = function(idx) { semesterData.subjects.splice(idx, 1); renderInputRows(); saveCgpaData(); };

// Analysis Engine
function analyzeCGPA(switchView = true) {
    if(semesterData.subjects.length === 0) return;
    
    // Calculate total credits
    semesterData.total_credits = semesterData.subjects.reduce((sum, s) => sum + s.credits, 0);
    
    // Add computed properties
    semesterData.subjects.forEach(sub => {
        sub.computed = sub.computed || {};
        sub.computed.cgpa_weight_pct = semesterData.total_credits > 0 ? ((sub.credits / semesterData.total_credits) * 100) : 0;
        
        let ext_target = sub.marks.external_target !== undefined ? sub.marks.external_target : (sub.type === 'lab' ? 90 : 70);
        sub.marks.external_target = ext_target;
        
        const total = computeSubjectScore(sub.marks.mst1_raw, sub.marks.mst2_raw, sub.marks.internal, ext_target);
        sub.computed.total = total;
        const gp = scoreToGradePoint(total);
        sub.computed.grade = gp.grade;
        sub.computed.grade_point = gp.gp;
    });
    
    // Sort and Pareto
    let sorted = [...semesterData.subjects].sort((a,b) => b.computed.cgpa_weight_pct - a.computed.cgpa_weight_pct);
    let cum = 0;
    
    semesterData.pareto = { vital_credit_pct: 0, vital_subjects: [], trivial_subjects: [] };
    
    sorted.forEach(sub => {
        cum += sub.computed.cgpa_weight_pct;
        if(cum <= 80 || semesterData.pareto.vital_subjects.length === 0) { // Keep at least one
            sub.computed.pareto_tier = "vital";
            semesterData.pareto.vital_subjects.push(sub);
            semesterData.pareto.vital_credit_pct += sub.computed.cgpa_weight_pct;
        } else {
            sub.computed.pareto_tier = "trivial";
            semesterData.pareto.trivial_subjects.push(sub);
        }
        
        // Detailed tiering for charts
        if (sub.computed.cgpa_weight_pct >= 15) sub.computed.tier_class = "tier-critical";
        else if (sub.computed.cgpa_weight_pct >= 10) sub.computed.tier_class = "tier-high";
        else if (sub.computed.cgpa_weight_pct >= 5) sub.computed.tier_class = "tier-medium";
        else sub.computed.tier_class = "tier-low";
    });
    
    updateLiveMetrics();
    
    if(switchView) {
        document.getElementById("cgpa-setup").style.display = 'none';
        document.getElementById("cgpa-dashboard").style.display = 'block';
        document.getElementById("btn-back-to-setup").style.display = 'flex';
        renderDashboardView();
    }
    
    saveCgpaData();
}

function updateLiveMetrics() {
    let weightedSum = 0;
    semesterData.subjects.forEach(sub => {
        const total = computeSubjectScore(sub.marks.mst1_raw, sub.marks.mst2_raw, sub.marks.internal, sub.marks.external_target);
        sub.computed.total = total;
        const gp = scoreToGradePoint(total);
        sub.computed.grade = gp.grade;
        sub.computed.grade_point = gp.gp;
        weightedSum += gp.gp * sub.credits;
    });
    
    semesterData.cgpa.projected = semesterData.total_credits > 0 ? (weightedSum / semesterData.total_credits) : 0;
}

function getCGPAColorClass(cgpa) {
    if(cgpa >= 9.0) return 'cgpa-excellent';
    if(cgpa >= 8.0) return 'cgpa-good';
    if(cgpa >= 7.0) return 'cgpa-average';
    return 'cgpa-poor';
}

function renderDashboardView() {
    renderCreditMap();
    renderPareto();
    renderSimulator();
    renderSubjectCards();
    renderActionPlan();
}

function renderCreditMap() {
    const mapDiv = document.getElementById("cgpa-credit-map");
    mapDiv.innerHTML = "";
    
    const sorted = [...semesterData.subjects].sort((a,b) => b.computed.cgpa_weight_pct - a.computed.cgpa_weight_pct);
    let html = '';
    
    sorted.forEach(sub => {
        let pct = sub.computed.cgpa_weight_pct.toFixed(1);
        html += `
            <div class="credit-bar-row">
                <div class="credit-bar-label">${sub.code || sub.name.substring(0,6)}</div>
                <div class="credit-bar-wrapper">
                    <div class="credit-bar-fill ${sub.computed.tier_class}" style="width: ${pct}%"></div>
                </div>
                <div class="credit-bar-value">${sub.credits} cr = ${pct}%</div>
            </div>
        `;
    });
    
    mapDiv.innerHTML = html;
    
    // Headline stats
    const vitalNames = semesterData.pareto.vital_subjects.slice(0,3).map(s=>s.code).join(' + ');
    let extra = semesterData.pareto.vital_subjects.length > 3 ? '...' : '';
    document.getElementById("cgpa-headline").textContent = 
        `${vitalNames}${extra} alone control ${semesterData.pareto.vital_credit_pct.toFixed(1)}% of your entire CGPA this semester.`;
}

function renderPareto() {
    const vitalHtml = semesterData.pareto.vital_subjects.map(sub => {
        return `<div style="display:flex; justify-content:space-between; margin-bottom: 0.5rem; color:var(--text-primary); font-size: 0.875rem;">
            <div style="width:40px; font-weight:600;">${sub.code}</div>
            <div style="width:40px;">${sub.credits} cr</div>
            <div style="flex:1; margin: 0 1rem; background:var(--color-border); height:8px; border-radius:4px; align-self:center;">
                <div style="background:var(--color-primary); height:100%; border-radius:4px; width:${sub.computed.cgpa_weight_pct}%;"></div>
            </div>
            <div style="width:45px; text-align:right;">${sub.computed.cgpa_weight_pct.toFixed(1)}%</div>
        </div>`;
    }).join('');
    
    const trivialSum = semesterData.pareto.trivial_subjects.reduce((sum, s)=>sum + s.computed.cgpa_weight_pct, 0);
    const trivialHtml = semesterData.pareto.trivial_subjects.map(s => s.code).join(' + ');

    document.getElementById("cgpa-pareto-vital").innerHTML = `
        <div style="border-bottom: 1px solid var(--color-border); padding-bottom: 0.5rem; margin-bottom: 1rem;">
            <div style="font-weight:700; color:var(--color-primary);">VITAL FEW</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">Spend 80% of your time here</div>
        </div>
        ${vitalHtml}
        <div style="border-top: 1px solid var(--color-border); padding-top: 0.5rem; margin-top: 0.5rem; display:flex; justify-content:space-between; font-weight:bold;">
            <span>TOTAL:</span>
            <span>${semesterData.pareto.vital_credit_pct.toFixed(1)}% of CGPA</span>
        </div>
    `;
    
    document.getElementById("cgpa-pareto-trivial").innerHTML = `
        <div style="border-bottom: 1px solid var(--color-border); padding-bottom: 0.5rem; margin-bottom: 1rem;">
            <div style="font-weight:700; color:var(--text-muted);">TRIVIAL MANY</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">Spend 20% of your time here</div>
        </div>
        <div style="font-size: 0.875rem; color:var(--text-muted); line-height:1.5;">
            ${trivialHtml}
            <div style="margin-top: 1rem; font-weight:bold; color:var(--text-primary);">${trivialSum.toFixed(1)}% of CGPA</div>
        </div>
    `;
}

function renderSubjectCards() {
    const container = document.getElementById("cgpa-detailed-cards");
    container.innerHTML = "";
    
    const sorted = [...semesterData.subjects].sort((a,b) => b.computed.cgpa_weight_pct - a.computed.cgpa_weight_pct);
    let html = '';
    
    sorted.forEach(sub => {
        let tType = sub.computed.tier_class.replace('tier-', 'tier-border-');
        let extNeededO = externalNeededForGrade(90, sub.marks.mst1_raw, sub.marks.mst2_raw, sub.marks.internal);
        let extNeededA = externalNeededForGrade(80, sub.marks.mst1_raw, sub.marks.mst2_raw, sub.marks.internal);
        
        let mst1_s = sub.marks.mst1_raw ? ((Number(sub.marks.mst1_raw)/30)*15).toFixed(1) : '?';
        let mst2_s = sub.marks.mst2_raw ? ((Number(sub.marks.mst2_raw)/30)*15).toFixed(1) : '?';
        let ext_s = ((sub.marks.external_target/100)*60).toFixed(1);
        let int_s = sub.marks.internal ? Number(sub.marks.internal) : '?';
        
        html += `
        <div class="cgpa-subject-card ${tType}">
            <div class="flex justify-between items-center">
                <h3 class="font-bold">${sub.code} — ${sub.name} <span class="text-sm text-muted">(${sub.credits} credits)</span></h3>
                <span class="badge badge-blue">Weight: ${sub.computed.cgpa_weight_pct.toFixed(1)}%</span>
            </div>
            
            <table class="marks-table">
                <tr><th>Component</th><th>Raw</th><th>Scaled</th></tr>
                <tr><td>External</td><td>${sub.marks.external_target} / 100</td><td>${ext_s} / 60</td></tr>
                <tr><td>MST 1</td><td>${sub.marks.mst1_raw||'?'} / 30</td><td>${mst1_s} / 15</td></tr>
                <tr><td>MST 2</td><td>${sub.marks.mst2_raw||'?'} / 30</td><td>${mst2_s} / 15</td></tr>
                <tr><td>Internal</td><td>${sub.marks.internal||'?'} / 10</td><td>${int_s} / 10</td></tr>
            </table>
            
            <div class="flex justify-between font-semibold mt-4 pt-4" style="border-top:1px dashed var(--color-border)">
                <div>Projected Total: ${sub.computed.total.toFixed(1)} / 100</div>
                <div>Grade: ${sub.computed.grade} (${sub.computed.grade_point})</div>
            </div>
            
            <div class="text-sm mt-4 text-muted">
                ⚡ To score S (90+): Need ${extNeededO}+ in External<br>
                ⚡ To score A+ (80+): Need ${extNeededA}+ in External
            </div>
        </div>
        `;
    });
    
    container.innerHTML = html;
}

function renderSimulator() {
    updateTopCgpaDisplay();
    
    const container = document.getElementById("cgpa-sim-sliders");
    let html = '';
    
    semesterData.subjects.forEach((sub, idx) => {
        html += `
        <div class="sim-row">
            <div class="font-semibold">${sub.code}</div>
            <input type="range" class="sim-slider" min="0" max="100" value="${sub.marks.external_target}" oninput="simSliderChange(this.value, '${sub.id}', 'label_${sub.id}')">
            <div id="label_${sub.id}" class="text-right">${sub.marks.external_target}</div>
            <div id="sim_total_${sub.id}" class="text-right text-muted">${sub.computed.total.toFixed(0)}</div>
            <div id="sim_grade_${sub.id}" class="text-right font-bold">${sub.computed.grade}</div>
        </div>
        `;
    });
    
    container.innerHTML = html;
}

window.simSliderChange = function(val, id, labelId) {
    document.getElementById(labelId).textContent = val;
    let sub = semesterData.subjects.find(s => s.id === id);
    if(sub) {
        sub.marks.external_target = Number(val);
        updateLiveMetrics();
        updateTopCgpaDisplay();
        document.getElementById(`sim_total_${id}`).textContent = sub.computed.total.toFixed(0);
        document.getElementById(`sim_grade_${id}`).textContent = sub.computed.grade;
        saveCgpaData();
        renderSubjectCards(); // Re-render detailed cards to reflect new totals.
    }
}

function updateTopCgpaDisplay() {
    const cgpa = semesterData.cgpa.projected.toFixed(2);
    const disp = document.getElementById("cgpa-live-display");
    disp.textContent = cgpa;
    disp.className = "sim-cgpa-display " + getCGPAColorClass(parseFloat(cgpa));
    
    const letterGrade = scoreToGradePoint(parseFloat(cgpa)*10).grade; // Approx Grade
    document.getElementById("cgpa-live-grade").textContent = `Grade: ${letterGrade} | Scenario: ${semesterData.cgpa.scenario}`;
}

window.setScenario = function(type) {
    semesterData.cgpa.scenario = type;
    semesterData.subjects.forEach(sub => {
        if(type === 'Pessimistic') sub.marks.external_target = 55;
        else if (type === 'Realistic') sub.marks.external_target = 70;
        else if (type === 'Target 9.0') {
            // Very basic heuristic: 9.0 means average gp = 9 => S or A+
            // Set 85 target
            sub.marks.external_target = sub.type === 'lab' ? 95 : 82;
        }
    });
    analyzeCGPA(true);
}

function renderActionPlan() {
    const container = document.getElementById("cgpa-action-plan");
    let html = ``;
    
    semesterData.pareto.vital_subjects.forEach((sub, i) => {
        html += `
        <div class="action-plan-item">
            <div class="action-rank">#${i+1}</div>
            <div>
                <div class="font-bold">${sub.name} <span class="text-sm text-muted font-normal">(${sub.credits} cr, ${sub.computed.cgpa_weight_pct.toFixed(1)}% weight)</span></div>
                <div class="text-sm text-muted mt-1">
                    External worth: 60 marks → scales to 60% of subject.<br>
                    Every 10 marks in External = +0.6 subject score.
                </div>
            </div>
        </div>
        `;
    });
    
    let labs = semesterData.subjects.filter(s=>s.type === 'lab').map(s=>s.code).join(', ');
    if(labs) {
        html += `
        <div class="insight-callout" style="margin-top: 1.5rem;">
            <strong>QUICK WINS (do these fast, they're free marks):</strong><br>
            ${labs}.<br>
            Labs are attendance + submission based. 85%+ is default. Don't spend more than 20% of your time here.
        </div>
        `;
    }
    
    container.innerHTML = html;
}

window.toggleCgpaSetup = function() {
    document.getElementById("cgpa-dashboard").style.display = 'none';
    document.getElementById("btn-back-to-setup").style.display = 'none';
    document.getElementById("cgpa-setup").style.display = 'block';
    renderInputRows();
}
