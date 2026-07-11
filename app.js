const QUESTIONS_PER_RUN = 10;
const REACTION_ROUNDS = 10;
const REACTION_CELL_COUNT = 64;
const SEQUENCE_CELL_COUNT = 9;
const SEQUENCE_START_LENGTH = 3;
const SEQUENCE_MAX_LENGTH = 8;
const FLASH_ROUNDS = 5;
const FLASH_CELL_COUNT = 9;
const flashLevels = [
  { id: "easy", label: "初級", revealMs: 1200 },
  { id: "normal", label: "中級", revealMs: 850 },
  { id: "hard", label: "上級", revealMs: 600 },
];
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
  // {
  //   id: "three-carry",
  //   title: "3けた くり上がり",
  //   short: "3けた+",
  //   description: "発展チャレンジ。ゆっくり正確に解ければ十分すごい。",
  //   digits: 3,
  //   carry: true,
  // },
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
  visionNumbers: [],
  visionNext: 1,
  visionStartedAt: 0,
  visionElapsedMs: 0,
  visionTimer: null,
  visionRunning: false,
  reactionRound: 0,
  reactionTotalMs: 0,
  reactionLitIndex: -1,
  reactionCueAt: 0,
  reactionTimer: null,
  reactionRunning: false,
  reactionWaiting: false,
  sequencePattern: [],
  sequenceInputIndex: 0,
  sequenceLength: SEQUENCE_START_LENGTH,
  sequenceBestLength: 0,
  sequenceLitIndex: -1,
  sequenceRunning: false,
  sequenceShowing: false,
  sequenceTimer: null,
  flashRound: 0,
  flashScore: 0,
  flashTargets: [],
  flashInputNumber: 1,
  flashShowing: false,
  flashRunning: false,
  flashTimer: null,
  flashLevel: flashLevels[0],
};

const screens = {
  home: document.querySelector("#homeScreen"),
  mathHome: document.querySelector("#mathHomeScreen"),
  vision: document.querySelector("#visionScreen"),
  reaction: document.querySelector("#reactionScreen"),
  sequence: document.querySelector("#sequenceScreen"),
  flash: document.querySelector("#flashScreen"),
  quiz: document.querySelector("#quizScreen"),
  result: document.querySelector("#resultScreen"),
  ranking: document.querySelector("#rankingScreen"),
};

const els = {
  homeButton: document.querySelector("#homeButton"),
  topEyebrow: document.querySelector("#topEyebrow"),
  topTitle: document.querySelector("#topTitle"),
  soundButton: document.querySelector("#soundButton"),
  playerSelect: document.querySelector("#playerSelect"),
  addPlayerButton: document.querySelector("#addPlayerButton"),
  openRankingButton: document.querySelector("#openRankingButton"),
  openMathButton: document.querySelector("#openMathButton"),
  openVisionButton: document.querySelector("#openVisionButton"),
  openReactionButton: document.querySelector("#openReactionButton"),
  openSequenceButton: document.querySelector("#openSequenceButton"),
  openFlashButton: document.querySelector("#openFlashButton"),
  levelGrid: document.querySelector("#levelGrid"),
  tabs: [...document.querySelectorAll(".tab")],
  visionPlayerLabel: document.querySelector("#visionPlayerLabel"),
  visionTimerDisplay: document.querySelector("#visionTimerDisplay"),
  visionBoard: document.querySelector("#visionBoard"),
  startVisionButton: document.querySelector("#startVisionButton"),
  resetVisionButton: document.querySelector("#resetVisionButton"),
  visionResultPanel: document.querySelector("#visionResultPanel"),
  reactionPlayerLabel: document.querySelector("#reactionPlayerLabel"),
  reactionRoundLabel: document.querySelector("#reactionRoundLabel"),
  reactionTimerDisplay: document.querySelector("#reactionTimerDisplay"),
  reactionBoard: document.querySelector("#reactionBoard"),
  startReactionButton: document.querySelector("#startReactionButton"),
  resetReactionButton: document.querySelector("#resetReactionButton"),
  reactionResultPanel: document.querySelector("#reactionResultPanel"),
  sequencePlayerLabel: document.querySelector("#sequencePlayerLabel"),
  sequenceLevelLabel: document.querySelector("#sequenceLevelLabel"),
  sequenceStatusLabel: document.querySelector("#sequenceStatusLabel"),
  sequenceBoard: document.querySelector("#sequenceBoard"),
  startSequenceButton: document.querySelector("#startSequenceButton"),
  resetSequenceButton: document.querySelector("#resetSequenceButton"),
  sequenceResultPanel: document.querySelector("#sequenceResultPanel"),
  flashPlayerLabel: document.querySelector("#flashPlayerLabel"),
  flashRoundLabel: document.querySelector("#flashRoundLabel"),
  flashStatusLabel: document.querySelector("#flashStatusLabel"),
  flashBoard: document.querySelector("#flashBoard"),
  flashLevelTabs: [...document.querySelectorAll(".difficulty-tab")],
  startFlashButton: document.querySelector("#startFlashButton"),
  resetFlashButton: document.querySelector("#resetFlashButton"),
  flashResultPanel: document.querySelector("#flashResultPanel"),
  quizLevelLabel: document.querySelector("#quizLevelLabel"),
  questionCounter: document.querySelector("#questionCounter"),
  timerDisplay: document.querySelector("#timerDisplay"),
  progressFill: document.querySelector("#progressFill"),
  problemText: document.querySelector("#problemText"),
  answerInput: document.querySelector("#answerInput"),
  submitAnswerButton: document.querySelector("#submitAnswerButton"),
  feedbackText: document.querySelector("#feedbackText"),
  visualHint: document.querySelector("#visualHint"),
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
  resetVisionBoard();
  resetReactionGame();
  resetSequenceGame();
  resetFlashGame();
  wireEvents();
  renderRanking();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
}

