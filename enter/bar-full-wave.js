window.PLP_FX = window.PLP_FX || {};
window.PLP_FX["enter_bar_full_wave"] = {
  run: function (el, ctx) {
    return new Promise(function (resolve) {
      if (el._barWaveRaf) cancelAnimationFrame(el._barWaveRaf);

      // حفظ الأبعاد والمواضع الأصلية مرة واحدة فقط لمنع تغيرها عند إعادة التشغيل
      if (el.dataset._origW === undefined) el.dataset._origW = (parseFloat(el.style.width) || el.offsetWidth || 100) + "px";
      if (el.dataset._origH === undefined) el.dataset._origH = (parseFloat(el.style.height) || el.offsetHeight || 40) + "px";
      if (el.dataset._origLeft === undefined) el.dataset._origLeft = (parseFloat(el.style.left) || 0) + "px";
      if (el.dataset._origTop === undefined) el.dataset._origTop = (parseFloat(el.style.top) || 0) + "px";

      var origW = parseFloat(el.dataset._origW);
      var origH = parseFloat(el.dataset._origH);
      var origLeft = parseFloat(el.dataset._origLeft);
      var origTop = parseFloat(el.dataset._origTop);

      var g = ctx && ctx.guide;
      var isVertical = !!(g && ((g.kind === "segment" && g.axis === "v") || (g.kind === "infinite" && g.axis === "h")));

      var origLen = isVertical ? origH : origW;
      var fullLen = origLen * 1.35; // قيمة افتراضية إذا لم يُربط بخط

      if (g) {
        if (g.kind === "segment") {
          // الوصول إلى مقدار طول خط المسار بالكامل
          fullLen = Math.max(10, parseFloat(g.length) || origLen);
        } else if (g.kind === "infinite") {
          if (g.axis === "v" && typeof g.x === "number") {
            fullLen = Math.max(10, g.x - origLeft);
          } else if (g.axis === "h" && typeof g.y === "number") {
            fullLen = Math.max(10, g.y - origTop);
          }
        }
      }

      // الطول النهائي الذي يستقر عليه الشريط (مقيد بطول الخط احتياطاً)
      var finalLen = Math.min(origLen, fullLen);

      // في المسار العمودي: إذا كان الشريط مرتكزاً في الأسفل نملؤه من الأسفل للأعلى تلقائياً
      var fillUpward = false;
      var bottomAnchor = origTop + origH;
      if (isVertical && g && g.kind === "segment") {
        fillUpward = Math.abs(bottomAnchor - g.end) < Math.abs(origTop - g.start);
      }

      // محطات الصعود والهبوط: 0 -> كامل الخط 100% -> هبوط -> صعود -> هبوط خفيف -> استقرار على الأصل
      var nearFull = finalLen >= fullLen * 0.9;
      var keys = [
        { t: 0.00, v: 0 },
        { t: 0.30, v: fullLen },
        { t: 0.50, v: Math.max(fullLen * 0.22, Math.min(finalLen * 0.52, fullLen * 0.52)) },
        { t: 0.68, v: nearFull ? fullLen * 0.94 : finalLen + (fullLen - finalLen) * 0.58 },
        { t: 0.82, v: finalLen * 0.84 },
        { t: 0.92, v: nearFull ? fullLen * 0.99 : finalLen + (fullLen - finalLen) * 0.14 },
        { t: 1.00, v: finalLen }
      ];

      var duration = 1850; // مدة الحركة الكلية (ملي ثانية)
      var startTime = null;
      el.style.transition = "none";

      // دالة جيب التمام لارتداد ناعم جداً بدون أي توقف مفاجئ عند القمم والقيعان
      function cosineEase(p) {
        return 0.5 - 0.5 * Math.cos(Math.PI * p);
      }

      function applyLength(len) {
        var clamped = Math.min(fullLen, Math.max(0, len));
        if (isVertical) {
          el.style.height = clamped + "px";
          if (fillUpward) el.style.top = (bottomAnchor - clamped) + "px";
        } else {
          el.style.width = clamped + "px";
        }
      }

      applyLength(0);

      function step(ts) {
        if (!startTime) startTime = ts;
        var progress = Math.min(1, (ts - startTime) / duration);
        var cur = finalLen;

        for (var i = 0; i < keys.length - 1; i++) {
          if (progress >= keys[i].t && progress <= keys[i + 1].t) {
            var localP = (progress - keys[i].t) / (keys[i + 1].t - keys[i].t);
            cur = keys[i].v + (keys[i + 1].v - keys[i].v) * cosineEase(localP);
            break;
          }
        }

        applyLength(cur);

        if (progress < 1) {
          el._barWaveRaf = requestAnimationFrame(step);
        } else {
          el.style.width = origW + "px";
          el.style.height = origH + "px";
          el.style.left = origLeft + "px";
          el.style.top = origTop + "px";
          el._barWaveRaf = null;
          resolve();
        }
      }

      el._barWaveRaf = requestAnimationFrame(step);
    });
  },
  reset: function (el) {
    if (el._barWaveRaf) {
      cancelAnimationFrame(el._barWaveRaf);
      el._barWaveRaf = null;
    }
    el.style.transition = "none";
    if (el.dataset._origW !== undefined) el.style.width = el.dataset._origW;
    if (el.dataset._origH !== undefined) el.style.height = el.dataset._origH;
    if (el.dataset._origLeft !== undefined) el.style.left = el.dataset._origLeft;
    if (el.dataset._origTop !== undefined) el.style.top = el.dataset._origTop;
  }
};
