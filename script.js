const STORAGE_KEY = "study_dashboard_data_v3";
const CONTENT_KEY = "study_dashboard_content_v2";

const defaultData = {
  goal: "CGPA 8.8+",
  subjects: [
    { name: "Mathematics II", result: 0, prep: 0, revisions: 0 },
    { name: "Data Structures", result: 0, prep: 0, revisions: 0 }
  ],
  exams: [{ subject: "Mathematics II", date: "10 Aug 2026", slot: "10:00 AM" }],
  questionBank: [{ title: "Unit-wise PYQ", href: "#" }],
  quotes: [
    "Consistency beats intensity when exams get close.",
    "A planned semester is a stress-free semester."
  ]
};

const defaultContent = {
  siteTitle: "Study Command Center",
  siteSubtitle: "Degree Preparation Dashboard (Editable for Every Semester)",
  heroHeading: "Plan Smarter. Revise Better. Score Higher.",
  heroText:
    "Edit all sections below according to your next semester subjects, timetable, goals, and study strategy.",
  footerText: "Built for your degree success • Stay consistent, stay confident."
};

const totalSubjects = document.getElementById("totalSubjects");
const overallProgress = document.getElementById("overallProgress");
const goalForm = document.getElementById("goalForm");
const goalInput = document.getElementById("goalInput");
const savedGoal = document.getElementById("savedGoal");
const resultTable = document.getElementById("resultTable");
const prepTable = document.getElementById("prepTable");
const revisionTable = document.getElementById("revisionTable");
const examTable = document.getElementById("examTable");
const questionBank = document.getElementById("questionBank");
const quoteText = document.getElementById("quoteText");
const quoteList = document.getElementById("quoteList");

const addSubjectBtn = document.getElementById("addSubjectBtn");
const addExamBtn = document.getElementById("addExamBtn");
const addResourceBtn = document.getElementById("addResourceBtn");
const addQuoteBtn = document.getElementById("addQuoteBtn");
const newQuoteBtn = document.getElementById("newQuoteBtn");

let state = loadState();
let contentState = loadContent();

function loadState() {
  const fromStorage = localStorage.getItem(STORAGE_KEY);
  if (!fromStorage) return structuredClone(defaultData);
  try {
    return { ...structuredClone(defaultData), ...JSON.parse(fromStorage) };
  } catch {
    return structuredClone(defaultData);
  }
}