function wireEvents() {
  els.homeButton.addEventListener("click", () => showScreen("home"));
  els.openMathButton.addEventListener("click", () => showScreen("mathHome"));
  els.openVisionButton.addEventListener("click", () => {
    resetVisionBoard();
    showScreen("vision");
  });
  els.openReactionButton.addEventListener("click", () => {
    resetReactionGame();
    showScreen("reaction");
  });
  els.openSequenceButton.addEventListener("click", () => {
    resetSequenceGame();
    showScreen("sequence");
  });
  els.openFlashButton.addEventListener("click", () => {
    resetFlashGame();
    showScreen("flash");
  });
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
  els.startVisionButton.addEventListener("click", startVision);
  els.resetVisionButton.addEventListener("click", resetVisionBoard);
  els.startReactionButton.addEventListener("click", startReactionGame);
  els.resetReactionButton.addEventListener("click", resetReactionGame);
  els.startSequenceButton.addEventListener("click", startSequenceGame);
  els.resetSequenceButton.addEventListener("click", resetSequenceGame);
  els.startFlashButton.addEventListener("click", startFlashGame);
  els.resetFlashButton.addEventListener("click", resetFlashGame);
  els.flashLevelTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      if (state.flashRunning) return;
      state.flashLevel = flashLevels.find((level) => level.id === tab.dataset.flashLevel) || flashLevels[0];
      els.flashLevelTabs.forEach((item) => item.classList.toggle("active", item === tab));
      resetFlashGame();
    });
  });
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
  renderVisionLabels();
  renderReactionLabels();
  renderSequenceLabels();
  renderFlashLabels();
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
  renderVisionLabels();
  renderReactionLabels();
  renderSequenceLabels();
  renderFlashLabels();
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
  const visionOption = document.createElement("option");
  visionOption.value = "vision-grid:vision";
  visionOption.textContent = "数字タップ・1から25";
  els.rankingLevelSelect.append(visionOption);

  const reactionOption = document.createElement("option");
  reactionOption.value = "reaction-tap:reaction";
  reactionOption.textContent = "反射タップ・平均タイム";
  els.rankingLevelSelect.append(reactionOption);

  const sequenceOption = document.createElement("option");
  sequenceOption.value = "sequence-memory:sequence";
  sequenceOption.textContent = "順番記憶・最高の長さ";
  els.rankingLevelSelect.append(sequenceOption);

  flashLevels.forEach((level) => {
    const flashOption = document.createElement("option");
    flashOption.value = `flash-memory-${level.id}:flash`;
    flashOption.textContent = `フラッシュ記憶${level.label}・正解数`;
    els.rankingLevelSelect.append(flashOption);
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
  if (level.digits === 1 && level.carry) {
    for (let i = 0; i < 800; i += 1) {
      const a = rand(10, 18);
      const b = rand(1, 9);
      if (subtractionHasBorrow(a, b)) {
        return { a, b, operation: "-", answer: a - b };
      }
    }
    return { a: 15, b: 8, operation: "-", answer: 7 };
  }

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
  els.visualHint.innerHTML = "";
  els.visualHint.classList.remove("active");
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
  if (correct) {
    if (state.currentIndex >= QUESTIONS_PER_RUN) {
      finishQuiz();
    } else {
      els.feedbackText.textContent = "いいね！";
      setTimeout(renderQuestion, 260);
    }
  } else {
    els.feedbackText.textContent = `せいかいは ${question.answer}`;
    renderVisualHint(question);
  }
}

function goNextAfterHint() {
  if (state.currentIndex >= QUESTIONS_PER_RUN) {
    finishQuiz();
  } else {
    renderQuestion();
  }
}

function renderVisualHint(question) {
  const hint = buildHint(question);
  const demo = buildVisualDemo(question);
  els.visualHint.classList.add("active");
  els.visualHint.innerHTML = `
    <div class="hint-message">${hint.message}</div>
    ${demo}
    <button class="primary-button hint-next-button" id="nextAfterHintButton" type="button">つぎへ</button>
  `;
  document.querySelector("#nextAfterHintButton").addEventListener("click", goNextAfterHint);
}

function buildVisualDemo(question) {
  if (question.operation === "+" && shouldShowCarryDemo(question)) {
    return renderAdditionCarryDemo(question);
  }
  if (question.operation === "-" && shouldShowBorrowDemo(question)) {
    return renderSubtractionBorrowDemo(question);
  }
  return renderPlaceValueTable(question);
}

function shouldShowCarryDemo(question) {
  return question.a < 100 && question.b < 100 && additionHasCarry(question.a, question.b);
}

function shouldShowBorrowDemo(question) {
  return subtractionHasBorrow(question.a, question.b);
}

function renderAdditionCarryDemo(question) {
  const maxDigits = Math.max(String(question.a).length, String(question.b).length, String(question.answer).length);
  const placeNames = ["一の位", "十の位", "百の位"];
  const placeClasses = ["eq-ones-cell", "eq-tens-cell", "eq-hundreds-cell"];
  const colorAs = ["color-a", "color-a-tens", "color-a-hundreds"];
  const colorBs = ["color-b", "color-b-tens", "color-b-hundreds"];

  const aDigits = [];
  const bDigits = [];
  const ansDigits = [];
  for (let p = 0; p < maxDigits; p += 1) {
    aDigits.push(Math.floor(question.a / 10 ** p) % 10);
    bDigits.push(Math.floor(question.b / 10 ** p) % 10);
    ansDigits.push(Math.floor(question.answer / 10 ** p) % 10);
  }

  const carries = [];
  let carry = 0;
  for (let p = 0; p < maxDigits; p += 1) {
    const sum = aDigits[p] + bDigits[p] + carry;
    carries.push(sum >= 10);
    carry = sum >= 10 ? 1 : 0;
  }

  const headerCells = placeNames.slice(0, maxDigits).reverse()
    .map((name) => `<span class="eq-place-label">${name}</span>`).join("");

  const rowACells = aDigits.slice().reverse().map((d, i) => {
    const p = maxDigits - 1 - i;
    return `<div class="eq-cell ${placeClasses[p]}">${renderEquationBoxes(10, d, colorAs[p])}</div>`;
  }).join("");

  const rowBCells = bDigits.slice().reverse().map((d, i) => {
    const p = maxDigits - 1 - i;
    return `<div class="eq-cell ${placeClasses[p]}">${renderEquationBoxes(10, d, colorBs[p])}</div>`;
  }).join("");

  let carryAcc = 0;
  const resultCells = aDigits.slice().reverse().map((_, i) => {
    const p = maxDigits - 1 - i;
    const hasCarryFromRight = p > 0 && carries[p - 1];
    const hasCarryToLeft = carries[p];
    const aVal = aDigits[p] + (hasCarryFromRight ? 1 : 0);
    const bVal = bDigits[p];
    const placeDelay = p * 3500;
    const carryArriveDelay = hasCarryFromRight ? (p - 1) * 3500 + 2600 : 0;

    if (hasCarryToLeft) {
      return `<div class="eq-cell ${placeClasses[p]} eq-ones-result" style="--place-delay:${placeDelay}ms">
        ${renderAnimatedOnesBoxes(aVal, bVal, ansDigits[p], hasCarryFromRight, colorAs[p], colorBs[p], carryArriveDelay)}
      </div>`;
    }
    return `<div class="eq-cell ${placeClasses[p]} eq-ones-result" style="--place-delay:${placeDelay}ms">
      ${renderAnimatedNoCarry(aVal, bVal, hasCarryFromRight, colorAs[p], colorBs[p], carryArriveDelay)}
    </div>`;
  }).join("");

  const carryPlaces = carries.map((c, i) => c ? placeNames[i] : null).filter(Boolean);
  const stepsHtml = carryPlaces.map((name, i) => {
    const p = carries.indexOf(true, i > 0 ? carries.indexOf(true) + 1 : 0);
    return `<span>${i + 1}. ${name}: ${aDigits[carries.indexOf(true, i === 0 ? 0 : undefined)]} + ${bDigits[carries.indexOf(true, i === 0 ? 0 : undefined)]} = 10こ以上 → くり上げ</span>`;
  });

  const gridCols = `3.2rem repeat(${maxDigits}, minmax(0, 1fr))`;

  return `
    <div class="equation-demo addition-demo">
      <div class="eq-table" style="--eq-cols: ${maxDigits}">
        <div class="eq-header" style="grid-template-columns: ${gridCols}">
          <span class="eq-num-col"></span>
          ${headerCells}
        </div>
        <div class="eq-row" style="grid-template-columns: ${gridCols}">
          <span class="eq-num-col eq-number">${question.a}</span>
          ${rowACells}
        </div>
        <div class="eq-operator">＋</div>
        <div class="eq-row" style="grid-template-columns: ${gridCols}">
          <span class="eq-num-col eq-number">${question.b}</span>
          ${rowBCells}
        </div>
        <div class="eq-operator">=</div>
        <div class="eq-row eq-row-result" style="grid-template-columns: ${gridCols}">
          <span class="eq-num-col eq-number eq-number-final">${question.answer}</span>
          ${resultCells}
        </div>
      </div>
      <div class="demo-steps">
        ${carryPlaces.map((name) => `<span>${name}で10こ のまとまりを左の位へくり上げる</span>`).join("")}
        <span>答え: ${question.answer}</span>
      </div>
    </div>
  `;
}

function renderSubtractionBorrowDemo(question) {
  const maxDigits = Math.max(String(question.a).length, String(question.b).length);
  const placeNames = ["一の位", "十の位", "百の位"];
  const placeClasses = ["eq-ones-cell", "eq-tens-cell", "eq-hundreds-cell"];

  const aDigits = [];
  const bDigits = [];
  const ansDigits = [];
  for (let p = 0; p < maxDigits; p += 1) {
    aDigits.push(Math.floor(question.a / 10 ** p) % 10);
    bDigits.push(Math.floor(question.b / 10 ** p) % 10);
    ansDigits.push(Math.floor(question.answer / 10 ** p) % 10);
  }

  const borrows = [];
  let borrow = 0;
  for (let p = 0; p < maxDigits; p += 1) {
    const diff = aDigits[p] - borrow - bDigits[p];
    borrows.push(diff < 0);
    borrow = diff < 0 ? 1 : 0;
  }

  const gridCols = `3.2rem repeat(${maxDigits}, minmax(0, 1fr))`;
  const headerCells = placeNames.slice(0, maxDigits).reverse()
    .map((name) => `<span class="eq-place-label">${name}</span>`).join("");

  const rowACells = aDigits.slice().reverse().map((d, i) => {
    const p = maxDigits - 1 - i;
    const givesToRight = p > 0 && borrows[p - 1];
    const receivesFromLeft = borrows[p];
    if (givesToRight && receivesFromLeft) {
      return `<div class="eq-cell ${placeClasses[p]} eq-tens-borrow-src eq-sub-ones-result">
        ${renderEquationBoxesWithBorrow(10, d, "color-a")}
        ${renderSubARowOnesOnly()}
      </div>`;
    }
    if (givesToRight) {
      return `<div class="eq-cell ${placeClasses[p]} eq-tens-borrow-src">
        ${renderEquationBoxesWithBorrow(10, d, "color-a")}
      </div>`;
    }
    if (receivesFromLeft) {
      return `<div class="eq-cell ${placeClasses[p]} eq-sub-ones-result">
        ${renderSubARowOnes(d)}
      </div>`;
    }
    return `<div class="eq-cell ${placeClasses[p]}">
      ${renderEquationBoxes(10, d, "color-a")}
    </div>`;
  }).join("");

  const rowBCells = bDigits.slice().reverse().map((d, i) => {
    const p = maxDigits - 1 - i;
    return `<div class="eq-cell ${placeClasses[p]}">${renderEquationBoxes(10, d, "color-b")}</div>`;
  }).join("");

  const resultCells = aDigits.slice().reverse().map((_, i) => {
    const p = maxDigits - 1 - i;
    const receivesFromLeft = borrows[p];
    const givesToRight = p > 0 && borrows[p - 1];
    const aEffective = aDigits[p] - (givesToRight ? 1 : 0);

    if (receivesFromLeft) {
      return `<div class="eq-cell ${placeClasses[p]} eq-sub-ones-result">
        ${renderSubResultBoxes(aDigits[p], bDigits[p])}
      </div>`;
    }
    return `<div class="eq-cell ${placeClasses[p]}">
      ${renderSubResultTensBoxes(aEffective, bDigits[p])}
    </div>`;
  }).join("");

  const borrowPlaces = borrows.map((b, i) => b ? placeNames[i] : null).filter(Boolean);

  return `
    <div class="equation-demo subtraction-demo">
      <div class="eq-table" style="--eq-cols: ${maxDigits}">
        <div class="eq-header" style="grid-template-columns: ${gridCols}">
          <span class="eq-num-col"></span>
          ${headerCells}
        </div>
        <div class="eq-row" style="grid-template-columns: ${gridCols}">
          <span class="eq-num-col eq-number">${question.a}</span>
          ${rowACells}
        </div>
        <div class="eq-operator">ー</div>
        <div class="eq-row" style="grid-template-columns: ${gridCols}">
          <span class="eq-num-col eq-number">${question.b}</span>
          ${rowBCells}
        </div>
        <div class="eq-operator">=</div>
        <div class="eq-row eq-row-result" style="grid-template-columns: ${gridCols}">
          <span class="eq-num-col eq-number eq-number-final">${question.answer}</span>
          ${resultCells}
        </div>
      </div>
      <div class="demo-steps">
        ${borrowPlaces.map((name) => `<span>${name}で足りないので左の位から10こもらう</span>`).join("")}
        <span>答え: ${question.answer}</span>
      </div>
    </div>
  `;
}

function renderPlaceValueTable(question) {
  return `
    <div class="place-board">
      ${renderPlaceRow(question.a, "上の数")}
      ${renderPlaceRow(question.b, question.operation === "+" ? "たす数" : "ひく数")}
      ${renderPlaceRow(question.answer, "答え")}
    </div>
    <div class="block-legend">
      <span><i class="hundreds-swatch"></i>百の位</span>
      <span><i class="tens-swatch"></i>十の位</span>
      <span><i class="ones-swatch"></i>一の位</span>
    </div>
  `;
}

function renderEquationBoxes(total, filled, colorClass) {
  return `<div class="eq-boxes">${Array.from({ length: total }, (_, i) =>
    `<i class="eq-box ${i < filled ? colorClass : "eq-box-empty"}"></i>`
  ).join("")}</div>`;
}

function renderEquationBoxesWithCarry(total, filled, colorClass) {
  return `<div class="eq-boxes">${Array.from({ length: total }, (_, i) => {
    if (i < filled) return `<i class="eq-box ${colorClass}"></i>`;
    if (i === filled) return `<i class="eq-box ${colorClass} eq-carry-land"></i>`;
    return `<i class="eq-box eq-box-empty"></i>`;
  }).join("")}</div>`;
}

function renderAnimatedNoCarry(aVal, bVal, hasCarryFromRight, colorA, colorB, carryArriveDelay) {
  const total = aVal + bVal;
  const boxes = [];
  let idx = 0;
  if (hasCarryFromRight) {
    boxes.push(`<i class="eq-box ${colorA} eq-carry-land-early" style="animation-delay:${carryArriveDelay}ms"></i>`);
  }
  const aCount = hasCarryFromRight ? aVal - 1 : aVal;
  for (let i = 0; i < aCount; i += 1) {
    boxes.push(`<i class="eq-box ${colorA} eq-carry-slide" style="--i:${idx}"></i>`);
    idx += 1;
  }
  for (let i = 0; i < bVal; i += 1) {
    boxes.push(`<i class="eq-box ${colorB} eq-carry-slide" style="--i:${idx}"></i>`);
    idx += 1;
  }
  for (let i = total; i < 10; i += 1) {
    boxes.push(`<i class="eq-box eq-box-empty eq-empty-appear" style="--i:${i}"></i>`);
  }
  return `<div class="eq-remain-row">${boxes.join("")}</div>`;
}

function renderEquationLooseBoxes(count, colorClass) {
  if (count === 0) return "";
  return `<div class="eq-loose">${Array.from({ length: count }, () =>
    `<i class="eq-box ${colorClass}"></i>`
  ).join("")}</div>`;
}

function renderAnimatedOnesBoxes(aOnes, bOnes, resultOnes, hasCarryFromRight, colorA, colorB, carryArriveDelay) {
  const carryBoxes = [];
  const remainBoxes = [];
  let idx = 0;
  if (hasCarryFromRight) {
    carryBoxes.push(`<i class="eq-box ${colorA} eq-carry-land-early" style="animation-delay:${carryArriveDelay}ms"></i>`);
    idx += 1;
  }
  const aCount = hasCarryFromRight ? aOnes - 1 : aOnes;
  for (let i = 0; i < aCount; i += 1) {
    if (idx < 10) {
      carryBoxes.push(`<i class="eq-box ${colorA} eq-carry-slide" style="--i:${idx}"></i>`);
    } else {
      remainBoxes.push(`<i class="eq-box ${colorA} eq-remain" style="--i:${idx - 10}"></i>`);
    }
    idx += 1;
  }
  for (let i = 0; i < bOnes; i += 1) {
    if (idx < 10) {
      carryBoxes.push(`<i class="eq-box ${colorB} eq-carry-slide" style="--i:${idx}"></i>`);
    } else {
      remainBoxes.push(`<i class="eq-box ${colorB} eq-remain" style="--i:${idx - 10}"></i>`);
    }
    idx += 1;
  }
  const remainCount = remainBoxes.length;
  for (let i = remainCount; i < 10; i += 1) {
    remainBoxes.push(`<i class="eq-box eq-box-empty eq-empty-appear" style="--i:${i}"></i>`);
  }
  return `
    <div class="eq-carry-row">${carryBoxes.join("")}</div>
    <div class="eq-remain-row">${remainBoxes.join("")}</div>
  `;
}

function renderSubARowOnes(onesBefore) {
  const onesRow = [];
  for (let i = 0; i < 10; i += 1) {
    if (i < onesBefore) {
      onesRow.push(`<i class="eq-box color-a"></i>`);
    } else {
      onesRow.push(`<i class="eq-box eq-box-empty"></i>`);
    }
  }
  const borrowRow = [];
  for (let i = 0; i < 10; i += 1) {
    borrowRow.push(`<i class="eq-box color-a eq-borrow-slide-in" style="--i:${i}"></i>`);
  }
  return `
    <div class="eq-sub-ones-row">${onesRow.join("")}</div>
    <div class="eq-borrow-in-row">${borrowRow.join("")}</div>
  `;
}

function renderSubARowOnesOnly() {
  const borrowRow = [];
  for (let i = 0; i < 10; i += 1) {
    borrowRow.push(`<i class="eq-box color-a eq-borrow-slide-in" style="--i:${i}"></i>`);
  }
  return `<div class="eq-borrow-in-row">${borrowRow.join("")}</div>`;
}

function renderSubResultTensBoxes(tensAfterBorrow, bTens) {
  const resultTens = tensAfterBorrow - bTens;
  const boxes = [];
  for (let i = 0; i < 10; i += 1) {
    if (i < resultTens) {
      boxes.push(`<i class="eq-box color-a eq-sub-result-stay" style="--i:${i}"></i>`);
    } else if (i < tensAfterBorrow) {
      boxes.push(`<i class="eq-box color-a eq-sub-remove-tens" style="--r:${i - resultTens}"></i>`);
    } else {
      boxes.push(`<i class="eq-box eq-box-empty"></i>`);
    }
  }
  return `<div class="eq-boxes">${boxes.join("")}</div>`;
}

function renderSubResultBoxes(onesBefore, subtractOnes) {
  const total = onesBefore + 10;
  const resultOnes = total - subtractOnes;
  const removeFromOnes = Math.min(onesBefore, subtractOnes);
  const removeFromBorrow = subtractOnes - removeFromOnes;
  const onesRow = [];
  for (let i = 0; i < 10; i += 1) {
    if (i < onesBefore - removeFromOnes) {
      onesRow.push(`<i class="eq-box color-a eq-sub-result-stay" style="--i:${i}"></i>`);
    } else if (i < onesBefore) {
      onesRow.push(`<i class="eq-box color-a eq-sub-remove" style="--r:${i - (onesBefore - removeFromOnes) + removeFromBorrow}"></i>`);
    } else {
      onesRow.push(`<i class="eq-box eq-box-empty"></i>`);
    }
  }
  const borrowRow = [];
  for (let i = 0; i < 10; i += 1) {
    if (i < 10 - removeFromBorrow) {
      borrowRow.push(`<i class="eq-box color-a eq-sub-result-stay" style="--i:${i}"></i>`);
    } else {
      borrowRow.push(`<i class="eq-box color-a eq-sub-remove" style="--r:${i - (10 - removeFromBorrow)}"></i>`);
    }
  }
  return `
    <div class="eq-sub-ones-row">${borrowRow.join("")}</div>
    <div class="eq-sub-ones-row">${onesRow.join("")}</div>
  `;
}

function renderEquationBoxesWithBorrow(total, filled, colorClass) {
  return `<div class="eq-boxes">${Array.from({ length: total }, (_, i) => {
    if (i < filled - 1) return `<i class="eq-box ${colorClass}"></i>`;
    if (i === filled - 1) return `<i class="eq-box ${colorClass} eq-borrow-leave"></i>`;
    return `<i class="eq-box eq-box-empty"></i>`;
  }).join("")}</div>`;
}

function renderTenBlocks(count) {
  if (count === 0) return "";
  return Array.from({ length: count }, () => '<i class="ten-block"></i>').join("");
}

function renderFinalTenBlocks(carryTens, totalTens) {
  const count = Math.max(0, totalTens - carryTens);
  return Array.from({ length: carryTens }, () => '<i class="ten-block final-carry-ten"></i>').join("")
    + Array.from({ length: count }, () => '<i class="ten-block final-existing-ten"></i>').join("");
}

function renderVerticalNumberRow(label, value, rowType) {
  const tens = Math.floor(value / 10);
  const ones = value % 10;
  return `
    <div class="flow-row ${rowType}-row">
      <span class="flow-label">${label}</span>
      <div class="flow-cell tens-cell">${renderTenBlocks(tens)}</div>
      <div class="flow-cell ones-cell">${renderUnitBlocks(ones, rowType)}</div>
    </div>
  `;
}

function renderUnitBlocks(count, type) {
  return Array.from({ length: count }, (_, index) => `<i class="unit-block ${type}" style="--i:${index}"></i>`).join("");
}

function renderBorrowedUnits(count) {
  return Array.from(
    { length: count },
    (_, index) => `<i class="unit-block borrowed" style="--i:${index}"></i>`,
  ).join("");
}

function renderGroupedCarryUnits(count) {
  return Array.from(
    { length: count },
    (_, index) => `<i class="unit-block carry-piece" style="--i:${index}"></i>`,
  ).join("");
}

function renderRemovedUnits(count) {
  return Array.from(
    { length: count },
    (_, index) => `<i class="unit-block removed" style="--i:${index}"></i>`,
  ).join("");
}

function renderMovingCarryGroup() {
  return '<span class="carry-group" aria-hidden="true">10こ</span>';
}

function buildHint(question) {
  if (question.operation === "+") {
    const carryPlaces = carryPlaceLabels(question.a, question.b);
    if (carryPlaces.length > 0) {
      return { message: `${carryPlaces.join("と")}で10のまとまりを作ろう。くり上がりを忘れずに。` };
    }
    return { message: "位をそろえて、同じ色どうしをたしてみよう。" };
  }

  const borrowPlaces = borrowPlaceLabels(question.a, question.b);
  if (borrowPlaces.length > 0) {
    return { message: `${borrowPlaces.join("と")}で足りない時は、左の位から10をもらおう。` };
  }
  return { message: "位をそろえて、同じ色どうしをひいてみよう。" };
}

function carryPlaceLabels(a, b) {
  const labels = [];
  const placeLabels = ["一の位", "十の位", "百の位"];
  for (let i = 0; i < 3; i += 1) {
    if (Math.floor(a / 10 ** i) % 10 + (Math.floor(b / 10 ** i) % 10) >= 10) {
      labels.push(placeLabels[i]);
    }
  }
  return labels;
}

function borrowPlaceLabels(a, b) {
  const labels = [];
  const placeLabels = ["一の位", "十の位", "百の位"];
  for (let i = 0; i < 3; i += 1) {
    if (Math.floor(a / 10 ** i) % 10 < (Math.floor(b / 10 ** i) % 10)) {
      labels.push(placeLabels[i]);
    }
  }
  return labels;
}

function renderPlaceRow(value, label) {
  const digits = splitDigits(value);
  return `
    <div class="place-row">
      <span class="place-label">${label}</span>
      ${renderPlace("hundreds", "百", digits.hundreds)}
      ${renderPlace("tens", "十", digits.tens)}
      ${renderPlace("ones", "一", digits.ones)}
    </div>
  `;
}

function renderPlace(type, label, count) {
  return `
    <div class="place-cell ${type}">
      <strong>${label}</strong>
      <div class="blocks">${renderBlocks(type, count)}</div>
      <span>${count}</span>
    </div>
  `;
}

function renderBlocks(type, count) {
  if (count === 0) return '<i class="empty-block"></i>';
  return Array.from({ length: count }, () => `<i class="math-block ${type}"></i>`).join("");
}

function splitDigits(value) {
  return {
    hundreds: Math.floor(value / 100) % 10,
    tens: Math.floor(value / 10) % 10,
    ones: value % 10,
  };
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

function resetVisionBoard() {
  clearInterval(state.visionTimer);
  state.visionNumbers = shuffle(Array.from({ length: 25 }, (_, index) => index + 1));
  state.visionNext = 1;
  state.visionStartedAt = 0;
  state.visionElapsedMs = 0;
  state.visionRunning = false;
  els.startVisionButton.disabled = false;
  els.startVisionButton.textContent = "スタート";
  els.resetVisionButton.disabled = false;
  renderVisionLabels();
  renderVisionBoard();
  renderVisionIntro();
}

function startVision() {
  state.visionNumbers = shuffle(Array.from({ length: 25 }, (_, index) => index + 1));
  state.visionNext = 1;
  state.visionStartedAt = performance.now();
  state.visionElapsedMs = 0;
  state.visionRunning = true;
  els.startVisionButton.disabled = true;
  els.startVisionButton.textContent = "チャレンジ中";
  els.resetVisionButton.disabled = true;
  renderVisionLabels();
  renderVisionBoard();
  updateVisionTimer();
  clearInterval(state.visionTimer);
  state.visionTimer = setInterval(updateVisionTimer, 100);
}

function renderVisionBoard() {
  els.visionBoard.innerHTML = "";
  state.visionNumbers.forEach((number) => {
    const button = document.createElement("button");
    button.className = "vision-cell";
    button.type = "button";
    button.textContent = state.visionRunning || number < state.visionNext ? number : "";
    button.dataset.number = String(number);
    button.disabled = !state.visionRunning;
    button.setAttribute("aria-label", `${number}`);
    if (!state.visionRunning) button.classList.add("hidden-number");
    if (number < state.visionNext) button.classList.add("done");
    button.addEventListener("click", () => pressVisionNumber(number, button));
    els.visionBoard.append(button);
  });
}

function pressVisionNumber(number, button) {
  if (!state.visionRunning) return;
  if (number !== state.visionNext) {
    button.classList.remove("miss");
    void button.offsetWidth;
    button.classList.add("miss");
    playWrongSound();
    return;
  }

  button.classList.add("done");
  playCorrectSound();
  state.visionNext += 1;
  if (state.visionNext > 25) {
    finishVision();
    return;
  }
  renderVisionLabels();
  renderVisionBoard();
}

function finishVision() {
  clearInterval(state.visionTimer);
  state.visionElapsedMs = performance.now() - state.visionStartedAt;
  state.visionRunning = false;
  const seconds = Math.max(0.1, Math.round(state.visionElapsedMs / 100) / 10);
  const previous = bestVisionRecord(state.data.currentPlayerId);
  const isNewRecord = !previous || seconds < previous.seconds;
  const record = {
    id: createId(),
    playerId: state.data.currentPlayerId,
    playerName: currentPlayer().name,
    levelId: "vision-grid",
    mode: "vision",
    score: 25,
    seconds,
    createdAt: new Date().toISOString(),
  };
  state.data.records.push(record);
  saveData();
  els.startVisionButton.disabled = false;
  els.startVisionButton.textContent = "もういちど";
  els.resetVisionButton.disabled = false;
  renderVisionLabels();
  renderVisionBoard();
  renderVisionResult(seconds, isNewRecord, previous);
  renderRanking();
  if (isNewRecord) celebrate();
}

function renderVisionLabels() {
  const player = currentPlayer();
  const best = bestVisionRecord(state.data.currentPlayerId);
  els.visionPlayerLabel.textContent = `${player ? player.name : ""} / ベスト ${best ? formatSeconds(best.seconds) : "まだ記録なし"}`;
  updateVisionTimer();
}

function renderVisionIntro() {
  const best = bestVisionRecord(state.data.currentPlayerId);
  els.visionResultPanel.innerHTML = `
    <h3>${best ? "ベストタイム" : "あそび方"}</h3>
    <p>${
      best
        ? `${currentPlayer().name}のベストは ${formatSeconds(best.seconds)} です。まん中あたりを見ながら数字を探してみよう。`
        : "まん中あたりを見ながら、1から25まで順番に押します。押し間違えても続けられます。"
    }</p>
  `;
}

function renderVisionResult(seconds, isNewRecord, previous) {
  els.visionResultPanel.innerHTML = `
    <h3>${isNewRecord ? "New Record!" : "ゴール！"}</h3>
    <p>${formatSeconds(seconds)}でクリア。${isNewRecord ? "自分のベストを更新しました。" : `ベストは ${formatSeconds(previous.seconds)} です。`}</p>
  `;
}

function updateVisionTimer() {
  const elapsed = state.visionRunning ? performance.now() - state.visionStartedAt : state.visionElapsedMs;
  els.visionTimerDisplay.textContent = formatSeconds(Math.round(elapsed / 100) / 10);
}

function resetReactionGame() {
  clearTimeout(state.reactionTimer);
  state.reactionRound = 0;
  state.reactionTotalMs = 0;
  state.reactionLitIndex = -1;
  state.reactionCueAt = 0;
  state.reactionRunning = false;
  state.reactionWaiting = false;
  els.startReactionButton.disabled = false;
  els.startReactionButton.textContent = "スタート";
  els.resetReactionButton.disabled = false;
  renderReactionLabels();
  renderReactionBoard();
  renderReactionIntro();
}

function startReactionGame() {
  clearTimeout(state.reactionTimer);
  state.reactionRound = 0;
  state.reactionTotalMs = 0;
  state.reactionLitIndex = -1;
  state.reactionCueAt = 0;
  state.reactionRunning = true;
  state.reactionWaiting = false;
  els.startReactionButton.disabled = true;
  els.startReactionButton.textContent = "チャレンジ中";
  els.resetReactionButton.disabled = false;
  renderReactionLabels();
  renderReactionBoard();
  queueReactionCue();
}

function queueReactionCue() {
  if (!state.reactionRunning) return;
  state.reactionWaiting = true;
  state.reactionLitIndex = -1;
  renderReactionBoard();
  const delay = rand(650, 1450);
  state.reactionTimer = setTimeout(showReactionCue, delay);
}

function showReactionCue() {
  if (!state.reactionRunning) return;
  state.reactionWaiting = false;
  state.reactionLitIndex = rand(0, REACTION_CELL_COUNT - 1);
  state.reactionCueAt = performance.now();
  renderReactionLabels();
  renderReactionBoard();
  playCorrectSound();
}

function renderReactionBoard() {
  els.reactionBoard.innerHTML = "";
  for (let index = 0; index < REACTION_CELL_COUNT; index += 1) {
    const button = document.createElement("button");
    button.className = "reaction-cell";
    button.type = "button";
    button.dataset.index = String(index);
    button.disabled = !state.reactionRunning;
    button.setAttribute("aria-label", `マス ${index + 1}`);
    if (state.reactionLitIndex === index) button.classList.add("lit");
    button.addEventListener("click", () => pressReactionCell(index, button));
    els.reactionBoard.append(button);
  }
}

function pressReactionCell(index, button) {
  if (!state.reactionRunning) return;
  if (state.reactionWaiting || state.reactionLitIndex === -1 || index !== state.reactionLitIndex) {
    button.classList.remove("miss");
    void button.offsetWidth;
    button.classList.add("miss");
    playWrongSound();
    return;
  }

  const reactionMs = performance.now() - state.reactionCueAt;
  state.reactionTotalMs += reactionMs;
  state.reactionRound += 1;
  state.reactionLitIndex = -1;
  renderReactionLabels();
  renderReactionBoard();
  if (state.reactionRound >= REACTION_ROUNDS) {
    finishReactionGame();
  } else {
    queueReactionCue();
  }
}

function finishReactionGame() {
  clearTimeout(state.reactionTimer);
  state.reactionRunning = false;
  state.reactionWaiting = false;
  const averageSeconds = Math.max(0.1, Math.round((state.reactionTotalMs / REACTION_ROUNDS) / 100) / 10);
  const previous = bestReactionRecord(state.data.currentPlayerId);
  const isNewRecord = !previous || averageSeconds < previous.seconds;
  const record = {
    id: createId(),
    playerId: state.data.currentPlayerId,
    playerName: currentPlayer().name,
    levelId: "reaction-tap",
    mode: "reaction",
    score: REACTION_ROUNDS,
    seconds: averageSeconds,
    createdAt: new Date().toISOString(),
  };
  state.data.records.push(record);
  saveData();
  els.startReactionButton.disabled = false;
  els.startReactionButton.textContent = "もういちど";
  renderReactionLabels();
  renderReactionBoard();
  renderReactionResult(averageSeconds, isNewRecord, previous);
  renderRanking();
  if (isNewRecord) celebrate();
}

function renderReactionLabels() {
  const player = currentPlayer();
  const best = bestReactionRecord(state.data.currentPlayerId);
  els.reactionPlayerLabel.textContent = `${player ? player.name : ""} / ベスト ${best ? formatSeconds(best.seconds) : "まだ記録なし"}`;
  els.reactionRoundLabel.textContent = `${state.reactionRound} / ${REACTION_ROUNDS}`;
  const average = state.reactionRound > 0 ? state.reactionTotalMs / state.reactionRound / 1000 : 0;
  els.reactionTimerDisplay.textContent = `平均 ${formatSeconds(Math.round(average * 10) / 10)}`;
}

function renderReactionIntro() {
  const best = bestReactionRecord(state.data.currentPlayerId);
  els.reactionResultPanel.innerHTML = `
    <h3>${best ? "ベストタイム" : "あそび方"}</h3>
    <p>${
      best
        ? `${currentPlayer().name}のベスト平均は ${formatSeconds(best.seconds)} です。光ったマスだけをすばやく押そう。`
        : "光ったマスをできるだけ早く押します。10回の平均タイムを記録します。"
    }</p>
  `;
}

function renderReactionResult(seconds, isNewRecord, previous) {
  els.reactionResultPanel.innerHTML = `
    <h3>${isNewRecord ? "New Record!" : "ゴール！"}</h3>
    <p>平均 ${formatSeconds(seconds)}。${isNewRecord ? "自分のベストを更新しました。" : `ベスト平均は ${formatSeconds(previous.seconds)} です。`}</p>
  `;
}

function resetSequenceGame() {
  clearTimeout(state.sequenceTimer);
  state.sequencePattern = [];
  state.sequenceInputIndex = 0;
  state.sequenceLength = SEQUENCE_START_LENGTH;
  state.sequenceBestLength = 0;
  state.sequenceLitIndex = -1;
  state.sequenceRunning = false;
  state.sequenceShowing = false;
  els.startSequenceButton.disabled = false;
  els.startSequenceButton.textContent = "スタート";
  els.resetSequenceButton.disabled = false;
  renderSequenceLabels();
  renderSequenceBoard();
  renderSequenceIntro();
}

function startSequenceGame() {
  clearTimeout(state.sequenceTimer);
  state.sequenceLength = SEQUENCE_START_LENGTH;
  state.sequenceBestLength = 0;
  state.sequenceRunning = true;
  els.startSequenceButton.disabled = true;
  els.startSequenceButton.textContent = "チャレンジ中";
  nextSequenceRound();
}

function nextSequenceRound() {
  state.sequencePattern = [];
  for (let i = 0; i < state.sequenceLength; i += 1) {
    let next = rand(0, SEQUENCE_CELL_COUNT - 1);
    while (next === state.sequencePattern[i - 1]) {
      next = rand(0, SEQUENCE_CELL_COUNT - 1);
    }
    state.sequencePattern.push(next);
  }
  state.sequenceInputIndex = 0;
  state.sequenceShowing = true;
  state.sequenceLitIndex = -1;
  renderSequenceLabels();
  renderSequenceBoard();
  showSequenceStep(0);
}

function showSequenceStep(stepIndex) {
  if (!state.sequenceRunning) return;
  if (stepIndex >= state.sequencePattern.length) {
    state.sequenceLitIndex = -1;
    state.sequenceShowing = false;
    renderSequenceLabels();
    renderSequenceBoard();
    return;
  }

  state.sequenceLitIndex = state.sequencePattern[stepIndex];
  renderSequenceBoard();
  state.sequenceTimer = setTimeout(() => {
    state.sequenceLitIndex = -1;
    renderSequenceBoard();
    state.sequenceTimer = setTimeout(() => showSequenceStep(stepIndex + 1), 170);
  }, 520);
}

function renderSequenceBoard() {
  els.sequenceBoard.innerHTML = "";
  for (let index = 0; index < SEQUENCE_CELL_COUNT; index += 1) {
    const button = document.createElement("button");
    button.className = "memory-cell";
    button.type = "button";
    button.dataset.index = String(index);
    button.disabled = !state.sequenceRunning || state.sequenceShowing;
    button.setAttribute("aria-label", `マス ${index + 1}`);
    if (state.sequenceLitIndex === index) button.classList.add("lit");
    button.addEventListener("click", () => pressSequenceCell(index, button));
    els.sequenceBoard.append(button);
  }
}

function pressSequenceCell(index, button) {
  if (!state.sequenceRunning || state.sequenceShowing) return;
  if (index !== state.sequencePattern[state.sequenceInputIndex]) {
    button.classList.add("miss");
    playWrongSound();
    finishSequenceGame(false);
    return;
  }

  button.classList.add("done");
  playCorrectSound();
  state.sequenceInputIndex += 1;
  if (state.sequenceInputIndex < state.sequencePattern.length) {
    return;
  }

  state.sequenceBestLength = Math.max(state.sequenceBestLength, state.sequenceLength);
  if (state.sequenceLength >= SEQUENCE_MAX_LENGTH) {
    finishSequenceGame(true);
    return;
  }

  state.sequenceLength += 1;
  renderSequenceLabels();
  els.sequenceResultPanel.innerHTML = "<h3>いいね！</h3><p>次は少し長い順番です。</p>";
  state.sequenceTimer = setTimeout(nextSequenceRound, 850);
}

function finishSequenceGame(clearedMax) {
  clearTimeout(state.sequenceTimer);
  state.sequenceRunning = false;
  state.sequenceShowing = false;
  state.sequenceLitIndex = -1;
  const score = state.sequenceBestLength;
  const previous = bestSequenceRecord(state.data.currentPlayerId);
  const isNewRecord = !previous || score > previous.score;
  const record = {
    id: createId(),
    playerId: state.data.currentPlayerId,
    playerName: currentPlayer().name,
    levelId: "sequence-memory",
    mode: "sequence",
    score,
    seconds: 0,
    createdAt: new Date().toISOString(),
  };
  if (score > 0) {
    state.data.records.push(record);
    saveData();
  }
  els.startSequenceButton.disabled = false;
  els.startSequenceButton.textContent = "もういちど";
  renderSequenceLabels();
  renderSequenceBoard();
  renderSequenceResult(score, isNewRecord, previous, clearedMax);
  renderRanking();
  if (score > 0 && isNewRecord) celebrate();
}

function renderSequenceLabels() {
  const player = currentPlayer();
  const best = bestSequenceRecord(state.data.currentPlayerId);
  els.sequencePlayerLabel.textContent = `${player ? player.name : ""} / ベスト ${best ? `${best.score}こ` : "まだ記録なし"}`;
  els.sequenceLevelLabel.textContent = `${state.sequenceLength}こ`;
  els.sequenceStatusLabel.textContent = state.sequenceShowing ? "見て覚える" : state.sequenceRunning ? "順番に押す" : "スタート前";
}

function renderSequenceIntro() {
  const best = bestSequenceRecord(state.data.currentPlayerId);
  els.sequenceResultPanel.innerHTML = `
    <h3>${best ? "ベスト" : "あそび方"}</h3>
    <p>${best ? `${currentPlayer().name}のベストは ${best.score}こ です。` : "光った順番を覚えて、同じ順番で押します。正解すると次は少し長くなります。"}</p>
  `;
}

function renderSequenceResult(score, isNewRecord, previous, clearedMax) {
  const title = isNewRecord && score > 0 ? "New Record!" : clearedMax ? "クリア！" : "そこまで！";
  const detail = score > 0
    ? `${score}こまで覚えました。${isNewRecord ? "自分のベストを更新しました。" : previous ? `ベストは ${previous.score}こ です。` : ""}`
    : "まずは3この順番から、もう一度やってみよう。";
  els.sequenceResultPanel.innerHTML = `<h3>${title}</h3><p>${detail}</p>`;
}

function resetFlashGame() {
  clearTimeout(state.flashTimer);
  state.flashRound = 0;
  state.flashScore = 0;
  state.flashTargets = [];
  state.flashInputNumber = 1;
  state.flashShowing = false;
  state.flashRunning = false;
  els.startFlashButton.disabled = false;
  els.startFlashButton.textContent = "スタート";
  els.resetFlashButton.disabled = false;
  renderFlashLabels();
  renderFlashBoard();
  renderFlashIntro();
}

function startFlashGame() {
  clearTimeout(state.flashTimer);
  state.flashRound = 0;
  state.flashScore = 0;
  state.flashRunning = true;
  els.startFlashButton.disabled = true;
  els.startFlashButton.textContent = "チャレンジ中";
  nextFlashRound();
}

function nextFlashRound() {
  state.flashRound += 1;
  state.flashInputNumber = 1;
  const count = Math.min(3 + state.flashRound, FLASH_CELL_COUNT);
  const cells = shuffle(Array.from({ length: FLASH_CELL_COUNT }, (_, index) => index)).slice(0, count);
  state.flashTargets = cells.map((cell, index) => ({ cell, number: index + 1 }));
  state.flashShowing = true;
  renderFlashLabels();
  renderFlashBoard();
  state.flashTimer = setTimeout(() => {
    state.flashShowing = false;
    renderFlashLabels();
    renderFlashBoard();
  }, state.flashLevel.revealMs);
}

function renderFlashBoard() {
  els.flashBoard.innerHTML = "";
  for (let index = 0; index < FLASH_CELL_COUNT; index += 1) {
    const target = state.flashTargets.find((item) => item.cell === index);
    const button = document.createElement("button");
    button.className = "memory-cell flash-cell";
    button.type = "button";
    button.dataset.index = String(index);
    button.disabled = !state.flashRunning || state.flashShowing;
    button.setAttribute("aria-label", `マス ${index + 1}`);
    if (target && state.flashShowing) {
      button.textContent = target.number;
      button.classList.add("flash-show");
    }
    if (target && target.number < state.flashInputNumber && !state.flashShowing) button.classList.add("done");
    button.addEventListener("click", () => pressFlashCell(index, button));
    els.flashBoard.append(button);
  }
}

function pressFlashCell(index, button) {
  if (!state.flashRunning || state.flashShowing) return;
  const target = state.flashTargets.find((item) => item.number === state.flashInputNumber);
  if (!target || target.cell !== index) {
    button.classList.add("miss");
    playWrongSound();
    finishFlashGame();
    return;
  }

  button.classList.add("done");
  playCorrectSound();
  state.flashInputNumber += 1;
  if (state.flashInputNumber <= state.flashTargets.length) {
    renderFlashLabels();
    renderFlashBoard();
    return;
  }

  state.flashScore += 1;
  if (state.flashRound >= FLASH_ROUNDS) {
    finishFlashGame();
  } else {
    els.flashResultPanel.innerHTML = "<h3>正解！</h3><p>次は数字が少し増えます。</p>";
    state.flashTimer = setTimeout(nextFlashRound, 850);
  }
}

function finishFlashGame() {
  clearTimeout(state.flashTimer);
  state.flashRunning = false;
  state.flashShowing = false;
  const previous = bestFlashRecord(state.data.currentPlayerId);
  const isNewRecord = !previous || state.flashScore > previous.score;
  const record = {
    id: createId(),
    playerId: state.data.currentPlayerId,
    playerName: currentPlayer().name,
    levelId: flashLevelRecordId(state.flashLevel.id),
    mode: "flash",
    score: state.flashScore,
    seconds: 0,
    createdAt: new Date().toISOString(),
  };
  if (state.flashScore > 0) {
    state.data.records.push(record);
    saveData();
  }
  els.startFlashButton.disabled = false;
  els.startFlashButton.textContent = "もういちど";
  renderFlashLabels();
  renderFlashBoard();
  renderFlashResult(state.flashScore, isNewRecord, previous);
  renderRanking();
  if (state.flashScore > 0 && isNewRecord) celebrate();
}

function renderFlashLabels() {
  const player = currentPlayer();
  const best = bestFlashRecord(state.data.currentPlayerId);
  els.flashPlayerLabel.textContent = `${player ? player.name : ""} / ${state.flashLevel.label} / ベスト ${best ? `${best.score}/${FLASH_ROUNDS}` : "まだ記録なし"}`;
  els.flashRoundLabel.textContent = `${state.flashRound} / ${FLASH_ROUNDS}`;
  els.flashStatusLabel.textContent = state.flashShowing ? "見て覚える" : state.flashRunning ? `${state.flashInputNumber}から押す` : "スタート前";
}

function renderFlashIntro() {
  const best = bestFlashRecord(state.data.currentPlayerId);
  els.flashResultPanel.innerHTML = `
    <h3>${best ? `${state.flashLevel.label}のベスト` : "あそび方"}</h3>
    <p>${best ? `${currentPlayer().name}の${state.flashLevel.label}ベストは ${best.score}/${FLASH_ROUNDS} です。` : "数字が一瞬だけ出ます。消えたあと、1から順番に場所を押します。中級・上級は表示時間が短くなります。"}</p>
  `;
}

function renderFlashResult(score, isNewRecord, previous) {
  els.flashResultPanel.innerHTML = `
    <h3>${isNewRecord ? "New Record!" : "おしまい！"}</h3>
    <p>${score}/${FLASH_ROUNDS} 正解。${isNewRecord ? "自分のベストを更新しました。" : previous ? `ベストは ${previous.score}/${FLASH_ROUNDS} です。` : ""}</p>
  `;
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

function bestVisionRecord(playerId) {
  return state.data.records
    .filter((record) => record.levelId === "vision-grid" && record.mode === "vision" && record.playerId === playerId)
    .sort((a, b) => a.seconds - b.seconds)[0];
}

function bestReactionRecord(playerId) {
  return state.data.records
    .filter((record) => record.levelId === "reaction-tap" && record.mode === "reaction" && record.playerId === playerId)
    .sort((a, b) => a.seconds - b.seconds)[0];
}

function bestSequenceRecord(playerId) {
  return state.data.records
    .filter((record) => record.levelId === "sequence-memory" && record.mode === "sequence" && record.playerId === playerId)
    .sort(compareScoreRecords)[0];
}

function bestFlashRecord(playerId) {
  return state.data.records
    .filter((record) => record.levelId === flashLevelRecordId(state.flashLevel.id) && record.mode === "flash" && record.playerId === playerId)
    .sort(compareScoreRecords)[0];
}

function flashLevelRecordId(levelId) {
  return `flash-memory-${levelId}`;
}

function compareRecords(a, b) {
  if (b.score !== a.score) return b.score - a.score;
  return a.seconds - b.seconds;
}

function compareScoreRecords(a, b) {
  if (b.score !== a.score) return b.score - a.score;
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

function renderRanking() {
  const [levelId, mode] = els.rankingLevelSelect.value.split(":");
  const recordsByPlayer = new Map();
  state.data.records
    .filter((record) => record.levelId === levelId && record.mode === mode)
    .sort(["vision", "reaction"].includes(mode) ? (a, b) => a.seconds - b.seconds : ["sequence", "flash"].includes(mode) ? compareScoreRecords : compareRecords)
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
      <span class="rank-score">${rankingScoreLabel(record, mode)}</span>
    `;
    els.rankingList.append(row);
  });
}

function rankingScoreLabel(record, mode) {
  if (["vision", "reaction"].includes(mode)) return formatSeconds(record.seconds);
  if (mode === "sequence") return `${record.score}こ`;
  if (mode === "flash") return `${record.score}/${FLASH_ROUNDS}`;
  return `${record.score}/10・${formatTime(record.seconds)}`;
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
  if (name !== "quiz") clearInterval(state.timer);
  if (name !== "vision") {
    clearInterval(state.visionTimer);
    state.visionRunning = false;
  }
  if (name !== "reaction") {
    clearTimeout(state.reactionTimer);
    state.reactionRunning = false;
    state.reactionWaiting = false;
  }
  if (name !== "sequence") {
    clearTimeout(state.sequenceTimer);
    state.sequenceRunning = false;
    state.sequenceShowing = false;
  }
  if (name !== "flash") {
    clearTimeout(state.flashTimer);
    state.flashRunning = false;
    state.flashShowing = false;
  }
  Object.entries(screens).forEach(([key, screen]) => {
    screen.classList.toggle("active", key === name);
  });
  document.body.classList.toggle("quiz-active", name === "quiz");
  const labels = {
    home: ["まなびトレーニング", "きょうのチャレンジ"],
    mathHome: ["1・2年生のさんすう", "さんすう10もんチャレンジ"],
    vision: ["数字タップ", "1から25チャレンジ"],
    reaction: ["反射タップ", "光ったマスをタップ"],
    sequence: ["順番記憶", "光った順番を覚える"],
    flash: ["フラッシュ記憶", "一瞬の数字を覚える"],
    quiz: ["1・2年生のさんすう", "さんすう10もんチャレンジ"],
    result: ["1・2年生のさんすう", "できた！"],
    ranking: ["きろく", "ランキング"],
  };
  els.topEyebrow.textContent = labels[name][0];
  els.topTitle.textContent = labels[name][1];
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

function formatSeconds(seconds) {
  return `${Number(seconds).toFixed(1)}秒`;
}

function shuffle(items) {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
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
