window.PLP_FX = window.PLP_FX || {};
window.PLP_FX["exit_cross_dust"] = (function () {
  function parseHex(hex) {
    var c = String(hex || "").trim().replace(/^#/, "");
    if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
    if (!/^[0-9a-fA-F]{6}$/.test(c)) return null;
    return "#" + c.toUpperCase();
  }

  function sampleViewportEl(el, rect, count) {
    var pts = [];
    try {
      var sc = Math.min(1, 140 / Math.max(rect.width, rect.height, 1));
      var cw = Math.max(16, Math.ceil(rect.width * sc));
      var ch = Math.max(16, Math.ceil(rect.height * sc));
      var c = document.createElement("canvas");
      c.width = cw; c.height = ch;
      var cx = c.getContext("2d");
      var img = el.querySelector("img");
      if (img && img.complete && img.naturalWidth > 0) {
        cx.drawImage(img, 0, 0, cw, ch);
      } else {
        cx.fillStyle = getComputedStyle(el).backgroundColor || "#E86A33";
        cx.fillRect(0, 0, cw, ch);
      }
      var data = cx.getImageData(0, 0, cw, ch).data;
      var solid = [];
      for (var y = 0; y < ch; y++) {
        for (var x = 0; x < cw; x++) {
          if (data[(y * cw + x) * 4 + 3] > 35) solid.push(x, y);
        }
      }
      var tot = solid.length / 2;
      if (tot > 0) {
        var step = Math.max(1, tot / count);
        for (var k = 0; k < tot; k += step) {
          var idx = Math.floor(k) * 2;
          var px = solid[idx], py = solid[idx + 1];
          var di = (py * cw + px) * 4;
          pts.push({
            x: rect.left + (px + 0.5) / sc,
            y: rect.top + (py + 0.5) / sc,
            r: data[di], g: data[di + 1], b: data[di + 2]
          });
        }
      }
    } catch (e) {}
    if (pts.length < 30) {
      for (var i = 0; i < 400; i++) {
        pts.push({ x: rect.left + Math.random() * rect.width, y: rect.top + Math.random() * rect.height, r: 232, g: 106, b: 51 });
      }
    }
    return pts;
  }

  return {
    usesStage: true,
    run: function (el, ctx) {
      return new Promise(function (resolve) {
        var p = (ctx && ctx.params) || {};
        var fromEl = (p.fromEl && document.getElementById(p.fromEl)) || el;
        var toEl = p.toEl ? document.getElementById(p.toEl) : null;
        var tint = parseHex(p.dustColor);

        if (!ctx || ctx.isPreview || !ctx.stage || !ctx.fromPage || !ctx.toPage || !fromEl || !toEl) {
          if (fromEl) {
            fromEl.dataset._origOp = fromEl.style.opacity || "1";
            fromEl.style.transition = "opacity 0.3s ease, transform 0.3s ease";
            fromEl.style.opacity = "0.15";
            fromEl.style.transform = "scale(1.12)";
            setTimeout(function () {
              fromEl.style.opacity = fromEl.dataset._origOp;
              fromEl.style.transform = "";
              resolve();
            }, 340);
          } else resolve();
          return;
        }

        var fromRect = ctx.getRect(fromEl);
        var toRect = ctx.getRect(toEl);
        if (!fromRect || !toRect || !fromRect.width || !toRect.width) { resolve(); return; }

        var srcPts = sampleViewportEl(fromEl, fromRect, 1100);
        var dstPts = sampleViewportEl(toEl, toRect, 1100);
        var count = Math.max(srcPts.length, dstPts.length);

        var particles = new Array(count);
        for (var i = 0; i < count; i++) {
          var s = srcPts[i % srcPts.length];
          var d = dstPts[(i * 7) % dstPts.length];
          var ang = Math.random() * Math.PI * 2;
          var spread = 24 + Math.random() * 72;
          particles[i] = {
            sx: s.x, sy: s.y, tx: d.x, ty: d.y,
            sr: s.r, sg: s.g, sb: s.b, tr: d.r, tg: d.g, tb: d.b,
            bx: Math.cos(ang) * spread, by: Math.sin(ang) * spread,
            delay: Math.random() * 0.22,
            span: 0.56 + Math.random() * 0.22,
            phase: Math.random() * Math.PI * 2,
            size: 1.5 + Math.random() * 1.8
          };
        }

        var vw = window.innerWidth, vh = window.innerHeight;
        var canvas = document.createElement("canvas");
        canvas.width = vw; canvas.height = vh;
        canvas.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;";
        ctx.stage.appendChild(canvas);
        var c2d = canvas.getContext("2d");

        var prevFromVis = fromEl.style.visibility;
        var prevToVis = toEl.style.visibility;
        fromEl.style.visibility = "hidden";
        toEl.style.visibility = "hidden";

        var dur = 980, start = null;
        function tick(ts) {
          if (!start) start = ts;
          var elapsed = ts - start;
          var prog = Math.min(1, elapsed / dur);

          // تلاشي سلس بين الصفحتين تحت سحابة الذرات
          ctx.fromPage.style.opacity = String(Math.max(0, 1 - prog * 1.35));
          ctx.toPage.style.opacity = String(Math.min(1, Math.max(0, (prog - 0.15) / 0.75)));

          c2d.clearRect(0, 0, vw, vh);
          for (var i = 0; i < count; i++) {
            var pt = particles[i];
            var lp = (prog - pt.delay) / pt.span;
            if (lp < 0) lp = 0; else if (lp > 1) lp = 1;
            var ease = lp < 0.5 ? 4 * lp * lp * lp : 1 - Math.pow(-2 * lp + 2, 3) / 2;
            var energy = Math.sin(Math.PI * lp);

            var px = pt.sx + (pt.tx - pt.sx) * ease + pt.bx * energy * energy + Math.sin(elapsed * 0.03 + pt.phase) * 4 * energy;
            var py = pt.sy + (pt.ty - pt.sy) * ease + pt.by * energy * energy + Math.cos(elapsed * 0.03 + pt.phase) * 4 * energy;

            if (tint) {
              c2d.fillStyle = tint;
            } else {
              var rr = (pt.sr + (pt.tr - pt.sr) * ease) | 0;
              var gg = (pt.sg + (pt.tg - pt.sg) * ease) | 0;
              var bb = (pt.sb + (pt.tb - pt.sb) * ease) | 0;
              c2d.fillStyle = "rgb(" + rr + "," + gg + "," + bb + ")";
            }
            c2d.globalAlpha = 0.7 + 0.3 * energy;
            var sz = pt.size * (0.85 + 0.45 * energy);
            c2d.fillRect(px - sz * 0.5, py - sz * 0.5, sz, sz);
          }

          if (prog < 1) {
            requestAnimationFrame(tick);
          } else {
            fromEl.style.visibility = prevFromVis;
            toEl.style.visibility = prevToVis;
            if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
            resolve();
          }
        }
        requestAnimationFrame(tick);
      });
    },
    reset: function (el) {
      if (!el) return;
      el.style.transition = "none";
      el.style.visibility = "";
      el.style.transform = "";
      if (el.dataset._origOp !== undefined) el.style.opacity = el.dataset._origOp;
    }
  };
})();
