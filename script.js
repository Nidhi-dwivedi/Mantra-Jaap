const MAX_COUNT = 108;
const STORAGE_KEY = "mantra_jaap_state_v5";
const MIN_FOCUS_SECONDS = 60;
const MAX_FOCUS_SECONDS = 60 * 60;

const elements = {
  themeToggle: document.getElementById("themeToggle"),
  mantraSelect: document.getElementById("mantraSelect"),
  customMantra: document.getElementById("customMantra"),
  saveBtn: document.getElementById("saveBtn"),
  translitToggle: document.getElementById("translitToggle"),
  hapticToggle: document.getElementById("hapticToggle"),
  mantraSanskrit: document.getElementById("mantraSanskrit"),
  mantraTranslit: document.getElementById("mantraTranslit"),
  count: document.getElementById("count"),
  counter: document.getElementById("counter"),
  progressCircle: document.getElementById("progressCircle"),
  chantBtn: document.getElementById("chantBtn"),
  resetBtn: document.getElementById("resetBtn"),
  completionMessage: document.getElementById("completionMessage"),
  streakCount: document.getElementById("streakCount"),
  focusBox: document.getElementById("focusBox"),
  focusSelect: document.getElementById("focusSelect"),
  focusToggleBtn: document.getElementById("focusToggleBtn"),
  focusMinusBtn: document.getElementById("focusMinusBtn"),
  focusPlusBtn: document.getElementById("focusPlusBtn"),
  focusResetBtn: document.getElementById("focusResetBtn"),
  focusExtras: document.getElementById("focusExtras"),
  focusTime: document.getElementById("focusTime"),
  alarmSelect: document.getElementById("alarmSelect"),
  goalSelect: document.getElementById("goalSelect"),
  goalFill: document.getElementById("goalFill"),
  goalMeta: document.getElementById("goalMeta"),
  sessionCount: document.getElementById("sessionCount"),
  sessionRate: document.getElementById("sessionRate"),
  sessionResetBtn: document.getElementById("sessionResetBtn"),
  openSettingsBtn: document.getElementById("openSettingsBtn"),
  openToolsBtn: document.getElementById("openToolsBtn"),
  closeSettingsBtn: document.getElementById("closeSettingsBtn"),
  closeToolsBtn: document.getElementById("closeToolsBtn"),
  settingsSheet: document.getElementById("settingsSheet"),
  toolsSheet: document.getElementById("toolsSheet"),
  sheetBackdrop: document.getElementById("sheetBackdrop"),
};

const mantras = {
  gayatri: {
    sanskrit:
      "\u0950 \u092d\u0942\u0930\u094d\u092d\u0941\u0935\u0903 \u0938\u094d\u0935\u0903\n" +
      "\u0924\u0924\u094d\u0938\u0935\u093f\u0924\u0941\u0930\u094d\u0935\u0930\u0947\u0923\u094d\u092f\u0902\n" +
      "\u092d\u0930\u094d\u0917\u094b \u0926\u0947\u0935\u0938\u094d\u092f \u0927\u0940\u092e\u0939\u093f\n" +
      "\u0927\u093f\u092f\u094b \u092f\u094b \u0928\u0903 \u092a\u094d\u0930\u091a\u094b\u0926\u092f\u093e\u0924\u094d",
    translit:
      "Om bhur bhuvah svah\n" +
      "Tat savitur varenyam\n" +
      "Bhargo devasya dhimahi\n" +
      "Dhiyo yo nah prachodayat",
  },
  krishna: {
    sanskrit:
      "\u0939\u0930\u0947 \u0915\u0943\u0937\u094d\u0923 \u0939\u0930\u0947 \u0915\u0943\u0937\u094d\u0923\n" +
      "\u0915\u0943\u0937\u094d\u0923 \u0915\u0943\u0937\u094d\u0923 \u0939\u0930\u0947 \u0939\u0930\u0947\n" +
      "\u0939\u0930\u0947 \u0930\u093e\u092e \u0939\u0930\u0947 \u0930\u093e\u092e\n" +
      "\u0930\u093e\u092e \u0930\u093e\u092e \u0939\u0930\u0947 \u0939\u0930\u0947",
    translit:
      "Hare Krishna Hare Krishna\n" +
      "Krishna Krishna Hare Hare\n" +
      "Hare Rama Hare Rama\n" +
      "Rama Rama Hare Hare",
  },
};

