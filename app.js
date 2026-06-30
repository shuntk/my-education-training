const QUESTIONS_PER_RUN = 10;
const STORAGE_KEY = "math10-progress-v1";
const levels = [
  {
    id: "one-no-carry",
    title: "1けた",
    short: "1けた",
    description: "答えが10まで。指や数のまとまりで考えやすい入門。",
    digits: 1,
    carry: false,
  },
  {
    id: "one-carry",
    title: "1けた くり上がり",
    short: "1けた+",
    description: "10のまとまりを作る練習。1・2年生の大事な土台。",
    digits: 1,
    carry: true,
  },
  {
    id: "two-no-carry",
    title: "2けた",
    short: "2けた",
    description: "十の位と一の位を分けて見る練習。",
    digits: 2,
    carry: false,
  },
  {
    id: "two-carry",
    title: "2けた くり上がり",
    short: "2けた+",
    description: "筆算につながる、くり上がり・くり下がり。",
    digits: 2,
    carry: true,
  },
  {
    id: "three-no-carry",
    title: "3けた",
    short: "3けた",
    description: "位をそろえて、大きい数にも落ち着いて挑戦。",
    digits: 3,
    carry: false,
  },
  {
    id: "three-carry",
    title: "3けた くり上がり",
    short: "3けた+",
    description: "発展チャレンジ。ゆっくり正確に解ければ十分すごい。",
    digits: 3,
    carry: true,
  },
];

const state = {
  data: loadData(),
  mode: "mix",
  currentLevel: levels[0],
  currentQuestions: [],
  currentIndex: 0,
  answers: [],
  startedAt: 0,
  activeQuestionStartedAt: 0,
  elapsedMs: 0,
  timer: null,
  acceptingAnswer: false,
  sound: true,
};

const screens = {
  home: document.querySelector("#homeScreen"),
  quiz: document.querySelector("#quizScreen"),
  result: document.querySelector("#resultScreen"),
  ranking: document.querySelector("#rankingScreen"),
};

const els = {
  homeButton: document.querySelector("#homeButton"),
  soundButton: document.querySelector("#soundButton"),
  playerSelect: document.querySelector("#playerSelect"),
  addPlayerButton: document.querySelector("#addPlayerButton"),
  openRankingButton: document.querySelector("#openRankingButton"),
  levelGrid: document.querySelector("#levelGrid"),
  tabs: [...document.querySelectorAll(".tab")],
  quizLevelLabel: document.querySelector("#quizLevelLabel"),
  questionCounter: document.querySelector("#questionCounter"),
  timerDisplay: document.querySelector("#timerDisplay"),
  progressFill: document.querySelector("#progressFill"),
  problemText: document.querySelector("#problemText"),
  answerInput: document.querySelector("#answerInput"),
  submitAnswerButton: document.querySelector("#submitAnswerButton"),
  feedbackText: document.querySelector("#feedbackText"),
  keypad: document.querySelector("#keypad"),
  resultPlayer: document.querySelector("#resultPlayer"),
  resultTitle: document.querySelector("#resultTitle"),
  resultSummary: document.querySelector("#resultSummary"),
  retryButton: document.querySelector("#retryButton"),
  rankingButton: document.querySelector("#rankingButton"),
  reviewPanel: document.querySelector("#reviewPanel"),
  rankingLevelSelect: document.querySelector("#rankingLevelSelect"),
  rankingList: document.querySelector("#rankingList"),
  celebration: document.querySelector("#celebration"),
  playerDialog: document.querySelector("#playerDialog"),
  newPlayerName: document.querySelector("#newPlayerName"),
  savePlayerButton: document.querySelector("#savePlayerButton"),
};

init();

function init() {
  if (state.data.players.length === 0) {
    state.data.players.push({ id: createId(), name: "チャレンジャー" });
    state.data.currentPlayerId = state.data.players[0].id;
    saveData();
  }

  renderPlayers();
  renderLevels();
  renderRankingOptions();
  wireEvents();
  renderRanking();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
}