function loadContent() {
  const fromStorage = localStorage.getItem(CONTENT_KEY);
  if (!fromStorage) return structuredClone(defaultContent);
  try {
    return { ...structuredClone(defaultContent), ...JSON.parse(fromStorage) };
  } catch {
    return structuredClone(defaultContent);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function saveContent() {
  localStorage.setItem(CONTENT_KEY, JSON.stringify(contentState));
}

function clampPercent(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return 0;
  return Math.max(0, Math.min(100, Math.round(num)));
}

function createField({ label, value, type, index, key }) {
  const elementType = type === "number" ? "input" : "div";
  const attrs = type === "number" ? `value="${value}"` : 'contenteditable="true"';

  return `<div class="cell-wrap">
    <div class="cell-label">${label}</div>
    <${elementType} class="editable-cell" data-type="${type}" data-index="${index}" data-key="${key}" ${attrs}>${type === "number" ? "" : value}</${elementType}>
  </div>`;
}

function renderHeaderStats() {
  totalSubjects.textContent = state.subjects.length;
  const avg = state.subjects.length
    ? Math.round(state.subjects.reduce((sum, row) => sum + clampPercent(row.prep), 0) / state.subjects.length)
    : 0;
  overallProgress.textContent = `${avg}%`;
}

function renderGoal() {
  goalInput.value = state.goal || "";
  savedGoal.textContent = state.goal || "Not set yet";
}

function renderResults() {
  resultTable.innerHTML = "";
  state.subjects.forEach((subject, index) => {
    resultTable.insertAdjacentHTML(
      "beforeend",
      `<article class="table-row short-row">
        ${createField({ label: "Subject", value: subject.name, type: "text", index, key: "name" })}
        ${createField({ label: "Result %", value: clampPercent(subject.result), type: "number", index, key: "result" })}
        <button type="button" class="danger-btn" data-remove="subject" data-index="${index}">Delete</button>
      </article>`
    );
  });
}

function renderPreparation() {
  prepTable.innerHTML = "";
  state.subjects.forEach((subject, index) => {
    prepTable.insertAdjacentHTML(
      "beforeend",
      `<article class="table-row short-row">
        ${createField({ label: "Subject", value: subject.name, type: "text", index, key: "name" })}
        ${createField({ label: "Preparation %", value: clampPercent(subject.prep), type: "number", index, key: "prep" })}
      </article>`
    );
  });
}

function renderRevisions() {
  revisionTable.innerHTML = "";
  state.subjects.forEach((subject, index) => {
    revisionTable.insertAdjacentHTML(
      "beforeend",
      `<article class="table-row short-row">
        ${createField({ label: "Subject", value: subject.name, type: "text", index, key: "name" })}
        ${createField({ label: "Revisions", value: Math.max(0, Number(subject.revisions) || 0), type: "number", index, key: "revisions" })}
      </article>`
    );
  });
}

function renderExams() {
  examTable.innerHTML = "";
  state.exams.forEach((exam, index) => {
    examTable.insertAdjacentHTML(
      "beforeend",
      `<article class="table-row exam-row">
        ${createField({ label: "Subject", value: exam.subject, type: "text", index, key: "subject" })}
        ${createField({ label: "Date", value: exam.date, type: "text", index, key: "date" })}
        ${createField({ label: "Time", value: exam.slot, type: "text", index, key: "slot" })}
        <button type="button" class="danger-btn" data-remove="exam" data-index="${index}">Delete</button>
      </article>`
    );
  });
}

function renderResources() {
  questionBank.innerHTML = "";
  state.questionBank.forEach((resource, index) => {
    questionBank.insertAdjacentHTML(
      "beforeend",
      `<article class="table-row resource-row">
        ${createField({ label: "Title", value: resource.title, type: "text", index, key: "title" })}
        ${createField({ label: "Link", value: resource.href, type: "text", index, key: "href" })}
        <button type="button" class="danger-btn" data-remove="resource" data-index="${index}">Delete</button>
      </article>`
    );
  });
}

function renderQuotes() {
  quoteList.innerHTML = "";
  state.quotes.forEach((quote, index) => {
    quoteList.insertAdjacentHTML(
      "beforeend",
      `<article class="table-row quote-row">
        ${createField({ label: "Quote", value: quote, type: "text", index, key: "quote" })}
        <button type="button" class="danger-btn" data-remove="quote" data-index="${index}">Delete</button>
      </article>`
    );
  });
  quoteText.textContent = state.quotes[0] ? `"${state.quotes[0]}"` : '"Add quotes to show motivation."';
}

function renderEditableContent() {
  document.querySelectorAll("[data-edit-key]").forEach((node) => {
    const key = node.dataset.editKey;
    node.textContent = contentState[key] || "";
  });
}

function rerenderAll() {
  renderGoal();
  renderHeaderStats();
  renderResults();
  renderPreparation();
  renderRevisions();
  renderExams();
  renderResources();
  renderQuotes();
}

function updateSubject(index, key, value, type) {
  if (!state.subjects[index]) return;
  if (type === "number") {
    state.subjects[index][key] = key === "revisions" ? Math.max(0, Number(value) || 0) : clampPercent(value);
  } else {
    state.subjects[index][key] = String(value).trim() || "-";
  }
  saveState();
  rerenderAll();
}

function updateCollection(collectionName, index, key, value) {
  const collection = state[collectionName];
  if (!collection || !collection[index]) return;

  if (collectionName === "quotes") {
    collection[index] = String(value).trim() || "New motivational quote";
  } else {
    collection[index][key] = String(value).trim() || "-";
  }

  saveState();
  rerenderAll();
}

goalForm.addEventListener("submit", (event) => {
  event.preventDefault();
  state.goal = goalInput.value.trim() || "Not set yet";
  saveState();
  renderGoal();
});

addSubjectBtn.addEventListener("click", () => {
  state.subjects.push({ name: "New Subject", result: 0, prep: 0, revisions: 0 });
  saveState();
  rerenderAll();
});

addExamBtn.addEventListener("click", () => {
  state.exams.push({ subject: "New Subject", date: "Date", slot: "Time" });
  saveState();
  rerenderAll();
});

addResourceBtn.addEventListener("click", () => {
  state.questionBank.push({ title: "New Resource", href: "#" });
  saveState();
  rerenderAll();
});

addQuoteBtn.addEventListener("click", () => {
  state.quotes.push("New motivational quote");
  saveState();
  rerenderAll();
});

newQuoteBtn.addEventListener("click", () => {
  if (!state.quotes.length) {
    quoteText.textContent = '"Add quotes to show motivation."';
    return;
  }
  const index = Math.floor(Math.random() * state.quotes.length);
  quoteText.textContent = `"${state.quotes[index]}"`;
});

function bindEditableEvents(container, collectionName) {
  container.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement) || !target.classList.contains("editable-cell")) return;

    const index = Number(target.dataset.index);
    const key = target.dataset.key;
    const type = target.dataset.type;
    const value = target instanceof HTMLInputElement ? target.value : target.textContent;

    if (collectionName === "subjects") {
      updateSubject(index, key, value, type);
    } else {
      updateCollection(collectionName, index, key, value);
    }
  });

  container.addEventListener(
    "blur",
    (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement) || !target.classList.contains("editable-cell")) return;
      if (target instanceof HTMLInputElement) return;

      const index = Number(target.dataset.index);
      const key = target.dataset.key;
      const type = target.dataset.type;

      if (collectionName === "subjects") {
        updateSubject(index, key, target.textContent, type);
      } else {
        updateCollection(collectionName, index, key, target.textContent);
      }
    },
    true
  );

  container.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-remove]");
    if (!button) return;

    const index = Number(button.dataset.index);
    const removeType = button.dataset.remove;

    if (removeType === "subject") {
      state.subjects.splice(index, 1);
    } else if (removeType === "exam") {
      state.exams.splice(index, 1);
    } else if (removeType === "resource") {
      state.questionBank.splice(index, 1);
    } else if (removeType === "quote") {
      state.quotes.splice(index, 1);
    }

    saveState();
    rerenderAll();
  });
}

function bindEditableTextBlocks() {
  document.querySelectorAll("[data-edit-key]").forEach((node) => {
    node.addEventListener("blur", () => {
      const key = node.dataset.editKey;
      contentState[key] = node.textContent.trim();
      saveContent();
    });
  });
}

renderEditableContent();
rerenderAll();
bindEditableEvents(resultTable, "subjects");
bindEditableEvents(prepTable, "subjects");
bindEditableEvents(revisionTable, "subjects");
bindEditableEvents(examTable, "exams");
bindEditableEvents(questionBank, "questionBank");
bindEditableEvents(quoteList, "quotes");
bindEditableTextBlocks();
