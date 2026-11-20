window.PLP_FX = window.PLP_FX || {};
window.PLP_FX["click_open_page"] = {
  run: function (el, ctx) {
    return new Promise(function (resolve) {
      var p = (ctx && ctx.params) || {};
      var targetPage = parseInt(p.targetPage || "0", 10);
      var anim = p.anim || "fade";

      // نبضة تأكيد في التجربة الحية داخل المحرر
      if ((ctx && ctx.isPreview) || !window.PLP || !targetPage) {
        if (el) {
          el.dataset._origT = el.style.transform || "";
          el.style.transition = "transform 0.18s ease";
          el.style.transform = el.dataset._origT + " scale(0.92)";
          setTimeout(function () {
            el.style.transform = el.dataset._origT;
            setTimeout(resolve, 180);
          }, 160);
        } else resolve();
        return;
      }

      if (anim === "instant") {
        window.PLP.goPage(targetPage, false, true);
        resolve();
        return;
      }

      var customSwap = {
        usesStage: true,
        run: function (trig, sCtx) {
          return new Promise(function (done) {
            var fromP = sCtx.fromPage, toP = sCtx.toPage;
            var dur = 300;
            var ease = "cubic-bezier(0.22, 1, 0.36, 1)";

            if (anim === "slide_left" || anim === "slide_right") {
              var dir = anim === "slide_left" ? 1 : -1;
              toP.style.opacity = "1";
              toP.style.transform = "translateX(" + (dir * 100) + "%)";
              requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                  fromP.style.transition = "transform " + dur + "ms " + ease + ", opacity " + dur + "ms ease";
                  toP.style.transition = "transform " + dur + "ms " + ease;
                  fromP.style.transform = "translateX(" + (-dir * 28) + "%)";
                  fromP.style.opacity = "0.4";
                  toP.style.transform = "translateX(0)";
                  setTimeout(done, dur + 20);
                });
              });
            } else if (anim === "slide_up") {
              toP.style.opacity = "1";
              toP.style.transform = "translateY(45px)";
              requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                  fromP.style.transition = "opacity " + dur + "ms ease";
                  toP.style.transition = "transform " + dur + "ms " + ease + ", opacity " + dur + "ms ease";
                  fromP.style.opacity = "0.2";
                  toP.style.transform = "translateY(0)";
                  setTimeout(done, dur + 20);
                });
              });
            } else if (anim === "zoom") {
              toP.style.opacity = "0";
              toP.style.transform = "scale(1.06)";
              requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                  fromP.style.transition = "transform " + dur + "ms " + ease + ", opacity " + dur + "ms ease";
                  toP.style.transition = "transform " + dur + "ms " + ease + ", opacity " + dur + "ms ease";
                  fromP.style.transform = "scale(0.94)";
                  fromP.style.opacity = "0";
                  toP.style.transform = "scale(1)";
                  toP.style.opacity = "1";
                  setTimeout(done, dur + 20);
                });
              });
            } else {
              // fade ناعم
              toP.style.opacity = "0";
              requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                  fromP.style.transition = "opacity 220ms ease";
                  toP.style.transition = "opacity 220ms ease";
                  fromP.style.opacity = "0.2";
                  toP.style.opacity = "1";
                  setTimeout(done, 230);
                });
              });
            }
          });
        }
      };

      window.PLP.transitionTo(targetPage, customSwap, el, { swapMode: "cross_stage" });
      resolve();
    });
  },
  reset: function (el) {
    if (!el) return;
    el.style.transition = "none";
    if (el.dataset._origT !== undefined) el.style.transform = el.dataset._origT;
  }
};
