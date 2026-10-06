(() => {
  const LANGUAGE_KEY = "study-notes-language";
  const SUPPORT_LANGUAGE_KEY = "study-notes-support-language";
  const DEFAULT_CHAPTER_KEY = "french-chapter-01-complete";

  function chapterKeyFor(element) {
    return (element && element.dataset && element.dataset.chapterKey) || DEFAULT_CHAPTER_KEY;
  }
  const languageButtons = [...document.querySelectorAll("[data-set-language]")];
  const languagePanels = [...document.querySelectorAll("[data-language-content]")];
  const languageStatus = document.querySelector("[data-language-status]");
  let activeLanguage = "hinglish";
  let supportLanguage = "hinglish";

  function getSavedValue(key, fallback) {
    try {
      return window.localStorage.getItem(key) || fallback;
    } catch {
      return fallback;
    }
  }

  supportLanguage = getSavedValue(SUPPORT_LANGUAGE_KEY, "hinglish") === "english" ? "english" : "hinglish";

  function saveValue(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // The page remains usable when browser storage is unavailable.
    }
  }

  const chapterCompleteMemory = {};

  function getChapterComplete(storageKey) {
    const key = storageKey || DEFAULT_CHAPTER_KEY;
    const savedValue = getSavedValue(key, "");
    if (savedValue) chapterCompleteMemory[key] = savedValue === "true";
    return !!chapterCompleteMemory[key];
  }

  function progressText(complete, total) {
    if (supportLanguage === "english") {
      return complete === total && total === 1
        ? "1 of 1 chapter complete"
        : `${complete} of ${total} chapters complete`;
    }
    return `1 mein se ${complete} / ${total} chapter complete`;
  }

  function updateProgress() {
    document.querySelectorAll("[data-chapter-progress]").forEach((bar) => {
      const key = chapterKeyFor(bar);
      const complete = getChapterComplete(key);
      const fill = bar.querySelector("[data-progress-fill]");
      const max = Number(bar.getAttribute("aria-valuemax")) || 1;
      bar.setAttribute("aria-valuenow", complete ? String(max) : "0");
      bar.setAttribute("aria-valuetext", progressText(complete ? max : 0, max));
      if (!bar.getAttribute("aria-label")) {
        bar.setAttribute(
          "aria-label",
          supportLanguage === "english" ? "French chapter completion" : "French chapter ka progress",
        );
      }
      if (fill) fill.style.setProperty("--progress", complete ? "100%" : "0%");
    });

    document.querySelectorAll("[data-progress-state]").forEach((label) => {
      const complete = getChapterComplete(chapterKeyFor(label));
      const rightState = label.dataset.progressState === (complete ? "complete" : "incomplete");
      const labelLanguage = label.dataset.languageContent;
      const rightLanguage = !labelLanguage || labelLanguage === supportLanguage || (activeLanguage === "french" && labelLanguage === "french");
      label.hidden = !rightState || !rightLanguage;
    });

    document.querySelectorAll("[data-mark-state]").forEach((label) => {
      const complete = getChapterComplete(chapterKeyFor(label));
      const rightState = label.dataset.markState === (complete ? "complete" : "incomplete");
      const labelLanguage = label.dataset.languageContent;
      const rightLanguage = !labelLanguage || labelLanguage === supportLanguage || (activeLanguage === "french" && labelLanguage === "french");
      label.hidden = !rightState || !rightLanguage;
    });

    document.querySelectorAll("[data-mark-chapter]").forEach((button) => {
      button.setAttribute("aria-pressed", String(getChapterComplete(chapterKeyFor(button))));
    });
  }

  function setLanguage(language) {
    const selectedLanguage = ["english", "french"].includes(language) ? language : "hinglish";
    if (selectedLanguage !== "french") {
      supportLanguage = selectedLanguage;
      saveValue(SUPPORT_LANGUAGE_KEY, supportLanguage);
    }
    activeLanguage = selectedLanguage;

    languagePanels.forEach((panel) => {
      const panelLanguage = panel.dataset.languageContent;
      panel.hidden = panelLanguage !== supportLanguage && !(selectedLanguage === "french" && panelLanguage === "french");
    });

    languageButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.setLanguage === selectedLanguage));
    });

    document.documentElement.lang = supportLanguage === "english" ? "en" : "hi-Latn";
    if (languageStatus) {
      languageStatus.textContent = selectedLanguage === "french"
        ? (supportLanguage === "english" ? "French practice with English meaning" : "French practice ke saath Hinglish meaning")
        : (selectedLanguage === "english" ? "English selected" : "Hinglish chuna gaya");
    }

    saveValue(LANGUAGE_KEY, selectedLanguage);
    updateProgress();
  }

  languageButtons.forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.dataset.setLanguage));
  });

  document.querySelectorAll("[data-mark-chapter]").forEach((button) => {
    button.addEventListener("click", () => {
      const key = chapterKeyFor(button);
      const nextValue = !getChapterComplete(key);
      chapterCompleteMemory[key] = nextValue;
      saveValue(key, String(nextValue));
      updateProgress();
    });
  });

  document.querySelectorAll("[data-print]").forEach((button) => {
    button.addEventListener("click", () => window.print());
  });

  setLanguage(getSavedValue(LANGUAGE_KEY, "hinglish"));
  updateProgress();
})();
