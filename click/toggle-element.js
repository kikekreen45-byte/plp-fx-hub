window.PLP_FX = window.PLP_FX || {};
window.PLP_FX["click_toggle_element"] = (function () {
  function getAnimTarget(target) {
    // للحفاظ على إحداثيات translate3d للصناديق العائمة، نحرك المحتوى الداخلي
    if (target.classList && target.classList.contains("floating-box")) {
      return target.querySelector(".plp-wrapper > div") || target;
    }
    return target;
  }

  return {
    setup: function (el, ctx) {
      var p = (ctx && ctx.params) || {};
      if (p.startHidden !== "yes" || !p.targetEl) return;
      var target = document.getElementById(p.targetEl);
      if (target) {
        target.style.display = "none";
        target.style.opacity = "0";
      }
    },
    run: function (el, ctx) {
      return new Promise(function (resolve) {
        var p = (ctx && ctx.params) || {};
        var target = p.targetEl ? document.getElementById(p.targetEl) : el;
        if (!target) { resolve(); return; }

        var action = p.action || "toggle";
        var anim = p.anim || "pop";
        var withSound = p.sound === "yes";
        var isHidden = target.style.display === "none" || getComputedStyle(target).display === "none";

        var shouldShow = action === "show" ? true : (action === "hide" ? false : isHidden);
        if (ctx && ctx.isPreview) {
          target.dataset._prevDisp = target.style.display;
          target.dataset._prevOp = target.style.opacity;
          shouldShow = isHidden ? true : false;
        }

        var inner = getAnimTarget(target);
        var isFloat = target.classList && target.classList.contains("floating-box");
        if (inner.dataset._origT === undefined) inner.dataset._origT = inner.style.transform || "";
        var origT = inner.dataset._origT;

        if (withSound && window.PLP && window.PLP.playSound) {
          window.PLP.playSound(shouldShow ? "open" : "close");
        }

        if (shouldShow) {
          target.style.display = isFloat ? "block" : "";
          if (isFloat && typeof fitExportPages === "function") fitExportPages();

          if (anim === "none") {
            target.style.opacity = "1";
            inner.style.transform = origT;
            if (window.PLP && window.PLP.runEnterFxInContainer) window.PLP.runEnterFxInContainer(target);
            resolve();
            return;
          }

          target.style.transition = "none";
          inner.style.transition = "none";
          target.style.opacity = "0";
          if (anim === "pop") inner.style.transform = origT + " scale(0.84)";
          else if (anim === "slide_up") inner.style.transform = origT + " translateY(34px)";

          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              target.style.transition = "opacity 0.24s ease";
              inner.style.transition = "transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)";
              target.style.opacity = "1";
              inner.style.transform = origT;
              setTimeout(function () {
                if (window.PLP && window.PLP.runEnterFxInContainer) window.PLP.runEnterFxInContainer(target);
                resolve();
              }, 310);
            });
          });
        } else {
          if (anim === "none") {
            target.style.display = "none";
            resolve();
            return;
          }
          target.style.transition = "opacity 0.2s ease";
          inner.style.transition = "transform 0.22s ease";
          target.style.opacity = "0";
          if (anim === "pop") inner.style.transform = origT + " scale(0.86)";
          else if (anim === "slide_up") inner.style.transform = origT + " translateY(28px)";

          setTimeout(function () {
            target.style.display = "none";
            inner.style.transition = "none";
            inner.style.transform = origT;
            resolve();
          }, 220);
        }
      });
    },
    reset: function (el, ctx) {
      var p = (ctx && ctx.params) || {};
      var target = (p.targetEl && document.getElementById(p.targetEl)) || el;
      if (!target) return;
      var inner = getAnimTarget(target);
      target.style.transition = "none";
      inner.style.transition = "none";
      if (target.dataset._prevDisp !== undefined) target.style.display = target.dataset._prevDisp;
      if (target.dataset._prevOp !== undefined) target.style.opacity = target.dataset._prevOp;
      if (inner.dataset._origT !== undefined) inner.style.transform = inner.dataset._origT;
    }
  };
})();
