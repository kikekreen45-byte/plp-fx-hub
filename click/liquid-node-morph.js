window.PLP_FX = window.PLP_FX || {};
window.PLP_FX["click_liquid_node_morph"] = (function () {
  function parseHex(hex) {
    var c = String(hex || "").trim().replace(/^#/, "");
    if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
    if (!/^[0-9a-fA-F]{6}$/.test(c)) return null;
    return {
      r: parseInt(c.slice(0, 2), 16),
      g: parseInt(c.slice(2, 4), 16),
      b: parseInt(c.slice(4, 6), 16)
    };
  }

  function sampleElementColor(el) {
    var fallback = { r: 36, g: 32, b: 33 };
    if (!el) return fallback;
    try {
      var img = el.querySelector("img");
      if (img && img.complete && img.naturalWidth > 0) {
        var c = document.createElement("canvas");
        c.width = 24;
        c.height = 24;
        var cx = c.getContext("2d");
        cx.drawImage(img, 0, 0, 24, 24);
        var d = cx.getImageData(0, 0, 24, 24).data;
        var rs = 0, gs = 0, bs = 0, n = 0;
        for (var i = 0; i < d.length; i += 4) {
          if (d[i + 3] > 60) {
            rs += d[i]; gs += d[i + 1]; bs += d[i + 2]; n++;
          }
        }
        if (n > 0) return { r: Math.round(rs / n), g: Math.round(gs / n), b: Math.round(bs / n) };
      } else {
        var bg = getComputedStyle(el).backgroundColor || "";
        var m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (m) return { r: +m[1], g: +m[2], b: +m[3] };
      }
    } catch (e) {}
    return fallback;
  }

  function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function smoothstep(a, b, x) {
    var t = clamp((x - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  }
  function easeOutCubic(t) { return 1 - Math.pow(1 - clamp(t, 0, 1), 3); }
  function easeInOutCubic(t) {
    t = clamp(t, 0, 1);
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  function easeInQuad(t) { t = clamp(t, 0, 1); return t * t; }
  function easeOutBack(t) {
    t = clamp(t, 0, 1);
    var c1 = 1.65, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  function safeRect(el) {
    if (!el) return null;
    var r = el.getBoundingClientRect();
    if (r && r.width > 1 && r.height > 1) return r;
    var prevDisp = el.style.display;
    var prevVis = el.style.visibility;
    el.style.visibility = "hidden";
    el.style.display = "";
    r = el.getBoundingClientRect();
    el.style.display = prevDisp;
    el.style.visibility = prevVis;
    return (r && r.width > 1 && r.height > 1) ? r : null;
  }

  // رسم جسر سائل فيكتور نقي بين دائرتين بدون أي بكسلة (Vector Metaball Bridge)
  function drawVectorBridge(ctx, x1, y1, r1, x2, y2, r2, maxRatio) {
    if (r1 < 1 || r2 < 1) return;
    var dx = x2 - x1;
    var dy = y2 - y1;
    var d = Math.hypot(dx, dy);
    var totalR = r1 + r2;
    var maxDist = totalR * (maxRatio || 2.1);

    if (d <= Math.abs(r1 - r2) + 0.5 || d >= maxDist) return;

    var startGap = totalR * 0.72;
    var gapRatio = clamp((d - startGap) / Math.max(1, maxDist - startGap), 0, 1);
    if (gapRatio >= 0.992) return;

    var u1 = 0, u2 = 0;
    if (d < totalR) {
      u1 = Math.acos(clamp((r1 * r1 + d * d - r2 * r2) / (2 * r1 * d), -1, 1));
      u2 = Math.acos(clamp((r2 * r2 + d * d - r1 * r1) / (2 * r2 * d), -1, 1));
    }

    var angleBetween = Math.atan2(dy, dx);
    var maxSpread = Math.acos(clamp((r1 - r2) / d, -1, 1));

    // تضييق زاوية الاتصال تدريجياً قبل الانفصال حتى ينقطع الجسر بنعومة تامة
    var v = lerp(0.56, 0.14, Math.pow(gapRatio, 0.85));

    var a1 = angleBetween + u1 + (maxSpread - u1) * v;
    var a2 = angleBetween - u1 - (maxSpread - u1) * v;
    var a3 = angleBetween + Math.PI - u2 - (Math.PI - u2 - maxSpread) * v;
    var a4 = angleBetween - Math.PI + u2 + (Math.PI - u2 - maxSpread) * v;

    var p1x = x1 + Math.cos(a1) * r1, p1y = y1 + Math.sin(a1) * r1;
    var p2x = x1 + Math.cos(a2) * r1, p2y = y1 + Math.sin(a2) * r1;
    var p3x = x2 + Math.cos(a3) * r2, p3y = y2 + Math.sin(a3) * r2;
    var p4x = x2 + Math.cos(a4) * r2, p4y = y2 + Math.sin(a4) * r2;

    var ux = dx / d, uy = dy / d;
    var nx = -uy, ny = ux;

    var dp13 = Math.hypot(p3x - p1x, p3y - p1y);
    var handleBase = lerp(0.46, 0.62, gapRatio);

    function calcHandle(px, py, cx, cy, tangAng, rad, sideSign) {
      var tx = Math.cos(tangAng), ty = Math.sin(tangAng);
      var hDist = Math.abs((px - cx) * nx + (py - cy) * ny);
      var towardAxis = -(tx * nx + ty * ny) * sideSign;
      var maxL = dp13 * 0.52;
      if (towardAxis > 0.06) {
        var pinchCap = (hDist / (0.75 * towardAxis)) * lerp(0.88, 0.995, gapRatio);
        if (pinchCap < maxL) maxL = pinchCap;
      }
      var L = Math.min(maxL, Math.max(rad * 0.45, dp13 * handleBase));
      return { x: px + tx * L, y: py + ty * L };
    }

    var h1 = calcHandle(p1x, p1y, x1, y1, a1 - Math.PI * 0.5, r1, 1);
    var h3 = calcHandle(p3x, p3y, x2, y2, a3 + Math.PI * 0.5, r2, 1);
    var h4 = calcHandle(p4x, p4y, x2, y2, a4 - Math.PI * 0.5, r2, -1);
    var h2 = calcHandle(p2x, p2y, x1, y1, a2 + Math.PI * 0.5, r1, -1);

    ctx.beginPath();
    ctx.moveTo(p1x, p1y);
    ctx.bezierCurveTo(h1.x, h1.y, h3.x, h3.y, p3x, p3y);
    ctx.lineTo(p4x, p4y);
    ctx.bezierCurveTo(h4.x, h4.y, h2.x, h2.y, p2x, p2y);
    ctx.closePath();
    ctx.fill();
  }

  function drawVectorLiquidSet(ctx, list, fillCss, bridgeRatio) {
    if (!list.length) return;
    ctx.fillStyle = fillCss;

    // 1. رسم الجسور السائلة بين القطرات المتقاربة بدقة فيكتور كاملة
    for (var i = 0; i < list.length; i++) {
      for (var j = i + 1; j < list.length; j++) {
        var a = list[i], b = list[j];
        var ra = (a.rx + a.ry) * 0.5;
        var rb = (b.rx + b.ry) * 0.5;
        drawVectorBridge(ctx, a.x, a.y, ra, b.x, b.y, rb, bridgeRatio || 2.15);
      }
    }

    // 2. رسم القطرات نفسها كأقواس/أشكال بيضاوية فيكتور نقية تماماً
    for (var k = 0; k < list.length; k++) {
      var it = list[k];
      if (it.rx < 0.6 || it.ry < 0.6) continue;
      ctx.beginPath();
      if (Math.abs(it.rx - it.ry) < 0.25) {
        ctx.arc(it.x, it.y, it.rx, 0, Math.PI * 2);
      } else {
        ctx.ellipse(it.x, it.y, it.rx, it.ry, it.ang || 0, 0, Math.PI * 2);
      }
      ctx.fill();
    }
  }

  function runLiquidAnimation(fromEl, toEl, fromRect, toRect, opts, crossCtx) {
    return new Promise(function (resolve) {
      var vw = window.innerWidth;
      var vh = window.innerHeight;
      var dpr = Math.min(3, Math.max(1.5, window.devicePixelRatio || 1));

      var display = document.createElement("canvas");
      display.width = Math.ceil(vw * dpr);
      display.height = Math.ceil(vh * dpr);
      display.style.cssText =
        "position:fixed;left:0;top:0;width:" + vw + "px;height:" + vh +
        "px;pointer-events:none;z-index:760;";
      var host = (crossCtx && crossCtx.stage) || document.body;
      host.appendChild(display);
      var dCtx = display.getContext("2d");
      dCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var col = opts.color || sampleElementColor(fromEl);
      var colRgb = col.r + "," + col.g + "," + col.b;
      var solidColor = "rgb(" + colRgb + ")";
      var duration = opts.duration;
      var blobCount = opts.blobCount;
      var hudMode = opts.hudMode;

      var sx = fromRect.left + fromRect.width * 0.5;
      var sy = fromRect.top + fromRect.height * 0.5;
      var tx = toRect.left + toRect.width * 0.5;
      var ty = toRect.top + toRect.height * 0.5;

      var sR = clamp(Math.min(fromRect.width, fromRect.height) * 0.36, 13, 38);
      var tR = clamp(Math.min(toRect.width, toRect.height) * 0.36, 13, 38);
      var dropDist = clamp(sR * 1.35, 22, 54);
      var apexLift = clamp(sR * 2.15, 36, 86);
      var groundY = sy + dropDist;

      var spreadX = clamp(Math.max(vw * 0.30, Math.abs(tx - sx) * 0.55), 85, vw * 0.40);
      var spreadY = clamp(Math.max(vh * 0.085, Math.abs(ty - sy) * 0.35), 34, vh * 0.16);

      var blobs = [];
      for (var i = 0; i < blobCount; i++) {
        var frac = blobCount === 1 ? 0 : (i / (blobCount - 1)) * 2 - 1;
        var jitterX = Math.sin(i * 4.31) * 0.18;
        var ox = (frac + jitterX) * spreadX;
        var oy = Math.cos(i * 2.17 + 0.6) * spreadY;
        var isSat = i >= Math.max(3, blobCount - 2);
        var baseRad = lerp(sR, tR, 0.5) * (isSat ? (0.34 + (i % 2) * 0.15) : (0.50 + ((i * 37) % 10) * 0.032));
        blobs.push({
          ox: ox,
          oy: oy,
          driftX: Math.cos(i * 3.1) * 26,
          driftY: Math.sin(i * 2.7) * 24 - 16,
          r: clamp(baseRad, 6, 26),
          phase: i * 1.47,
          parentIdx: isSat ? (i % Math.max(2, blobCount - 2)) : -1,
          splitDelay: isSat ? (0.14 + (i % 2) * 0.05) : (Math.abs(frac) * 0.03),
          numSeed: 120 + ((i * 217 + 93) % 820),
          numSpeed: 65 + (i % 4) * 38,
          x: sx, y: sy, px: sx, py: sy, ang: 0, curR: sR
        });
      }

      var fromOrigOp = fromEl ? (fromEl.dataset._origOp || getComputedStyle(fromEl).opacity || "1") : "1";
      var toOrigOp = toEl ? (toEl.dataset._origOp || getComputedStyle(toEl).opacity || "1") : "1";
      var fromOrigT = fromEl ? (fromEl.style.transform || "") : "";
      var toOrigT = toEl ? (toEl.style.transform || "") : "";

      if (fromEl) fromEl.style.transition = "none";
      if (toEl) {
        toEl.style.transition = "none";
        toEl.style.opacity = "0";
        if (toEl.style.display === "none") toEl.style.display = "";
      }

      var activeBlobs = [];
      var startTs = null;
      var rafId = null;

      function step(ts) {
        if (!startTs) startTs = ts;
        var elapsed = ts - startTs;
        var p = Math.min(1, elapsed / duration);

        dCtx.clearRect(0, 0, vw, vh);
        display.style.opacity = "1";
        activeBlobs.length = 0;

        if (crossCtx && crossCtx.fromPage && crossCtx.toPage) {
          var swapP = smoothstep(0.42, 0.78, p);
          crossCtx.fromPage.style.opacity = String(1 - swapP);
          crossCtx.toPage.style.opacity = String(swapP);
        }

        if (fromEl) {
          if (p < 0.08) {
            var fp = p / 0.08;
            fromEl.style.opacity = String(parseFloat(fromOrigOp) * (1 - fp));
            fromEl.style.transform = fromOrigT + " scale(" + (1 - fp * 0.22).toFixed(3) + ")";
          } else {
            fromEl.style.opacity = "0";
          }
        }

        // ====== المرحلة 1 و 2: الهبوط + القفزة + الخيط العمودي النقي (0.00 -> 0.35) ======
        if (p < 0.35) {
          var cy = sy;
          var rx = sR, ry = sR;
          var shadowAlpha = 0;
          var tetherTop = 0, tetherBot = 0, tetherAlpha = 0;

          if (p < 0.13) {
            var t1 = p / 0.13;
            var e1 = easeInQuad(t1);
            cy = lerp(sy, groundY, e1);
            rx = sR * (1 - 0.13 * Math.sin(t1 * Math.PI));
            ry = sR * (1 + 0.16 * Math.sin(t1 * Math.PI));
            shadowAlpha = smoothstep(0.03, 0.12, p) * 0.12;
          } else if (p < 0.26) {
            var t2 = (p - 0.13) / 0.13;
            var e2 = easeOutCubic(t2);
            cy = lerp(groundY, sy - apexLift, e2);
            var stretchPulse = Math.sin(t2 * Math.PI);
            rx = sR * (1 - 0.15 * stretchPulse);
            ry = sR * (1 + 0.20 * stretchPulse);
            shadowAlpha = 0.12 * (1 - t2 * 0.45);

            if (t2 < 0.88) {
              tetherAlpha = (1 - smoothstep(0.62, 0.88, t2)) * 0.82;
              tetherTop = cy + ry * 0.72;
              var snapUp = smoothstep(0.38, 0.86, t2);
              tetherBot = lerp(groundY + sR * 0.9, cy + ry * 0.85, snapUp);
            }
          } else {
            var t3 = (p - 0.26) / 0.09;
            var e3 = easeInQuad(t3);
            cy = lerp(sy - apexLift, sy + dropDist * 0.35, e3);
            rx = sR * (1 - 0.12 * e3);
            ry = sR * (1 + 0.18 * e3);
            shadowAlpha = 0.06 * (1 - t3);
          }

          if (shadowAlpha > 0.005) {
            dCtx.save();
            dCtx.fillStyle = "rgba(" + colRgb + "," + shadowAlpha.toFixed(3) + ")";
            dCtx.beginPath();
            dCtx.ellipse(sx, groundY + sR * 1.05, sR * 1.25, sR * 0.23, 0, 0, Math.PI * 2);
            dCtx.fill();
            dCtx.restore();
          }

          if (tetherAlpha > 0.01 && tetherBot > tetherTop) {
            dCtx.save();
            dCtx.strokeStyle = "rgba(" + colRgb + "," + tetherAlpha.toFixed(3) + ")";
            dCtx.lineWidth = 1.15;
            dCtx.lineCap = "round";
            dCtx.beginPath();
            dCtx.moveTo(sx, tetherTop);
            dCtx.lineTo(sx, tetherBot);
            dCtx.stroke();
            dCtx.restore();
          }

          activeBlobs.push({ x: sx, y: cy, rx: rx, ry: ry, ang: 0 });
          if (p > 0.29) {
            var bulbT = (p - 0.29) / 0.06;
            var bRad = sR * (0.45 + 0.34 * bulbT);
            activeBlobs.push({ x: sx - sR * 0.32 * bulbT, y: cy + sR * 0.56 * bulbT, rx: bRad, ry: bRad, ang: 0 });
            activeBlobs.push({ x: sx + sR * 0.32 * bulbT, y: cy + sR * 0.56 * bulbT, rx: bRad, ry: bRad, ang: 0 });
          }

          display.style.opacity = String(smoothstep(0.0, 0.06, p));
          drawVectorLiquidSet(dCtx, activeBlobs, solidColor, 2.2);
        }
        // ====== المرحلة 3 و 4: الانقسام السائل بالفيكتور + الشبكة والأرقام + الالتحام (0.35 -> 0.90) ======
        else if (p < 0.90) {
          var mp = (p - 0.35) / 0.55;
          var travelE = easeInOutCubic(mp);
          var baseCenterX = lerp(sx, tx, travelE);
          var baseCenterY = lerp(sy + dropDist * 0.35, ty, travelE);

          for (var i = 0; i < blobs.length; i++) {
            var b = blobs[i];
            b.px = b.x;
            b.py = b.y;

            var localMp = clamp((mp - b.splitDelay) / Math.max(0.25, 1 - b.splitDelay * 1.25), 0, 1);
            var localSpread = Math.pow(Math.sin(localMp * Math.PI), 0.72);
            var driftWave = Math.sin(mp * Math.PI * 1.6 + b.phase);

            var targetX = baseCenterX + b.ox * localSpread + b.driftX * driftWave * localSpread;
            var targetY = baseCenterY + b.oy * localSpread + b.driftY * Math.sin(mp * Math.PI) * localSpread;

            if (b.parentIdx >= 0 && mp < 0.45) {
              var par = blobs[b.parentIdx];
              var bud = smoothstep(0.18, 0.44, mp);
              targetX = lerp(par.x, targetX, bud);
              targetY = lerp(par.y, targetY, bud);
            }

            b.x = targetX;
            b.y = targetY;

            var vx = b.x - b.px;
            var vy = b.y - b.py;
            var spd = Math.hypot(vx, vy);
            if (spd > 0.3) b.ang = Math.atan2(vy, vx);
            var stretch = 1 + clamp(spd * 0.015, 0, 0.18);

            var radNow = lerp(sR * 0.78, b.r, smoothstep(0.0, 0.22, mp));
            radNow = lerp(radNow, tR * 0.86, smoothstep(0.76, 1.0, mp));
            b.curR = radNow;

            activeBlobs.push({
              x: b.x,
              y: b.y,
              rx: radNow * stretch,
              ry: radNow / Math.sqrt(stretch),
              ang: b.ang
            });
          }

          if (mp > 0.80) {
            var tailT = (mp - 0.80) / 0.20;
            var tailY = ty + lerp(tR * 1.65, 0, easeInOutCubic(tailT));
            var tailR = tR * 0.34 * (1 - tailT * 0.65);
            if (tailR > 1.8) {
              activeBlobs.push({ x: tx, y: tailY, rx: tailR * 0.82, ry: tailR * 1.15, ang: 0 });
            }
          }

          // 1. شبكة الخطوط الهندسية الرفيعة الدقيقة
          var hudAlpha = smoothstep(0.06, 0.20, mp) * (1 - smoothstep(0.76, 0.90, mp));
          if (hudMode !== "liquid" && hudAlpha > 0.01) {
            dCtx.save();
            dCtx.strokeStyle = "rgba(" + colRgb + "," + (0.22 * hudAlpha).toFixed(3) + ")";
            dCtx.lineWidth = 0.75;
            for (var a = 0; a < blobs.length; a++) {
              for (var c = a + 1; c < blobs.length; c++) {
                var d = Math.hypot(blobs[a].x - blobs[c].x, blobs[a].y - blobs[c].y);
                if (d > (blobs[a].curR + blobs[c].curR) * 1.15) {
                  dCtx.beginPath();
                  dCtx.moveTo(blobs[a].x, blobs[a].y);
                  dCtx.lineTo(blobs[c].x, blobs[c].y);
                  dCtx.stroke();
                }
              }
            }
            if (mp < 0.38 && blobs.length >= 2) {
              var arcAlpha = (1 - smoothstep(0.18, 0.38, mp)) * 0.44 * hudAlpha;
              dCtx.strokeStyle = "rgba(" + colRgb + "," + arcAlpha.toFixed(3) + ")";
              dCtx.lineWidth = 0.85;
              dCtx.beginPath();
              dCtx.moveTo(blobs[0].x, blobs[0].y + blobs[0].curR * 0.5);
              dCtx.quadraticCurveTo(baseCenterX, baseCenterY + 34, blobs[blobs.length - 1].x, blobs[blobs.length - 1].y);
              dCtx.stroke();
            }
            dCtx.restore();
          }

          // 2. رسم القطرات وجسور الالتحام بدقة الفيكتور الكاملة
          drawVectorLiquidSet(dCtx, activeBlobs, solidColor, 2.25);

          // 3. الأرقام التقنية الحادة بجانب كل قطرة
          if (hudMode === "full" && hudAlpha > 0.02) {
            dCtx.save();
            dCtx.font = "600 9.5px monospace";
            dCtx.textBaseline = "middle";
            dCtx.fillStyle = "rgba(" + colRgb + "," + (0.76 * hudAlpha).toFixed(3) + ")";
            for (var ni = 0; ni < blobs.length; ni++) {
              var nb = blobs[ni];
              if (nb.parentIdx >= 0 && mp < 0.34) continue;
              var val = Math.abs(Math.floor(nb.numSeed + Math.sin(elapsed * 0.004 + nb.phase) * nb.numSpeed + mp * 420)) % 999;
              var txt = String(val).padStart(3, "0");
              dCtx.fillText(txt, nb.x - nb.curR - 22, nb.y - nb.curR * 0.55);
            }
            dCtx.restore();
          }
        }
        // ====== المرحلة 5: ارتداد قطرة الذيل الأخيرة واستقرار العنصر الهدف (0.90 -> 1.00) ======
        else {
          var ep = (p - 0.90) / 0.10;
          var coreFade = 1 - smoothstep(0.18, 0.84, ep);

          if (coreFade > 0.01) {
            var bounceSc = lerp(1.07, 1.0, easeOutBack(ep));
            activeBlobs.push({ x: tx, y: ty, rx: tR * bounceSc, ry: tR * (2 - bounceSc), ang: 0 });
            if (ep < 0.45) {
              var dt = ep / 0.45;
              var dropY = ty + lerp(tR * 1.45, tR * 0.32, easeInQuad(dt));
              activeBlobs.push({ x: tx, y: dropY, rx: 2.2 * (1 - dt * 0.55), ry: 5.0 * (1 - dt * 0.45), ang: 0 });
            }
            display.style.opacity = String(coreFade);
            drawVectorLiquidSet(dCtx, activeBlobs, solidColor, 2.0);
          }

          if (toEl) {
            var rev = smoothstep(0.08, 0.85, ep);
            var sc = lerp(0.84, 1.0, easeOutBack(ep));
            toEl.style.opacity = String(parseFloat(toOrigOp) * rev);
            toEl.style.transform = toOrigT + " scale(" + sc.toFixed(3) + ")";
          }
        }

        if (p < 1) {
          rafId = requestAnimationFrame(step);
        } else {
          if (display.parentNode) display.parentNode.removeChild(display);
          if (toEl) {
            toEl.style.opacity = toOrigOp;
            toEl.style.transform = toOrigT;
            toEl.style.pointerEvents = "auto";
          }
          if (fromEl) {
            fromEl.style.transform = fromOrigT;
            if (!crossCtx && opts.hideFrom) {
              fromEl.style.opacity = "0";
              fromEl.style.pointerEvents = "none";
            } else {
              fromEl.style.opacity = fromOrigOp;
            }
          }
          resolve();
        }
      }

      rafId = requestAnimationFrame(step);
      if (fromEl) {
        fromEl._liqCancel = function () {
          if (rafId) cancelAnimationFrame(rafId);
          if (display.parentNode) display.parentNode.removeChild(display);
        };
      }
    });
  }

  return {
    setup: function (el, ctx) {
      var p = (ctx && ctx.params) || {};
      if (p.startHiddenTo !== "yes" || !p.toEl) return;
      var toEl = document.getElementById(p.toEl);
      if (!toEl) return;
      var fromPage = el && el.closest ? el.closest(".html-page") : null;
      var toPage = toEl.closest ? toEl.closest(".html-page") : null;
      if (fromPage && toPage && fromPage === toPage) {
        if (toEl.dataset._origOp === undefined) toEl.dataset._origOp = toEl.style.opacity || "1";
        toEl.style.opacity = "0";
        toEl.style.pointerEvents = "none";
      }
    },
    run: function (el, ctx) {
      var p = (ctx && ctx.params) || {};
      var fromEl = (p.fromEl && document.getElementById(p.fromEl)) || el;
      var toId = p.toEl || "";
      var toEl = toId ? document.getElementById(toId) : null;

      var opts = {
        color: parseHex(p.blobColor),
        blobCount: clamp(parseInt(p.blobCount || "5", 10) || 5, 3, 9),
        hudMode: p.showNumbers || "full",
        duration: clamp(parseInt(p.duration || "2200", 10) || 2200, 900, 5000),
        hideFrom: p.hideFrom !== "no"
      };

      if (!fromEl) return Promise.resolve();
      if (fromEl.dataset._origOp === undefined) fromEl.dataset._origOp = fromEl.style.opacity || "1";
      if (toEl && toEl.dataset._origOp === undefined) toEl.dataset._origOp = toEl.style.opacity || "1";

      if (ctx && ctx.isPreview) {
        var fRectP = safeRect(fromEl);
        if (!fRectP) return Promise.resolve();
        var tRectP = (toEl && toEl !== fromEl) ? safeRect(toEl) : null;
        if (!tRectP) {
          tRectP = { left: fRectP.left, top: Math.max(40, fRectP.top - 10), width: fRectP.width, height: fRectP.height };
        }
        return runLiquidAnimation(fromEl, toEl, fRectP, tRectP, opts, null);
      }

      var fromPageEl = fromEl.closest ? fromEl.closest(".html-page") : null;
      var toPageEl = toEl && toEl.closest ? toEl.closest(".html-page") : null;
      var targetPageNum = toPageEl ? Number(toPageEl.dataset.page) : 0;
      if (!targetPageNum && toId && window.BRAIN && window.BRAIN.nodes && window.BRAIN.nodes[toId]) {
        targetPageNum = Number(window.BRAIN.nodes[toId].page);
      }

      if (window.PLP && targetPageNum > 0 && fromPageEl && Number(fromPageEl.dataset.page) !== targetPageNum) {
        return new Promise(function (resolve) {
          var crossRunner = {
            usesStage: true,
            run: function (trig, sCtx) {
              var fR = safeRect(fromEl);
              var tTarget = document.getElementById(toId);
              var tR = safeRect(tTarget) || fR;
              if (!fR) { resolve(); return Promise.resolve(); }
              return runLiquidAnimation(fromEl, tTarget, fR, tR, opts, sCtx).then(resolve);
            }
          };
          window.PLP.transitionTo(targetPageNum, crossRunner, fromEl, { swapMode: "cross_stage" });
        });
      }

      var fRect = safeRect(fromEl);
      var tRect = safeRect(toEl) || fRect;
      if (!fRect) return Promise.resolve();
      return runLiquidAnimation(fromEl, toEl, fRect, tRect, opts, null);
    },
    reset: function (el, ctx) {
      var p = (ctx && ctx.params) || {};
      var fromEl = (p.fromEl && document.getElementById(p.fromEl)) || el;
      var toEl = p.toEl ? document.getElementById(p.toEl) : null;
      if (fromEl && fromEl._liqCancel) fromEl._liqCancel();
      if (fromEl && fromEl.dataset._origOp !== undefined) {
        fromEl.style.opacity = fromEl.dataset._origOp;
        fromEl.style.pointerEvents = "auto";
      }
      if (toEl && toEl.dataset._origOp !== undefined) {
        toEl.style.opacity = toEl.dataset._origOp;
        toEl.style.pointerEvents = "auto";
      }
    }
  };
})();
