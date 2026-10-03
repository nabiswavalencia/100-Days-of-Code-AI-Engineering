const STORAGE_KEY = "daymark-timers";
const $ = (selector) => document.querySelector(selector);
let timers = loadTimers();
let toastTimer;

function loadTimers() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch { return []; }
}

function saveTimers() { localStorage.setItem(STORAGE_KEY, JSON.stringify(timers)); }
function localDate(value = new Date()) { const date = new Date(value); return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10); }
function dateAtMidnight(value) { return new Date(`${value}T00:00:00`); }
function formatDate(value) { return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(dateAtMidnight(value)); }
function daysBetween(start, end) { return Math.max(1, Math.ceil((dateAtMidnight(end) - dateAtMidnight(start)) / 86400000) + 1); }
function getProgress(timer) {
  const totalDays = daysBetween(timer.startDate, timer.endDate);
  const elapsedDays = Math.floor((dateAtMidnight(localDate()) - dateAtMidnight(timer.startDate)) / 86400000);
  const daysPassed = Math.min(totalDays, Math.max(0, elapsedDays));
  const currentDay = Math.min(totalDays, daysPassed + 1);
  return { currentDay, totalDays, daysPassed };
}
function getCountdown(timer) {
  const now = new Date();
  const start = dateAtMidnight(timer.startDate);
  const end = new Date(`${timer.endDate}T23:59:59`);
  if (now < start) return { state: "upcoming", days: daysBetween(timer.startDate, timer.endDate), hours: 0, minutes: 0, seconds: 0 };
  if (now >= end) return { state: "complete", days: 0, hours: 0, minutes: 0, seconds: 0 };
  const totalSeconds = Math.max(0, Math.floor((end - now) / 1000));
  return { state: "active", days: Math.floor(totalSeconds / 86400), hours: Math.floor((totalSeconds % 86400) / 3600), minutes: Math.floor((totalSeconds % 3600) / 60), seconds: totalSeconds % 60 };
}

function render() {
  renderClock();
  const grid = $("#timer-grid");
  const ordered = [...timers].sort((a, b) => a.endDate.localeCompare(b.endDate));
  grid.innerHTML = ordered.map((timer, index) => renderTimer(timer, index)).join("");
  $("#empty-state").hidden = timers.length > 0;
  updateStats();
}

function updateLiveCountdowns() {
  document.querySelectorAll(".timer-card").forEach((card) => {
    const timer = timers.find((item) => item.id === card.dataset.id);
    if (!timer) return;
    const countdown = getCountdown(timer);
    const numbers = countdown.state === "complete" ? ["00", "00", "00", "00"] : [countdown.days, countdown.hours, countdown.minutes, countdown.seconds].map((value) => String(value).padStart(2, "0"));
    card.querySelectorAll(".countdown strong").forEach((element, index) => { element.textContent = numbers[index]; });
    card.querySelector(".timer-status").textContent = countdown.state === "upcoming" ? "Starts soon" : countdown.state === "complete" ? "Complete" : "In progress";
    const progress = getProgress(timer);
    card.querySelector(".progress-day").textContent = `Day ${progress.currentDay} / ${progress.totalDays}`;
    card.querySelector(".progress-passed").textContent = `${progress.daysPassed} ${progress.daysPassed === 1 ? "day" : "days"} passed`;
  });
  renderClock();
  updateStats();
}

function renderClock() {
  const now = new Date();
  $("#today-date").textContent = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(now);
  $("#today-time").textContent = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(now);
}

