const themeButton = document.getElementById("themeButton");
const addTopButton = document.getElementById("addTopButton");
const addCardButton = document.getElementById("addCardButton");

const modal = document.getElementById("modal");
const closeModalButton = document.getElementById(
  "closeModalButton"
);
const cardForm = document.getElementById("cardForm");

const questionInput = document.getElementById("questionInput");
const answerInput = document.getElementById("answerInput");
const categoryInput = document.getElementById("categoryInput");

const cardList = document.getElementById("cardList");
const searchInput = document.getElementById("searchInput");
const filterSelect = document.getElementById("filterSelect");
const studyCategory = document.getElementById("studyCategory");

const studyCardCategory = document.getElementById(
  "studyCardCategory"
);
const studyQuestion = document.getElementById("studyQuestion");
const studyAnswer = document.getElementById("studyAnswer");
const answerArea = document.getElementById("answerArea");
const flipButton = document.getElementById("flipButton");
const reviewButton = document.getElementById("reviewButton");
const knownButton = document.getElementById("knownButton");
const cardCounter = document.getElementById("cardCounter");

const totalCards = document.getElementById("totalCards");
const knownCards = document.getElementById("knownCards");
const reviewCards = document.getElementById("reviewCards");
const progressPercent = document.getElementById("progressPercent");
const toast = document.getElementById("toast");

let cards = JSON.parse(
  localStorage.getItem("recalllyCards")
) || [];

let currentStudyIndex = 0;
let isAnswerVisible = false;

function saveCards() {
  localStorage.setItem("recalllyCards", JSON.stringify(cards));
}

function escapeHTML(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showToast(text) {
  toast.textContent = text;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

function openModal() {
  modal.classList.remove("hidden");
  questionInput.focus();
}

function closeModal() {
  modal.classList.add("hidden");
  cardForm.reset();
}

function updateStats() {
  const known = cards.filter((card) => card.status === "known").length;
  const review = cards.filter((card) => card.status === "review").length;
  const progress = cards.length
    ? Math.round((known / cards.length) * 100)
    : 0;

  totalCards.textContent = cards.length;
  knownCards.textContent = known;
  reviewCards.textContent = review;
  progressPercent.textContent = `${progress}%`;
}

function updateCategoryOptions() {
  const categories = [
    ...new Set(cards.map((card) => card.category))
  ].sort();

  const currentValue = studyCategory.value;

  studyCategory.innerHTML = `
    <option value="all">All categories</option>
    ${categories
      .map(
        (category) => `
          <option value="${escapeHTML(category)}">
            ${escapeHTML(category)}
          </option>
        `
      )
      .join("")}
  `;

  if (categories.includes(currentValue)) {
    studyCategory.value = currentValue;
  }
}

function getFilteredCards() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  const filter = filterSelect.value;

  return cards.filter((card) => {
    const matchesSearch =
      card.question.toLowerCase().includes(searchTerm) ||
      card.answer.toLowerCase().includes(searchTerm) ||
      card.category.toLowerCase().includes(searchTerm);

    const matchesFilter =
      filter === "all" || card.status === filter;

    return matchesSearch && matchesFilter;
  });
}

function renderCards() {
  const filteredCards = getFilteredCards();
  cardList.innerHTML = "";

  if (filteredCards.length === 0) {
    cardList.innerHTML = `
      <div class="empty-state">
        No flashcards found. Create your first card!
      </div>
    `;

    return;
  }

  filteredCards.forEach((card) => {
    const cardElement = document.createElement("article");

    cardElement.className = "flashcard-item";

    cardElement.innerHTML = `
      <div class="flashcard-top">
        <span class="category-badge">
          ${escapeHTML(card.category)}
        </span>

        <span class="status-badge ${
          card.status === "known" ? "known" : ""
        }">
          ${card.status === "known" ? "Known" : "Review later"}
        </span>
      </div>

      <h3>${escapeHTML(card.question)}</h3>
      <p>${escapeHTML(card.answer)}</p>

      <div class="card-actions">
        <button class="small-button status-button">
          ${card.status === "known" ? "Mark Review" : "Mark Known"}
        </button>

        <button class="small-button delete-button">
          Delete
        </button>
      </div>
    `;

    const statusButton = cardElement.querySelector(
      ".status-button"
    );

    const deleteButton = cardElement.querySelector(
      ".delete-button"
    );

    statusButton.addEventListener("click", () => {
      card.status = card.status === "known" ? "review" : "known";
      saveCards();
      updateEverything();
      showToast(
        card.status === "known"
          ? "Marked as known"
          : "Marked for review"
      );
    });

    deleteButton.addEventListener("click", () => {
      cards = cards.filter((item) => item.id !== card.id);
      saveCards();
      updateEverything();
      showToast("Flashcard deleted");
    });

    cardList.appendChild(cardElement);
  });
}

function getStudyCards() {
  const category = studyCategory.value;

  return cards.filter((card) => {
    return category === "all" || card.category === category;
  });
}

function renderStudyCard() {
  const studyCards = getStudyCards();

  if (studyCards.length === 0) {
    studyCardCategory.textContent = "No cards available";
    studyQuestion.textContent =
      "Add a flashcard to start learning.";
    studyAnswer.textContent = "";
    cardCounter.textContent = "0 / 0";
    answerArea.classList.add("hidden");
    flipButton.textContent = "Show Answer";
    isAnswerVisible = false;
    return;
  }

  if (currentStudyIndex >= studyCards.length) {
    currentStudyIndex = 0;
  }

  const card = studyCards[currentStudyIndex];

  studyCardCategory.textContent = card.category;
  studyQuestion.textContent = card.question;
  studyAnswer.textContent = card.answer;
  cardCounter.textContent = `
    ${currentStudyIndex + 1} / ${studyCards.length}
  `.trim();

  answerArea.classList.toggle(
    "hidden",
    !isAnswerVisible
  );

  flipButton.textContent = isAnswerVisible
    ? "Hide Answer"
    : "Show Answer";
}

function moveToNextCard() {
  const studyCards = getStudyCards();

  if (studyCards.length === 0) {
    return;
  }

  currentStudyIndex =
    (currentStudyIndex + 1) % studyCards.length;

  isAnswerVisible = false;
  renderStudyCard();
}

function updateEverything() {
  updateStats();
  updateCategoryOptions();
  renderCards();
  renderStudyCard();
}

cardForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const newCard = {
    id: Date.now(),
    question: questionInput.value.trim(),
    answer: answerInput.value.trim(),
    category: categoryInput.value.trim(),
    status: "review"
  };

  cards.unshift(newCard);
  saveCards();
  updateEverything();
  closeModal();
  showToast("Flashcard saved!");
});

