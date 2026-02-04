// main_code.js

let section = 0, question = 0, mode = "start",
    autoScrollTimer = null, scrollDirection = 1;

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

function playEffect(img, audio) {
    if (audio) new Audio(audio).play().catch(() => {});
    if (img) {
        const i = document.createElement('img');
        i.src = img;
        i.className = 'popup-img';
        document.body.appendChild(i);
        setTimeout(() => i.remove(), 3000);
    }
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
        <p>${SITE.intro.message}</p>
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
    screen.innerHTML = `<h1>${q.text}</h1><div class="buttons"></div>`;
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

    playEffect(SITE.finalYesImage, SITE.finalYesAudio);

    const box = document.getElementById('scrollBox');
    let pause = false;

    box.addEventListener('touchstart', () => pause = true);
    box.addEventListener('touchend', () => pause = false);

    clearInterval(autoScrollTimer);

    // ⏳ wait 3 sec → force auto scroll
    setTimeout(() => {
        box.scrollTop = 1; // force activation
        autoScrollTimer = setInterval(() => {
            if (!pause) {
                if (
                    scrollDirection === 1 &&
                    box.scrollTop + box.clientHeight < box.scrollHeight
                ) {
                    box.scrollTop += 1;
                }
            }
        }, 40);
    }, 3000);
}

/* ✅ FIXED COUNTDOWN FLOW */
function startCountdown() {
    let count = 5;
    screen.innerHTML = `<h1>Get ready! 💥</h1><p style="font-size:2rem">${count}</p>`;

    const p = screen.querySelector('p');

    const countdownInterval = setInterval(() => {
        count--;

        if (count >= 0) {
            p.textContent = count;
        }

        if (count === 0) {
            clearInterval(countdownInterval);

            // 🔥 IMMEDIATE transition
            openSecret();
            showAmazingBurst();
        }
    }, 1000);
}

function showAmazingBurst() {
    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.top = 0;
    flash.style.left = 0;
    flash.style.width = '100%';
    flash.style.height = '100%';
    flash.style.background = 'white';
    flash.style.opacity = '0.8';
    flash.style.zIndex = '200';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 150);

    const emojis = ['💖', '✨', '🔥', '🌟'];
    for (let i = 0; i < 60; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        p.style.left = '50%';
        p.style.top = '50%';
        document.body.appendChild(p);

        const angle = Math.random() * 2 * Math.PI;
        const dist = 80 + Math.random() * 320;
        const x = dist * Math.cos(angle);
        const y = dist * Math.sin(angle);
        const rot = Math.random() * 720;

        setTimeout(() => {
            p.style.transform =
                `translate(${x}px,${y}px) rotate(${rot}deg) scale(1.6)`;
            p.style.opacity = 0;
        }, 30);

        setTimeout(() => p.remove(), 1500);
    }
}

function openSecret() {
    save();
    mode = "secret";
    render();
}

function renderSecret() {
    screen.innerHTML = `<h1>💖 Secret</h1><p>Just for you 😘</p>`;
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

render();