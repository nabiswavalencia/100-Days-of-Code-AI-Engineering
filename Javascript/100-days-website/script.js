/* Journal behavior: entries are saved locally and shown in the daily record. */
const STORAGE_KEY = "ai-engineering-100-days-journals";
const START_DATE = new Date("2026-08-23T00:00:00");

const seedEntries = [
  {
    id: 1,
    day: 1,
    date: "2026-08-23",
    title: "Set up the journey",
    content: "Created the repository structure, defined the 100-day goal, and prepared the learning environment.",
    recovery: "",
    completed: true,
    hours: 2
  }
];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
let entries = loadEntries();
let selectedCalendarDay = null;

function loadEntries() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) && saved.length ? saved : seedEntries;
  } catch {
    return seedEntries;
  }
}

function saveEntries() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function formatDate(value) {
  if (!value) return "No date set";
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date(`${value}T00:00:00`));
}

function getStatus(entry) {
  if (entry.completed) return { label: "Complete", className: "" };
  if (entry.recovery?.trim()) return { label: "Needs another try", className: "recovery" };
  return { label: "Not started", className: "open" };
}

function nextDate(day) {
  const date = new Date(START_DATE);
  date.setDate(date.getDate() + Number(day) - 1);
  return date.toISOString().slice(0, 10);
}

function render() {
  renderJournals();
  renderRecent();
  renderCalendar();
  renderStats();
}

function renderJournals() {
  const container = $("#journals");
  const ordered = [...entries].sort((a, b) => b.day - a.day);
  $("#journal-count").textContent = `${entries.length} ${entries.length === 1 ? "entry" : "entries"}`;
  if (!ordered.length) {
    container.innerHTML = '<div class="content-panel"><p>No journal entries yet. Add your first day to begin the stream.</p></div>';
    return;
  }
  container.innerHTML = ordered.map((entry, index) => {
    const status = getStatus(entry);
    return `<article class="journal-card ${index === 0 ? "featured" : ""}" data-id="${entry.id}">
      <div class="journal-meta"><span>DAY ${String(entry.day).padStart(2, "0")}</span><span class="status-badge ${status.className}">${status.label}</span></div>
      <h3>${escapeHtml(entry.title)}</h3>
      <p>${escapeHtml(entry.content || "No reflection added yet.")}</p>
      <time datetime="${entry.date}">${formatDate(entry.date)}</time>
      <div class="card-actions">
        <button type="button" data-action="edit" data-id="${entry.id}">Edit</button>
        <button type="button" data-action="complete" data-id="${entry.id}">${entry.completed ? "Reopen" : "Mark complete"}</button>
        <button type="button" data-action="delete" data-id="${entry.id}">Delete</button>
      </div>
    </article>`;
  }).join("");
}

function renderRecent() {
  const container = $("#recent-list");
  const recent = [...entries].sort((a, b) => b.day - a.day).slice(0, 5);
  container.innerHTML = recent.length ? recent.map((entry) => `<div class="recent-item"><div><strong>Day ${entry.day}: ${escapeHtml(entry.title)}</strong><p>${formatDate(entry.date)}</p></div><span class="status-badge ${getStatus(entry).className}">${getStatus(entry).label}</span></div>`).join("") : '<div class="content-panel"><p>Your recent entries will appear here.</p></div>';
}

function renderCalendar() {
  const grid = $("#calendar-grid");
  grid.innerHTML = Array.from({ length: 100 }, (_, index) => {
    const day = index + 1;
    const entry = entries.find((item) => Number(item.day) === day);
    const status = entry ? getStatus(entry) : { label: "Open", className: "open" };
    const selected = selectedCalendarDay === day ? "selected" : "";
    return `<button type="button" class="day-cell ${status.label === "Complete" ? "complete" : status.label === "Needs another try" ? "recovery" : ""} ${selected}" data-calendar-day="${day}"><strong>${String(day).padStart(2, "0")}</strong><small>${status.label === "Complete" ? "done" : status.label === "Needs another try" ? "try again" : "open"}</small></button>`;
  }).join("");
  const complete = entries.filter((entry) => entry.completed).length;
  $("#calendar-summary").textContent = `${complete} / 100 complete`;
  renderCalendarDetail();
}

function renderCalendarDetail() {
  const detail = $("#calendar-detail");
  if (!selectedCalendarDay) {
    detail.innerHTML = "<p>Select a day to inspect or edit its journal entry.</p>";
    return;
  }
  const entry = entries.find((item) => Number(item.day) === selectedCalendarDay);
  if (!entry) {
    detail.innerHTML = `<p>Day ${selectedCalendarDay} is open. <button class="primary-btn" type="button" data-action="new-for-day" data-id="${selectedCalendarDay}">Add this day</button></p>`;
    return;
  }
  detail.innerHTML = `<p><strong>Day ${entry.day} · ${escapeHtml(entry.title)}</strong><br>${escapeHtml(entry.content || "No reflection yet.")}<br><button class="ghost-btn" type="button" data-action="edit" data-id="${entry.id}">Edit this entry</button></p>`;
}