function wireEvents() {
  els.homeButton.addEventListener("click", () => showScreen("home"));
  els.soundButton.addEventListener("click", () => {
    state.sound = !state.sound;
    els.soundButton.style.opacity = state.sound ? "1" : "0.45";
  });
  els.addPlayerButton.addEventListener("click", () => {
    els.newPlayerName.value = "";
    if (typeof els.playerDialog.showModal === "function") {
      els.playerDialog.showModal();
      setTimeout(() => els.newPlayerName.focus(), 50);
    } else {
      const name = window.prompt("なまえを入力してね");
      addPlayerByName(name);
    }
  });
  els.openRankingButton.addEventListener("click", () => {
    renderRanking();
    showScreen("ranking");
  });
  els.savePlayerButton.addEventListener("click", addPlayer);
  els.playerSelect.addEventListener("change", () => {
    state.data.currentPlayerId = els.playerSelect.value;
    saveData();
    renderLevels();
    renderRanking();
  });
  els.tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      state.mode = tab.dataset.mode;
      els.tabs.forEach((item) => item.classList.toggle("active", item === tab));
      renderLevels();
    });
  });
  els.submitAnswerButton.addEventListener("click", submitAnswer);
  els.answerInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") submitAnswer();
  });
  els.retryButton.addEventListener("click", () => startQuiz(state.currentLevel.id));
  els.rankingButton.addEventListener("click", () => {
    renderRanking();
    showScreen("ranking");
  });
  els.rankingLevelSelect.addEventListener("change", renderRanking);
  renderKeypad();
}

function loadData() {
  try {
    const savedData = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return savedData || defaultData();
  } catch {
    return defaultData();
  }
}

function defaultData() {
  return { players: [], currentPlayerId: "", records: [] };
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
}

function currentPlayer() {
  return state.data.players.find((player) => player.id === state.data.currentPlayerId);
}

function renderPlayers() {
  els.playerSelect.innerHTML = "";
  state.data.players.forEach((player) => {
    const option = document.createElement("option");
    option.value = player.id;
    option.textContent = player.name;
    els.playerSelect.append(option);
  });
  els.playerSelect.value = state.data.currentPlayerId;
}

function addPlayer() {
  addPlayerByName(els.newPlayerName.value);
}

function addPlayerByName(rawName) {
  const name = String(rawName || "").trim();
  if (!name) return;
  const player = { id: createId(), name };
  state.data.players.push(player);
  state.data.currentPlayerId = player.id;
  saveData();
  renderPlayers();
  renderLevels();
  if (typeof els.playerDialog.close === "function" && els.playerDialog.open) {
    els.playerDialog.close();
  }
}

function renderLevels() {
  els.levelGrid.innerHTML = "";
  levels.forEach((level) => {
    const best = bestRecord(level.id, state.mode, state.data.currentPlayerId);
    const card = document.createElement("button");
    card.className = "level-card";
    card.type = "button";
    card.innerHTML = `
      <div>
        <strong>${level.title}</strong>
        <span>${level.description}</span>
      </div>
      <div class="level-meta">
        <span>${modeLabel(state.mode)}</span>
        <span>${best ? `${best.score}/10・${formatTime(best.seconds)}` : "まだ記録なし"}</span>
      </div>
    `;
    card.addEventListener("click", () => startQuiz(level.id));
    els.levelGrid.append(card);
  });
}

function renderRankingOptions() {
  els.rankingLevelSelect.innerHTML = "";
  levels.forEach((level) => {
    ["mix", "add", "sub"].forEach((mode) => {
      const option = document.createElement("option");
      option.value = `${level.id}:${mode}`;
      option.textContent = `${level.short}・${modeLabel(mode)}`;
      els.rankingLevelSelect.append(option);
    });
  });
}

function startQuiz(levelId) {
  const level = levels.find((item) => item.id === levelId);
  state.currentLevel = level;
  state.currentQuestions = makeQuestionSet(level, state.mode);
  state.currentIndex = 0;
  state.answers = [];
  state.elapsedMs = 0;
  state.activeQuestionStartedAt = 0;
  state.acceptingAnswer = false;
  clearInterval(state.timer);
  state.timer = setInterval(updateTimer, 250);
  els.quizLevelLabel.textContent = `${currentPlayer().name} / ${level.title} / ${modeLabel(state.mode)}`;
  showScreen("quiz");
  renderQuestion();
  updateTimer();
}

