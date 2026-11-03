(function () {
  "use strict";

  var menuToggle = document.querySelector(".menu-toggle");
  var menu = document.getElementById("main-menu");

  if (menuToggle && menu) {
    var toggleLabel = menuToggle.querySelector(".menu-toggle__label");

    function setMenuOpen(open) {
      menu.classList.toggle("is-open", open);
      menuToggle.setAttribute("aria-expanded", String(open));
      if (toggleLabel) {
        toggleLabel.textContent = open ? "Cerrar" : "Menú";
      }
    }

    menuToggle.addEventListener("click", function () {
      setMenuOpen(!menu.classList.contains("is-open"));
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && menu.classList.contains("is-open")) {
        setMenuOpen(false);
        menuToggle.focus();
      }
    });

    document.addEventListener("click", function (event) {
      if (!menu.contains(event.target) && !menuToggle.contains(event.target)) {
        setMenuOpen(false);
      }
    });

    window.matchMedia("(min-width: 66rem)").addEventListener("change", function (query) {
      if (query.matches) {
        setMenuOpen(false);
      }
    });
  }

  var revealItems = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && revealItems.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealItems.forEach(function (item) {
      observer.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add("is-visible");
    });
  }

  var currentYear = document.getElementById("current-year");
  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }
})();
