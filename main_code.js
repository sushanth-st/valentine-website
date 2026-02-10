// main_code.js

/* ================= CONFIG ================= */
const POPUP_DURATION = 6000; // popup + YES disable duration (ms)
const POPUP_FADE_TIME = 800;

/* ================= STATE ================= */
let section = 0;
let question = 0;
let mode = "start";
let yesLocked = false;

const history = [];
const screen = document.getElementById("screen");
const backBtn = document.getElementById("backBtn");

/* ================= BUTTONS ================= */
const yesBtn = document.createElement("button");
yesBtn.id = "yesBtn";
yesBtn.className = "primary";
yesBtn.textContent = "YES 💖";

const noBtn = document.createElement("button");
noBtn.id = "noBtn";
noBtn.className = "secondary";
noBtn.textContent = "NO 😅";

/* ================= BASIC HELPERS ================= */
function toggleDark() {
  document.body.classList.toggle("dark");
}

function setBG() {
  if (!document.body.classList.contains("dark")) {
    document.body.style.background =
      SITE.sections[section]?.bg || "#fff";
  }
}

/* ================= CAUTION POPUP ================= */
function showCaution() {
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.background = "rgba(0,0,0,0.8)";
  overlay.style.zIndex = "200";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";

  overlay.innerHTML = `
    <div class="card">
      <h1>⚠️ Please Read</h1>
      <p style="white-space:pre-line">${SITE.caution.message}</p>
      <button class="primary">I Understand 💖</button>
    </div>
  `;

  overlay.querySelector("button").onclick = () => overlay.remove();
  document.body.appendChild(overlay);
}

/* ================= POPUP EFFECT ================= */
function playEffect(img, audio, done) {
  if (audio) new Audio(audio).play().catch(() => {});

  let popup = null;

  if (img) {
    popup = document.createElement("img");
    popup.src = img;
    popup.className = "popup-img";
    document.body.appendChild(popup);
  }

  // lock YES immediately
  yesLocked = true;
  yesBtn.disabled = true;

  // fade near the end
  setTimeout(() => {
    if (popup) popup.classList.add("fade-out");
  }, Math.max(POPUP_DURATION - POPUP_FADE_TIME, 0));

  // remove popup + unlock YES
  setTimeout(() => {
    if (popup) popup.remove();
    yesLocked = false;
    yesBtn.disabled = false;
    done && done();
  }, POPUP_DURATION);
}

/* ================= NAV ================= */
function save() {
  history.push({ section, question, mode });
  backBtn.classList.remove("hidden");
}

backBtn.onclick = () => {
  if (!history.length) return;
  const h = history.pop();
  section = h.section;
  question = h.question;
  mode = h.mode;
  render();
  if (!history.length) backBtn.classList.add("hidden");
};

/* ================= RENDER ================= */
function render() {
  setBG();
  if (mode === "start") renderStart();
  else if (mode === "intro") renderIntro();
  else if (mode === "question") renderQuestion();
  else if (mode === "password") renderPassword();
  else if (mode === "final") renderFinal();
}

function renderStart() {
  screen.innerHTML = `
    <h1>${SITE.intro.title}</h1>
    <p style="white-space:pre-line">${SITE.intro.message}</p>
    <button class="primary" onclick="begin()">Start 💖</button>
  `;
}

function begin() {
  save();
  mode = "intro";
  render();
}

function renderIntro() {
  screen.innerHTML = `
    <h1>${SITE.sections[section].title}</h1>
    <p>${SITE.sections[section].intro}</p>
    <button class="primary" onclick="startQuestions()">Continue</button>
  `;
}

function startQuestions() {
  save();
  question = 0;
  mode = "question";
  render();
}

function renderQuestion() {
  const q = SITE.sections[section].questions[question];
  screen.innerHTML = `
    <h1 style="white-space:pre-line">${q.text}</h1>
    <div class="buttons"></div>
  `;
  const box = screen.querySelector(".buttons");
  box.append(yesBtn, noBtn);
  bindButtons();
}

function renderPassword() {
  const s = SITE.sections[section];
  screen.innerHTML = `
    <h1>🔐 Enter Password</h1>
    <p>${s.hint}</p>
    <input id="pw" style="width:100%;padding:12px;border-radius:10px">
    <p id="err" style="color:#ff4d6d"></p>
    <button class="primary" onclick="checkPw()">Unlock</button>
  `;
}

function renderFinal() {
  screen.innerHTML = `
    <div class="final-scroll-container">
      <h1>${SITE.finalMessage}</h1>
      <div class="final-scroll">
        ${SITE.finalImages.map(i => `<img src="${i}">`).join("")}
      </div>
    </div>
  `;
}

/* ================= BUTTON LOGIC ================= */
function bindButtons() {
  yesBtn.onclick = () => {
    if (yesLocked) return;

    const q = SITE.sections[section].questions[question];

    playEffect(q.yesImage, q.yesAudio, () => {
      save();
      question++;

      if (question < SITE.sections[section].questions.length) {
        render();
        return;
      }

      section++;
      question = 0;

      if (section >= SITE.sections.length) {
        mode = "final";
        render();
        return;
      }

      SITE.sections[section].passcode
        ? renderPassword()
        : renderIntro();
    });
  };

  noBtn.onclick = () => {
    const box = noBtn.parentElement;
    if (box) {
      noBtn.style.left =
        Math.random() * (box.clientWidth - noBtn.offsetWidth) + "px";
      noBtn.style.top =
        Math.random() * (box.clientHeight - noBtn.offsetHeight) + "px";
      noBtn.style.transform = "none";
    }

    const s = SITE.sections[section];
    if (s.noAudio) new Audio(s.noAudio).play().catch(() => {});
    toast(
      SITE.noClickMessages[
        Math.floor(Math.random() * SITE.noClickMessages.length)
      ]
    );
  };
}

function checkPw() {
  const input = document.getElementById("pw").value.trim().toLowerCase();
  const pass = SITE.sections[section].passcode?.toLowerCase();
  if (input !== pass) {
    document.getElementById("err").textContent =
      SITE.sections[section].wrongMessage;
    return;
  }
  save();
  question = 0;
  mode = "question";
  render();
}

function toast(m) {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = m;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2000);
}

/* ================= INIT ================= */
showCaution();
render();