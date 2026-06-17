const PRIORITY_ITEMS = [
  "Rank-for-Rank Recall policy",
  "Promotional process",
  "Temporary assignments (TA)",
  "Hazard / specialty pay",
  "Sick leave",
  "Vacation / time off",
  "PPE and equipment",
  "Working hours / shift schedule",
  "Wages and step progression",
  "Staffing levels and minimum manning"
];

const RANKED_SECTIONS = [
  { title: "Assignments", groups: [{ field:"rank", label:"Rank" },{ field:"apparatus", label:"Apparatus Assignment" },{ field:"workedEngine", label:"Previously worked on engine company?" }] },
  { title: "R4R Experience", groups: [{ field:"reached288", label:"Reached 288-hour guarantee?" },{ field:"hoursWorked", label:"Hours worked this fiscal year" },{ field:"shortfallReason", label:"Reasons for shortfall", isMulti:true }] },
  { title: "The Apparatus Restriction", groups: [{ field:"awareRestriction", label:"Aware of apparatus restriction?" },{ field:"restrictionImpact", label:"How much the restriction limited R4R access" },{ field:"shiftsMissed", label:"Shifts missed — Hazmat / Rescue / Ladder / BC Aid" }] },
  { title: "The Double Standard", groups: [{ field:"awareTA", label:"Aware of cross-apparatus TA / Relocation?" },{ field:"taConsistency", label:"Same cross-apparatus logic should apply to R4R?" }] },
  { title: "Proposed Changes", groups: [{ field:"supportChange", label:"Support R4R across non-cert apparatus types?" },{ field:"priority", label:"Priority level for fixing the restriction" }] },
  { title: "Open Feedback — Ranked Members", isText:true, groups: [{ field:"biggestChange", label:"What change would make the biggest difference?" },{ field:"otherComments", label:"Additional comments" }] }
];

const FF1_SECTIONS = [
  { title: "Background", groups: [{ field:"yearsOnDept", label:"Years with MFD" },{ field:"apparatus", label:"Apparatus Assignment" },{ field:"hasTAd", label:"Have you TA'd to FF III?" }] },
  { title: "The R4R Policy & You", groups: [{ field:"r4rAwareness", label:"Familiarity with R4R program" },{ field:"everRelocated", label:"Ever relocated due to R4R?" },{ field:"relocationTime", label:"If relocated — was it around 7:30pm?" }] },
  { title: "Safety, Burden & Hardship", groups: [{ field:"crewSafety", label:"Feel safe with ranked member from different apparatus on your truck?" },{ field:"back12Burden", label:"Back-12 R4R increases burden on FF I personnel?" },{ field:"easierShifts", label:"Ranked members take back-12 because it's easier, adding FF I workload?" },{ field:"negativeImpact", label:"Negatively impacted by the current R4R policy?" }] },
  { title: "The Double Standard", groups: [{ field:"awareTAPolicy", label:"Aware FF Is can TA to FF III on any apparatus?" },{ field:"taExperience", label:"Have TA'd to FF III on different apparatus?" },{ field:"taDoubleStandard", label:"Ranked members should have same cross-apparatus freedom for R4R?" }] },
  { title: "Fairness & Voice", groups: [{ field:"policyFairness", label:"R4R policy accounts for FF I impact?" },{ field:"voiceWeight", label:"Junior member voice carries equal weight on policy?" },{ field:"comfortSpeakingUp", label:"Comfortable raising R4R concerns as junior member?" }] },
  { title: "Open Feedback — Firefighter Is", isText:true, groups: [{ field:"ff1Change", label:"What change would make the biggest difference for FF Is?" },{ field:"ff1Comments", label:"Additional comments" }] }
];

let rankedData = [], ff1Data = [];

document.addEventListener("DOMContentLoaded", () => { loadResults(); setInterval(loadResults, 60000); });