flipButton.addEventListener("click", () => {
  if (getStudyCards().length === 0) {
    return;
  }

  isAnswerVisible = !isAnswerVisible;
  renderStudyCard();
});

knownButton.addEventListener("click", () => {
  const studyCards = getStudyCards();

  if (studyCards.length === 0) {
    return;
  }

  const card = studyCards[currentStudyIndex];
  const originalCard = cards.find((item) => item.id === card.id);

  originalCard.status = "known";
  saveCards();
  updateEverything();
  showToast("Great job! Card marked as known");
  moveToNextCard();
});

reviewButton.addEventListener("click", () => {
  const studyCards = getStudyCards();

  if (studyCards.length === 0) {
    return;
  }

  const card = studyCards[currentStudyIndex];
  const originalCard = cards.find((item) => item.id === card.id);

  originalCard.status = "review";
  saveCards();
  updateEverything();
  showToast("Card saved for review");
  moveToNextCard();
});

searchInput.addEventListener("input", renderCards);
filterSelect.addEventListener("change", renderCards);

studyCategory.addEventListener("change", () => {
  currentStudyIndex = 0;
  isAnswerVisible = false;
  renderStudyCard();
});

addTopButton.addEventListener("click", openModal);
addCardButton.addEventListener("click", openModal);
closeModalButton.addEventListener("click", closeModal);

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

themeButton.addEventListener("click", () => {
  const isDark =
    document.body.getAttribute("data-theme") === "dark";

  if (isDark) {
    document.body.removeAttribute("data-theme");
    themeButton.textContent = "🌙";
    localStorage.setItem("recalllyTheme", "light");
  } else {
    document.body.setAttribute("data-theme", "dark");
    themeButton.textContent = "☀️";
    localStorage.setItem("recalllyTheme", "dark");
  }
});

function loadTheme() {
  const savedTheme = localStorage.getItem("recalllyTheme");

  if (savedTheme === "dark") {
    document.body.setAttribute("data-theme", "dark");
    themeButton.textContent = "☀️";
  }
}

loadTheme();
updateEverything();