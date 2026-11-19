window.PLP_FX = window.PLP_FX || {};
window.PLP_FX["exit_slide_swap"] = {
  run: function (el, ctx) {
    return new Promise(function (resolve) {
      // في وضع التجربة الحية داخل المحرر نطبّق الانزلاق على العنصر للمعاينة
      if (!ctx || ctx.isPreview || !ctx.fromPage || !ctx.toPage) {
        el.dataset._origT = el.style.transform || "";
        el.dataset._origOp = el.style.opacity || "1";
        el.style.transition = "transform 0.32s ease, opacity 0.32s ease";
        el.style.transform = el.dataset._origT + " translateX(-60px)";
        el.style.opacity = "0";
        setTimeout(resolve, 330);
        return;
      }

      var fromP = ctx.fromPage;
      var toP = ctx.toPage;

      // وضع الصفحتين متراكبتين لحظياً لانتقال سلس بدون وميض أسود
      toP.classList.add("active");
      toP.style.position = "fixed";
      toP.style.inset = "0";
      toP.style.zIndex = "500";
      toP.style.transition = "none";
      toP.style.transform = "translateX(100%)";
      if (typeof fitExportPages === "function") fitExportPages();

      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          fromP.style.transition = "transform 0.34s cubic-bezier(0.22,1,0.36,1), opacity 0.34s ease";
          toP.style.transition = "transform 0.34s cubic-bezier(0.22,1,0.36,1)";
          fromP.style.transform = "translateX(-25%)";
          fromP.style.opacity = "0.4";
          toP.style.transform = "translateX(0)";

          setTimeout(function () {
            fromP.classList.remove("active");
            fromP.style.transition = "none";
            fromP.style.transform = "";
            fromP.style.opacity = "1";
            toP.style.position = "";
            toP.style.inset = "";
            toP.style.zIndex = "";
            toP.style.transition = "none";
            toP.style.transform = "";
            resolve();
          }, 350);
        });
      });
    });
  },
  reset: function (el) {
    el.style.transition = "none";
    el.style.transform = el.dataset._origT || "";
    el.style.opacity = el.dataset._origOp || "1";
  }
};
