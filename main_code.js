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

function toggleDark() {
    document.body.classList.toggle('dark');
}

function setBG() {
    if (!document.body.classList.contains('dark')) {
        document.body.style.background = SITE.sections[section]?.bg || "#fff";
    }
}

/* ✅ FIXED: instant popup, 6s duration, NON-BLOCKING */
function playEffect(img, audio) {
    if (audio) new Audio(audio).play().catch(() => {});
    if (!img) return;

    const i = document.createElement('img');
    i.src = img;
    i.className = 'popup-img';
    i.style.opacity = '1';
    i.style.zIndex = '9999';

    document.body.appendChild(i);

    setTimeout(() => i.remove(), 6000);
}

function moveNoButton() {
    const box = noBtn.parentElement;
    if (!box) return;
    const maxX = box.clientWidth - noBtn.offsetWidth;
    const maxY = box.clientHeight - noBtn.offsetHeight;
    noBtn.style.left = Math.random() * maxX + "px";
    noBtn.style.top = Math.random() * maxY + "px";
    noBtn.style.transform = "none";
}

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

function startCountdown() {
    let count = 5;
    screen.innerHTML = `<h1>Get ready! 💥</h1><p style="font-size:2rem">${count}</p>`;
    const p = screen.querySelector('p');

    const countdownInterval = setInterval(() => {
        count--;
        p.textContent = count;

        if (count === 0) {
            clearInterval(countdownInterval);
            openSecret();
            showAmazingBurst();
            startFallingEmojis();
        }
    }, 1000);
}

function showAmazingBurst() {
    for (let wave = 0; wave < 3; wave++) {
        setTimeout(() => {
            for (let i = 0; i < 150; i++) {
                const e = document.createElement('div');
                e.className = 'particle';
                e.textContent = ['💖','🔥','✨','🌹','💋'][Math.floor(Math.random()*5)];
                e.style.left = '50%';
                e.style.top = '50%';
                document.body.appendChild(e);

                const angle = Math.random() * Math.PI * 2;
                const dist = 150 + Math.random() * 400;
                const x = Math.cos(angle) * dist;
                const y = Math.sin(angle) * dist;
                const rot = Math.random() * 720;

                setTimeout(() => {
                    e.style.transform =
                        `translate(${x}px,${y}px) rotate(${rot}deg) scale(1.8)`;
                    e.style.opacity = 0;
                }, 30);

                setTimeout(() => e.remove(), 1800);
            }
        }, wave * 180);
    }
}

function startFallingEmojis() {
    clearInterval(fallingInterval);
    const emojis = ['💖','🔥','💋','🌹','✨','😍','😘'];

    fallingInterval = setInterval(() => {
        const f = document.createElement('div');
        f.className = 'confetti';
        f.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        f.style.left = Math.random() * 100 + '%';
        f.style.top = '-30px';
        f.style.fontSize = (16 + Math.random() * 26) + 'px';
        const dur = 3 + Math.random() * 3;
        f.style.animationDuration = dur + 's';
        document.body.appendChild(f);

        setTimeout(() => f.remove(), dur * 1000);
    }, 120);
}

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

function bindButtons() {
    yesBtn.onclick = () => {
        const q = SITE.sections[section].questions[question];

        playEffect(q.yesImage, q.yesAudio);

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

function toast(m) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = m;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2000);
}

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

showCaution();
render();