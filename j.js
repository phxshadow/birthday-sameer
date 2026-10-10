// ==========================================================================
// 1. AUDIO & MUSIC PLAYER ENGINE
// ==========================================================================
let isAudioPlaying = false;

function toggleAudioPlayback() {
    const bgAudio = document.getElementById("bg-music");
    const musicIcon = document.getElementById("music-icon");
    const spindleLeft = document.getElementById("spindle-left");
    const spindleRight = document.getElementById("spindle-right");
    const statusMsg = document.getElementById("music-modal-status");

    if (!bgAudio) return;

    if (isAudioPlaying) {
        bgAudio.pause();
        isAudioPlaying = false;
        if (musicIcon) musicIcon.innerText = "🔇";
        if (spindleLeft) spindleLeft.classList.add("paused");
        if (spindleRight) spindleRight.classList.add("paused");
        if (statusMsg) statusMsg.innerText = "Music Paused ⏸️";
    } else {
        bgAudio.play().then(() => {
            isAudioPlaying = true;
            if (musicIcon) musicIcon.innerText = "🎵";
            if (spindleLeft) spindleLeft.classList.remove("paused");
            if (spindleRight) spindleRight.classList.remove("paused");
            if (statusMsg) statusMsg.innerText = "Now Playing Your Favorite Song! 🎶";
        }).catch(err => {
            console.log("Audio playback waiting for user interaction:", err);
        });
    }
}

// ==========================================================================
// 2. PASSWORD ACCESS ROUTER ("Khul Ja Sim Sim")
// ==========================================================================
function checkPasskey() {
    const passwordInput = document.getElementById("entry-passkey");
    const errorElement = document.getElementById("lock-error-msg");

    if (!passwordInput) return;

    const enteredValue = passwordInput.value.trim();

    // Passkey check
    if (enteredValue === "sameer") {
        if (errorElement) errorElement.innerText = "";
        navigateToPanel("screen-proposal"); 

        // Auto-play music on successful unlock
        toggleAudioPlayback();
    } else {
        if (errorElement) {
            errorElement.innerText = "Incorrect passkey! Try again. ❌";
        }
    }
}

// Attach Enter key listener safely
document.addEventListener("DOMContentLoaded", function () {
    const inputEl = document.getElementById("entry-passkey");
    if (inputEl) {
        inputEl.addEventListener("keypress", function (event) {
            if (event.key === "Enter") {
                checkPasskey();
            }
        });
    }

    // Set initial spindle paused state until audio plays
    const spindleLeft = document.getElementById("spindle-left");
    const spindleRight = document.getElementById("spindle-right");
    if (spindleLeft) spindleLeft.classList.add("paused");
    if (spindleRight) spindleRight.classList.add("paused");
});

// ==========================================================================
// 3. STAGE MOVEMENT UTILITY
// ==========================================================================
function navigateToPanel(panelId) {
    const allPanels = document.querySelectorAll(".view-panel");
    allPanels.forEach(panel => {
        panel.classList.remove("active-panel");
    });

    const targetPanel = document.getElementById(panelId);
    if (targetPanel) {
        targetPanel.classList.add("active-panel");
    }

    if (panelId === 'screen-cake') {
        startMicDetection();
    }
}

// ==========================================================================
// 4. DIALOG OVERLAY ACTIVATION ENGINE
// ==========================================================================
function launchModalWindow(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add("active-modal");
        if (modalId === 'modal-scratch') {
            initScratchCard();
        } else if (modalId === 'modal-quiz') {
            initQuiz();
        }
    }
}

function closeActiveModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove("active-modal");
    }
}

// ==========================================================================
// 5. PHOTO LIGHTBOX & CAPTION ENGINE
// ==========================================================================
function openPhotoViewer(imageSrc, captionText) {
    const lightboxImg = document.getElementById("lightbox-img");
    const lightboxCaption = document.getElementById("lightbox-caption");
    
    if (lightboxImg) lightboxImg.src = imageSrc;
    if (lightboxCaption) lightboxCaption.innerText = captionText;

    launchModalWindow("modal-photo-viewer");
}

// ==========================================================================
// 6. PRECISION CANDLE BLOWOUT ENGINE
// ==========================================================================
let audioContext;
let analyser;
let micStream;