function makeQuestionSet(level, mode) {
  const questions = [];
  const usedKeys = new Set();
  for (let i = 0; i < 2000 && questions.length < QUESTIONS_PER_RUN; i += 1) {
    const question = makeQuestion(level, mode);
    const key = questionKey(question);
    if (usedKeys.has(key)) continue;
    usedKeys.add(key);
    questions.push(question);
  }

  while (questions.length < QUESTIONS_PER_RUN) {
    questions.push(makeQuestion(level, mode));
  }
  return questions;
}

function makeQuestion(level, mode) {
  const operation = mode === "mix" ? (Math.random() < 0.5 ? "add" : "sub") : mode;
  return operation === "add" ? makeAddition(level) : makeSubtraction(level);
}

function questionKey(question) {
  return `${question.a}${question.operation}${question.b}`;
}

function makeAddition(level) {
  for (let i = 0; i < 800; i += 1) {
    const a = randomNumber(level.digits);
    const b = randomNumber(level.digits);
    const hasCarry = additionHasCarry(a, b);
    const withinStarterRange = level.digits !== 1 || a + b <= 18;
    if (hasCarry === level.carry && withinStarterRange) {
      return { a, b, operation: "+", answer: a + b };
    }
  }
  return { a: 8, b: 7, operation: "+", answer: 15 };
}

function makeSubtraction(level) {
  for (let i = 0; i < 1000; i += 1) {
    let a = randomNumber(level.digits);
    let b = randomNumber(level.digits);
    if (b > a) [a, b] = [b, a];
    const hasBorrow = subtractionHasBorrow(a, b);
    const withinStarterRange = level.digits !== 1 || a <= 18;
    if (hasBorrow === level.carry && withinStarterRange && a !== b) {
      return { a, b, operation: "-", answer: a - b };
    }
  }
  return { a: 15, b: 8, operation: "-", answer: 7 };
}

function randomNumber(digits) {
  if (digits === 1) return rand(1, 9);
  const min = 10 ** (digits - 1);
  const max = 10 ** digits - 1;
  return rand(min, max);
}

function additionHasCarry(a, b) {
  while (a > 0 || b > 0) {
    if ((a % 10) + (b % 10) >= 10) return true;
    a = Math.floor(a / 10);
    b = Math.floor(b / 10);
  }
  return false;
}