function renderStats() {
  const completed = entries.filter((entry) => entry.completed).length;
  const hours = entries.reduce((sum, entry) => sum + Number(entry.hours || 0), 0);
  $("#progress-number").innerHTML = `${String(completed).padStart(2, "0")}<span>/100</span>`;
  $("#progress-bar").style.width = `${completed}%`;
  $("#progress-label").textContent = `${completed}% logged`;
  $("#current-day").textContent = `DAY ${String(Math.min(completed + 1, 100)).padStart(2, "0")}`;
  $("#total-hours").textContent = `${String(hours).padStart(2, "0")}h`;
}

function openDialog(entry = null, day = null) {
  const form = $("#journal-form");
  const targetDay = day || entry?.day || (Math.max(0, ...entries.map((item) => Number(item.day))) + 1);
  $("#dialog-kicker").textContent = entry ? "EDIT ENTRY" : "NEW ENTRY";
  $("#dialog-title").textContent = entry ? `Edit day ${entry.day}` : `Add day ${targetDay}`;
  $("#entry-id").value = entry?.id || "";
  $("#entry-day").value = entry?.day || targetDay;
  $("#entry-date").value = entry?.date || nextDate(targetDay);
  $("#entry-title").value = entry?.title || `Day ${targetDay} checkpoint`;
  $("#entry-content").value = entry?.content || "";
  $("#entry-recovery").value = entry?.recovery || "";
  $("#delete-entry-btn").style.display = entry ? "inline-flex" : "none";
  $("#journal-dialog").showModal();
  setTimeout(() => $("#entry-title").focus(), 0);
}

function closeDialog() { $("#journal-dialog").close(); }

function handleFormSubmit(event) {
  event.preventDefault();
  const id = Number($("#entry-id").value);
  const updated = {
    id: id || Date.now(),
    day: Number($("#entry-day").value),
    date: $("#entry-date").value,
    title: $("#entry-title").value.trim(),
    content: $("#entry-content").value.trim(),
    recovery: $("#entry-recovery").value.trim(),
    completed: id ? Boolean(entries.find((entry) => entry.id === id)?.completed) : false,
    hours: id ? Number(entries.find((entry) => entry.id === id)?.hours || 0) : 0
  };
  const existingIndex = entries.findIndex((entry) => entry.id === id);
  if (existingIndex >= 0) entries[existingIndex] = updated;
  else entries.push(updated);
  saveEntries();
  closeDialog();
  render();
  showToast(`Day ${updated.day} saved.`);
}

function handleAction(action, id) {
  const numericId = Number(id);
  const entry = entries.find((item) => item.id === numericId);
  if (action === "edit" && entry) openDialog(entry);
  if (action === "new-for-day") openDialog(null, numericId);
  if (action === "complete" && entry) {
    entry.completed = !entry.completed;
    if (entry.completed) entry.recovery = "";
    saveEntries(); render(); showToast(entry.completed ? `Day ${entry.day} marked complete.` : `Day ${entry.day} reopened.`);
  }
  if (action === "delete" && entry && window.confirm(`Delete the journal entry for Day ${entry.day}?`)) {
    entries = entries.filter((item) => item.id !== numericId);
    saveEntries(); render(); showToast(`Day ${entry.day} deleted.`);
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;" }[character]));
}

let toastTimer;
function showToast(message) { const toast = $("#toast"); toast.textContent = message; toast.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("show"), 2400); }

$$("[data-section]").forEach((button) => button.addEventListener("click", () => {
  const target = button.dataset.section;
  $$('[data-page-section]').forEach((section) => section.classList.toggle("active", section.id === target));
  $$('[data-section]').forEach((item) => item.classList.toggle("active", item.dataset.section === target));
  window.scrollTo({ top: 0, behavior: "smooth" });
}));

$("#add-day-btn").addEventListener("click", () => openDialog());
$("#journal-form").addEventListener("submit", handleFormSubmit);
$("#close-dialog").addEventListener("click", closeDialog);
$("#cancel-dialog").addEventListener("click", closeDialog);
$("#delete-entry-btn").addEventListener("click", () => { handleAction("delete", $("#entry-id").value); if ($("#journal-dialog").open) closeDialog(); });
$("#journals").addEventListener("click", (event) => { const button = event.target.closest("[data-action]"); if (button) handleAction(button.dataset.action, button.dataset.id); });
$("#calendar-detail").addEventListener("click", (event) => { const button = event.target.closest("[data-action]"); if (button) handleAction(button.dataset.action, button.dataset.id); });
$("#calendar-grid").addEventListener("click", (event) => { const button = event.target.closest("[data-calendar-day]"); if (button) { selectedCalendarDay = Number(button.dataset.calendarDay); renderCalendar(); } });

render();