async function loadResults() {
  try {
    const res = await fetch("/api/results");
    if (!res.ok) throw new Error("failed");
    const data = await res.json();
    rankedData = data.ranked || []; ff1Data = data.ff1 || [];
    renderAll();
    document.getElementById("last-updated").textContent = "Last updated: " + new Date().toLocaleTimeString();
  } catch {
    document.getElementById("results-container").innerHTML = `<div class="card"><p style="color:var(--red)">Could not load results. Check Upstash env vars in Netlify.</p></div>`;
  }
}

function renderAll() {
  document.getElementById("count-ranked").textContent = rankedData.length;
  document.getElementById("count-ff1").textContent    = ff1Data.length;
  document.getElementById("count-total").textContent  = rankedData.length + ff1Data.length;
  document.getElementById("results-container").innerHTML = [
    renderPriorityComparison(),
    renderSurveyBlocks("Ranked Member Results", RANKED_SECTIONS, rankedData, false),
    renderSurveyBlocks("Firefighter I Results", FF1_SECTIONS, ff1Data, true),
  ].join("");
}

// ── Priority Top-3 Comparison ─────────────────────────────────────────────────
function top3Count(responses, item) {
  return responses.filter(r => Array.isArray(r.priorities) && r.priorities.includes(item)).length;
}
function top3RankCount(responses, item, rank) {
  return responses.filter(r => Array.isArray(r.priorities) && r.priorities[rank] === item).length;
}

function renderPriorityComparison() {
  const rN = rankedData.filter(r => Array.isArray(r.priorities) && r.priorities.length === 3).length;
  const fN = ff1Data.filter(r => Array.isArray(r.priorities) && r.priorities.length === 3).length;

  // Sort by combined top-3 inclusion
  const sorted = [...PRIORITY_ITEMS].sort((a, b) => {
    const aTotal = top3Count(rankedData, a) + top3Count(ff1Data, a);
    const bTotal = top3Count(rankedData, b) + top3Count(ff1Data, b);
    return bTotal - aTotal;
  });

  const rows = sorted.map(item => {
    const rCount = top3Count(rankedData, item);
    const fCount = top3Count(ff1Data, item);
    const rPct = rN > 0 ? Math.round((rCount / rN) * 100) : 0;
    const fPct = fN > 0 ? Math.round((fCount / fN) * 100) : 0;
    // Rank breakdown for ranked
    const r1 = top3RankCount(rankedData, item, 0);
    const r2 = top3RankCount(rankedData, item, 1);
    const r3 = top3RankCount(rankedData, item, 2);
    const f1 = top3RankCount(ff1Data, item, 0);
    const f2 = top3RankCount(ff1Data, item, 1);
    const f3 = top3RankCount(ff1Data, item, 2);
    const rankBreakdownR = rCount > 0 ? `<span style="font-size:11px;color:rgba(255,255,255,0.6);margin-left:8px">#1:${r1} #2:${r2} #3:${r3}</span>` : "";
    const rankBreakdownF = fCount > 0 ? `<span style="font-size:11px;color:rgba(255,255,255,0.6);margin-left:8px">#1:${f1} #2:${f2} #3:${f3}</span>` : "";

    return `
      <div class="priority-row">
        <div class="priority-name">${item}</div>
        <div class="priority-bar-row">
          <span class="priority-bar-label ranked-label">Ranked</span>
          <div class="priority-bar-track"><div class="priority-bar-fill bar-fill-navy" style="width:${rPct}%"></div></div>
          <span class="priority-pct ranked-pct">${rCount > 0 ? `${rPct}%${rankBreakdownR}` : "—"}</span>
        </div>
        <div class="priority-bar-row">
          <span class="priority-bar-label ff1-label">FF I</span>
          <div class="priority-bar-track"><div class="priority-bar-fill bar-fill-teal" style="width:${fPct}%"></div></div>
          <span class="priority-pct ff1-pct">${fCount > 0 ? `${fPct}%${rankBreakdownF}` : "—"}</span>
        </div>
      </div>`;
  }).join("");

  return `
    <div class="comparison-block">
      <div class="comparison-title">Top 3 Priority Comparison — Ranked vs. FF I</div>
      <div class="comparison-legend">
        <div class="legend-item"><div class="legend-dot legend-dot-navy"></div>Ranked Members (n=${rN})</div>
        <div class="legend-item"><div class="legend-dot legend-dot-teal"></div>Firefighter Is (n=${fN})</div>
      </div>
      <div style="font-size:12px;color:var(--light);font-style:italic;margin-bottom:18px">
        % who included each issue in their top 3. Sorted by combined selection. Shows rank breakdown (#1, #2, #3) per issue.
      </div>
      ${rows}
    </div>`;
}

