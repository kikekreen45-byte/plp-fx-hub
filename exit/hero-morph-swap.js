window.PLP_FX = window.PLP_FX || {};
window.PLP_FX["exit_hero_morph"] = {
  usesStage: true,
  run: function (el, ctx) {
    return new Promise(function (resolve) {
      var p = (ctx && ctx.params) || {};
      var fromEl = (p.fromEl && document.getElementById(p.fromEl)) || el;
      var toEl = p.toEl ? document.getElementById(p.toEl) : null;
      var dur = Math.max(220, parseInt(p.duration || "520", 10) || 520);

      // معاينة داخل المحرر
      if (!ctx || ctx.isPreview || !ctx.stage || !ctx.fromPage || !ctx.toPage) {
        if (!fromEl) { resolve(); return; }
        fromEl.dataset._origT = fromEl.style.transform || "";
        fromEl.style.transition = "transform 0.35s cubic-bezier(0.22,1,0.36,1)";
        fromEl.style.transform = fromEl.dataset._origT + " scale(1.16) translateY(-14px)";
        setTimeout(function () {
          fromEl.style.transform = fromEl.dataset._origT;
          setTimeout(resolve, 260);
        }, 320);
        return;
      }

      var fromRect = fromEl ? ctx.getRect(fromEl) : null;
      var toRect = toEl ? ctx.getRect(toEl) : null;

      // في حال عدم تحديد عنصر هدف: انتقال تلاشي وتكبير ناعم بين الصفحتين
      if (!fromEl || !toEl || !fromRect || !toRect || !fromRect.width || !toRect.width) {
        ctx.fromPage.style.transition = "opacity " + dur + "ms ease, transform " + dur + "ms ease";
        ctx.toPage.style.transition = "opacity " + dur + "ms ease";
        ctx.fromPage.style.opacity = "0";
        ctx.fromPage.style.transform = "scale(0.96)";
        ctx.toPage.style.opacity = "1";
        setTimeout(resolve, dur + 20);
        return;
      }

      var stage = ctx.stage;
      var flyer = document.createElement("div");
      flyer.style.cssText =
        "position:fixed;margin:0;padding:0;overflow:hidden;pointer-events:none;" +
        "left:" + fromRect.left + "px;top:" + fromRect.top + "px;" +
        "width:" + fromRect.width + "px;height:" + fromRect.height + "px;" +
        "border-radius:" + (getComputedStyle(fromEl).borderRadius || "0px") + ";";

      function buildVisual(srcEl) {
        var box = document.createElement("div");
        box.style.cssText = "position:absolute;inset:0;width:100%;height:100%;";
        var img = srcEl.querySelector("img");
        if (img) {
          var ci = img.cloneNode(true);
          ci.style.cssText = "width:100%;height:100%;object-fit:fill;display:block;position:static;";
          box.appendChild(ci);
        } else {
          var cs = getComputedStyle(srcEl);
          box.style.background = cs.backgroundColor || "transparent";
        }
        return box;
      }

      var vFrom = buildVisual(fromEl);
      var vTo = buildVisual(toEl);
      vFrom.style.opacity = "1";
      vTo.style.opacity = "0";
      flyer.appendChild(vFrom);
      flyer.appendChild(vTo);
      stage.appendChild(flyer);

      var prevFromVis = fromEl.style.visibility;
      var prevToVis = toEl.style.visibility;
      fromEl.style.visibility = "hidden";
      toEl.style.visibility = "hidden";

      var targetRad = getComputedStyle(toEl).borderRadius || "0px";
      var ease = "cubic-bezier(0.22, 1, 0.36, 1)";

      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          flyer.style.transition =
            "left " + dur + "ms " + ease + ", top " + dur + "ms " + ease +
            ", width " + dur + "ms " + ease + ", height " + dur + "ms " + ease +
            ", border-radius " + dur + "ms " + ease;
          vFrom.style.transition = "opacity " + Math.round(dur * 0.7) + "ms ease";
          vTo.style.transition = "opacity " + Math.round(dur * 0.7) + "ms ease";
          ctx.fromPage.style.transition = "opacity " + dur + "ms ease, transform " + dur + "ms " + ease;
          ctx.toPage.style.transition = "opacity " + dur + "ms ease";

          flyer.style.left = toRect.left + "px";
          flyer.style.top = toRect.top + "px";
          flyer.style.width = toRect.width + "px";
          flyer.style.height = toRect.height + "px";
          flyer.style.borderRadius = targetRad;

          vFrom.style.opacity = "0";
          vTo.style.opacity = "1";
          ctx.fromPage.style.opacity = "0";
          ctx.fromPage.style.transform = "scale(0.97)";
          ctx.toPage.style.opacity = "1";

          setTimeout(function () {
            fromEl.style.visibility = prevFromVis;
            toEl.style.visibility = prevToVis;
            if (flyer.parentNode) flyer.parentNode.removeChild(flyer);
            resolve();
          }, dur + 30);
        });
      });
    });
  },
  reset: function (el) {
    if (!el) return;
    el.style.transition = "none";
    el.style.visibility = "";
    if (el.dataset._origT !== undefined) el.style.transform = el.dataset._origT;
  }
};