function renderTimer(timer, index) {
  const countdown = getCountdown(timer);
  const label = countdown.state === "upcoming" ? "Starts soon" : countdown.state === "complete" ? "Complete" : "In progress";
  const numbers = countdown.state === "complete" ? ["00", "00", "00", "00"] : [countdown.days, countdown.hours, countdown.minutes, countdown.seconds].map((value) => String(value).padStart(2, "0"));
  const progress = getProgress(timer);
  const color = timer.color || "coral";
  return `<article class="timer-card ${index === 0 ? "featured" : ""}" style="--accent: var(--${color}); --accent-soft: var(--${color}-soft); --accent-deep: var(--${color}-deep)" data-id="${timer.id}">
    <div><div class="timer-meta"><span class="timer-status">${label}</span><span>${daysBetween(timer.startDate, timer.endDate)} day plan</span></div><h3>${escapeHtml(timer.name)}</h3><div class="countdown">${numbers.map((number, item) => `<div><strong>${number}</strong><small>${["days", "hours", "min", "sec"][item]}</small></div>`).join("")}</div><p class="progress-line"><strong class="progress-day">Day ${progress.currentDay} / ${progress.totalDays}</strong><span class="progress-passed">${progress.daysPassed} ${progress.daysPassed === 1 ? "day" : "days"} passed</span></p><p class="date-line">${formatDate(timer.startDate)} — ${formatDate(timer.endDate)}</p></div>
    <div class="timer-actions"><button type="button" data-action="edit">Edit</button><button type="button" data-action="delete">Delete</button></div>
  </article>`;
}

function updateStats() {
  const active = timers.filter((timer) => getCountdown(timer).state === "active");
  $("#active-count").textContent = active.length;
  $("#days-in-motion").textContent = timers.reduce((sum, timer) => sum + daysBetween(timer.startDate, timer.endDate), 0);
  const next = [...timers].sort((a, b) => a.endDate.localeCompare(b.endDate))[0];
  $("#next-finish").textContent = next ? formatDate(next.endDate) : "—";
}

function openDialog(timer = null) {
  $("#timer-form").reset();
  $("#timer-id").value = timer?.id || "";
  $("#dialog-eyebrow").textContent = timer ? "EDIT TIMER" : "NEW TIMER";
  $("#dialog-title").textContent = timer ? "Adjust your finish line" : "Start a challenge";
  $("#timer-name").value = timer?.name || "";
  $("#start-date").value = timer?.startDate || localDate();
  $("#end-date").value = timer?.endDate || localDate(new Date(Date.now() + 99 * 86400000));
  $("#timer-color").value = timer?.color || "coral";
  $("#delete-timer-btn").hidden = !timer;
  $("#form-error").textContent = "";
  $("#timer-dialog").showModal();
  setTimeout(() => $("#timer-name").focus(), 0);
}

function closeDialog() { $("#timer-dialog").close(); }
function handleSubmit(event) {
  event.preventDefault();
  const name = $("#timer-name").value.trim();
  const startDate = $("#start-date").value;
  const endDate = $("#end-date").value;
  if (endDate < startDate) { $("#form-error").textContent = "End date must be after the start date."; return; }
  const id = $("#timer-id").value;
  const timer = { id: id || String(Date.now()), name, startDate, endDate, color: $("#timer-color").value };
  const existingIndex = timers.findIndex((item) => item.id === id);
  if (existingIndex >= 0) timers[existingIndex] = timer; else timers.push(timer);
  saveTimers(); closeDialog(); render(); showToast(id ? "Timer updated." : "Timer added.");
}

function deleteTimer(id) {
  const timer = timers.find((item) => item.id === id);
  if (!timer || !window.confirm(`Delete the ${timer.name} timer?`)) return;
  timers = timers.filter((item) => item.id !== id); saveTimers(); render(); showToast("Timer deleted.");
}

function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;" }[character])); }
function showToast(message) { const toast = $("#toast"); toast.textContent = message; toast.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("show"), 2200); }

$("#add-timer-btn").addEventListener("click", () => openDialog());
$("#timer-form").addEventListener("submit", handleSubmit);
$("#close-dialog").addEventListener("click", closeDialog);
$("#cancel-dialog").addEventListener("click", closeDialog);
$("#delete-timer-btn").addEventListener("click", () => { deleteTimer($("#timer-id").value); if ($("#timer-dialog").open) closeDialog(); });
$("#timer-grid").addEventListener("click", (event) => { const button = event.target.closest("button[data-action]"); if (!button) return; const card = button.closest(".timer-card"); const timer = timers.find((item) => item.id === card.dataset.id); if (button.dataset.action === "edit") openDialog(timer); if (button.dataset.action === "delete") deleteTimer(timer.id); });
$("#widget-toggle").addEventListener("click", () => { document.body.classList.toggle("compact"); $("#widget-toggle").textContent = document.body.classList.contains("compact") ? "↙" : "↗"; });

render();
setInterval(updateLiveCountdowns, 1000);