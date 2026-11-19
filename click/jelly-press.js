window.PLP_FX = window.PLP_FX || {};
window.PLP_FX["click_jelly"] = {
  run: function (el, ctx) {
    return new Promise(function (resolve) {
      el.dataset._origT = el.style.transform || "";
      el.style.transition = "transform 0.12s ease-out";
      el.style.transform = el.dataset._origT + " scale(0.88)";
      setTimeout(function () {
        el.style.transition = "transform 0.3s cubic-bezier(0.34,1.56,0.64,1)";
        el.style.transform = el.dataset._origT + " scale(1.06)";
        setTimeout(function () {
          el.style.transform = el.dataset._origT;
          setTimeout(resolve, 160);
        }, 150);
      }, 120);
    });
  },
  reset: function (el) {
    el.style.transition = "none";
    el.style.transform = el.dataset._origT || "";
  }
};
