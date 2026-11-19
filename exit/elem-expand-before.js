window.PLP_FX = window.PLP_FX || {};
window.PLP_FX["exit_elem_expand"] = {
  run: function (el, ctx) {
    return new Promise(function (resolve) {
      el.dataset._origT = el.style.transform || "";
      el.dataset._origOp = el.style.opacity || "1";

      el.style.transition = "transform 0.28s cubic-bezier(0.4,0,0.2,1), opacity 0.26s ease";
      el.style.transform = el.dataset._origT + " scale(1.3)";
      el.style.opacity = "0";

      // إذا لم نكن في وضع التجربة الحية، نخفي الصفحة الحالية بنعومة
      if (ctx && ctx.fromPage && !ctx.isPreview) {
        ctx.fromPage.style.transition = "opacity 0.25s ease";
        ctx.fromPage.style.opacity = "0";
      }

      setTimeout(function () {
        // إعادة ضبط العنصر والصفحة في الخلفية ليكونا جاهزين عند الرجوع لاحقاً
        el.style.transition = "none";
        el.style.transform = el.dataset._origT;
        el.style.opacity = el.dataset._origOp;
        if (ctx && ctx.fromPage && !ctx.isPreview) {
          ctx.fromPage.style.transition = "none";
          ctx.fromPage.style.opacity = "1";
        }
        resolve();
      }, 290);
    });
  },
  reset: function (el) {
    el.style.transition = "none";
    el.style.transform = el.dataset._origT || "";
    el.style.opacity = el.dataset._origOp || "1";
  }
};
