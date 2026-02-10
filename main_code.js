const POPUP_DURATION = 6000;
const POPUP_FADE_TIME = 800;

let section = 0;
let question = 0;
let mode = "start";
let yesLocked = false;
let popupTimer = null;
let fadeTimer = null;

const history = [];
const screen = document.getElementById("screen");
const backBtn = document.getElementById("backBtn");

const yesBtn = document.createElement("button");
yesBtn.id = "yesBtn";
yesBtn.className = "primary";
yesBtn.textContent = "YES 💖";

const noBtn = document.createElement("button");
noBtn.id = "noBtn";
noBtn.className = "secondary";
noBtn.textContent = "NO 😅";

function setBG() {
  document.body.style.background =
    SITE.sections[section]?.bg || "#fff";
}

function showCaution() {
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.background = "rgba(0,0,0,0.85)";
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

function playEffect(img, audio, done) {
  if (yesLocked) return;

  yesLocked = true;
  yesBtn.disabled = true;

  if (audio) new Audio(audio).play().catch(()=>{});

  let popup = null;
  if (img) {
    popup = document.createElement("img");
    popup.src = img;
    popup.className = "popup-img";
    document.body.appendChild(popup);
  }

  fadeTimer = setTimeout(() => {
    popup && popup.classList.add("fade-out");
  }, POPUP_DURATION - POPUP_FADE_TIME);

  popupTimer = setTimeout(() => {
    popup && popup.remove();
    yesLocked = false;
    yesBtn.disabled = false;
    done && done();
  }, POPUP_DURATION);
}

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
      <h1 style="white-space:pre-line">${SITE.finalMessage}</h1>
      ${SITE.finalImages.map(i=>`<img src="${i}" style="width:100%;margin-top:12px;border-radius:14px">`).join("")}
    </div>
  `;
}

function bindButtons() {
  yesBtn.onclick = () => {
    if (yesLocked) return;
    const q = SITE.sections[section].questions[question];
    playEffect(q.yesImage, q.yesAudio, () => {
      save();
      question++;
      if (question < SITE.sections[section].questions.length) return render();
      section++;
      question = 0;
      if (section >= SITE.sections.length) {
        mode = "final";
        return render();
      }
      SITE.sections[section].passcode ? renderPassword() : renderIntro();
    });
  };

  noBtn.onclick = () => {
    const s = SITE.sections[section];
    s.noAudio && new Audio(s.noAudio).play().catch(()=>{});
  };
}

function checkPw() {
  const input = document.getElementById("pw").value.trim().toLowerCase();
  const pass = SITE.sections[section].passcode.toLowerCase();
  if (input !== pass) {
    document.getElementById("err").textContent =
      SITE.sections[section].wrongMessage;
    return;
  }
  save();
  mode = "question";
  question = 0;
  render();
}

/* INIT */
render();
setTimeout(showCaution, 300);