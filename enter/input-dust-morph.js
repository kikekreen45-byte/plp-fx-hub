window.PLP_FX = window.PLP_FX || {};
window.PLP_FX["enter_input_dust_morph"] = (function () {
  var cachedWrapBgImg = null;
  var cachedWrapBgSrc = "";

  function parseHex(hex) {
    var c = String(hex || "").trim().replace(/^#/, "");
    if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
    if (!/^[0-9a-fA-F]{6}$/.test(c)) return null;
    return {
      hex: "#" + c.toUpperCase(),
      r: parseInt(c.slice(0, 2), 16),
      g: parseInt(c.slice(2, 4), 16),
      b: parseInt(c.slice(4, 6), 16)
    };
  }

  function preloadWrapperBg(wrapper) {
    if (!wrapper) return;
    var bgImgCss = getComputedStyle(wrapper).backgroundImage || "";
    var m = bgImgCss.match(/url\(["']?([^"')]+)["']?\)/);
    if (m && m[1] && m[1] !== cachedWrapBgSrc) {
      cachedWrapBgSrc = m[1];
      var im = new Image();
      im.crossOrigin = "anonymous";
      im.src = m[1];
      cachedWrapBgImg = im;
    }
  }

  function parseRot(el) {
    var m = (el.style.transform || "").match(/rotate\(([-\d.]+)deg\)/);
    return m ? (parseFloat(m[1]) * Math.PI) / 180 : 0;
  }

  function drawCompToCtx(ctx, el, ox, oy) {
    var l = parseFloat(el.style.left) || 0;
    var t = parseFloat(el.style.top) || 0;
    var w = parseFloat(el.style.width) || el.offsetWidth || 100;
    var h = parseFloat(el.style.height) || el.offsetHeight || 100;
    var rot = parseRot(el);

    ctx.save();
    ctx.translate(l - ox + w / 2, t - oy + h / 2);
    if (rot) ctx.rotate(rot);
    ctx.translate(-w / 2, -h / 2);

    var img = el.querySelector("img");
    if (img && img.complete && img.naturalWidth > 0) {
      var il = parseFloat(img.style.left) || 0;
      var it = parseFloat(img.style.top) || 0;
      var iw = parseFloat(img.style.width) || w;
      var ih = parseFloat(img.style.height) || h;
      ctx.drawImage(img, il, it, iw, ih);
    } else {
      var cs = getComputedStyle(el);
      var bg = cs.backgroundColor;
      if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
        ctx.fillStyle = bg;
        var rad = parseFloat(cs.borderRadius) || 0;
        if (rad > 0) {
          var r = Math.min(rad, w / 2, h / 2);
          ctx.beginPath();
          ctx.moveTo(r, 0);
          ctx.arcTo(w, 0, w, h, r);
          ctx.arcTo(w, h, 0, h, r);
          ctx.arcTo(0, h, 0, 0, r);
          ctx.arcTo(0, 0, w, 0, r);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillRect(0, 0, w, h);
        }
      }
    }
    ctx.restore();
  }

  function buildBackdropMap(wrapper, elFrom, elTo, boxX, boxY, boxW, boxH, fallbackHex) {
    try {
      var scale = 0.5;
      var bw = Math.max(16, Math.ceil(boxW * scale));
      var bh = Math.max(16, Math.ceil(boxH * scale));
      var c = document.createElement("canvas");
      c.width = bw;
      c.height = bh;
      var ctx = c.getContext("2d");
      ctx.scale(scale, scale);

      ctx.fillStyle = getComputedStyle(document.body).backgroundColor || fallbackHex || "#EFEBE0";
      ctx.fillRect(0, 0, boxW, boxH);

      if (wrapper) {
        var wrapBg = getComputedStyle(wrapper).backgroundColor;
        if (wrapBg && wrapBg !== "rgba(0, 0, 0, 0)" && wrapBg !== "transparent") {
          ctx.fillStyle = wrapBg;
          ctx.fillRect(0, 0, boxW, boxH);
        }
        if (cachedWrapBgImg && cachedWrapBgImg.complete && cachedWrapBgImg.naturalWidth > 0) {
          var ww = parseFloat(wrapper.style.width) || wrapper.offsetWidth || 1058;
          var wh = parseFloat(wrapper.style.height) || wrapper.offsetHeight || 1058;
          ctx.drawImage(cachedWrapBgImg, -boxX, -boxY, ww, wh);
        }
      }

      var maxZ = Math.max(parseInt(elFrom.style.zIndex || 0, 10), parseInt(elTo.style.zIndex || 0, 10));
      var parent = elFrom.parentElement;
      if (parent) {
        var sibs = Array.prototype.slice.call(parent.children).filter(function (s) {
          if (s === elFrom || s === elTo || !s.classList || !s.classList.contains("comp")) return false;
          if (s.style.display === "none" || parseFloat(getComputedStyle(s).opacity) <= 0.02) return false;
          if (parseInt(s.style.zIndex || 0, 10) >= maxZ) return false;
          var sl = parseFloat(s.style.left) || 0, st = parseFloat(s.style.top) || 0;
          var sw = parseFloat(s.style.width) || 0, sh = parseFloat(s.style.height) || 0;
          return sl + sw >= boxX && sl <= boxX + boxW && st + sh >= boxY && st <= boxY + boxH;
        });
        sibs.sort(function (a, b) {
          return parseInt(a.style.zIndex || 0, 10) - parseInt(b.style.zIndex || 0, 10);
        });
        for (var i = 0; i < sibs.length; i++) {
          ctx.save();
          ctx.globalAlpha = parseFloat(getComputedStyle(sibs[i]).opacity) || 1;
          drawCompToCtx(ctx, sibs[i], boxX, boxY);
          ctx.restore();
        }
      }
      return { data: ctx.getImageData(0, 0, bw, bh).data, w: bw, h: bh, x: boxX, y: boxY, scale: scale };
    } catch (e) {
      return null;
    }
  }

  function sampleElementPixels(el, boxX, boxY, boxW, boxH, targetCount) {
    var pts = [];
    var l = parseFloat(el.style.left) || 0;
    var t = parseFloat(el.style.top) || 0;
    var w = parseFloat(el.style.width) || el.offsetWidth || 100;
    var h = parseFloat(el.style.height) || el.offsetHeight || 100;

    try {
      var sc = Math.min(1, 220 / Math.max(boxW, boxH, 1));
      var cw = Math.max(20, Math.ceil(boxW * sc));
      var ch = Math.max(20, Math.ceil(boxH * sc));
      var c = document.createElement("canvas");
      c.width = cw;
      c.height = ch;
      var ctx = c.getContext("2d");
      ctx.scale(sc, sc);
      drawCompToCtx(ctx, el, boxX, boxY);
      var data = ctx.getImageData(0, 0, cw, ch).data;

      var opaque = [];
      for (var y = 0; y < ch; y++) {
        for (var x = 0; x < cw; x++) {
          if (data[(y * cw + x) * 4 + 3] > 35) opaque.push(x, y);
        }
      }
      var total = opaque.length / 2;
      if (total > 0) {
        var step = Math.max(1, total / targetCount);
        for (var k = 0; k < total; k += step) {
          var idxPair = Math.floor(k) * 2;
          var px = opaque[idxPair], py = opaque[idxPair + 1];
          var di = (py * cw + px) * 4;
          pts.push({
            x: boxX + (px + 0.5) / sc,
            y: boxY + (py + 0.5) / sc,
            r: data[di], g: data[di + 1], b: data[di + 2], a: data[di + 3] / 255
          });
        }
      }
    } catch (e) {}

    if (pts.length < 30) {
      for (var n = 0; n < 450; n++) {
        pts.push({ x: l + Math.random() * w, y: t + Math.random() * h, r: 36, g: 32, b: 33, a: 1 });
      }
    }
    return pts;
  }

  function resolveSwappedColor(px, py, br, bg, bb, bgMap, colA, colB) {
    if (bgMap && colA && colB) {
      var bx = Math.max(0, Math.min(bgMap.w - 1, Math.floor((px - bgMap.x) * bgMap.scale)));
      var by = Math.max(0, Math.min(bgMap.h - 1, Math.floor((py - bgMap.y) * bgMap.scale)));
      var idx = (by * bgMap.w + bx) * 4;
      var r = bgMap.data[idx], g = bgMap.data[idx + 1], b = bgMap.data[idx + 2];

      var dA = Math.abs(r - colA.r) + Math.abs(g - colA.g) + Math.abs(b - colA.b);
      var dB = Math.abs(r - colB.r) + Math.abs(g - colB.g) + Math.abs(b - colB.b);
      if (dA <= 115 && dA <= dB) return colB.hex;
      if (dB <= 115 && dB < dA) return colA.hex;

      var vr = colB.r - colA.r, vg = colB.g - colA.g, vb = colB.b - colA.b;
      var lenSq = vr * vr + vg * vg + vb * vb;
      if (lenSq > 100) {
        var t = ((r - colA.r) * vr + (g - colA.g) * vg + (b - colA.b) * vb) / lenSq;
        if (t >= 0 && t <= 1) {
          var dr = r - (colA.r + vr * t), dg = g - (colA.g + vg * t), db = b - (colA.b + vb * t);
          if (Math.abs(dr) + Math.abs(dg) + Math.abs(db) < 60) {
            return t < 0.5 ? colB.hex : colA.hex;
          }
        }
      }
    }
    return "rgb(" + (br | 0) + "," + (bg | 0) + "," + (bb | 0) + ")";
  }

  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
  }

  function runDustMorph(elFrom, elTo, colA, colB, onDone) {
    if (!elFrom || !elTo) { if (onDone) onDone(); return; }
    var parent = elFrom.parentElement;
    if (!parent) { if (onDone) onDone(); return; }

    if (parent._dustRaf) { cancelAnimationFrame(parent._dustRaf); parent._dustRaf = null; }
    if (parent._dustCanvas && parent._dustCanvas.parentNode) {
      parent._dustCanvas.parentNode.removeChild(parent._dustCanvas);
    }

    var fL = parseFloat(elFrom.style.left) || 0, fT = parseFloat(elFrom.style.top) || 0;
    var fW = parseFloat(elFrom.style.width) || elFrom.offsetWidth || 100;
    var fH = parseFloat(elFrom.style.height) || elFrom.offsetHeight || 100;
    var tL = parseFloat(elTo.style.left) || 0, tT = parseFloat(elTo.style.top) || 0;
    var tW = parseFloat(elTo.style.width) || elTo.offsetWidth || 100;
    var tH = parseFloat(elTo.style.height) || elTo.offsetHeight || 100;

    var pad = Math.min(130, Math.max(65, Math.round(Math.max(fW, fH, tW, tH) * 0.48)));
    var minX = Math.min(fL, tL) - pad;
    var minY = Math.min(fT, tT) - pad;
    var maxX = Math.max(fL + fW, tL + tW) + pad;
    var maxY = Math.max(fT + fH, tT + tH) + pad;
    var boxW = Math.max(40, Math.ceil(maxX - minX));
    var boxH = Math.max(40, Math.ceil(maxY - minY));

    var wrapper = elFrom.closest(".plp-wrapper");
    preloadWrapperBg(wrapper);

    var targetCount = 1350;
    var srcPts = sampleElementPixels(elFrom, minX, minY, boxW, boxH, targetCount);
    var dstPts = sampleElementPixels(elTo, minX, minY, boxW, boxH, targetCount);
    var bgMap = (colA && colB) ? buildBackdropMap(wrapper, elFrom, elTo, minX, minY, boxW, boxH, colA.hex) : null;

    shuffle(srcPts);
    shuffle(dstPts);
    var count = Math.max(srcPts.length, dstPts.length);
    var cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;

    var particles = new Array(count);
    for (var i = 0; i < count; i++) {
      var s = srcPts[i % srcPts.length];
      var d = dstPts[i % dstPts.length];
      var ang = Math.atan2(s.y - cy, s.x - cx) + (Math.random() - 0.5) * 2.2;
      var burst = 18 + Math.random() * (pad * 0.82);
      particles[i] = {
        sx: s.x, sy: s.y, tx: d.x, ty: d.y,
        sr: s.r, sg: s.g, sb: s.b,
        tr: d.r, tg: d.g, tb: d.b,
        bx: Math.cos(ang) * burst,
        by: Math.sin(ang) * burst - Math.random() * 14,
        delay: Math.random() * 0.24,
        span: 0.54 + Math.random() * 0.22,
        freq: 0.022 + Math.random() * 0.032,
        phase: Math.random() * Math.PI * 2,
        buzz: 3.5 + Math.random() * 7.5,
        size: 1.5 + Math.random() * 1.9
      };
    }

    var canvas = document.createElement("canvas");
    canvas.width = boxW;
    canvas.height = boxH;
    canvas.style.position = "absolute";
    canvas.style.left = minX + "px";
    canvas.style.top = minY + "px";
    canvas.style.width = boxW + "px";
    canvas.style.height = boxH + "px";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = String(Math.max(parseInt(elFrom.style.zIndex || 0, 10), parseInt(elTo.style.zIndex || 0, 10)) + 5);
    parent.appendChild(canvas);
    parent._dustCanvas = canvas;

    var ctx = canvas.getContext("2d");
    var opFrom = parseFloat(elFrom.dataset._origOp || "1");
    var opTo = parseFloat(elTo.dataset._origOp || "1");
    var duration = 1080;
    var startTime = null;

    elFrom.style.transition = "none";
    elTo.style.transition = "none";
    elFrom.style.pointerEvents = "none";
    elTo.style.pointerEvents = "none";

    function step(ts) {
      if (!startTime) startTime = ts;
      var elapsed = ts - startTime;
      var p = Math.min(1, elapsed / duration);

      elFrom.style.opacity = p < 0.16 ? String(opFrom * (1 - p / 0.16)) : "0";
      elTo.style.opacity = p > 0.84 ? String(opTo * ((p - 0.84) / 0.16)) : "0";
      ctx.clearRect(0, 0, boxW, boxH);

      for (var i = 0; i < count; i++) {
        var pt = particles[i];
        var lp = (p - pt.delay) / pt.span;
        if (lp < 0) lp = 0; else if (lp > 1) lp = 1;

        var ease = lp < 0.5 ? 4 * lp * lp * lp : 1 - Math.pow(-2 * lp + 2, 3) / 2;
        var energy = Math.sin(Math.PI * lp);
        var swirl = energy * energy;
        var jx = Math.sin(elapsed * pt.freq + pt.phase) * pt.buzz * energy;
        var jy = Math.cos(elapsed * pt.freq * 1.17 + pt.phase) * pt.buzz * energy;

        var px = pt.sx + (pt.tx - pt.sx) * ease + pt.bx * swirl + jx;
        var py = pt.sy + (pt.ty - pt.sy) * ease + pt.by * swirl + jy;
        var rr = pt.sr + (pt.tr - pt.sr) * ease;
        var gg = pt.sg + (pt.tg - pt.sg) * ease;
        var bb = pt.sb + (pt.tb - pt.sb) * ease;

        ctx.fillStyle = resolveSwappedColor(px, py, rr, gg, bb, bgMap, colA, colB);
        ctx.globalAlpha = 0.65 + 0.35 * (0.5 + 0.5 * Math.sin(elapsed * pt.freq * 1.5 + pt.phase));
        var sz = pt.size * (0.8 + 0.45 * energy);
        ctx.fillRect(px - minX - sz * 0.5, py - minY - sz * 0.5, sz, sz);
      }

      if (p < 1) {
        parent._dustRaf = requestAnimationFrame(step);
      } else {
        parent._dustRaf = null;
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
        parent._dustCanvas = null;
        elFrom.style.opacity = "0";
        elFrom.style.pointerEvents = "none";
        elTo.style.opacity = String(opTo);
        elTo.style.pointerEvents = "auto";
        if (onDone) onDone();
      }
    }

    parent._dustRaf = requestAnimationFrame(step);
  }

  function resolvePair(el, ctx) {
    var p = (ctx && ctx.params) || {};
    var elFrom = (p.fromEl && document.getElementById(p.fromEl)) || el;
    var elTo = p.targetEl ? document.getElementById(p.targetEl) : null;
    return {
      elFrom: elFrom,
      elTo: elTo,
      inputId: p.triggerInput || "",
      colA: parseHex(p.colorA),
      colB: parseHex(p.colorB)
    };
  }

  return {
    setup: function (el, ctx) {
      var cfg = resolvePair(el, ctx);
      if (cfg.elFrom && cfg.elFrom.dataset._origOp === undefined) cfg.elFrom.dataset._origOp = cfg.elFrom.style.opacity || "1";
      if (cfg.elTo) {
        if (cfg.elTo.dataset._origOp === undefined) cfg.elTo.dataset._origOp = cfg.elTo.style.opacity || "1";
        cfg.elTo.style.opacity = "0";
        cfg.elTo.style.pointerEvents = "none";
      }
    },
    run: function (el, ctx) {
      return new Promise(function (resolve) {
        var cfg = resolvePair(el, ctx);
        var elFrom = cfg.elFrom, elTo = cfg.elTo;
        if (!elFrom || !elTo) { resolve(); return; }

        el._dustFromRef = elFrom;
        el._dustToRef = elTo;
        if (elFrom.dataset._origOp === undefined) elFrom.dataset._origOp = elFrom.style.opacity || "1";
        if (elTo.dataset._origOp === undefined) elTo.dataset._origOp = elTo.style.opacity || "1";
        preloadWrapperBg(elFrom.closest(".plp-wrapper"));

        if ((ctx && ctx.isPreview) || !cfg.inputId) {
          runDustMorph(elFrom, elTo, cfg.colA, cfg.colB, resolve);
          return;
        }

        elFrom.style.opacity = elFrom.dataset._origOp;
        elFrom.style.pointerEvents = "auto";
        elTo.style.opacity = "0";
        elTo.style.pointerEvents = "none";

        var tries = 0;
        function bindInput() {
          var host = document.getElementById(cfg.inputId);
          var inp = host ? (host.querySelector(".plp-live-input, input, textarea") || (host.tagName === "INPUT" ? host : null)) : null;
          if (!inp) {
            if (++tries < 15) setTimeout(bindInput, 100);
            else resolve();
            return;
          }

          var bindKey = "_dustBound_" + elFrom.id + "_" + elTo.id;
          if (!inp[bindKey]) {
            inp[bindKey] = true;
            var currentState = (inp.value && inp.value.length > 0) ? "to" : "from";
            if (currentState === "to") {
              elFrom.style.opacity = "0"; elFrom.style.pointerEvents = "none";
              elTo.style.opacity = elTo.dataset._origOp; elTo.style.pointerEvents = "auto";
            }

            inp.addEventListener("input", function () {
              var hasChar = inp.value.length > 0;
              if (hasChar && currentState !== "to") {
                currentState = "to";
                runDustMorph(elFrom, elTo, cfg.colA, cfg.colB);
              } else if (!hasChar && currentState !== "from") {
                currentState = "from";
                runDustMorph(elTo, elFrom, cfg.colA, cfg.colB);
              }
            });
          }
          resolve();
        }
        bindInput();
      });
    },
    reset: function (el, ctx) {
      var cfg = resolvePair(el, ctx);
      var elFrom = (el && el._dustFromRef) || cfg.elFrom;
      var elTo = (el && el._dustToRef) || cfg.elTo;
      var parent = elFrom && elFrom.parentElement;
      if (parent) {
        if (parent._dustRaf) { cancelAnimationFrame(parent._dustRaf); parent._dustRaf = null; }
        if (parent._dustCanvas && parent._dustCanvas.parentNode) {
          parent._dustCanvas.parentNode.removeChild(parent._dustCanvas);
          parent._dustCanvas = null;
        }
      }
      if (elFrom && elFrom.dataset._origOp !== undefined) {
        elFrom.style.opacity = elFrom.dataset._origOp;
        elFrom.style.pointerEvents = "auto";
      }
      if (elTo && elTo.dataset._origOp !== undefined) {
        elTo.style.opacity = elTo.dataset._origOp;
        elTo.style.pointerEvents = "auto";
      }
    }
  };
})();