function subtractionHasBorrow(a, b) {
  while (a > 0 || b > 0) {
    if (a % 10 < b % 10) return true;
    a = Math.floor(a / 10);
    b = Math.floor(b / 10);
  }
  return false;
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function renderQuestion() {
  const question = state.currentQuestions[state.currentIndex];
  els.problemText.textContent = `${question.a} ${question.operation} ${question.b}`;
  els.questionCounter.textContent = `${state.currentIndex + 1} / ${QUESTIONS_PER_RUN}`;
  els.progressFill.style.width = `${(state.currentIndex / QUESTIONS_PER_RUN) * 100}%`;
  els.feedbackText.textContent = "";
  els.answerInput.value = "";
  state.activeQuestionStartedAt = performance.now();
  state.acceptingAnswer = true;
  els.submitAnswerButton.disabled = false;
  setTimeout(() => els.answerInput.focus(), 30);
}

function submitAnswer() {
  if (!state.acceptingAnswer) return;
  const raw = els.answerInput.value.trim();
  if (raw === "") {
    els.feedbackText.textContent = "数字を入れてね";
    return;
  }
  state.acceptingAnswer = false;
  els.submitAnswerButton.disabled = true;
  state.elapsedMs += performance.now() - state.activeQuestionStartedAt;
  const question = state.currentQuestions[state.currentIndex];
  const answer = Number(raw);
  const correct = answer === question.answer;
  state.answers.push({ ...question, userAnswer: answer, correct });
  if (correct) {
    playCorrectSound();
  } else {
    playWrongSound();
  }

  state.currentIndex += 1;
  els.progressFill.style.width = `${(state.currentIndex / QUESTIONS_PER_RUN) * 100}%`;
  if (state.currentIndex >= QUESTIONS_PER_RUN) {
    finishQuiz();
  } else {
    els.feedbackText.textContent = correct ? "いいね！" : `せいかいは ${question.answer}`;
    setTimeout(renderQuestion, correct ? 260 : 620);
  }
}

function finishQuiz() {
  clearInterval(state.timer);
  const seconds = Math.max(1, Math.round(state.elapsedMs / 1000));
  const score = state.answers.filter((answer) => answer.correct).length;
  const previous = bestRecord(state.currentLevel.id, state.mode, state.data.currentPlayerId);
  const isNewRecord = !previous || score > previous.score || (score === previous.score && seconds < previous.seconds);
  const record = {
    id: createId(),
    playerId: state.data.currentPlayerId,
    playerName: currentPlayer().name,
    levelId: state.currentLevel.id,
    mode: state.mode,
    score,
    seconds,
    createdAt: new Date().toISOString(),
  };
  state.data.records.push(record);
  saveData();
  renderLevels();
  renderResult(score, seconds, isNewRecord);
  if (isNewRecord) celebrate();
  showScreen("result");
}

function renderResult(score, seconds, isNewRecord) {
  els.resultPlayer.textContent = `${currentPlayer().name} / ${state.currentLevel.title} / ${modeLabel(state.mode)}`;
  els.resultTitle.textContent = isNewRecord ? "New Record!" : "できた！";
  els.resultSummary.textContent = `${score} / 10 せいかい・${formatTime(seconds)}。${resultMessage(score, isNewRecord)}`;

  const misses = state.answers.filter((answer) => !answer.correct);
  if (misses.length === 0) {
    els.reviewPanel.innerHTML = "<h3>見直し</h3><p>ぜんぶ正解。今日はここで終わっても花丸です。</p>";
    return;
  }
  const items = misses
    .map(
      (item) =>
        `<li>${item.a} ${item.operation} ${item.b} = ${item.answer}（答えた数: ${item.userAnswer}）</li>`,
    )
    .join("");
  els.reviewPanel.innerHTML = `<h3>見直し</h3><ul>${items}</ul>`;
}

function resultMessage(score, isNewRecord) {
  if (isNewRecord) return "自分のベストをこえました。すばらしい！";
  if (score === 10) return "正確さはばっちり。次は落ち着いた速さに挑戦。";
  if (score >= 7) return "もう少しで満点。まちがい直しが力になります。";
  return "最後までやり切ったことが今日の大事な記録です。";
}

function bestRecord(levelId, mode, playerId) {
  return state.data.records
    .filter((record) => record.levelId === levelId && record.mode === mode && record.playerId === playerId)
    .sort(compareRecords)[0];
}

function compareRecords(a, b) {
  if (b.score !== a.score) return b.score - a.score;
  return a.seconds - b.seconds;
}

function renderRanking() {
  const [levelId, mode] = els.rankingLevelSelect.value.split(":");
  const recordsByPlayer = new Map();
  state.data.records
    .filter((record) => record.levelId === levelId && record.mode === mode)
    .sort(compareRecords)
    .forEach((record) => {
      if (!recordsByPlayer.has(record.playerId)) recordsByPlayer.set(record.playerId, record);
    });
  const records = [...recordsByPlayer.values()].slice(0, 10);
  els.rankingList.innerHTML = "";
  if (records.length === 0) {
    els.rankingList.innerHTML = '<p class="coach-panel">まだ記録がありません。</p>';
    return;
  }
  records.forEach((record, index) => {
    const row = document.createElement("div");
    row.className = "rank-row";
    row.innerHTML = `
      <span class="rank-place">${index + 1}</span>
      <div>
        <strong>${record.playerName}</strong>
        <p>${new Date(record.createdAt).toLocaleDateString("ja-JP")}</p>
      </div>
      <span class="rank-score">${record.score}/10・${formatTime(record.seconds)}</span>
    `;
    els.rankingList.append(row);
  });
}

function renderKeypad() {
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "消す", "0", "OK"].forEach((key) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = key;
    button.addEventListener("click", () => {
      if (key === "消す") {
        els.answerInput.value = els.answerInput.value.slice(0, -1);
      } else if (key === "OK") {
        submitAnswer();
      } else {
        els.answerInput.value += key;
      }
      els.answerInput.focus();
    });
    els.keypad.append(button);
  });
}

