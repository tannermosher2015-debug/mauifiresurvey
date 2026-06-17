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
  subtitle: "Tap to select your top 3 priorities — in order. Your #1 first, then #2, then #3. Your results will be compared side by side with ranked member responses.",
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
    title: "Your Background",
    subtitle: "A few quick questions to help us understand where you're at in your career.",
    questions: [
      { id: "yearsOnDept", type: "pill", required: true, text: "How long have you been with MFD?", options: ["Under 1 year","1–2 years","2–4 years","4+ years"] },
      { id: "apparatus", type: "pill", required: true, text: "What is your primary apparatus/station assignment?", options: ["Engine","Ladder","Tanker","Hazmat","Rescue","Other"] },
      { id: "hasTAd", type: "pill", required: true, text: "Have you ever Temporarily Assigned (TA'd) to Firefighter III — the driver position?", options: ["Yes","No","Not yet — but I would be willing to"] }
    ]
  },
  {
    title: "The R4R Policy & You",
    subtitle: "R4R (Rank-for-Rank Recall) is when a ranked member works overtime to fill a vacancy left by another ranked member on leave.",
    questions: [
      { id: "r4rAwareness", type: "pill", required: true, text: "How familiar are you with the Rank-for-Rank Recall (R4R) program?", options: ["I understand it well","I've heard of it but don't fully understand it","I'm not familiar with it"] },
      { id: "everRelocated", type: "pill", required: true, text: "Has the R4R policy ever resulted in you being relocated or moved to a different station?", options: ["Yes, more than once","Yes, once","No","I'm not sure if R4R caused it"] },
      { id: "relocationTime", type: "pill", required: true, text: "If you were relocated due to R4R, did it happen at the start of the back-12 shift — around 7:30pm?", options: ["Yes — around 7:30pm","No — it was a different time","Not applicable — I've never been relocated"] }
    ]
  },
  {
    title: "Safety, Burden & Hardship",
    subtitle: "Your honest perspective on how R4R affects your safety and daily workload.",
    questions: [
      { id: "crewSafety", type: "pill", required: true, text: "Do you feel safe having a ranked member work on your truck who comes from a different station or apparatus type?", options: ["Yes, completely safe","Mostly safe","It depends on the person","Not always comfortable","No — crew familiarity matters for safety"] },
      { id: "back12Burden", type: "pill", required: true, text: "Do you feel that ranked members who take only back-12 R4R shifts (7:30pm–7:30am) place a heavier operational burden on firefighter-level personnel during those hours?", options: ["Yes, definitely","Yes, sometimes","No","Unsure"] },
      { id: "easierShifts", type: "pill", required: true, text: "Do you feel that ranked personnel sometimes choose back-12 R4R shifts specifically because they are easier, and that this creates a heavier workload for firefighter-level personnel?", options: ["Yes, definitely","Yes, sometimes","No","Unsure"] },
      { id: "negativeImpact", type: "pill", required: true, text: "Have you been negatively impacted by the current R4R policy — through relocation, working with an unfamiliar crew, added workload, or any other hardship?", options: ["Yes, significantly","Yes, somewhat","No","Unsure"] }
    ]
  },
  {
    title: "The Double Standard",
    subtitle: "The department allows FF Is to TA on almost any apparatus. We want your take on how that compares to how ranked members are treated under R4R.",
    questions: [
      { id: "awareTAPolicy", type: "pill", required: true, text: "As a FF I, are you aware that you can TA to Firefighter III (driver position) on almost any apparatus — even ones you don't regularly work on?", options: ["Yes","No","I've heard something about it but I'm not sure"] },
      { id: "taExperience", type: "pill", required: true, text: "Have you TA'd to FF III on an apparatus that is not your permanent assignment?", options: ["Yes","No","Not yet — but I'd be willing to","Not applicable"] },
      { id: "taDoubleStandard", type: "pill", required: true, text: "If the department considers FF Is qualified enough to operate as FF III on different apparatus, should ranked members have the same flexibility to work R4R on different apparatus types?", options: ["Yes — if it's good enough for FF Is, it should apply to ranked members too","No — they are different situations","Unsure"] }
    ]
  },
  {
    title: "Fairness & Your Voice",
    subtitle: "Tell us how you see the policy and whether you feel heard as a junior member.",
    questions: [
      { id: "policyFairness", type: "pill", required: true, text: "Do you feel the current R4R policy takes into account the impact it has on firefighter-level personnel?", options: ["Yes, fully","Somewhat","Not really","No, not at all"] },
      { id: "voiceWeight", type: "pill", required: true, text: "Do you feel like your voice as a junior member carries the same weight when it comes to policy concerns like R4R?", options: ["Yes","Somewhat","No — junior members have less of a voice","I haven't tried to speak up"] },
      { id: "comfortSpeakingUp", type: "pill", required: true, text: "Do you feel comfortable raising concerns about the R4R policy as a junior member?", options: ["Yes — I feel comfortable","Somewhat — it depends on the situation","No — it's harder as a junior member"] }
    ]
  },
  PRIORITY_SECTION,
  {
    title: "Your Voice",
    subtitle: "Optional — but your perspective as a FF I is exactly what's missing from this conversation.",
    questions: [
      { id: "ff1Change", type: "text", required: false, text: "What specific change to the R4R policy would make the biggest difference for you as a FF I?", placeholder: "Be as specific as you'd like..." },
      { id: "ff1Comments", type: "text", required: false, text: "Anything else about R4R or your daily work experience you'd like the union to know?", placeholder: "Any additional feedback..." }
    ]
  }
];

