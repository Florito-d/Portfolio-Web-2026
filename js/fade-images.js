document.addEventListener("DOMContentLoaded", function () {
  // Active les styles conditionnels (html.js ...)
  document.documentElement.classList.add("js");

  // ============================
  // 1) Reveal WORDS (mot par mot)
  // ============================
  var titles = document.querySelectorAll(".reveal-words");

  titles.forEach(function (title) {
    var words = title.textContent.trim().split(" ");
    title.textContent = "";

    words.forEach(function (word, i) {
      var span = document.createElement("span");
      span.textContent = word;
      span.style.transitionDelay = (i * 80) + "ms";
      title.appendChild(span);
    });
  });

  // ======================================
  // 2) Reveal CHARS (lettre par lettre / mot)
  // ======================================
  (function initRevealCharsByWord() {
    var targets = document.querySelectorAll(".reveal-chars");

    targets.forEach(function (el) {
      if (el.dataset.splitted === "1") return;
      el.dataset.splitted = "1";

      var text = el.textContent.trim();
      el.textContent = "";

      var delayStep = 14;
      var words = text.split(/\s+/);
      var globalIndex = 0;

      words.forEach(function (word) {
        var wordSpan = document.createElement("span");
        wordSpan.className = "word";

        for (var i = 0; i < word.length; i++) {
          var span = document.createElement("span");
          span.className = "char";
          span.textContent = word[i];

          span.style.transitionDelay = (globalIndex * delayStep) + "ms";
          globalIndex++;

          wordSpan.appendChild(span);
        }

        el.appendChild(wordSpan);
      });
    });
  })();

  // ======================================
  // 3) Cascade auto (fade-block)
  // ======================================
  var fadeBlocks = document.querySelectorAll(".fade-block");
  fadeBlocks.forEach(function (el, i) {
    // petit offset + cascade progressive
    el.style.transitionDelay = (80 + i * 70) + "ms"; /*80 = délai de base avant que la cascade commence ------ 70 = intervalle entre chaque élément (plus petit=plus rapide)*/
  });

  // ======================================
  // 4) Observer global : fade / reveal / blocks
  // ======================================
  var elements = document.querySelectorAll(
    ".image, .fade-text, .reveal-words, .reveal-chars, .fade-block, .fade-on-scroll, .collections-subtitle"
  );

  if (!("IntersectionObserver" in window)) {
    elements.forEach(function (el) { el.classList.add("is-visible"); });
    return;
  }

  var observer = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  elements.forEach(function (el) { observer.observe(el); });
});

// ======================================
// 5) Collection Cards
// ======================================

document.addEventListener("DOMContentLoaded", function () {
  const grid = document.querySelector(".collections-grid");
  if (!grid) return;

  // fallback vieux navigateurs
  if (!("IntersectionObserver" in window)) {
    grid.classList.add("is-visible");
    return;
  }

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        grid.classList.add("is-visible");  // <- déclenche tout
        obs.unobserve(grid);
      }
    });
  }, { threshold: 0.15 });

  io.observe(grid);
});
