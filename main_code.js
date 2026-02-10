/* ================= CONFIG ================= */
const POPUP_DURATION = 6000;
const POPUP_FADE_TIME = 800;

/* ================= STATE ================= */
let section = 0;
let question = 0;
let mode = "start";
let yesLocked = false;
let autoScrollTimer = null;
let countdownTimer = null;
let fallingInterval = null;

/* ================= DOM ================= */
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

/* ================= HELPERS ================= */
function toggleDark() {
  document.body.classList.toggle("dark");
}

function setBG() {
  if (!document.body.classList.contains("dark")) {
    document.body.style.background =
      SITE.sections[section]?.bg || "#fff";
  }
}

/* ================= CAUTION ================= */
function showCaution() {
  const o = document.createElement("div");
  o.style.cssText =
    "position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:200;display:flex;align-items:center;justify-content:center";
  o.innerHTML = `
    <div class="card">
      <h1>⚠️ Please Read</h1>
      <p style="white-space:pre-line">${SITE.caution.message}</p>
      <button class="primary">I Understand 💖</button>
    </div>
  `;
  o.querySelector("button").onclick = () => o.remove();
  document.body.appendChild(o);
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

  yesLocked = true;
  yesBtn.disabled = true;

  setTimeout(() => {
    popup && popup.classList.add("fade-out");
  }, Math.max(POPUP_DURATION - POPUP_FADE_TIME, 0));

  setTimeout(() => {
    popup && popup.remove();
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
  else if (mode === "secret") renderSecret();
}

/* ================= SCREENS ================= */
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
    <div class="final-scroll-container" id="scrollBox">
      <h1>${SITE.finalMessage}</h1>
      <div class="final-scroll">
        ${SITE.finalImages.map(i => `<img src="${i}">`).join("")}
      </div>
      <p style="margin-top:16px">Liked the surprise so far? 💖</p>
      <button class="primary" onclick="startSecret()">View Secret Message 💌</button>
    </div>
  `;
  startAutoScroll();
}

/* ================= FINAL SECRET ================= */
function startSecret() {
  save();
  mode = "secret";
  render();
}

function renderSecret() {
  let count = 5;

  screen.innerHTML = `
    <div style="
      display:flex;
      flex-direction:column;
      align-items:center;
      justify-content:center;
      height:60vh;
      gap:12px;
    ">
      <div style="font-size:64px;animation:pulse 1s infinite">💖</div>
      <div id="countNum" style="font-size:48px;font-weight:800">${count}</div>
      <p style="opacity:.7">Something special is coming…</p>
    </div>
  `;

  countdownTimer = setInterval(() => {
    count--;
    const el = document.getElementById("countNum");

    if (count > 0) {
      el.textContent = count;
      el.style.transform = "scale(1.3)";
      setTimeout(() => (el.style.transform = "scale(1)"), 200);
    } else {
      clearInterval(countdownTimer);
      showBurst();
      startFalling();
      setTimeout(showSecretPage, 1400);
    }
  }, 1000);
}

function showSecretPage() {
  const s = SITE.secretPage;
  screen.innerHTML = `
    <img src="${s.image}" style="width:100%;border-radius:18px;margin-bottom:18px">
    <button class="primary" onclick="openSecret()">${s.buttonText}</button>
  `;
}

function openSecret() {
  window.location.href = SITE.secretPage.redirectUrl;
}

/* ================= BURST EFFECT ================= */
function showBurst() {
  const emojis = ["💖","🔥","✨","🌹","💋"];
  const points = [
    { x: 20, y: 20 },
    { x: 80, y: 20 },
    { x: 50, y: 50 },
    { x: 20, y: 80 },
    { x: 80, y: 80 }
  ];

  points.forEach((p, idx) => {
    setTimeout(() => {
      for (let i = 0; i < 80; i++) {
        const e = document.createElement("div");
        e.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        e.style.position = "fixed";
        e.style.left = p.x + "%";
        e.style.top = p.y + "%";
        e.style.fontSize = 20 + Math.random() * 18 + "px";
        e.style.zIndex = 9999;
        e.style.transition = "transform 1.2s ease-out, opacity 1.2s";
        document.body.appendChild(e);

        const angle = Math.random() * Math.PI * 2;
        const dist = 200 + Math.random() * 400;
        const x = Math.cos(angle) * dist;
        const y = Math.sin(angle) * dist;

        requestAnimationFrame(() => {
          e.style.transform = `translate(${x}px, ${y}px) scale(1.6)`;
          e.style.opacity = "0";
        });

        setTimeout(() => e.remove(), 1400);
      }
    }, idx * 150);
  });
}

/* ================= FALLING ================= */
function startFalling() {
  clearInterval(fallingInterval);
  const emojis = ["💖","🔥","✨","🌹","💋"];

  fallingInterval = setInterval(() => {
    const f = document.createElement("div");
    f.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    f.style.position = "fixed";
    f.style.left = Math.random() * 100 + "%";
    f.style.top = "-30px";
    f.style.fontSize = "22px";
    f.style.zIndex = 9999;
    document.body.appendChild(f);

    const dur = 3 + Math.random() * 3;
    f.animate([{ transform: "translateY(0)" }, { transform: "translateY(110vh)" }], {
      duration: dur * 1000,
      easing: "linear"
    });

    setTimeout(() => f.remove(), dur * 1000);
  }, 120);
}

/* ================= AUTO SCROLL ================= */
function startAutoScroll() {
  const box = document.getElementById("scrollBox");
  if (!box) return;
  autoScrollTimer = setInterval(() => {
    box.scrollTop += 1;
    if (box.scrollTop + box.clientHeight >= box.scrollHeight) {
      clearInterval(autoScrollTimer);
    }
  }, 40);
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
    noBtn.style.left =
      Math.random() * (box.clientWidth - noBtn.offsetWidth) + "px";
    noBtn.style.top =
      Math.random() * (box.clientHeight - noBtn.offsetHeight) + "px";
    noBtn.style.transform = "none";

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