let currentSection = 0;
const answers = { surveyType: "ff1" };
document.addEventListener("DOMContentLoaded", () => { renderSection(); });

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
  if (q.type === "pill") input = `<div class="pill-group">${q.options.map(o => `<button class="pill-btn" data-val="${esc(o)}" onclick="selectPill('${q.id}',this)">${esc(o)}</button>`).join("")}</div>`;
  else if (q.type === "multi") input = `<div class="multi-hint">Select all that apply</div><div class="pill-group">${q.options.map(o => `<button class="multi-btn" data-val="${esc(o)}" onclick="toggleMulti('${q.id}',this)"><span class="checkbox-box"></span>${esc(o)}</button>`).join("")}</div>`;
  else if (q.type === "scale") input = `<div class="scale-group">${q.options.map(o => `<button class="scale-btn" data-val="${esc(o)}" onclick="selectScale('${q.id}',this)">${esc(o)}</button>`).join("")}</div><div class="scale-selected-label"></div>`;
  else if (q.type === "text") input = `<textarea rows="4" placeholder="${esc(q.placeholder||"")}" oninput="saveText('${q.id}',this)"></textarea>`;
  else if (q.type === "top3") input = renderTop3(q);
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
    else if (q.type === "scale") card.querySelectorAll(".scale-btn").forEach(b => { if (b.dataset.val === saved) { b.classList.add("selected"); card.querySelector(".scale-selected-label").textContent = "✓ " + saved; } });
    else if (q.type === "text") { const ta = card.querySelector("textarea"); if (ta) ta.value = saved; }
    else if (q.type === "top3") updateTop3Display(q.id, q);
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
  if (existingPos !== -1) answers[qid] = current.filter(i => i !== itemName);
  else if (current.length < 3) answers[qid] = [...current, itemName];
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
    if (rank !== -1) { btn.classList.add("selected"); btn.classList.remove("dimmed"); rankSpan.textContent = rank + 1; rankSpan.classList.remove("hidden"); }
    else { btn.classList.remove("selected"); rankSpan.classList.add("hidden"); if (selected.length >= 3) btn.classList.add("dimmed"); else btn.classList.remove("dimmed"); }
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
  btn.disabled = !ok; btn.style.background = ok ? "var(--teal)" : "#CBD5E1";
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
    if (!res.ok) throw new Error("failed");
    window.location.href = "thanks-ff1.html";
  } catch { btn.textContent = "Submit Survey"; btn.disabled = false; alert("There was an error submitting. Please try again."); }
}