function updateTimer() {
  const activeMs = state.acceptingAnswer ? performance.now() - state.activeQuestionStartedAt : 0;
  const seconds = Math.round((state.elapsedMs + activeMs) / 1000);
  els.timerDisplay.textContent = `${seconds}びょう`;
}

function showScreen(name) {
  Object.entries(screens).forEach(([key, screen]) => {
    screen.classList.toggle("active", key === name);
  });
  document.body.classList.toggle("quiz-active", name === "quiz");
  if (name === "ranking") renderRanking();
}

function celebrate() {
  els.celebration.innerHTML = "";
  const colors = ["#ffb000", "#6fd3b1", "#6ba7ff", "#ff7c9c", "#fff06a"];
  for (let i = 0; i < 72; i += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[i % colors.length];
    piece.style.animationDelay = `${Math.random() * 420}ms`;
    piece.style.transform = `rotate(${Math.random() * 180}deg)`;
    els.celebration.append(piece);
  }
  setTimeout(() => {
    els.celebration.innerHTML = "";
  }, 1900);
  playCelebrationSound();
}

function playCorrectSound() {
  playMelody([
    { frequency: 880, start: 0, duration: 0.09, type: "sine", volume: 0.06 },
    { frequency: 1174, start: 0.11, duration: 0.13, type: "sine", volume: 0.055 },
  ]);
}

function playWrongSound() {
  playMelody([
    { frequency: 150, start: 0, duration: 0.16, type: "sawtooth", volume: 0.045 },
    { frequency: 118, start: 0.13, duration: 0.18, type: "sawtooth", volume: 0.04 },
  ]);
}

function playCelebrationSound() {
  playMelody([
    { frequency: 523, start: 0, duration: 0.1, type: "triangle", volume: 0.045 },
    { frequency: 659, start: 0.1, duration: 0.1, type: "triangle", volume: 0.05 },
    { frequency: 784, start: 0.2, duration: 0.12, type: "triangle", volume: 0.052 },
    { frequency: 1046, start: 0.34, duration: 0.22, type: "sine", volume: 0.06 },
    { frequency: 1318, start: 0.42, duration: 0.16, type: "sine", volume: 0.035 },
  ]);
}

function playMelody(notes) {
  if (!state.sound) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const context = new AudioContext();
  notes.forEach((note) => {
    playNote(context, note);
  });
  const lastNoteEnd = Math.max(...notes.map((note) => note.start + note.duration));
  setTimeout(() => context.close(), (lastNoteEnd + 0.25) * 1000);
}

function playNote(context, note) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const startAt = context.currentTime + note.start;
  const endAt = startAt + note.duration;
  oscillator.frequency.setValueAtTime(note.frequency, startAt);
  oscillator.type = note.type;
  gain.gain.setValueAtTime(0.001, startAt);
  gain.gain.exponentialRampToValueAtTime(note.volume, startAt + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.001, endAt);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(startAt);
  oscillator.stop(endAt + 0.02);
}

function modeLabel(mode) {
  return { mix: "ミックス", add: "たし算", sub: "ひき算" }[mode];
}

function formatTime(seconds) {
  if (seconds < 60) return `${seconds}秒`;
  return `${Math.floor(seconds / 60)}分${seconds % 60}秒`;
}

function createId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  const randomPart =
    window.crypto && typeof window.crypto.getRandomValues === "function"
      ? Array.from(window.crypto.getRandomValues(new Uint32Array(2)), (value) => value.toString(36)).join("")
      : Math.random().toString(36).slice(2);
  return `id-${Date.now().toString(36)}-${randomPart}`;
}
