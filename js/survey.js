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

const PRIORITY_SECTION = {
  title: "What Matters Most",
  subtitle: "Tap to select your top 3 priorities — in order. Your #1 first, then #2, then #3. Results will be compared side by side with Firefighter I responses.",
  questions: [
    {
      id: "priorities", type: "top3", required: true,
      text: "Choose your top 3 contract and policy priorities — in order.",
      items: PRIORITY_ITEMS
    }
  ]
};

const SECTIONS = [
  {
    title: "Your Assignment",
    subtitle: "Helps us break down feedback by apparatus type and rank.",
    questions: [
      { id: "rank", type: "pill", required: true, text: "What is your current rank?", options: ["Firefighter II", "Firefighter III", "Fire Captain"] },
      { id: "apparatus", type: "pill", required: true, text: "What is your primary apparatus/company assignment?", options: ["Engine", "Ladder", "Tanker", "Hazmat", "Rescue", "BC Aid", "Other"] },
      { id: "workedEngine", type: "pill", required: true, text: "At any point in your MFD career, have you been regularly assigned to or worked on an engine company?", options: ["Yes", "No"] }
    ]
  },
  {
    title: "Your R4R Experience",
    subtitle: "Covering this fiscal year — July 2025 through June 2026.",
    questions: [
      { id: "reached288", type: "pill", required: true, text: "This fiscal year, were you able to reach the 288-hour R4R guarantee?", options: ["Yes","No — I wanted more hours but couldn't access them","No — I wasn't trying to reach 288","I wasn't aware of the 288-hour guarantee","Newly promoted"] },
      { id: "hoursWorked", type: "pill", required: true, text: "Roughly how many R4R hours have you worked this fiscal year?", options: ["0 hours","1–50 hrs","51–100 hrs","101–150 hrs","151–287 hrs","288+ hrs"] },
      { id: "shortfallReason", type: "multi", required: true, text: "If you fell short of 288 hours, what were the reasons?", options: ["No vacancies available in my apparatus class","Restricted to my apparatus class — limited or no counterparts","BC approval issues","The notification window was too tight","Personal choice — I didn't want more hours","I didn't fall short","Newly promoted"] }
    ]
  },
  {
    title: "The Apparatus Restriction",
    subtitle: "The department policy limits R4R to the same apparatus type only.",
    questions: [
      { id: "awareRestriction", type: "pill", required: true, text: "Were you aware that the department's R4R policy limits you to working recall only within your same apparatus type — Engine to Engine, Ladder to Ladder, Hazmat to Hazmat, etc.?", options: ["Yes, I was aware","No, I wasn't aware"] },
      { id: "restrictionImpact", type: "scale", required: true, text: "How much has the apparatus-class restriction limited your access to R4R opportunities?", options: ["No impact","Slight","Moderate","Significant","Blocked all R4R"] },
      { id: "shiftsMissed", type: "pill", required: true, text: "If you're assigned to Hazmat, Rescue, Ladder, or BC Aid — how many R4R shifts do you estimate you missed this fiscal year due to the restriction?", options: ["Not applicable to my assignment","0 shifts missed","1–2 shifts missed","3–5 shifts missed","6+ shifts missed"] }
    ]
  },
  {
    title: "The Double Standard",
    subtitle: "The department allows TA across any apparatus. We want to know how members see the inconsistency.",
    questions: [
      { id: "awareTA", type: "pill", required: true, text: "Were you aware that under the current department policy, a Firefighter I can Relocate and/or Temporarily Assign (TA) to Firefighter III on almost any apparatus type, and/or any district, regardless of their permanent assignment?", options: ["Yes","No","Unsure"] },
      { id: "taConsistency", type: "pill", required: true, text: "If a member is considered qualified enough to TA to a higher rank on any apparatus, should that same cross-apparatus logic apply when working R4R at their own rank?", options: ["Yes — the logic should be consistent","No — R4R and TA are separate programs","Unsure"] }
    ]
  },
  {
    title: "Proposed Changes",
    subtitle: "Tell us where you stand on what we're pushing for.",
    questions: [
      { id: "supportChange", type: "scale", required: true, text: "Would you support allowing R4R across all non-cert apparatus types (Engine, Ladder, Tanker), while keeping the restriction only for cert-required companies like Hazmat and Rescue?", options: ["Strongly oppose","Oppose","Neutral","Support","Strongly support"] },
      { id: "priority", type: "scale", required: true, text: "How would you prioritize fixing the apparatus-class restriction in the R4R policy?", options: ["Not a priority","Low","Medium","High","Fix it now"] }
    ]
  },
  PRIORITY_SECTION,
  {
    title: "Your Voice",
    subtitle: "Optional, but this is where the most useful detail comes from.",
    questions: [
      { id: "biggestChange", type: "text", required: false, text: "What specific change to the R4R policy would make the biggest difference for you?", placeholder: "Be as specific as you'd like..." },
      { id: "otherComments", type: "text", required: false, text: "Anything else about the R4R program you'd like the union to know?", placeholder: "Any additional feedback..." }
    ]
  }
];

