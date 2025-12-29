// --- Math Game Script with Sounds, Disco, Confetti, Mobile support, Correct Answer Reveal, Addition ≤ 100 ---

// Elements
const questionEl = document.getElementById("question");
const answerEl = document.getElementById("answer");
const startBtn = document.getElementById("start");
const timerEl = document.getElementById("timer");
const streakEl = document.getElementById("streak");
const progressBar = document.getElementById("progress-bar");
const confettiCanvas = document.getElementById("confetti-canvas");
const ctx = confettiCanvas.getContext("2d");

// Sounds
const correctSound = new Audio("https://freesound.org/data/previews/522/522563_8399127-lq.mp3");
const wrongSound = new Audio("https://freesound.org/data/previews/331/331912_3248244-lq.mp3");
const highscoreSound = new Audio("https://freesound.org/data/previews/341/341695_5121236-lq.mp3");

// Mobile detection
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
if (isMobile) {
  answerEl.setAttribute("inputmode", "numeric");
  answerEl.setAttribute("pattern", "[0-9]*");
}

let currentAnswer;
let timeLeft;
let totalTime;
let timer;
let streak = 0;
let highStreak = localStorage.getItem("highStreak") || 0;

// --- Start game ---
function startGame() {
  streak = 0;
  updateStreak();
  startBtn.disabled = true;
  answerEl.disabled = false;
  nextQuestion();
}

// --- Generate question ---
function nextQuestion() {
  const type = Math.floor(Math.random() * 3);
  let a, b;

  if (type === 0) {
    // Addition: sum ≤ 100
    a = Math.floor(Math.random() * 91) + 10;       // 10–100
    let maxB = Math.min(90, 100 - a);             // ensure sum ≤ 100
    b = Math.floor(Math.random() * (maxB + 1));
    currentAnswer = a + b;
    questionEl.textContent = `${a} + ${b}`;
  } else if (type === 1) {
    // Subtraction
    a = Math.floor(Math.random() * 90) + 10;
    b = Math.floor(Math.random() * 90) + 10;
    if (b > a) [a, b] = [b, a];
    currentAnswer = a - b;
    questionEl.textContent = `${a} - ${b}`;
  } else {
    // Multiplication
    a = Math.floor(Math.random() * 12) + 1;
    b = Math.floor(Math.random() * 12) + 1;
    currentAnswer = a * b;
    questionEl.textContent = `${a} × ${b}`;
  }

  // --- Time calculation ---
  let baseTime = 10 - Math.floor(streak / 5);
  if (baseTime < 4) baseTime = 4;

  if (type === 2) {
    timeLeft = Math.max(3, 8 - Math.floor(streak / 5));
  } else {
    const difficultyBonus = Math.round((a + b) / 20);
    timeLeft = Math.max(3, baseTime + difficultyBonus);
  }

  totalTime = timeLeft;
  updateTimer();
  progressBar.style.width = "100%";
  progressBar.style.backgroundColor = "#00ff99";
  clearInterval(timer);
  timer = setInterval(countdown, 1000);
  answerEl.value = "";
  answerEl.focus();
}

// --- Countdown ---
function countdown() {
  timeLeft--;
  updateTimer();
  progressBar.style.width = `${(timeLeft / totalTime) * 100}%`;

  if (timeLeft / totalTime < 0.3) progressBar.style.backgroundColor = "#ff0000";
  else if (timeLeft / totalTime < 0.6) progressBar.style.backgroundColor = "#ffff00";
  else progressBar.style.backgroundColor = "#00ff99";

  if (timeLeft <= 0) wrongAnswer(true);
}

// --- Check answer ---
answerEl.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    const userAnswer = Number(answerEl.value);
    if (userAnswer === currentAnswer) correctAnswer();
    else wrongAnswer();
  }
});

// --- Correct answer ---
function correctAnswer() {
  clearInterval(timer);
  streak++;

  correctSound.currentTime = 0;
  correctSound.play().catch(() => {});

  let isNewHigh = false;
  if (streak > highStreak) {
    highStreak = streak;
    localStorage.setItem("highStreak", highStreak);
    isNewHigh = true;
  }

  updateStreak();
  animateCorrect();

  if (isNewHigh) {
    discoCelebrate();
    confetti();
  }

  nextQuestion();
}

// --- Wrong answer ---
function wrongAnswer(timeout = false) {
  clearInterval(timer);
  streak = 0;
  updateStreak();
  animateWrong();

  wrongSound.currentTime = 0;
  wrongSound.play().catch(() => {});

  questionEl.textContent = `❌ Wrong! Correct: ${currentAnswer}`;
  if (timeout) questionEl.textContent += " (Time's up!)";

  answerEl.disabled = true;
  startBtn.disabled = false;
}

// --- Update displays ---
function updateTimer() {
  timerEl.textContent = `Time: ${timeLeft}s`;
}
function updateStreak() {
  streakEl.textContent = `Current streak: ${streak} | High streak: ${highStreak}`;
}

// --- Animations ---
function animateCorrect() {
  questionEl.style.color = "#00ff99";
  questionEl.style.transform = "scale(1.3)";
  setTimeout(() => {
    questionEl.style.color = "white";
    questionEl.style.transform = "scale(1)";
  }, 300);
}
function animateWrong() {
  questionEl.style.color = "#ff0000";
  questionEl.style.transform = "rotate(-10deg)";
  setTimeout(() => {
    questionEl.style.color = "white";
    questionEl.style.transform = "rotate(0)";
  }, 400);
}

// --- Disco for high score ---
function discoCelebrate() {
  highscoreSound.currentTime = 0;
  highscoreSound.play().catch(() => {});
  questionEl.classList.add("disco");
  setTimeout(() => questionEl.classList.remove("disco"), 3000);
}

// --- Confetti effect ---
function confetti() {
  const w = confettiCanvas.width = window.innerWidth;
  const h = confettiCanvas.height = window.innerHeight;
  const pieces = [];
  for(let i=0; i<150; i++){
    pieces.push({
      x: Math.random()*w,
      y: Math.random()*h - h,
      r: Math.random()*6+4,
      d: Math.random()*h,
      color: `hsl(${Math.random()*360}, 100%, 50%)`,
      tilt: Math.random()*10-10
    });
  }

  let anim;
  function draw() {
    ctx.clearRect(0,0,w,h);
    for(let p of pieces){
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.moveTo(p.x + p.tilt, p.y);
      ctx.lineTo(p.x + p.tilt + p.r/2, p.y + p.r);
      ctx.lineTo(p.x + p.tilt - p.r/2, p.y + p.r);
      ctx.closePath();
      ctx.fill();
      p.y += 2 + Math.random()*3;
      if(p.y > h) p.y = -p.r;
    }
    anim = requestAnimationFrame(draw);
  }
  draw();
  setTimeout(() => {
    cancelAnimationFrame(anim);
    ctx.clearRect(0,0,w,h);
  }, 3000);
}

// --- Start button ---
startBtn.addEventListener("click", startGame);

