// main_code.js

/* ================================
   GLOBAL CONFIG
================================ */
const POPUP_DURATION = 6000; // ⏱️ change this to control popup + YES lock (ms)
const POPUP_FADE_TIME = 800;

/* ================================
   STATE
================================ */
let yesLocked = false;
let currentIndex = 0;

/* ================================
   POPUP HANDLER
================================ */
function showPopup(img, audio) {
    if (audio) {
        new Audio(audio).play().catch(() => {});
    }

    if (!img) return;

    const popup = document.createElement('img');
    popup.src = img;
    popup.className = 'popup-img';

    document.body.appendChild(popup);

    // Fade out near the end
    setTimeout(() => {
        popup.classList.add('fade-out');
    }, POPUP_DURATION - POPUP_FADE_TIME);

    // Remove popup after duration
    setTimeout(() => {
        popup.remove();
    }, POPUP_DURATION);
}

/* ================================
   YES BUTTON HANDLER
================================ */
function onYes(question) {
    if (yesLocked) return;

    yesLocked = true;

    // Disable YES button immediately
    const yesBtn = document.querySelector('.yes-btn');
    if (yesBtn) yesBtn.disabled = true;

    // Show popup immediately
    showPopup(question.yesImage, question.yesAudio);

    // Move to next question AFTER popup duration
    setTimeout(() => {
        yesLocked = false;
        if (yesBtn) yesBtn.disabled = false;

        goToNextQuestion();
    }, POPUP_DURATION);
}

/* ================================
   QUESTION FLOW
================================ */
function goToNextQuestion() {
    currentIndex++;

    if (currentIndex >= SITE.questions.length) {
        showFinalScreen();
        return;
    }

    renderQuestion(SITE.questions[currentIndex]);
}

/* ================================
   RENDER QUESTION
================================ */
function renderQuestion(q) {
    document.getElementById('question-text').innerText = q.text;

    const yesBtn = document.querySelector('.yes-btn');
    const noBtn  = document.querySelector('.no-btn');

    yesBtn.onclick = () => onYes(q);
    noBtn.onclick  = () => onNo(q);
}

/* ================================
   NO HANDLER (UNCHANGED)
================================ */
function onNo(question) {
    if (question.noAudio) {
        new Audio(question.noAudio).play().catch(() => {});
    }
    if (question.noImage) {
        showPopup(question.noImage, null);
    }
}

/* ================================
   INITIAL LOAD (CAUTION SCREEN SAFE)
================================ */
window.onload = () => {
    renderQuestion(SITE.questions[0]);
};