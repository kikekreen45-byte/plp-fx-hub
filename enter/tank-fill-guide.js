window.PLP_FX = window.PLP_FX || {};
window.PLP_FX["enter_tank_fill"] = {
  run: function (el, ctx) {
    return new Promise(function (resolve) {
      if (el._tankRaf) cancelAnimationFrame(el._tankRaf);

      var origW = parseFloat(el.dataset._origW || el.style.width) || el.offsetWidth || 100;
      var startX = parseFloat(el.style.left) || 0;
      el.dataset._origW = origW + "px";

      // حساب الحد الأقصى المسموح به بناءً على الخط الوهمي (لا يتجاوزه أبداً)
      var maxAllowedW = (ctx && ctx.guide && typeof ctx.guide.x === "number")
        ? Math.max(10, ctx.guide.x - startX)
        : origW * 1.15;

      // القيمة النهائية التي يستقر عليها (الأصلية، ومقيدة بالخط الوهمي احتياطاً)
      var finalW = Math.min(origW, maxAllowedW);

      // محطات الحركة: 0 -> ارتفاع أول (مقيد بالخط) -> انخفاض -> ارتفاع ثانٍ -> انخفاض بسيط -> الاستقرار
      var keys = [
        { t: 0.00, w: 0 },
        { t: 0.34, w: Math.min(maxAllowedW, origW * 1.25) },
        { t: 0.56, w: finalW * 0.65 },
        { t: 0.76, w: Math.min(maxAllowedW, finalW * 1.10) },
        { t: 0.90, w: finalW * 0.92 },
        { t: 1.00, w: finalW }
      ];

      var duration = 1450; // مدة الحركة الكلية بالملي ثانية
      var startTime = null;
      el.style.transition = "none";
      el.style.width = "0px";

      function easeInOut(p) {
        return p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      }

      function step(ts) {
        if (!startTime) startTime = ts;
        var progress = Math.min(1, (ts - startTime) / duration);

        // إيجاد المرحلة الحالية بين نقطتين
        var curW = finalW;
        for (var i = 0; i < keys.length - 1; i++) {
          if (progress >= keys[i].t && progress <= keys[i + 1].t) {
            var localP = (progress - keys[i].t) / (keys[i + 1].t - keys[i].t);
            curW = keys[i].w + (keys[i + 1].w - keys[i].w) * easeInOut(localP);
            break;
          }
        }

        // ضمان مطلق بعدم تخطي الخط الوهمي في أي إطار
        el.style.width = Math.min(maxAllowedW, Math.max(0, curW)) + "px";

        if (progress < 1) {
          el._tankRaf = requestAnimationFrame(step);
        } else {
          el.style.width = finalW + "px";
          el._tankRaf = null;
          resolve();
        }
      }

      el._tankRaf = requestAnimationFrame(step);
    });
  },
  reset: function (el) {
    if (el._tankRaf) {
      cancelAnimationFrame(el._tankRaf);
      el._tankRaf = null;
    }
    el.style.transition = "none";
    if (el.dataset._origW) el.style.width = el.dataset._origW;
  }
};