const state = {
  count: 0,
  selectedMantra: "",
  customMantra: "",
  showTranslit: true,
  hapticsOn: true,
  theme: "light",
  streak: 0,
  lastChantDate: "",
  focusPresetMinutes: 5,
  focusRemaining: 300,
  focusRunning: false,
  dailyGoal: 108,
  dailyTotal: 0,
  dailyDate: "",
  sessionCount: 0,
  sessionStartedAt: 0,
  focusAlarm: "soft",
};

let chantLocked = false;
let focusInterval = null;
let audioContext = null;

const radius = Number(elements.progressCircle.getAttribute("r"));
const circumference = 2 * Math.PI * radius;
elements.progressCircle.style.strokeDasharray = `${circumference}`;

init();

function init() {
  loadState();
  bindEvents();
  renderAll();
  if (state.focusRunning) startFocusInterval();
}

function bindEvents() {
  elements.themeToggle.addEventListener("click", onThemeToggle);
  elements.mantraSelect.addEventListener("change", onMantraChange);
  elements.saveBtn.addEventListener("click", onSaveCustomMantra);
  elements.translitToggle.addEventListener("change", onTranslitToggle);
  elements.hapticToggle.addEventListener("change", onHapticToggle);
  elements.chantBtn.addEventListener("click", onChant);
  elements.resetBtn.addEventListener("click", onResetCount);
  elements.focusSelect.addEventListener("change", onFocusPresetChange);
  elements.focusToggleBtn.addEventListener("click", onFocusToggle);
  elements.focusMinusBtn.addEventListener("click", () => onAdjustFocus(-60));
  elements.focusPlusBtn.addEventListener("click", () => onAdjustFocus(60));
  elements.focusResetBtn.addEventListener("click", onFocusReset);
  elements.alarmSelect.addEventListener("change", onAlarmChange);
  elements.goalSelect.addEventListener("change", onGoalChange);
  elements.sessionResetBtn.addEventListener("click", onSessionReset);
  elements.openSettingsBtn.addEventListener("click", () => openSheet("settings"));
  elements.openToolsBtn.addEventListener("click", () => openSheet("tools"));
  elements.closeSettingsBtn.addEventListener("click", closeSheets);
  elements.closeToolsBtn.addEventListener("click", closeSheets);
  elements.sheetBackdrop.addEventListener("click", closeSheets);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeSheets();
  });
}

function openSheet(type) {
  const showSettings = type === "settings";
  elements.settingsSheet.classList.toggle("hidden", !showSettings);
  elements.toolsSheet.classList.toggle("hidden", showSettings);
  elements.sheetBackdrop.classList.remove("hidden");
}

function closeSheets() {
  elements.settingsSheet.classList.add("hidden");
  elements.toolsSheet.classList.add("hidden");
  elements.sheetBackdrop.classList.add("hidden");
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    Object.assign(state, saved);
    state.focusRemaining = clamp(state.focusRemaining, MIN_FOCUS_SECONDS, MAX_FOCUS_SECONDS);
    normalizeDailyState();
  } catch (_error) {
    // keep defaults on parse/storage issues
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (_error) {
    // ignore storage failures gracefully
  }
}

function renderAll() {
  document.body.setAttribute("data-theme", state.theme);
  elements.themeToggle.textContent = state.theme === "dark" ? "\u2600" : "\u263D";
  elements.themeToggle.setAttribute(
    "aria-label",
    state.theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
  );
  elements.themeToggle.title = state.theme === "dark" ? "Light Mode" : "Dark Mode";

  elements.mantraSelect.value = state.selectedMantra;
  elements.customMantra.value = state.customMantra;
  elements.customMantra.classList.toggle("hidden", state.selectedMantra !== "custom");
  elements.saveBtn.classList.toggle("hidden", state.selectedMantra !== "custom");

  elements.translitToggle.checked = state.showTranslit;
  elements.hapticToggle.checked = state.hapticsOn;

  elements.count.textContent = String(state.count);
  renderProgress();
  renderCompletionMessage();
  renderMantra();
  renderStreak();
  renderFocus();
  renderGoal();
  renderSession();
  renderChantButtonState();
}

