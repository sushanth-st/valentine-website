// main_code.js

/* ===================== CONFIG ===================== */
const POPUP_DURATION = 10000; // 👈 change popup + YES disable time here

/* ===================== STATE ===================== */
let section = 0, question = 0, mode = "start",
    autoScrollTimer = null, scrollDirection = 1,
    fallingInterval = null;

const history = [],
    screen = document.getElementById('screen'),
    backBtn = document.getElementById('backBtn');

const yesBtn = document.createElement('button');
yesBtn.id = 'yesBtn';
yesBtn.className = 'primary';
yesBtn.textContent = 'YES 💖';

const noBtn = document.createElement('button');
noBtn.id = 'noBtn';
noBtn.className = 'secondary';
noBtn.textContent = 'NO 😅';

/* ===================== UTIL ===================== */
function toggleDark() {
    document.body.classList.toggle('dark');
}

function setBG() {
    if (!document.body.classList.contains('dark')) {
        document.body.style.background =
            SITE.sections[section]?.bg || "#fff";
    }
}

/* ===================== POPUP EFFECT ===================== */
function showPopup(img, audio, duration = POPUP_DURATION) {
    if (audio) new Audio(audio).play().catch(() => {});
    if (!img) return;

    const i = document.createElement('img');
    i.src = img;
    i.className = 'popup-img';
    document.body.appendChild(i);

    setTimeout(() => i.remove(), duration);
}

/* ===================== NO BUTTON ===================== */
function moveNoButton() {
    const box = noBtn.parentElement;
    if (!box) return;

    const maxX = box.clientWidth - noBtn.offsetWidth;
    const maxY = box.clientHeight - noBtn.offsetHeight;

    noBtn.style.left = Math.random() * maxX + "px";
    noBtn.style.top = Math.random() * maxY + "px";
    noBtn.style.transform = "none";
}

/* ===================== HISTORY ===================== */
function save() {
    history.push({ section, question, mode });
    backBtn.classList.remove('hidden');
}

backBtn.onclick = () => {
    if (!history.length) return;
    const h = history.pop();
    section = h.section;
    question = h.question;
    mode = h.mode;
    render();
    if (!history.length) backBtn.classList.add('hidden');
};

/* ===================== RENDER ===================== */
function render() {
    setBG();
    if (mode === "start") renderStart();
    else if (mode === "intro") renderIntro();
    else if (mode === "question") renderQuestion();
    else if (mode === "password") renderPassword();
    else if (mode === "final") renderFinal();
    else if (mode === "secret") renderSecret();
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
    const box = screen.querySelector('.buttons');
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

/* ===================== FINAL ===================== */
function renderFinal() {
    screen.innerHTML = `
        <div class="final-scroll-container" id="scrollBox">
            <h1>${SITE.finalMessage}</h1>
            <div class="final-scroll">
                ${SITE.finalImages.map(i => `<img src="${i}">`).join("")}
            </div>
            <p style="margin-top:16px">Liked the surprise so far? 💖</p>
            <button class="primary" onclick="startCountdown()">View Secret Message 💌</button>
        </div>
    `;

    const box = document.getElementById('scrollBox');
    let pause = false;

    box.addEventListener('touchstart', () => pause = true);
    box.addEventListener('touchend', () => pause = false);

    clearInterval(autoScrollTimer);

    setTimeout(() => {
        box.scrollTop = 1;
        autoScrollTimer = setInterval(() => {
            if (!pause && box.scrollTop + box.clientHeight < box.scrollHeight) {
                box.scrollTop += 1;
            }
        }, 40);
    }, 3000);
}

/* ===================== SECRET ===================== */
function openSecret() {
    save();
    mode = "secret";
    render();
}

function renderSecret() {
    clearInterval(fallingInterval);
    const s = SITE.secretPage;

    screen.innerHTML = `
        <h1>💖 Secret</h1>
        <img src="${s.image}" style="width:100%;border-radius:16px;margin:16px 0">
        <p>Just for you 😘</p>
        <button class="primary" onclick="window.location.href='${s.redirectUrl}'">
            ${s.buttonText}
        </button>
    `;
}

/* ===================== BUTTON LOGIC ===================== */
function bindButtons() {
    yesBtn.onclick = () => {
        if (yesBtn.disabled) return;

        const q = SITE.sections[section].questions[question];
        save();

        // 🔒 Disable YES for popup duration
        yesBtn.disabled = true;
        yesBtn.style.opacity = "0.6";
        yesBtn.style.pointerEvents = "none";

        // 🎉 Show popup immediately
        showPopup(q.yesImage, q.yesAudio);

        // 🔓 Re-enable after popup duration
        setTimeout(() => {
            yesBtn.disabled = false;
            yesBtn.style.opacity = "";
            yesBtn.style.pointerEvents = "";
        }, POPUP_DURATION);

        // ➡️ Move forward instantly
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

        SITE.sections[section].passcode ? renderPassword() : renderIntro();
    };

    noBtn.onclick = () => {
        moveNoButton();
        const s = SITE.sections[section];
        if (s.noAudio) new Audio(s.noAudio).play().catch(() => {});
        toast(
            SITE.noClickMessages[
                Math.floor(Math.random() * SITE.noClickMessages.length)
            ]
        );
    };
}

/* ===================== PASSWORD ===================== */
function checkPw() {
    const input = document.getElementById('pw').value.trim().toLowerCase();
    const pass = SITE.sections[section].passcode?.toLowerCase();
    if (input !== pass) {
        document.getElementById('err').textContent =
            SITE.sections[section].wrongMessage;
        return;
    }
    save();
    question = 0;
    mode = "question";
    render();
}

/* ===================== TOAST ===================== */
function toast(m) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = m;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2000);
}

/* ===================== CAUTION ===================== */
function showCaution() {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.background = 'rgba(0,0,0,0.8)';
    overlay.style.zIndex = '200';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';

    overlay.innerHTML = `
        <div class="card">
            <h1>⚠️ Please Read</h1>
            <p style="white-space:pre-line">${SITE.caution.message}</p>
            <button class="primary">I Understand 💖</button>
        </div>
    `;

    overlay.querySelector('button').onclick = () => overlay.remove();
    document.body.appendChild(overlay);
}

/* ===================== INIT ===================== */
showCaution();
render();