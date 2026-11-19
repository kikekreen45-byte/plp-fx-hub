window.PLP_FX = window.PLP_FX || {};
window.PLP_FX["click_glow_pulse"] = {
  run: function (el, ctx) {
    return new Promise(function (resolve) {
      el.dataset._origFilter = el.style.filter || "";
      el.dataset._origT = el.style.transform || "";
      el.style.transition = "transform 0.22s ease, filter 0.22s ease";
      el.style.transform = el.dataset._origT + " scale(1.08)";
      el.style.filter = "drop-shadow(0 0 18px rgba(232,106,51,0.95))";
      setTimeout(function () {
        el.style.transform = el.dataset._origT;
        el.style.filter = el.dataset._origFilter;
        setTimeout(resolve, 230);
      }, 220);
    });
  },
  reset: function (el) {
    el.style.transition = "none";
    el.style.transform = el.dataset._origT || "";
    el.style.filter = el.dataset._origFilter || "";
  }
};