function renderMantra() {
  if (!state.selectedMantra) {
    elements.mantraSanskrit.textContent = "Choose a mantra and begin your sadhana.";
    elements.mantraTranslit.textContent = "";
    return;
  }

  if (state.selectedMantra === "custom") {
    if (!state.customMantra.trim()) {
      elements.mantraSanskrit.textContent = "Write and save your mantra.";
      elements.mantraTranslit.textContent = "";
    } else {
      elements.mantraSanskrit.textContent = state.customMantra;
      elements.mantraTranslit.textContent = state.showTranslit ? "Custom mantra transliteration: add as needed." : "";
    }
    return;
  }

  const mantra = mantras[state.selectedMantra];
  elements.mantraSanskrit.textContent = mantra.sanskrit;
  elements.mantraTranslit.textContent = state.showTranslit ? mantra.translit : "";
}

function renderProgress() {
  const ratio = Math.min(state.count / MAX_COUNT, 1);
  elements.progressCircle.style.strokeDashoffset = `${circumference - ratio * circumference}`;
}

function renderCompletionMessage() {
  const completed = state.count >= MAX_COUNT;
  elements.completionMessage.textContent = completed ? "One mala completed \uD83D\uDE4F" : "";
  elements.completionMessage.classList.toggle("show", completed);
}

function renderStreak() {
  elements.streakCount.textContent = String(state.streak || 0);
}

function renderGoal() {
  elements.goalSelect.value = String(state.dailyGoal);
  const ratio = Math.min(state.dailyTotal / state.dailyGoal, 1);
  elements.goalFill.style.width = `${ratio * 100}%`;
  const remaining = Math.max(0, state.dailyGoal - state.dailyTotal);
  elements.goalMeta.textContent =
    remaining === 0
      ? `${state.dailyTotal} / ${state.dailyGoal} today - Goal complete`
      : `${state.dailyTotal} / ${state.dailyGoal} today - ${remaining} left`;
}

function renderSession() {
  elements.sessionCount.textContent = `${state.sessionCount} chants`;
  const pace = getSessionPace();
  elements.sessionRate.textContent = `${pace.toFixed(1)} chants/min`;
}

function renderFocus() {
  elements.focusSelect.value = String(state.focusPresetMinutes);
  elements.focusTime.textContent = formatTime(state.focusRemaining);
  elements.focusToggleBtn.textContent = state.focusRunning ? "Pause" : "Start";
  elements.focusExtras.classList.toggle("hidden", !state.focusRunning);
  elements.alarmSelect.value = state.focusAlarm;
}

function renderChantButtonState() {
  elements.chantBtn.disabled = chantLocked || state.count >= MAX_COUNT;
}

function onThemeToggle() {
  state.theme = state.theme === "light" ? "dark" : "light";
  saveState();
  renderAll();
}

function onMantraChange() {
  state.selectedMantra = elements.mantraSelect.value;
  state.count = 0;
  saveState();
  renderAll();
}

function onSaveCustomMantra() {
  const text = elements.customMantra.value.trim();
  if (!text) {
    alert("Please write a mantra first.");
    return;
  }
  state.customMantra = text;
  saveState();
  renderMantra();
}

function onTranslitToggle() {
  state.showTranslit = elements.translitToggle.checked;
  saveState();
  renderMantra();
}

function onHapticToggle() {
  state.hapticsOn = elements.hapticToggle.checked;
  saveState();
}

function onChant() {
  if (!state.selectedMantra) {
    alert("Select a mantra first.");
    return;
  }

  if (state.selectedMantra === "custom" && !state.customMantra.trim()) {
    alert("Save your custom mantra first.");
    return;
  }

  if (chantLocked || state.count >= MAX_COUNT) return;
  chantLocked = true;
  renderChantButtonState();
  setTimeout(() => {
    chantLocked = false;
    renderChantButtonState();
  }, 200);

  state.count += 1;
  incrementDailyTotal();
  incrementSessionTotal();
  updateStreakForToday();
  pulseCounter();
  playChantSound();
  vibratePhone(14);

  if (state.count === MAX_COUNT) playBellSound();

  saveState();
  renderAll();
}

function onResetCount() {
  state.count = 0;
  saveState();
  renderAll();
}

function onGoalChange() {
  state.dailyGoal = Number(elements.goalSelect.value);
  saveState();
  renderGoal();
}

function onSessionReset() {
  state.sessionCount = 0;
  state.sessionStartedAt = 0;
  saveState();
  renderSession();
}

function pulseCounter() {
  elements.counter.classList.remove("pop");
  void elements.counter.offsetWidth;
  elements.counter.classList.add("pop");
}

