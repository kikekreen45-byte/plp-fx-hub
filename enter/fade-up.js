window.PLP_FX = window.PLP_FX || {};
window.PLP_FX["enter_fade_up"] = {
  run: function (el, ctx) {
    return new Promise(function (resolve) {
      el.dataset._origT = el.style.transform || "";
      el.dataset._origOp = el.style.opacity || "1";
      el.style.transition = "none";
      el.style.opacity = "0";
      el.style.transform = el.dataset._origT + " translateY(45px)";
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          el.style.transition = "transform 0.45s cubic-bezier(0.22,1,0.36,1), opacity 0.35s ease";
          el.style.opacity = el.dataset._origOp;
          el.style.transform = el.dataset._origT;
          setTimeout(resolve, 460);
        });
      });
    });
  },
  reset: function (el) {
    el.style.transition = "none";
    el.style.opacity = el.dataset._origOp || "1";
    el.style.transform = el.dataset._origT || "";
  }
};