let currentSection = 0;
const answers = { surveyType: "ranked" };
const DONE_KEY = "r4r_done_ranked";
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem(DONE_KEY) === "1") { showAlready(); return; }
  renderSection();
});

function showAlready() {
  document.getElementById("survey-body").innerHTML =
    `<div class="card" style="margin:18px auto;max-width:520px;text-align:center">
      <h2>You've already submitted</h2>
      <p>This device has already completed the ranked survey. Each member should submit once — thank you for your response.</p>
      <a href="results.html" class="btn btn-primary" style="display:inline-block;margin-top:8px">View live results →</a>
      <p style="margin-top:12px"><a href="index.html" style="color:var(--navy);text-decoration:underline">← Back to portal</a></p>
    </div>`;
  const nav = document.querySelector(".survey-nav"); if (nav) nav.style.display = "none";
}

function findQuestion(qid) {
  for (const sec of SECTIONS) { const q = sec.questions.find(q => q.id === qid); if (q) return q; }
  return null;
}

function renderSection() {
  const sec = SECTIONS[currentSection];
  document.getElementById("progress-bar").innerHTML = SECTIONS.map((_, i) => `<div class="progress-seg ${i <= currentSection ? "active" : ""}"></div>`).join("");
  document.getElementById("section-counter").textContent = `${currentSection + 1} of ${SECTIONS.length}`;
  document.getElementById("section-title").textContent = sec.title;
  document.getElementById("section-subtitle").textContent = sec.subtitle;
  document.getElementById("questions-container").innerHTML = sec.questions.map(renderQuestion).join("");
  restoreAnswers(sec);
  document.getElementById("back-btn").style.display = currentSection > 0 ? "block" : "none";
  document.getElementById("next-btn").textContent = currentSection === SECTIONS.length - 1 ? "Submit Survey" : "Next Section →";
  updateNextBtn();
  document.getElementById("survey-body").scrollTop = 0;
}

function renderQuestion(q) {
  const req = q.required && q.type !== "text" ? '<span class="q-required"> *</span>' : "";
  let input = "";
  if (q.type === "pill") {
    input = `<div class="pill-group">${q.options.map(o => `<button class="pill-btn" data-val="${esc(o)}" onclick="selectPill('${q.id}',this)">${esc(o)}</button>`).join("")}</div>`;
  } else if (q.type === "multi") {
    input = `<div class="multi-hint">Select all that apply</div><div class="pill-group">${q.options.map(o => `<button class="multi-btn" data-val="${esc(o)}" onclick="toggleMulti('${q.id}',this)"><span class="checkbox-box"></span>${esc(o)}</button>`).join("")}</div>`;
  } else if (q.type === "scale") {
    input = `<div class="scale-group">${q.options.map(o => `<button class="scale-btn" data-val="${esc(o)}" onclick="selectScale('${q.id}',this)">${esc(o)}</button>`).join("")}</div><div class="scale-selected-label"></div>`;
  } else if (q.type === "text") {
    input = `<textarea rows="4" placeholder="${esc(q.placeholder||"")}" oninput="saveText('${q.id}',this)"></textarea>`;
  } else if (q.type === "top3") {
    input = renderTop3(q);
  }
  return `<div class="q-card" data-qid="${q.id}"><p class="q-text">${q.text}${req}</p>${input}</div>`;
}

function renderTop3(q) {
  return `
    <div class="top3-hint">Tap to select in order — #1 first, then #2, then #3</div>
    <div class="top3-status" id="top3-status-${q.id}">Select your #1 priority</div>
    <div class="top3-grid">
      ${q.items.map((item, idx) => `
        <button class="top3-btn" data-idx="${idx}" onclick="selectTop3('${q.id}',${idx},this)">
          <span class="top3-rank hidden"></span>${esc(item)}
        </button>
      `).join("")}
    </div>`;
}

function restoreAnswers(sec) {
  sec.questions.forEach(q => {
    const saved = answers[q.id];
    if (saved === undefined || saved === null) return;
    const card = document.querySelector(`[data-qid="${q.id}"]`);
    if (!card) return;
    if (q.type === "pill") card.querySelectorAll(".pill-btn").forEach(b => { if (b.dataset.val === saved) b.classList.add("selected"); });
    else if (q.type === "multi") { const vals = Array.isArray(saved) ? saved : []; card.querySelectorAll(".multi-btn").forEach(b => { if (vals.includes(b.dataset.val)) { b.classList.add("selected"); b.querySelector(".checkbox-box").textContent = "✓"; } }); }
    else if (q.type === "scale") { card.querySelectorAll(".scale-btn").forEach(b => { if (b.dataset.val === saved) { b.classList.add("selected"); card.querySelector(".scale-selected-label").textContent = "✓ " + saved; } }); }
    else if (q.type === "text") { const ta = card.querySelector("textarea"); if (ta) ta.value = saved; }
    else if (q.type === "top3") { updateTop3Display(q.id, q); }
  });
}