function onFocusPresetChange() {
  state.focusPresetMinutes = Number(elements.focusSelect.value);
  if (!state.focusRunning) {
    state.focusRemaining = state.focusPresetMinutes * 60;
  }
  saveState();
  renderFocus();
}

function onFocusToggle() {
  if (state.focusRunning) {
    state.focusRunning = false;
    stopFocusInterval();
    saveState();
    renderFocus();
    return;
  }

  if (state.focusRemaining <= 0) {
    state.focusRemaining = state.focusPresetMinutes * 60;
  }

  state.focusRunning = true;
  startFocusInterval();
  saveState();
  renderFocus();
}

function onFocusReset() {
  state.focusRunning = false;
  stopFocusInterval();
  state.focusRemaining = state.focusPresetMinutes * 60;
  saveState();
  renderFocus();
}

function onAlarmChange() {
  state.focusAlarm = elements.alarmSelect.value;
  saveState();
}

function onAdjustFocus(deltaSeconds) {
  state.focusRemaining = clamp(state.focusRemaining + deltaSeconds, MIN_FOCUS_SECONDS, MAX_FOCUS_SECONDS);
  saveState();
  renderFocus();
}

function startFocusInterval() {
  if (focusInterval) return;
  focusInterval = setInterval(() => {
    if (!state.focusRunning) return;

    if (state.focusRemaining > 0) {
      state.focusRemaining -= 1;
      renderFocus();
      saveState();
      return;
    }

    state.focusRunning = false;
    stopFocusInterval();
    playMeditationAlarm();
    vibratePhone(100);
    focusFinishAnimation();
    saveState();
    renderFocus();
  }, 1000);
}

function stopFocusInterval() {
  if (!focusInterval) return;
  clearInterval(focusInterval);
  focusInterval = null;
}

function focusFinishAnimation() {
  elements.focusBox.classList.remove("done");
  void elements.focusBox.offsetWidth;
  elements.focusBox.classList.add("done");
}

function updateStreakForToday() {
  const today = isoDateToday();
  if (state.lastChantDate === today) return;
  if (state.lastChantDate === isoDateDaysAgo(1)) state.streak += 1;
  else state.streak = 1;
  state.lastChantDate = today;
}

function incrementDailyTotal() {
  normalizeDailyState();
  state.dailyTotal += 1;
}

function normalizeDailyState() {
  const today = isoDateToday();
  if (state.dailyDate === today) return;
  state.dailyDate = today;
  state.dailyTotal = 0;
}

function incrementSessionTotal() {
  if (!state.sessionStartedAt) {
    state.sessionStartedAt = Date.now();
  }
  state.sessionCount += 1;
}

function getSessionPace() {
  if (!state.sessionStartedAt || state.sessionCount === 0) return 0;
  const elapsedMs = Date.now() - state.sessionStartedAt;
  const elapsedMinutes = Math.max(elapsedMs / 60000, 1 / 60);
  return state.sessionCount / elapsedMinutes;
}

function isoDateToday() {
  return new Date().toISOString().slice(0, 10);
}

function isoDateDaysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function formatTime(totalSeconds) {
  const safe = Math.max(totalSeconds, 0);
  const min = Math.floor(safe / 60)
    .toString()
    .padStart(2, "0");
  const sec = Math.floor(safe % 60)
    .toString()
    .padStart(2, "0");
  return `${min}:${sec}`;
}

function getAudioContext() {
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtor) return null;
  if (!audioContext) audioContext = new AudioCtor();
  return audioContext;
}

function playChantSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume();

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(560, now);
  osc.frequency.exponentialRampToValueAtTime(760, now + 0.08);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.05, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.13);
}

function playBellSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume();

  const now = ctx.currentTime;
  [660, 990].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const start = now + i * 0.03;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.03, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.45);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.5);
  });
}

function playMeditationAlarm() {
  if (state.focusAlarm === "chime") {
    playChimeSound();
    return;
  }
  if (state.focusAlarm === "temple") {
    playTempleBellSound();
    return;
  }
  playBellSound();
}

function playTempleBellSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume();

  const now = ctx.currentTime;
  [432, 648, 864].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const start = now + i * 0.05;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.04, start + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.9);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.95);
  });
}

function playChimeSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume();

  const now = ctx.currentTime;
  [784, 988].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = freq;
    const start = now + i * 0.08;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.03, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.55);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.6);
  });
}

function vibratePhone(ms) {
  if (!state.hapticsOn) return;
  if (typeof navigator.vibrate === "function") navigator.vibrate(ms);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
