window.PLP_FX = window.PLP_FX || {};
window.PLP_FX["enter_balls_write_text"] = (function () {
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

  function parseRot(el) {
    var m = (el.style.transform || "").match(/rotate\(([-\d.]+)deg\)/);
    return m ? (parseFloat(m[1]) * Math.PI) / 180 : 0;
  }

  function drawTextToCtx(ctx, el, ox, oy) {
    var l = parseFloat(el.style.left) || 0;
    var t = parseFloat(el.style.top) || 0;
    var w = parseFloat(el.style.width) || el.offsetWidth || 120;
    var h = parseFloat(el.style.height) || el.offsetHeight || 60;
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
      ctx.fillStyle = cs.backgroundColor || "#ffffff";
      ctx.fillRect(0, 0, w, h);
    }
    ctx.restore();
  }

  // خوارزمية Chaikin لتنعيم المنحنيات وإزالة أي انكسارات حادة عند الاستدارة
  function smoothPathChaikin(pts, iterations) {
    if (!pts || pts.length < 3) return pts || [];
    var cur = pts;
    for (var it = 0; it < iterations; it++) {
      var next = [cur[0]];
      for (var i = 0; i < cur.length - 1; i++) {
        var p0 = cur[i], p1 = cur[i + 1];
        next.push({ x: p0.x * 0.75 + p1.x * 0.25, y: p0.y * 0.75 + p1.y * 0.25 });
        next.push({ x: p0.x * 0.25 + p1.x * 0.75, y: p0.y * 0.25 + p1.y * 0.75 });
      }
      next.push(cur[cur.length - 1]);
      cur = next;
    }
    return cur;
  }

  // استخراج الجزر المتصلة (المقاطع والنقاط) وبناء مسارات ناعمة من اليمين لليسار
  function analyzeTextIslands(srcCanvas, boxW, boxH) {
    var result = { islands: [], dominantColor: { r: 232, g: 106, b: 51 }, strokeHint: 14 };
    try {
      var anScale = Math.min(1, 160 / Math.max(boxW, boxH, 1));
      var aw = Math.max(24, Math.ceil(boxW * anScale));
      var ah = Math.max(24, Math.ceil(boxH * anScale));
      var ac = document.createElement("canvas");
      ac.width = aw;
      ac.height = ah;
      var actx = ac.getContext("2d");
      actx.drawImage(srcCanvas, 0, 0, aw, ah);
      var data = actx.getImageData(0, 0, aw, ah).data;

      var mask = new Uint8Array(aw * ah);
      var visited = new Uint8Array(aw * ah);
      var rSum = 0, gSum = 0, bSum = 0, cCount = 0;

      for (var y = 0; y < ah; y++) {
        for (var x = 0; x < aw; x++) {
          var idx = y * aw + x;
          var a = data[idx * 4 + 3];
          if (a > 40) {
            mask[idx] = 1;
            rSum += data[idx * 4];
            gSum += data[idx * 4 + 1];
            bSum += data[idx * 4 + 2];
            cCount++;
          }
        }
      }

      if (cCount > 0) {
        result.dominantColor = {
          r: Math.round(rSum / cCount),
          g: Math.round(gSum / cCount),
          b: Math.round(bSum / cCount)
        };
      }

      // BFS لاستخراج كل مقطع وحرف ونقطة منفصلة
      var rawIslands = [];
      var qx = new Int32Array(aw * ah);
      var qy = new Int32Array(aw * ah);

      for (var sy = 0; sy < ah; sy++) {
        for (var sx = 0; sx < aw; sx++) {
          var sIdx = sy * aw + sx;
          if (!mask[sIdx] || visited[sIdx]) continue;

          var head = 0, tail = 0;
          qx[tail] = sx; qy[tail] = sy; tail++;
          visited[sIdx] = 1;

          var minX = sx, maxX = sx, minY = sy, maxY = sy;
          var pxList = [];

          while (head < tail) {
            var cx = qx[head], cy = qy[head]; head++;
            pxList.push(cx, cy);
            if (cx < minX) minX = cx;
            if (cx > maxX) maxX = cx;
            if (cy < minY) minY = cy;
            if (cy > maxY) maxY = cy;

            for (var dy = -1; dy <= 1; dy++) {
              for (var dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                var nx = cx + dx, ny = cy + dy;
                if (nx >= 0 && nx < aw && ny >= 0 && ny < ah) {
                  var nIdx = ny * aw + nx;
                  if (mask[nIdx] && !visited[nIdx]) {
                    visited[nIdx] = 1;
                    qx[tail] = nx; qy[tail] = ny; tail++;
                  }
                }
              }
            }
          }

          var count = pxList.length / 2;
          if (count < 3) continue;

          // تجميع البكسلات في خلايا صغيرة للحصول على خط منتصف ناعم للكتابة
          var cellSize = count < 45 ? 3 : 5;
          var buckets = {};
          for (var p = 0; p < pxList.length; p += 2) {
            var bx = Math.floor(pxList[p] / cellSize);
            var by = Math.floor(pxList[p + 1] / cellSize);
            var key = bx + "_" + by;
            if (!buckets[key]) buckets[key] = { sx: 0, sy: 0, n: 0 };
            buckets[key].sx += pxList[p];
            buckets[key].sy += pxList[p + 1];
            buckets[key].n++;
          }

          var nodes = [];
          var bKeys = Object.keys(buckets);
          for (var bk = 0; bk < bKeys.length; bk++) {
            var bObj = buckets[bKeys[bk]];
            nodes.push({
              x: (bObj.sx / bObj.n + 0.5) / anScale,
              y: (bObj.sy / bObj.n + 0.5) / anScale
            });
          }

          // ترتيب نقاط الجزيرة من أقصى اليمين بذكاء يحافظ على اتجاه الانحناء (Momentum Nearest Neighbor)
          var ordered = [];
          var used = new Uint8Array(nodes.length);
          var startIdx = 0;
          for (var ni = 1; ni < nodes.length; ni++) {
            if (nodes[ni].x > nodes[startIdx].x) startIdx = ni;
          }

          var curIdx = startIdx;
          used[curIdx] = 1;
          ordered.push(nodes[curIdx]);
          var dirX = -1, dirY = 0;

          for (var step = 1; step < nodes.length; step++) {
            var curPt = nodes[curIdx];
            var bestIdx = -1, bestScore = Infinity;
            for (var cand = 0; cand < nodes.length; cand++) {
              if (used[cand]) continue;
              var vx = nodes[cand].x - curPt.x;
              var vy = nodes[cand].y - curPt.y;
              var d = Math.sqrt(vx * vx + vy * vy) || 0.001;
              var dot = (vx / d) * dirX + (vy / d) * dirY;
              // تفضيل الاستمرار السلس في نفس اتجاه المنحنى بدل التعرّج الحاد
              var score = d * (1 + 0.42 * (1 - dot));
              if (score < bestScore) {
                bestScore = score;
                bestIdx = cand;
              }
            }
            if (bestIdx < 0) break;
            var nPt = nodes[bestIdx];
            var mvx = nPt.x - curPt.x, mvy = nPt.y - curPt.y;
            var md = Math.sqrt(mvx * mvx + mvy * mvy) || 1;
            dirX = dirX * 0.45 + (mvx / md) * 0.55;
            dirY = dirY * 0.45 + (mvy / md) * 0.55;
            var dl = Math.sqrt(dirX * dirX + dirY * dirY) || 1;
            dirX /= dl; dirY /= dl;

            used[bestIdx] = 1;
            ordered.push(nPt);
            curIdx = bestIdx;
          }

          // للكتل الصغيرة (النقاط والتشكيل) نصنع حركة دائرية ناعمة فوقها
          var path;
          if (ordered.length === 1) {
            var pt0 = ordered[0];
            path = [
              { x: pt0.x + 2, y: pt0.y - 2 },
              { x: pt0.x, y: pt0.y },
              { x: pt0.x - 2, y: pt0.y + 1 }
            ];
          } else {
            path = smoothPathChaikin(ordered, 3);
          }

          // حساب طول المسار
          var pLen = 0;
          for (var pi = 1; pi < path.length; pi++) {
            pLen += Math.hypot(path[pi].x - path[pi - 1].x, path[pi].y - path[pi - 1].y);
          }

          rawIslands.push({
            path: path,
            length: Math.max(12, pLen),
            area: count,
            centerX: ((minX + maxX) * 0.5) / anScale,
            maxX: maxX / anScale,
            cells: nodes,
            cellRadius: (cellSize / anScale) * 1.15
          });
        }
      }

      // ترتيب الجزر من اليمين إلى اليسار (عربي)، مع تقديم الحرف الأساسي قبل نقاطه القريبة
      rawIslands.sort(function (a, b) {
        if (Math.abs(a.centerX - b.centerX) < 18) return b.area - a.area;
        return b.centerX - a.centerX;
      });

      result.islands = rawIslands;
      result.strokeHint = Math.max(10, Math.min(34, (5 / anScale) * 1.1));
    } catch (e) {}

    return result;
  }

  // تقسيم أطول مسار إذا كان عدد الكرات المختار أكبر من عدد المقاطع المنفصلة
  function ensureEnoughSegments(islands, targetCount) {
    var list = islands.slice();
    while (list.length < targetCount && list.length > 0) {
      var bestIdx = -1, bestLen = 0;
      for (var i = 0; i < list.length; i++) {
        if (list[i].path.length >= 8 && list[i].length > bestLen) {
          bestLen = list[i].length;
          bestIdx = i;
        }
      }
      if (bestIdx < 0) break;

      var big = list[bestIdx];
      var mid = Math.floor(big.path.length / 2);
      var p1 = big.path.slice(0, mid + 1);
      var p2 = big.path.slice(mid);
      var cMid = Math.floor(big.cells.length / 2);

      var seg1 = {
        path: p1,
        length: big.length * 0.5,
        area: big.area * 0.5,
        centerX: p1[0].x,
        cells: big.cells.slice(0, cMid + 1),
        cellRadius: big.cellRadius
      };
      var seg2 = {
        path: p2,
        length: big.length * 0.5,
        area: big.area * 0.5,
        centerX: p2[0].x,
        cells: big.cells.slice(cMid),
        cellRadius: big.cellRadius
      };
      list.splice(bestIdx, 1, seg1, seg2);
    }
    return list;
  }

  // بناء مسار كامل موحّد لكل كرة مع قوس قفز مرن بين المقاطع
  function buildBallTrack(segments, boxW, boxH) {
    var pts = [];
    var drawFlags = [];
    var islandMarks = [];

    for (var s = 0; s < segments.length; s++) {
      var seg = segments[s];
      var sp = seg.path;
      if (!sp || !sp.length) continue;

      // إذا كانت الكرة تنتقل من مقطع لمقطع آخر، نصنع قوس طيران ناعم (Quadratic Bezier)
      if (pts.length > 0) {
        var prev = pts[pts.length - 1];
        var next = sp[0];
        var dx = next.x - prev.x, dy = next.y - prev.y;
        var dist = Math.hypot(dx, dy);
        if (dist > 6) {
          var lift = Math.min(85, Math.max(22, dist * 0.34));
          // رفع القوس للأعلى أو بشكل عمودي ناعم
          var mx = (prev.x + next.x) * 0.5 - (dy / dist) * (lift * 0.35);
          var my = (prev.y + next.y) * 0.5 - lift;
          var steps = Math.max(8, Math.min(20, Math.ceil(dist / 14)));
          for (var k = 1; k < steps; k++) {
            var t = k / steps;
            var it = 1 - t;
            pts.push({
              x: it * it * prev.x + 2 * it * t * mx + t * t * next.x,
              y: it * it * prev.y + 2 * it * t * my + t * t * next.y
            });
            drawFlags.push(false);
          }
        }
      } else {
        // مدخل انسيابي ناعم للكرة من خارج بداية أول حرف بقليل
        var entry = sp[0];
        var eStart = {
          x: Math.min(boxW - 8, entry.x + 36),
          y: Math.max(8, entry.y - 26)
        };
        var eCtrl = { x: entry.x + 24, y: entry.y - 4 };
        for (var e = 0; e < 8; e++) {
          var et = e / 8;
          var eit = 1 - et;
          pts.push({
            x: eit * eit * eStart.x + 2 * eit * et * eCtrl.x + et * et * entry.x,
            y: eit * eit * eStart.y + 2 * eit * et * eCtrl.y + et * et * entry.y
          });
          drawFlags.push(false);
        }
      }

      for (var i = 0; i < sp.length; i++) {
        pts.push(sp[i]);
        drawFlags.push(true);
      }

      islandMarks.push({
        ptIndex: pts.length - 1,
        cells: seg.cells,
        cellRadius: seg.cellRadius,
        stamped: false
      });
    }

    // حساب الأطوال التراكمية لضمان سرعة متجانسة تماماً عبر المنحنيات
    var cumDist = [0];
    for (var j = 1; j < pts.length; j++) {
      cumDist.push(cumDist[j - 1] + Math.hypot(pts[j].x - pts[j - 1].x, pts[j].y - pts[j - 1].y));
    }
    var totalLen = cumDist[cumDist.length - 1] || 1;
    for (var m = 0; m < islandMarks.length; m++) {
      islandMarks[m].doneDist = cumDist[islandMarks[m].ptIndex] || totalLen;
    }

    return { pts: pts, drawFlags: drawFlags, cumDist: cumDist, totalLen: totalLen, islandMarks: islandMarks };
  }

  function sampleTrack(track, dist) {
    var cd = track.cumDist;
    var pts = track.pts;
    if (dist <= 0) return { x: pts[0].x, y: pts[0].y, writing: track.drawFlags[0] };
    var last = pts.length - 1;
    if (dist >= track.totalLen) return { x: pts[last].x, y: pts[last].y, writing: track.drawFlags[last] };

    // بحث ثنائي سريع عن الموضع الدقيق على المنحنى
    var lo = 0, hi = last;
    while (lo < hi - 1) {
      var mid = (lo + hi) >> 1;
      if (cd[mid] <= dist) lo = mid;
      else hi = mid;
    }
    var segLen = (cd[hi] - cd[lo]) || 1;
    var f = (dist - cd[lo]) / segLen;
    return {
      x: pts[lo].x + (pts[hi].x - pts[lo].x) * f,
      y: pts[lo].y + (pts[hi].y - pts[lo].y) * f,
      writing: !!(track.drawFlags[lo] || track.drawFlags[hi])
    };
  }

  function paintMaskBrush(mCtx, x1, y1, x2, y2, radius) {
    var dist = Math.hypot(x2 - x1, y2 - y1);
    var steps = Math.max(1, Math.ceil(dist / Math.max(2, radius * 0.35)));
    mCtx.fillStyle = "#ffffff";
    for (var i = 0; i <= steps; i++) {
      var f = i / steps;
      var x = x1 + (x2 - x1) * f;
      var y = y1 + (y2 - y1) * f;
      var g = mCtx.createRadialGradient(x, y, radius * 0.45, x, y, radius);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      mCtx.fillStyle = g;
      mCtx.beginPath();
      mCtx.arc(x, y, radius, 0, Math.PI * 2);
      mCtx.fill();
    }
  }

  function stampIslandFull(mCtx, mark) {
    if (!mark || mark.stamped || !mark.cells) return;
    mark.stamped = true;
    var r = Math.max(8, mark.cellRadius * 1.45);
    mCtx.fillStyle = "#ffffff";
    for (var i = 0; i < mark.cells.length; i++) {
      mCtx.beginPath();
      mCtx.arc(mark.cells[i].x, mark.cells[i].y, r, 0, Math.PI * 2);
      mCtx.fill();
    }
  }

  return {
    setup: function (el) {
      if (!el) return;
      if (el.dataset._origOp === undefined) el.dataset._origOp = el.style.opacity || "1";
      el.style.opacity = "0";
    },
    run: function (el, ctx) {
      return new Promise(function (resolve) {
        if (!el || !el.parentElement) { resolve(); return; }
        var parent = el.parentElement;

        if (el._bwRaf) { cancelAnimationFrame(el._bwRaf); el._bwRaf = null; }
        if (el._bwCanvas && el._bwCanvas.parentNode) {
          el._bwCanvas.parentNode.removeChild(el._bwCanvas);
          el._bwCanvas = null;
        }

        if (el.dataset._origOp === undefined) el.dataset._origOp = el.style.opacity || "1";
        var origOp = parseFloat(el.dataset._origOp) || 1;

        var p = (ctx && ctx.params) || {};
        var ballCount = Math.max(1, Math.min(12, parseInt(p.ballCount || "3", 10) || 3));
        var speedVal = Math.max(1, Math.min(10, parseFloat(p.speed || "5") || 5));
        var ballSize = Math.max(6, Math.min(90, parseFloat(p.ballSize || "22") || 22));
        var glowStyle = p.glowStyle || "ribbon";
        var customCol = parseHex(p.ballColor);

        function startAnimation() {
          var elL = parseFloat(el.style.left) || 0;
          var elT = parseFloat(el.style.top) || 0;
          var elW = parseFloat(el.style.width) || el.offsetWidth || 160;
          var elH = parseFloat(el.style.height) || el.offsetHeight || 70;

          var pad = Math.max(48, Math.ceil(ballSize * 2.2));
          var boxX = elL - pad;
          var boxY = elT - pad;
          var boxW = Math.ceil(elW + pad * 2);
          var boxH = Math.ceil(elH + pad * 2);

          // ضبط دقة الرسم لضمان 60 إطاراً سلساً على جميع الهواتف
          var rs = Math.min(1.5, 760 / Math.max(boxW, boxH, 1));
          if (rs > 1 && Math.max(boxW, boxH) > 450) rs = 1;
          var cw = Math.max(32, Math.ceil(boxW * rs));
          var ch = Math.max(32, Math.ceil(boxH * rs));

          var srcCanvas = document.createElement("canvas");
          srcCanvas.width = cw; srcCanvas.height = ch;
          var srcCtx = srcCanvas.getContext("2d");
          srcCtx.setTransform(rs, 0, 0, rs, 0, 0);
          drawTextToCtx(srcCtx, el, boxX, boxY);

          var analysis = analyzeTextIslands(srcCanvas, boxW, boxH);
          var islands = analysis.islands;

          // خطة احتياطية إذا تعذرت قراءة بكسلات الصورة
          if (!islands.length) {
            var fallbackPts = [];
            for (var fi = 0; fi <= 24; fi++) {
              var ff = fi / 24;
              fallbackPts.push({
                x: boxW - pad - elW * ff,
                y: pad + elH * 0.5 + Math.sin(ff * Math.PI * 4) * (elH * 0.25)
              });
            }
            islands = [{
              path: smoothPathChaikin(fallbackPts, 2),
              length: elW * 1.4,
              area: 100,
              centerX: boxW * 0.5,
              cells: fallbackPts,
              cellRadius: Math.max(20, elH * 0.45)
            }];
          }

          var segments = ensureEnoughSegments(islands, ballCount);
          var actualBalls = Math.min(ballCount, segments.length);

          // توزيع المقاطع بتوازن ذكي بين الكرات بحيث تتعاون وتنتهي بتناغم
          var groups = [];
          var groupLens = [];
          for (var bi = 0; bi < actualBalls; bi++) {
            groups.push([]);
            groupLens.push(0);
          }
          for (var si = 0; si < segments.length; si++) {
            var minG = 0;
            for (var gi = 1; gi < actualBalls; gi++) {
              if (groupLens[gi] < groupLens[minG]) minG = gi;
            }
            groups[minG].push(segments[si]);
            groupLens[minG] += segments[si].length;
          }

          var baseCol = customCol || analysis.dominantColor || { r: 232, g: 106, b: 51 };
          var colRgb = baseCol.r + "," + baseCol.g + "," + baseCol.b;
          var brushR = Math.max(ballSize * 0.95, analysis.strokeHint * 1.25);

          // تحويل السرعة (1..10) إلى بكسل/ثانية
          var pxPerSec = 95 + Math.pow(speedVal, 1.55) * 44;

          var balls = [];
          for (var b = 0; b < actualBalls; b++) {
            var track = buildBallTrack(groups[b], boxW, boxH);
            var p0 = track.pts[0];
            balls.push({
              track: track,
              dist: 0,
              delay: b * (0.09 / Math.max(0.5, speedVal * 0.2)),
              // إحداثيات الكرة الفعلية بنظام تتبّع زنبركي ناعم
              x: p0.x,
              y: p0.y,
              prevX: p0.x,
              prevY: p0.y,
              vx: 0,
              vy: 0,
              angle: Math.PI,
              scale: 0.01,
              trail: [],
              finished: false,
              finishTime: 0
            });
          }

          var maskCanvas = document.createElement("canvas");
          maskCanvas.width = cw; maskCanvas.height = ch;
          var maskCtx = maskCanvas.getContext("2d");
          maskCtx.setTransform(rs, 0, 0, rs, 0, 0);

          var compCanvas = document.createElement("canvas");
          compCanvas.width = cw; compCanvas.height = ch;
          var compCtx = compCanvas.getContext("2d");

          var displayCanvas = document.createElement("canvas");
          displayCanvas.width = cw; displayCanvas.height = ch;
          displayCanvas.style.position = "absolute";
          displayCanvas.style.left = boxX + "px";
          displayCanvas.style.top = boxY + "px";
          displayCanvas.style.width = boxW + "px";
          displayCanvas.style.height = boxH + "px";
          displayCanvas.style.pointerEvents = "none";
          displayCanvas.style.zIndex = String((parseInt(el.style.zIndex || 0, 10) || 1) + 6);
          parent.appendChild(displayCanvas);
          el._bwCanvas = displayCanvas;

          var dCtx = displayCanvas.getContext("2d");
          var sparks = [];

          el.style.transition = "none";
          el.style.opacity = "0";

          var startTs = null, prevTs = null;
          var allDoneTs = null;

          function spawnSpark(x, y, vx, vy) {
            if (sparks.length > 75) return;
            var ang = Math.atan2(-vy, -vx) + (Math.random() - 0.5) * 1.4;
            var sp = 18 + Math.random() * 55;
            sparks.push({
              x: x, y: y,
              vx: Math.cos(ang) * sp,
              vy: Math.sin(ang) * sp,
              life: 1,
              size: Math.max(1.5, ballSize * (0.12 + Math.random() * 0.14))
            });
          }

          function drawFlexibleBall(ctx2d, ball, r) {
            var sc = ball.scale;
            if (sc <= 0.02) return;
            var rad = r * 0.5 * sc;

            // 1. رسم الذيل المرن المنحني خلف الكرة عند الاستدارة
            if (glowStyle !== "clean" && ball.trail.length >= 3) {
              var tr = ball.trail;
              ctx2d.save();
              ctx2d.lineCap = "round";
              ctx2d.lineJoin = "round";
              for (var i = 1; i < tr.length - 1; i++) {
                var frac = i / (tr.length - 1);
                var prevP = tr[i - 1], curP = tr[i], nxtP = tr[i + 1];
                var mx1 = (prevP.x + curP.x) * 0.5, my1 = (prevP.y + curP.y) * 0.5;
                var mx2 = (curP.x + nxtP.x) * 0.5, my2 = (curP.y + nxtP.y) * 0.5;

                ctx2d.beginPath();
                ctx2d.moveTo(mx1, my1);
                ctx2d.quadraticCurveTo(curP.x, curP.y, mx2, my2);
                ctx2d.strokeStyle = "rgba(" + colRgb + "," + (frac * 0.45 * sc).toFixed(3) + ")";
                ctx2d.lineWidth = Math.max(1, rad * 1.55 * frac);
                ctx2d.stroke();
              }
              ctx2d.restore();
            }

            // 2. هالة التوهج الناعمة + التمطّط المرن مع اتجاه الحركة والانعطاف
            var speed = Math.hypot(ball.vx, ball.vy);
            var stretch = 1 + Math.min(0.42, speed * 0.00055);
            var squash = 1 / Math.sqrt(stretch);

            ctx2d.save();
            ctx2d.translate(ball.x, ball.y);
            ctx2d.rotate(ball.angle);
            ctx2d.scale(stretch, squash);

            // هالة خارجية ناعمة
            if (glowStyle !== "clean") {
              var glowR = rad * 2.35;
              var gOut = ctx2d.createRadialGradient(0, 0, rad * 0.25, 0, 0, glowR);
              gOut.addColorStop(0, "rgba(" + colRgb + "," + (0.55 * sc).toFixed(3) + ")");
              gOut.addColorStop(0.5, "rgba(" + colRgb + "," + (0.18 * sc).toFixed(3) + ")");
              gOut.addColorStop(1, "rgba(" + colRgb + ",0)");
              ctx2d.fillStyle = gOut;
              ctx2d.beginPath();
              ctx2d.arc(0, 0, glowR, 0, Math.PI * 2);
              ctx2d.fill();
            }

            // جسم الكرة الأساسي بتدرج حيوي ثلاثي الأبعاد
            var gCore = ctx2d.createRadialGradient(-rad * 0.28, -rad * 0.28, rad * 0.1, 0, 0, rad);
            gCore.addColorStop(0, "#ffffff");
            gCore.addColorStop(0.38, "rgba(" + colRgb + ",0.98)");
            gCore.addColorStop(1, "rgba(" + Math.max(0, baseCol.r - 45) + "," + Math.max(0, baseCol.g - 45) + "," + Math.max(0, baseCol.b - 45) + ",0.95)");
            ctx2d.fillStyle = gCore;
            ctx2d.beginPath();
            ctx2d.arc(0, 0, rad, 0, Math.PI * 2);
            ctx2d.fill();

            ctx2d.restore();
          }

          function tick(ts) {
            if (!startTs) { startTs = ts; prevTs = ts; }
            var dt = Math.min(0.05, Math.max(0.001, (ts - prevTs) / 1000));
            prevTs = ts;
            var elapsed = (ts - startTs) / 1000;

            var activeCount = 0;

            // عامل استجابة الزنبرك: ينعّم كل استدارة بشكل مرن ومستقل عن معدل إطارات الشاشة
            var followStiffness = 1 - Math.exp(-(11 + speedVal * 1.1) * dt);

            for (var i = 0; i < balls.length; i++) {
              var b = balls[i];
              if (elapsed < b.delay) {
                activeCount++;
                continue;
              }

              // ظهور مرن للكرة عند بدايتها
              if (!b.finished) {
                b.scale += (1 - b.scale) * Math.min(1, dt * 10);
                var prevDist = b.dist;
                b.dist = Math.min(b.track.totalLen, b.dist + pxPerSec * dt);
                var target = sampleTrack(b.track, b.dist);

                b.prevX = b.x;
                b.prevY = b.y;

                // حركة زنبركية مرنة تتبع المنحنى وتستدير بنعومة فائقة
                var nextX = b.x + (target.x - b.x) * followStiffness;
                var nextY = b.y + (target.y - b.y) * followStiffness;
                var instVx = (nextX - b.x) / dt;
                var instVy = (nextY - b.y) / dt;

                // تنعيم متجه السرعة والزاوية حتى لا تنقلب الكرة فجأة
                b.vx += (instVx - b.vx) * Math.min(1, dt * 14);
                b.vy += (instVy - b.vy) * Math.min(1, dt * 14);

                var spd = Math.hypot(b.vx, b.vy);
                if (spd > 6) {
                  var targetAng = Math.atan2(b.vy, b.vx);
                  var diff = targetAng - b.angle;
                  while (diff > Math.PI) diff -= Math.PI * 2;
                  while (diff < -Math.PI) diff += Math.PI * 2;
                  b.angle += diff * Math.min(1, dt * 14);

                  // شرارات ناعمة عند الانعطافات السريعة
                  if (glowStyle === "sparkle" && (Math.abs(diff) > 0.22 || Math.random() < 0.22)) {
                    spawnSpark(b.x, b.y, b.vx, b.vy);
                  }
                }

                b.x = nextX;
                b.y = nextY;

                // تحديث سجل الذيل المرن
                b.trail.push({ x: b.x, y: b.y });
                if (b.trail.length > 14) b.trail.shift();

                // كشف النص الفعلي تحت الكرة أثناء الكتابة
                if (target.writing) {
                  paintMaskBrush(maskCtx, b.prevX, b.prevY, b.x, b.y, brushR);
                }

                // إكمال كشف أي مقطع وصلت الكرة لنهايته بدقة 100%
                for (var m = 0; m < b.track.islandMarks.length; m++) {
                  var mk = b.track.islandMarks[m];
                  if (!mk.stamped && b.dist >= mk.doneDist) {
                    stampIslandFull(maskCtx, mk);
                  }
                }

                if (b.dist >= b.track.totalLen && Math.hypot(target.x - b.x, target.y - b.y) < 3.5) {
                  b.finished = true;
                  b.finishTime = elapsed;
                  for (var m2 = 0; m2 < b.track.islandMarks.length; m2++) {
                    stampIslandFull(maskCtx, b.track.islandMarks[m2]);
                  }
                } else {
                  activeCount++;
                }
              } else {
                // تلاشي مرن للكرة بعد إنهاء مهمتها
                b.scale = Math.max(0, b.scale - dt * 3.8);
                if (b.trail.length > 0) b.trail.shift();
                if (b.scale > 0.02 || b.trail.length > 0) activeCount++;
              }
            }

            // دمج النص المكشوف بقناع الكرات
            compCtx.setTransform(1, 0, 0, 1, 0, 0);
            compCtx.globalCompositeOperation = "source-over";
            compCtx.clearRect(0, 0, cw, ch);
            compCtx.drawImage(maskCanvas, 0, 0);
            compCtx.globalCompositeOperation = "source-in";
            compCtx.drawImage(srcCanvas, 0, 0);
            compCtx.globalCompositeOperation = "source-over";

            // الرسم على الشاشة
            dCtx.setTransform(1, 0, 0, 1, 0, 0);
            dCtx.clearRect(0, 0, cw, ch);
            dCtx.globalAlpha = origOp;
            dCtx.drawImage(compCanvas, 0, 0);
            dCtx.globalAlpha = 1;

            dCtx.setTransform(rs, 0, 0, rs, 0, 0);

            // رسم الشرارات الخفيفة إن وُجدت
            for (var sp = sparks.length - 1; sp >= 0; sp--) {
              var sk = sparks[sp];
              sk.x += sk.vx * dt;
              sk.y += sk.vy * dt;
              sk.vx *= 0.94;
              sk.vy *= 0.94;
              sk.life -= dt * 2.4;
              if (sk.life <= 0) {
                sparks.splice(sp, 1);
                continue;
              }
              dCtx.fillStyle = "rgba(" + colRgb + "," + (sk.life * 0.85).toFixed(3) + ")";
              dCtx.beginPath();
              dCtx.arc(sk.x, sk.y, sk.size * sk.life, 0, Math.PI * 2);
              dCtx.fill();
            }

            // رسم الكرات المرنة فوق النص
            for (var k = 0; k < balls.length; k++) {
              drawFlexibleBall(dCtx, balls[k], ballSize);
            }

            if (activeCount > 0 || sparks.length > 0) {
              el._bwRaf = requestAnimationFrame(tick);
            } else {
              if (!allDoneTs) allDoneTs = ts;
              var fadeP = Math.min(1, (ts - allDoneTs) / 180);
              el.style.opacity = String(origOp * fadeP);
              displayCanvas.style.opacity = String(1 - fadeP);
              if (fadeP < 1) {
                el._bwRaf = requestAnimationFrame(tick);
              } else {
                el._bwRaf = null;
                if (displayCanvas.parentNode) displayCanvas.parentNode.removeChild(displayCanvas);
                el._bwCanvas = null;
                el.style.opacity = String(origOp);
                resolve();
              }
            }
          }

          el._bwRaf = requestAnimationFrame(tick);
        }

        // انتظار اكتمال تحميل صورة النص إن لم تكن محمّلة بعد
        var img = el.querySelector("img");
        if (img && !img.complete) {
          var started = false;
          var go = function () { if (!started) { started = true; startAnimation(); } };
          img.addEventListener("load", go, { once: true });
          setTimeout(go, 350);
        } else {
          startAnimation();
        }
      });
    },
    reset: function (el) {
      if (!el) return;
      if (el._bwRaf) { cancelAnimationFrame(el._bwRaf); el._bwRaf = null; }
      if (el._bwCanvas && el._bwCanvas.parentNode) {
        el._bwCanvas.parentNode.removeChild(el._bwCanvas);
        el._bwCanvas = null;
      }
      el.style.transition = "none";
      if (el.dataset._origOp !== undefined) el.style.opacity = el.dataset._origOp;
    }
  };
})();