// ── Survey Blocks ─────────────────────────────────────────────────────────────
function renderSurveyBlocks(header, sections, responses, isFF1) {
  const color = isFF1 ? "var(--teal)" : "var(--navy)";
  const fillCls = isFF1 ? "bar-fill-teal" : "bar-fill-navy";
  const textCls = isFF1 ? "ff1-response" : "";
  const blocks = sections.map(sec => {
    const content = sec.isText
      ? sec.groups.map(g => renderTextGroup(g, responses, textCls)).join("")
      : sec.groups.map(g => renderBarGroup(g, responses, responses.length, fillCls)).join("");
    return `<div class="results-block"><div class="block-title" style="color:${color}">${sec.title}</div>${content}</div>`;
  }).join("");
  return `<div style="margin-bottom:4px">
    <div style="background:${color};color:#fff;padding:10px 18px;font-size:13px;font-weight:800;border-radius:10px 10px 0 0;margin-bottom:2px">
      ${header}<span style="font-weight:400;opacity:0.65;font-size:12px"> — ${responses.length} response${responses.length!==1?"s":""}</span>
    </div></div>${blocks}`;
}

function renderBarGroup(g, responses, n, fillCls) {
  const counts = countField(g.field, responses);
  const base = g.isMulti ? respondentCount(g.field, responses) : n;
  const multiNote = g.isMulti ? `<span class="multi-note"> — select all that apply, % of ${base} respondents</span>` : "";
  const bars = counts.length === 0 ? `<p class="no-data">No responses yet</p>`
    : counts.map(([lbl, count]) => { const p = base > 0 ? Math.round((count/base)*100) : 0;
      return `<div class="result-row"><div class="result-row-top"><span class="result-row-option">${lbl}</span><span class="result-row-count">${count} <span class="pct">(${p}%)</span></span></div><div class="bar-bg"><div class="bar-fill ${fillCls}" style="width:${p}%"></div></div></div>`;
    }).join("");
  return `<div class="result-group"><div class="result-label">${g.label}${multiNote}</div>${bars}</div>`;
}

function renderTextGroup(g, responses, extraCls) {
  const texts = responses.filter(r => r[g.field]).map(r => r[g.field]);
  return `<div class="result-group"><div class="result-label">${g.label} <span style="font-weight:400;color:var(--light);font-size:11px">(${texts.length})</span></div>
    ${texts.length === 0 ? `<p class="no-data">No responses yet</p>` : texts.map(t => `<div class="text-response ${extraCls}">${escHtml(t)}</div>`).join("")}
  </div>`;
}

function countField(field, responses) {
  const map = {};
  responses.forEach(r => { const v = r[field]; if (!v) return; if (Array.isArray(v)) v.forEach(i => { map[i] = (map[i]||0)+1; }); else map[v] = (map[v]||0)+1; });
  return Object.entries(map).sort((a,b) => b[1]-a[1]);
}
function respondentCount(field, responses) { return responses.filter(r => { const v = r[field]; return Array.isArray(v) ? v.length > 0 : !!v; }).length; }
function escHtml(s) { return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