function blowOutCandle() {
    const flame = document.getElementById("candle-flame");
    const instruction = document.getElementById("cake-instruction");
    const wishMsg = document.getElementById("wish-message");
    const nextBtn = document.getElementById("cake-next-btn");

    if (flame && !flame.classList.contains("extinguished")) {
        flame.classList.add("extinguished");

        if (instruction) instruction.innerText = "Yay! Happy Birthday! 🎉";
        if (wishMsg) wishMsg.style.display = "block";
        if (nextBtn) nextBtn.style.display = "inline-block";

        // Trigger confetti burst
        if (typeof confetti === "function") {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }

        // Clean up mic stream if active
        if (micStream) {
            micStream.getTracks().forEach(track => track.stop());
        }
    }
}

async function startMicDetection() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStream = stream;
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);
        
        analyser.fftSize = 256;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        function checkVolume() {
            const flame = document.getElementById("candle-flame");
            if (flame && flame.classList.contains("extinguished")) return;

            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
            }
            let average = sum / dataArray.length;

            if (average > 75) {
                blowOutCandle();
            } else {
                requestAnimationFrame(checkVolume);
            }
        }

        checkVolume();
    } catch (err) {
        console.log("Microphone access denied or not supported. Tap to blow out is active.");
    }
}

// ==========================================================================
// 7. VIRTUAL SCRATCH CARD ENGINE
// ==========================================================================
let scratchInitialized = false;

function initScratchCard() {
    if (scratchInitialized) return;
    
    const canvas = document.getElementById("scratch-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    
    // Cover layer styling
    ctx.fillStyle = "#b2bec3";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = "bold 16px Arial";
    ctx.fillStyle = "#2d3436";
    ctx.textAlign = "center";
    ctx.fillText("Scratch Here! ✨", canvas.width / 2, canvas.height / 2 + 5);

    let isDrawing = false;

    function scratch(e) {
        if (!isDrawing) return;
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
        const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fill();
    }

    canvas.addEventListener("mousedown", () => isDrawing = true);
    canvas.addEventListener("mouseup", () => isDrawing = false);
    canvas.addEventListener("mousemove", scratch);

    canvas.addEventListener("touchstart", () => isDrawing = true);
    canvas.addEventListener("touchend", () => isDrawing = false);
    canvas.addEventListener("touchmove", scratch);

    scratchInitialized = true;
}

// ==========================================================================
// 8. TRIVIA QUIZ ENGINE
// ==========================================================================
const quizData = [
    {
        question: "What is my absolute favorite thing to do when we gather?",
        options: [ "Study silently", "Run a marathon", "Argue over nothing"],
        correct: 2
    },
    {
        question: "Who is the most dramatic person in this relationship?",
        options: ["me", "Definitely me", "100% me", "all of these"],
        correct: 3
    },
    {
        question: "am i irritating ? ",
        options: ["naah ","dispossible","yess"],
        correct: 2
    },
    {
        question: "rate my gift ",
        options: ["99 ","99.99","100"],
        correct: 2
    },
    

];

let currentQuestion = 0;

function initQuiz() {
    currentQuestion = 0;
    renderQuizQuestion();
}

function renderQuizQuestion() {
    const qText = document.getElementById("quiz-question");
    const optionsContainer = document.getElementById("quiz-options");
    const feedback = document.getElementById("quiz-feedback");

    if (!qText || !optionsContainer) return;

    feedback.innerText = "";
    optionsContainer.innerHTML = "";

    if (currentQuestion >= quizData.length) {
        qText.innerText = "Quiz Completed! You know us best! 🎉";
        return;
    }

    const data = quizData[currentQuestion];
    qText.innerText = data.question;

    data.options.forEach((opt, idx) => {
        const btn = document.createElement("button");
        btn.className = "quiz-option-btn";
        btn.innerText = opt;
        btn.onclick = () => selectQuizAnswer(idx, data.correct);
        optionsContainer.appendChild(btn);
    });
}

function selectQuizAnswer(selectedIndex, correctIndex) {
    const feedback = document.getElementById("quiz-feedback");
    
    if (selectedIndex === correctIndex) {
        feedback.style.color = "#27ae60";
        feedback.innerText = "Correct! 🎉";
        setTimeout(() => {
            currentQuestion++;
            renderQuizQuestion();
        }, 1200);
    } else {
        feedback.style.color = "#e74c3c";
        feedback.innerText = "Wrong answer! Try again 😜";
    }
}