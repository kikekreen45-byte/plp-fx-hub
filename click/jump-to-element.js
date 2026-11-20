window.PLP_FX = window.PLP_FX || {};
window.PLP_FX["click_jump_to_element"] = {
  run: function (el, ctx) {
    return new Promise(function (resolve) {
      var p = (ctx && ctx.params) || {};
      var targetId = p.targetEl || "";
      var highlight = p.highlight !== "no";
      var glowColor = p.glowColor || "#E86A33";

      if (!targetId) { resolve(); return; }

      function focusAndPulse(target) {
        if (!target) { resolve(); return; }
        // إظهار الصندوق العائم إن كان العنصر بداخله ومخفياً
        var fBox = target.closest && target.closest(".floating-box");
        if (fBox && (fBox.style.display === "none" || getComputedStyle(fBox).display === "none")) {
          fBox.style.display = "block";
          if (typeof fitExportPages === "function") fitExportPages();
        }
        try {
          target.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
        } catch (e) {}

        if (highlight) {
          var origFilter = target.style.filter || "";
          var origT = target.style.transform || "";
          setTimeout(function () {
            target.style.transition = "transform 0.25s ease, filter 0.25s ease";
            target.style.transform = origT + " scale(1.07)";
            target.style.filter = "drop-shadow(0 0 18px " + glowColor + ")";
            setTimeout(function () {
              target.style.transform = origT;
              target.style.filter = origFilter;
              setTimeout(resolve, 260);
            }, 340);
          }, 260);
        } else {
          setTimeout(resolve, 320);
        }
      }

      if (ctx && ctx.isPreview) {
        var localTarget = document.getElementById(targetId);
        focusAndPulse(localTarget || el);
        return;
      }

      var nodeInfo = window.BRAIN && window.BRAIN.nodes && window.BRAIN.nodes[targetId];
      var targetEl = document.getElementById(targetId);
      var targetPage = nodeInfo ? Number(nodeInfo.page) : (targetEl && targetEl.closest(".html-page") ? Number(targetEl.closest(".html-page").dataset.page) : 0);

      if (window.PLP && targetPage > 0 && targetPage !== Number(window.PLP.currentScreen)) {
        window.PLP.goPage(targetPage);
        setTimeout(function () {
          focusAndPulse(document.getElementById(targetId));
        }, 250);
      } else {
        focusAndPulse(targetEl);
      }
    });
  },
  reset: function (el, ctx) {
    var p = (ctx && ctx.params) || {};
    var t = (p.targetEl && document.getElementById(p.targetEl)) || el;
    if (t) {
      t.style.transition = "none";
      t.style.filter = "";
    }
  }
};