function esc(s) { return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }

function selectPill(qid, btn) { btn.closest(`[data-qid="${qid}"]`).querySelectorAll(".pill-btn").forEach(b => b.classList.remove("selected")); btn.classList.add("selected"); answers[qid] = btn.dataset.val; updateNextBtn(); }
function toggleMulti(qid, btn) { btn.classList.toggle("selected"); btn.querySelector(".checkbox-box").textContent = btn.classList.contains("selected") ? "✓" : ""; answers[qid] = Array.from(btn.closest(`[data-qid="${qid}"]`).querySelectorAll(".multi-btn.selected")).map(b => b.dataset.val); updateNextBtn(); }
function selectScale(qid, btn) { const card = btn.closest(`[data-qid="${qid}"]`); card.querySelectorAll(".scale-btn").forEach(b => b.classList.remove("selected")); btn.classList.add("selected"); answers[qid] = btn.dataset.val; card.querySelector(".scale-selected-label").textContent = "✓ " + btn.dataset.val; updateNextBtn(); }
function saveText(qid, ta) { answers[qid] = ta.value; }

function selectTop3(qid, idx, btn) {
  const q = findQuestion(qid);
  if (!q) return;
  if (!Array.isArray(answers[qid])) answers[qid] = [];
  const itemName = q.items[idx];
  const current = answers[qid];
  const existingPos = current.indexOf(itemName);
  if (existingPos !== -1) {
    answers[qid] = current.filter(i => i !== itemName);
  } else if (current.length < 3) {
    answers[qid] = [...current, itemName];
  }
  updateTop3Display(qid, q);
  updateNextBtn();
}

function updateTop3Display(qid, q) {
  const selected = Array.isArray(answers[qid]) ? answers[qid] : [];
  const card = document.querySelector(`[data-qid="${qid}"]`);
  if (!card) return;
  card.querySelectorAll(".top3-btn").forEach((btn, idx) => {
    const itemName = q.items[idx];
    const rank = selected.indexOf(itemName);
    const rankSpan = btn.querySelector(".top3-rank");
    if (rank !== -1) {
      btn.classList.add("selected"); btn.classList.remove("dimmed");
      rankSpan.textContent = rank + 1; rankSpan.classList.remove("hidden");
    } else {
      btn.classList.remove("selected"); rankSpan.classList.add("hidden");
      if (selected.length >= 3) btn.classList.add("dimmed");
      else btn.classList.remove("dimmed");
    }
  });
  const statusEl = document.getElementById(`top3-status-${qid}`);
  if (statusEl) {
    if (selected.length === 0) { statusEl.textContent = "Select your #1 priority"; statusEl.classList.remove("done"); }
    else if (selected.length === 1) { statusEl.textContent = "Now select your #2 priority"; statusEl.classList.remove("done"); }
    else if (selected.length === 2) { statusEl.textContent = "Now select your #3 priority"; statusEl.classList.remove("done"); }
    else { statusEl.textContent = "✓ Top 3 selected — tap any to change"; statusEl.classList.add("done"); }
  }
}

function sectionComplete() {
  return SECTIONS[currentSection].questions.filter(q => q.required && q.type !== "text").every(q => {
    const v = answers[q.id];
    if (q.type === "multi") return Array.isArray(v) && v.length > 0;
    if (q.type === "top3") return Array.isArray(v) && v.length === 3;
    return !!v;
  });
}
function updateNextBtn() {
  const btn = document.getElementById("next-btn"); const ok = sectionComplete();
  btn.disabled = !ok; btn.style.background = ok ? "var(--navy)" : "#CBD5E1";
  btn.style.color = ok ? "#fff" : "#94A3B8"; btn.style.cursor = ok ? "pointer" : "default";
}
function goBack() { if (currentSection > 0) { currentSection--; renderSection(); } }
async function goNext() {
  if (!sectionComplete()) return;
  if (currentSection < SECTIONS.length - 1) { currentSection++; renderSection(); }
  else await submitSurvey();
}
async function submitSurvey() {
  const btn = document.getElementById("next-btn");
  btn.textContent = "Submitting..."; btn.disabled = true;
  try {
    const res = await fetch("/api/submit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(answers) });
    if (res.status === 429) { btn.textContent = "Submit Survey"; btn.disabled = false; alert("Too many submissions from this network right now. Please try again later, or from a different connection."); return; }
    if (!res.ok) throw new Error("failed");
    localStorage.setItem(DONE_KEY, "1");
    window.location.href = "thanks.html";
  } catch { btn.textContent = "Submit Survey"; btn.disabled = false; alert("There was an error submitting. Please try again."); }
}
