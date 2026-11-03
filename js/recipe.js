(function () {
  "use strict";

  var checkboxes = document.querySelectorAll(".ingredient input");
  var counter = document.getElementById("ingredient-counter");

  function updateCounter() {
    if (!counter) return;
    var checked = document.querySelectorAll(".ingredient input:checked").length;
    counter.textContent =
      checked === checkboxes.length
        ? "¡Tienes todo! Ya puedes empezar la preparación."
        : "Ingredientes listos: " + checked + " de " + checkboxes.length;
  }

  checkboxes.forEach(function (checkbox) {
    checkbox.addEventListener("change", updateCounter);
  });
  updateCounter();

  var tabsContainer = document.querySelector(".tabs");
  if (!tabsContainer) return;

  var tabs = Array.prototype.slice.call(tabsContainer.querySelectorAll('[role="tab"]'));
  var panels = Array.prototype.slice.call(tabsContainer.querySelectorAll('[role="tabpanel"]'));

  function activate(tab, moveFocus) {
    tabs.forEach(function (other, index) {
      var active = other === tab;
      other.setAttribute("aria-selected", String(active));
      other.tabIndex = active ? 0 : -1;
      panels[index].hidden = !active;
    });
    if (moveFocus) tab.focus();
  }

  tabs.forEach(function (tab, index) {
    tab.addEventListener("click", function () {
      activate(tab, false);
    });

    tab.addEventListener("keydown", function (event) {
      var target = null;
      if (event.key === "ArrowRight") target = tabs[(index + 1) % tabs.length];
      if (event.key === "ArrowLeft") target = tabs[(index - 1 + tabs.length) % tabs.length];
      if (event.key === "Home") target = tabs[0];
      if (event.key === "End") target = tabs[tabs.length - 1];
      if (target) {
        event.preventDefault();
        activate(target, true);
      }
    });
  });
})();
