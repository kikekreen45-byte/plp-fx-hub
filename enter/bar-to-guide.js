window.PLP_FX = window.PLP_FX || {};
window.PLP_FX["enter_bar_guide"] = {
  run: function (el, ctx) {
    return new Promise(function (resolve) {
      var origW = parseFloat(el.style.width) || el.offsetWidth;
      var startX = parseFloat(el.style.left) || 0;
      // إذا ربط المصمم خطاً وهمياً عمودياً، يتوقف التمدد عنده تماماً
      var targetW = (ctx && ctx.guide && typeof ctx.guide.x === "number")
        ? Math.max(10, ctx.guide.x - startX)
        : origW;

      el.dataset._origW = el.style.width;
      el.style.transition = "none";
      el.style.width = "0px";
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          el.style.transition = "width 0.6s cubic-bezier(0.22,1,0.36,1)";
          el.style.width = targetW + "px";
          setTimeout(resolve, 610);
        });
      });
    });
  },
  reset: function (el) {
    el.style.transition = "none";
    if (el.dataset._origW) el.style.width = el.dataset._origW;
  }
};
