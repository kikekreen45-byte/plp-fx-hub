window.PLP_FX = window.PLP_FX || {};
window.PLP_FX["enter_jannah_rewards"] = (function () {
  var STORAGE_KEY = "plp_jannah_rewards_counts_v1";

  var CARDS_DATA = [
    {
      key: "palm",
      title: "نخلة",
      deed: "قل: سبحان الله العظيم وبحمده",
      icon: "palm",
      hadith: "عن جابر رضي الله عنه عن النبي ﷺ قال: «مَنْ قَالَ: سُبْحَانَ اللَّهِ الْعَظِيمِ وَبِحَمْدِهِ، غُرِسَتْ لَهُ نَخْلَةٌ فِي الْجَنَّةِ»\n(رواه الترمذي وصححه الألباني)"
    },
    {
      key: "tree",
      title: "شجرة",
      deed: "قل: سبحان الله، والحمد لله، ولا إله إلا الله، والله أكبر",
      icon: "tree",
      hadith: "عن أبي هريرة رضي الله عنه أن النبي ﷺ قال: «أَلَا أَدُلُّكَ عَلَى غِرَاسٍ خَيْرٍ لَكَ مِنْ هَذَا؟ تَقُولُ: سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَلَا إِلَهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ، يُغْرَسْ لَكَ بِكُلِّ وَاحِدَةٍ شَجَرَةٌ فِي الْجَنَّةِ»\n(رواه ابن ماجه وصححه الألباني)"
    },
    {
      key: "house",
      title: "بيت",
      deed: "صلِّ ١٢ ركعة غير الفريضة\n(٢ قبل الفجر، ٤ قبل الظهر و٢ بعدها، ٢ بعد المغرب، ٢ بعد العشاء)",
      icon: "house",
      hadith: "عن أم حبيبة رضي الله عنها قالت: سمعت رسول الله ﷺ يقول: «مَا مِنْ عَبْدٍ مُسْلِمٍ يُصَلِّي لِلَّهِ كُلَّ يَوْمٍ ثِنْتَيْ عَشْرَةَ رَكْعَةً تَطَوُّعًا غَيْرَ فَرِيضَةٍ، إِلَّا بَنَى اللَّهُ لَهُ بَيْتًا فِي الْجَنَّةِ»\n(رواه مسلم)"
    },
    {
      key: "treasure",
      title: "كنز",
      deed: "قل: لا حول ولا قوة إلا بالله",
      icon: "treasure",
      hadith: "عن أبي موسى الأشعري رضي الله عنه أن النبي ﷺ قال له: «أَلَا أَدُلُّكَ عَلَى كَنْزٍ مِنْ كُنُوزِ الْجَنَّةِ؟» فقلت: بلى يا رسول الله، قال: «قُلْ: لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ»\n(متفق عليه: رواه البخاري ومسلم)"
    }
  ];

  // أيقونات Lucide فيكتور نقية مدمجة (تعمل بدون إنترنت وبأعلى دقة)
  var LUCIDE_SVG = {
    palm:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M13 8c0-2.76-2.46-5-5.5-5S2 5.24 2 8h2l1-1 1 1h4"/>' +
      '<path d="M13 7.14A5.82 5.82 0 0 1 16.5 6c3.04 0 5.5 2.24 5.5 5h-3l-1-1-1 1h-3"/>' +
      '<path d="M5.89 9.71c-2.15 2.15-2.3 5.47-.35 7.43l4.24-4.25.7-.7.71-.71 2.12-2.12c-1.95-1.96-5.27-1.8-7.42.35"/>' +
      '<path d="M11 15.5c.5 2.5-.17 4.5-1 6.5h4c2-5.5-.5-12-1-14"/></svg>',
    tree:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M10 10v.2A3 3 0 0 1 8.9 16H5a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0Z"/>' +
      '<path d="M7 16v6"/><path d="M13 19v3"/>' +
      '<path d="M12 19h8.3a1 1 0 0 0 .7-1.7L18 14h.3a1 1 0 0 0 .7-1.7L16 9h.2a1 1 0 0 0 .8-1.7L13 3l-1.4 1.5"/></svg>',
    house:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/>' +
      '<path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>',
    treasure:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M6 3h12l4 6-10 13L2 9Z"/>' +
      '<path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/></svg>',
    textAlignEnd:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M21 5H3"/><path d="M21 12H9"/><path d="M21 19H7"/></svg>',
    hand:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/>' +
      '<path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2"/>' +
      '<path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8"/>' +
      '<path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>'
  };

  var memCounts = { palm: 0, tree: 0, house: 0, treasure: 0 };

  function loadCounts() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var obj = JSON.parse(raw);
        if (obj && typeof obj === "object") {
          for (var k in memCounts) {
            if (typeof obj[k] === "number" && obj[k] >= 0) memCounts[k] = obj[k];
          }
        }
      }
    } catch (e) {}
    return memCounts;
  }

  function saveCounts() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(memCounts)); } catch (e) {}
  }

  function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeOutCubic(t) { return 1 - Math.pow(1 - clamp(t, 0, 1), 3); }
  function easeOutBack(t) {
    t = clamp(t, 0, 1);
    var c1 = 1.55, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  function normId(s) {
    return String(s || "")
      .replace(/[\u064B-\u065F\u0670]/g, "")
      .replace(/ة/g, "ه");
  }

  function findEl(id, root) {
    var scope = root || document;
    if (!root) {
      var direct = document.getElementById(id);
      if (direct) return direct;
    }
    var n = normId(id);
    var list = scope.querySelectorAll("[data-jnh-id],[id]");
    for (var i = 0; i < list.length; i++) {
      var v = list[i].getAttribute("data-jnh-id") || list[i].id || "";
      if (v === id || normId(v) === n) return list[i];
    }
    return null;
  }

  function injectStyles() {
    if (document.getElementById("jnh-system-styles")) return;
    var st = document.createElement("style");
    st.id = "jnh-system-styles";
    st.textContent =
      ".jnh-scroll-viewport{position:absolute;left:0;top:0;width:100%;height:100%;overflow-y:auto;overflow-x:hidden;" +
      "-webkit-overflow-scrolling:touch;overscroll-behavior:contain;scrollbar-width:none;z-index:25;box-sizing:border-box;touch-action:pan-y;}" +
      ".jnh-scroll-viewport::-webkit-scrollbar{display:none;}" +
      ".jnh-card-slot{position:relative;margin-left:auto;margin-right:auto;will-change:transform,opacity,filter;}" +
      ".jnh-btn-press{transition:transform 210ms cubic-bezier(.34,1.56,.64,1),filter 180ms ease;cursor:pointer;-webkit-tap-highlight-color:transparent;}" +
      ".jnh-btn-press:active{transform:scale(0.86) !important;}" +
      ".jnh-icon-overlay{position:absolute;display:flex;align-items:center;justify-content:center;pointer-events:none;z-index:8;}" +
      ".jnh-icon-overlay svg{width:54%;height:54%;display:block;}" +
      ".jnh-text-overlay{position:absolute;display:flex;align-items:center;justify-content:center;text-align:center;" +
      "direction:rtl;pointer-events:none;z-index:9;box-sizing:border-box;padding:2px 6px;line-height:1.35;white-space:pre-line;word-break:break-word;}" +
      ".jnh-backdrop{position:absolute;inset:0;opacity:0;pointer-events:none;transition:opacity 320ms cubic-bezier(.22,1,.36,1),backdrop-filter 320ms ease;}" +
      ".jnh-backdrop.on{opacity:1;pointer-events:auto;}" +
      "@keyframes jnhPopBurst{0%{transform:translate(-50%,-50%) scale(.45);opacity:.95}100%{transform:translate(-50%,-50%) scale(1.95);opacity:0}}" +
      "@keyframes jnhFloatPlus{0%{transform:translate(-50%,0) scale(.7);opacity:0}20%{transform:translate(-50%,-16px) scale(1.12);opacity:1}100%{transform:translate(-50%,-68px) scale(.92);opacity:0}}" +
      "@keyframes jnhCountBump{0%{transform:scale(1)}35%{transform:scale(1.22)}100%{transform:scale(1)}}" +
      "@keyframes jnhIconWiggle{0%{transform:scale(1) rotate(0deg)}25%{transform:scale(1.18) rotate(-10deg)}55%{transform:scale(1.12) rotate(8deg)}80%{transform:scale(1.04) rotate(-3deg)}100%{transform:scale(1) rotate(0deg)}}" +
      ".jnh-count-bump{animation:jnhCountBump 290ms cubic-bezier(.34,1.56,.64,1);}" +
      ".jnh-icon-wiggle{animation:jnhIconWiggle 460ms cubic-bezier(.34,1.56,.64,1);}";
    document.head.appendChild(st);
  }

  // محرك صوتي ناعم (نقرة تسبيح / فتح البطاقة / انبثاق الحديث / نبضة الأيقونة)
  function getAudio() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!window.__plpAudioCtx) window.__plpAudioCtx = new AC();
    if (window.__plpAudioCtx.state === "suspended") {
      try { window.__plpAudioCtx.resume(); } catch (e) {}
    }
    return window.__plpAudioCtx;
  }

  function playSfx(type, countVal) {
    var ac = getAudio();
    if (!ac) return;
    try {
      var now = ac.currentTime;
      var osc = ac.createOscillator();
      var g = ac.createGain();
      if (type === "openModal") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(640, now + 0.11);
        g.gain.setValueAtTime(0.001, now);
        g.gain.linearRampToValueAtTime(0.14, now + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
      } else if (type === "closeModal") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(240, now + 0.11);
        g.gain.setValueAtTime(0.001, now);
        g.gain.linearRampToValueAtTime(0.11, now + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
      } else if (type === "hadithOpen") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(760, now + 0.085);
        g.gain.setValueAtTime(0.001, now);
        g.gain.linearRampToValueAtTime(0.13, now + 0.014);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);
      } else if (type === "count") {
        var milestone = countVal && countVal % 10 === 0;
        osc.type = milestone ? "triangle" : "sine";
        osc.frequency.setValueAtTime(milestone ? 580 : 420, now);
        osc.frequency.exponentialRampToValueAtTime(milestone ? 980 : 690, now + 0.065);
        g.gain.setValueAtTime(0.001, now);
        g.gain.linearRampToValueAtTime(milestone ? 0.18 : 0.14, now + 0.009);
        g.gain.exponentialRampToValueAtTime(0.0001, now + (milestone ? 0.18 : 0.095));
      } else {
        osc.type = "sine";
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(780, now + 0.07);
        g.gain.setValueAtTime(0.001, now);
        g.gain.linearRampToValueAtTime(0.11, now + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);
      }
      osc.connect(g);
      g.connect(ac.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } catch (e) {}
  }

  // استخراج اللون الصافي من صورة العنصر
  function sampleColor(el, fallback) {
    if (!el) return fallback;
    try {
      var img = el.querySelector("img");
      if (img && img.complete && img.naturalWidth > 0) {
        var c = document.createElement("canvas");
        c.width = 28; c.height = 28;
        var g = c.getContext("2d");
        g.drawImage(img, 0, 0, 28, 28);
        var d = g.getImageData(0, 0, 28, 28).data;
        var r = 0, gr = 0, b = 0, n = 0;
        for (var i = 0; i < d.length; i += 4) {
          if (d[i + 3] > 140) { r += d[i]; gr += d[i + 1]; b += d[i + 2]; n++; }
        }
        if (n > 2) return "rgb(" + Math.round(r / n) + "," + Math.round(gr / n) + "," + Math.round(b / n) + ")";
      }
    } catch (e) {}
    return fallback;
  }

  function pickContrastIconColor(bgEl, fallbackColor) {
    var rgbStr = sampleColor(bgEl, "");
    var m = rgbStr.match(/rgb\((\d+),(\d+),(\d+)\)/);
    if (!m) return fallbackColor;
    var lum = (0.299 * +m[1] + 0.587 * +m[2] + 0.114 * +m[3]) / 255;
    return lum > 0.52 ? "#242021" : "#EFEBE0";
  }

  // اكتشاف حدود الحبر داخل الصورة لتوسيط الأيقونة أو النص بدقة متناهية
  function getInkFrac(el) {
    var def = { u0: 0, v0: 0, u1: 1, v1: 1 };
    if (!el) return def;
    if (el._jnhInk) return el._jnhInk;
    try {
      var img = el.querySelector("img");
      if (!img || !img.complete || img.naturalWidth <= 0) return def;
      var sc = Math.min(1, 100 / Math.max(img.naturalWidth, img.naturalHeight, 1));
      var cw = Math.max(8, Math.ceil(img.naturalWidth * sc));
      var ch = Math.max(8, Math.ceil(img.naturalHeight * sc));
      var c = document.createElement("canvas");
      c.width = cw; c.height = ch;
      var g = c.getContext("2d");
      g.drawImage(img, 0, 0, cw, ch);
      var d = g.getImageData(0, 0, cw, ch).data;
      var minX = cw, minY = ch, maxX = -1, maxY = -1;
      for (var y = 0; y < ch; y++) {
        for (var x = 0; x < cw; x++) {
          if (d[(y * cw + x) * 4 + 3] > 28) {
            if (x < minX) minX = x; if (x > maxX) maxX = x;
            if (y < minY) minY = y; if (y > maxY) maxY = y;
          }
        }
      }
      if (maxX > minX && maxY > minY) {
        el._jnhInk = { u0: minX / cw, v0: minY / ch, u1: (maxX + 1) / cw, v1: (maxY + 1) / ch };
        return el._jnhInk;
      }
    } catch (e) {}
    return def;
  }

  function applyBoxToOverlay(hostEl, overlayEl, padExpand) {
    var w = parseFloat(hostEl.style.width) || hostEl.offsetWidth || 80;
    var h = parseFloat(hostEl.style.height) || hostEl.offsetHeight || 40;
    var img = hostEl.querySelector("img");
    var bx = 0, by = 0, bw = w, bh = h;
    if (img) {
      var f = getInkFrac(hostEl);
      var il = parseFloat(img.style.left) || 0;
      var it = parseFloat(img.style.top) || 0;
      var iw = parseFloat(img.style.width) || w;
      var ih = parseFloat(img.style.height) || h;
      bx = il + iw * f.u0;
      by = it + ih * f.v0;
      bw = Math.max(12, iw * (f.u1 - f.u0));
      bh = Math.max(12, ih * (f.v1 - f.v0));
    }
    var ex = padExpand || 0;
    overlayEl.style.left = (bx - ex) + "px";
    overlayEl.style.top = (by - ex) + "px";
    overlayEl.style.width = (bw + ex * 2) + "px";
    overlayEl.style.height = (bh + ex * 2) + "px";
    return { w: bw + ex * 2, h: bh + ex * 2 };
  }

  function getFontFamilyFor(id) {
    var li = (window.BRAIN && window.BRAIN.liveInputs) || {};
    var st = (li[id] && li[id].style) || {};
    var f = st.cssFontFamily || "";
    return f ? ("'" + f + "', 'Tajawal', 'Cairo', system-ui, sans-serif") : "'Tajawal', 'Cairo', 'Noto Sans Arabic', system-ui, sans-serif";
  }

  function setCenteredText(hostEl, text, opts) {
    if (!hostEl) return null;
    opts = opts || {};
    var color = opts.color || hostEl.dataset._jnhSampledColor || sampleColor(hostEl, opts.fallbackColor || "#189E68");
    hostEl.dataset._jnhSampledColor = color;

    var img = hostEl.querySelector("img");
    if (img) img.style.opacity = "0";
    hostEl.style.overflow = "visible";

    var box = hostEl.querySelector(".jnh-text-overlay");
    if (!box) {
      box = document.createElement("div");
      box.className = "jnh-text-overlay";
      hostEl.appendChild(box);
    }

    var dims = applyBoxToOverlay(hostEl, box, opts.expand || 0);
    box.style.color = color;
    box.style.fontFamily = opts.fontFamily || getFontFamilyFor(opts.origId || hostEl.id);
    box.style.fontWeight = opts.weight || "800";
    box.style.lineHeight = String(opts.lineHeight || 1.38);
    box.textContent = text;

    // ضبط حجم الخط تلقائياً ليملأ المساحة بتوازن ويتمركز تماماً في المنتصف
    var maxFs = opts.maxFontSize || Math.max(16, Math.round(dims.h * (opts.singleLine ? 0.76 : 0.34)));
    var minFs = opts.minFontSize || 12;
    box.style.whiteSpace = opts.singleLine ? "nowrap" : "pre-line";

    var fs = maxFs;
    box.style.fontSize = fs + "px";
    var guard = 0;
    while (fs > minFs && guard < 40) {
      if (box.scrollHeight <= dims.h + 4 && box.scrollWidth <= dims.w + 4) break;
      fs = Math.max(minFs, Math.floor(fs * 0.91));
      box.style.fontSize = fs + "px";
      guard++;
    }
    return box;
  }

  function setCenteredIcon(hostEl, iconKey, colorHex) {
    if (!hostEl) return null;
    var ic = hostEl.querySelector(".jnh-icon-overlay");
    if (!ic) {
      ic = document.createElement("div");
      ic.className = "jnh-icon-overlay";
      hostEl.appendChild(ic);
    }
    applyBoxToOverlay(hostEl, ic, 0);
    ic.style.color = colorHex;
    ic.innerHTML = LUCIDE_SVG[iconKey] || LUCIDE_SVG.palm;
    return ic;
  }

  function findGroupContainer(prefix, pageEl) {
    var sample = findEl(prefix + "صورة1", pageEl) || findEl(prefix + "نخلة", pageEl) || findEl(prefix + "م", pageEl);
    if (!sample) return null;

    var direct = document.getElementById(prefix);
    if (direct && direct.contains(sample)) return direct;

    var cur = sample.parentElement;
    while (cur && cur !== pageEl && cur !== document.body) {
      if (cur.classList.contains("plp-wrapper") || cur.classList.contains("html-page")) break;
      var allIds = cur.querySelectorAll("[id]");
      var foreign = false;
      for (var i = 0; i < allIds.length; i++) {
        var cid = allIds[i].id || "";
        if (/^h3f\d+/.test(cid) && cid.indexOf(prefix) !== 0) { foreign = true; break; }
      }
      if (!foreign) return cur;
      cur = cur.parentElement;
    }

    // في حال كانت العناصر متجاورة مباشرة داخل plp-wrapper نجمعها داخل حاوية نظيفة
    var wrap = pageEl.querySelector(".plp-wrapper") || pageEl;
    var grp = document.createElement("div");
    grp.className = "jnh-auto-group";
    grp.style.cssText = "position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;";
    var kids = Array.prototype.slice.call(wrap.querySelectorAll("[id]"));
    for (var j = 0; j < kids.length; j++) {
      if ((kids[j].id || "").indexOf(prefix) === 0 && kids[j].parentElement === wrap) {
        kids[j].style.pointerEvents = "auto";
        grp.appendChild(kids[j]);
      }
    }
    wrap.appendChild(grp);
    return grp;
  }

  function measureKidsUnionRect(container) {
    var kids = container.querySelectorAll("[data-jnh-id],[id]");
    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (var i = 0; i < kids.length; i++) {
      var r = kids[i].getBoundingClientRect();
      if (r.width > 1 && r.height > 1) {
        if (r.left < minX) minX = r.left;
        if (r.top < minY) minY = r.top;
        if (r.right > maxX) maxX = r.right;
        if (r.bottom > maxY) maxY = r.bottom;
      }
    }
    if (!isFinite(minX)) {
      var cr = container.getBoundingClientRect();
      return { left: cr.left, top: cr.top, right: cr.right, bottom: cr.bottom, width: cr.width, height: cr.height };
    }
    return { left: minX, top: minY, right: maxX, bottom: maxY, width: maxX - minX, height: maxY - minY };
  }

  function normalizeGroupIntoBox(groupEl, slotEl, scaleX, scaleY) {
    slotEl.style.position = "relative";
    slotEl.style.width = "10px";
    slotEl.style.height = "10px";
    groupEl.style.position = "absolute";
    groupEl.style.left = "0px";
    groupEl.style.top = "0px";
    groupEl.style.display = "block";
    groupEl.style.visibility = "visible";
    groupEl.style.opacity = "1";
    slotEl.appendChild(groupEl);

    var slotR = slotEl.getBoundingClientRect();
    var uR = measureKidsUnionRect(groupEl);
    var w = Math.max(40, uR.width / scaleX);
    var h = Math.max(40, uR.height / scaleY);
    var offX = (uR.left - slotR.left) / scaleX;
    var offY = (uR.top - slotR.top) / scaleY;

    groupEl.style.left = (-offX) + "px";
    groupEl.style.top = (-offY) + "px";
    slotEl.style.width = w + "px";
    slotEl.style.height = h + "px";
    return { w: w, h: h };
  }

  // طيران فيكتور مرن للأيقونات بين البطاقة (h3f1) والواجهة العائمة (h3f2)
  function flyHeroIcon(iconKey, fromRect, toRect, fromColorHex, toColorHex, durationMs, onArrive) {
    if (!fromRect || !toRect || fromRect.width < 2 || toRect.width < 2) {
      if (onArrive) onArrive();
      return;
    }
    function hexToRgb(h) {
      h = h.replace("#", "");
      return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
    }
    var c1 = hexToRgb(fromColorHex);
    var c2 = hexToRgb(toColorHex);

    var ghost = document.createElement("div");
    ghost.style.cssText =
      "position:fixed;left:0;top:0;display:flex;align-items:center;justify-content:center;" +
      "pointer-events:none;z-index:985;will-change:transform,width,height;";
    ghost.innerHTML = LUCIDE_SVG[iconKey] || LUCIDE_SVG.palm;
    var svg = ghost.querySelector("svg");
    if (svg) { svg.style.width = "54%"; svg.style.height = "54%"; }
    document.body.appendChild(ghost);

    var sx = fromRect.left + fromRect.width * 0.5;
    var sy = fromRect.top + fromRect.height * 0.5;
    var ex = toRect.left + toRect.width * 0.5;
    var ey = toRect.top + toRect.height * 0.5;
    var cx = (sx + ex) * 0.5 + (ex >= sx ? -28 : 28);
    var cy = Math.min(sy, ey) - 36;
    var startTs = null;

    function tick(ts) {
      if (!startTs) startTs = ts;
      var p = Math.min(1, (ts - startTs) / durationMs);
      var e = easeOutCubic(p);
      var it = 1 - e;
      var x = it * it * sx + 2 * it * e * cx + e * e * ex;
      var y = it * it * sy + 2 * it * e * cy + e * e * ey;
      var w = lerp(fromRect.width, toRect.width, e);
      var h = lerp(fromRect.height, toRect.height, e);
      var arcScale = 1 + Math.sin(p * Math.PI) * 0.24;
      var rot = Math.sin(p * Math.PI) * (ex >= sx ? 10 : -10);

      ghost.style.width = w + "px";
      ghost.style.height = h + "px";
      ghost.style.color = "rgb(" + Math.round(lerp(c1.r, c2.r, e)) + "," + Math.round(lerp(c1.g, c2.g, e)) + "," + Math.round(lerp(c1.b, c2.b, e)) + ")";
      ghost.style.transform = "translate(" + (x - w * 0.5).toFixed(1) + "px," + (y - h * 0.5).toFixed(1) + "px) scale(" + arcScale.toFixed(3) + ") rotate(" + rot.toFixed(1) + "deg)";

      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        if (ghost.parentNode) ghost.parentNode.removeChild(ghost);
        if (onArrive) onArrive();
      }
    }
    requestAnimationFrame(tick);
  }

  function spawnTapBurst(parentEl, x, y, colorCss, showPlusOne) {
    var ring = document.createElement("div");
    ring.style.cssText =
      "position:absolute;left:" + x + "px;top:" + y + "px;width:54px;height:54px;border-radius:999px;" +
      "border:3px solid " + colorCss + ";pointer-events:none;z-index:40;animation:jnhPopBurst 420ms cubic-bezier(.22,1,.36,1) forwards;";
    parentEl.appendChild(ring);
    setTimeout(function () { if (ring.parentNode) ring.parentNode.removeChild(ring); }, 450);

    if (showPlusOne) {
      var fl = document.createElement("div");
      fl.textContent = "+1";
      fl.style.cssText =
        "position:absolute;left:" + x + "px;top:" + (y - 14) + "px;font-weight:900;font-size:28px;color:" + colorCss + ";" +
        "font-family:system-ui,sans-serif;pointer-events:none;z-index:42;text-shadow:0 2px 10px rgba(0,0,0,0.2);" +
        "animation:jnhFloatPlus 560ms cubic-bezier(.22,1,.36,1) forwards;";
      parentEl.appendChild(fl);
      setTimeout(function () { if (fl.parentNode) fl.parentNode.removeChild(fl); }, 590);
    }
  }

  function triggerWiggle(iconEl) {
    if (!iconEl) return;
    iconEl.classList.remove("jnh-icon-wiggle");
    void iconEl.offsetWidth;
    iconEl.classList.add("jnh-icon-wiggle");
  }

  // ================== تهيئة النظام الكامل على صفحة h3 ==================
  function mountJannahSystem(pageEl, playIntro) {
    if (!pageEl) return;
    if (pageEl._jnhState) {
      if (playIntro) pageEl._jnhState.playCardsIntro();
      return;
    }

    var wrap = pageEl.querySelector(".plp-wrapper") || pageEl;
    var wr = wrap.getBoundingClientRect();
    if (!wr || wr.width < 10) {
      // انتظار حتى تصبح صفحة h3 مرئية للقياس بدقة 100%
      if (!pageEl._jnhObserver) {
        pageEl._jnhObserver = new MutationObserver(function () {
          var r = wrap.getBoundingClientRect();
          if (r && r.width > 10) {
            pageEl._jnhObserver.disconnect();
            pageEl._jnhObserver = null;
            mountJannahSystem(pageEl, true);
          }
        });
        pageEl._jnhObserver.observe(pageEl, { attributes: true, attributeFilter: ["style", "class"] });
      }
      return;
    }

    injectStyles();
    loadCounts();

    var wrapW = parseFloat(wrap.style.width) || wr.width;
    var wrapH = parseFloat(wrap.style.height) || wr.height;
    var scaleX = wr.width / wrapW;
    var scaleY = wr.height / wrapH;

    var f1Orig = findGroupContainer("h3f1", pageEl);
    var f2Orig = findGroupContainer("h3f2", pageEl);
    var f3Orig = findGroupContainer("h3f3", pageEl);
    if (!f1Orig) return;

    // ألوان أساسية مستخرجة من صور التصميم الأصلي
    var colTitle1 = sampleColor(findEl("h3f1نخلة", f1Orig), "#EFEBE0");
    var colDeed1  = sampleColor(findEl("h3f1ت", f1Orig), "#189E68");
    var colIcon1  = pickContrastIconColor(findEl("h3f1صورة7", f1Orig), "#242021");

    var colTitle2 = f2Orig ? sampleColor(findEl("h3f2نخلة", f2Orig), "#242021") : "#242021";
    var colDeed2  = f2Orig ? sampleColor(findEl("h3f2ه", f2Orig), "#189E68") : "#189E68";
    var colCount2 = f2Orig ? sampleColor(findEl("h3f210000", f2Orig), "#189E68") : "#189E68";
    var colIcon2  = f2Orig ? pickContrastIconColor(findEl("h3f2صورة4", f2Orig), "#EFEBE0") : "#EFEBE0";

    var colHadith3 = f3Orig ? sampleColor(findEl("h3f3م", f3Orig), "#189E68") : "#189E68";

    // إظهار القوالب لحظياً في الخفاء لقياس أبعادها الهندسية الدقيقة
    [f1Orig, f2Orig, f3Orig].forEach(function (g) {
      if (!g) return;
      g.style.display = "block";
      g.style.visibility = "hidden";
      g.style.opacity = "1";
    });

    // حساب موضع البداية العلوي لقالب البطاقة الأصلي h3f1
    var f1UnionR = measureKidsUnionRect(f1Orig);
    var topPad = clamp((f1UnionR.top - wr.top) / scaleY, 44, 180);

    // 1. إنشاء حاوية السحب العمودي للبطاقات الأربع
    var scroller = document.createElement("div");
    scroller.className = "jnh-scroll-viewport";
    scroller.style.paddingTop = Math.round(topPad) + "px";
    scroller.style.paddingBottom = "250px";
    wrap.appendChild(scroller);

    var state = {
      activeCardIdx: 0,
      activeCardRefs: null,
      modalOpen: false,
      hadithOpen: false,
      hadithAnchorEl: null,
      lastTapTs: 0,
      cards: [],
      scroller: scroller
    };

    // 2. تجهيز الواجهة العائمة h3f2 (العدّاد والتفاصيل)
    var modalBackdrop = null, modalShell = null, f2Refs = null, modalDims = { w: 720, h: 820 };
    if (f2Orig) {
      modalBackdrop = document.createElement("div");
      modalBackdrop.className = "jnh-backdrop";
      modalBackdrop.style.cssText = "z-index:140;background:rgba(12,12,15,0.62);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);";
      wrap.appendChild(modalBackdrop);

      modalShell = document.createElement("div");
      modalShell.style.cssText =
        "position:absolute;left:50%;top:47%;z-index:150;display:none;opacity:0;pointer-events:none;" +
        "transform:translate(-50%,-50%) scale(0.76);will-change:transform,opacity,filter;";
      wrap.appendChild(modalShell);

      modalShell.style.display = "block";
      modalShell.style.visibility = "hidden";
      modalDims = normalizeGroupIntoBox(f2Orig, modalShell, scaleX, scaleY);
      modalShell.style.position = "absolute";
      modalShell.style.left = "50%";
      modalShell.style.top = "47%";
      modalShell.style.display = "none";
      modalShell.style.visibility = "visible";

      f2Refs = {
        title: findEl("h3f2نخلة", f2Orig),
        deed: findEl("h3f2ه", f2Orig),
        iconReward: findEl("h3f2صورة4", f2Orig),
        iconText: findEl("h3f2صورة5", f2Orig),
        counter: findEl("h3f210000", f2Orig),
        plusBtn: findEl("h3f2+", f2Orig),
        plusBg: findEl("h3f2صورة3", f2Orig)
      };

      if (f2Refs.iconReward) f2Refs.iconReward.classList.add("jnh-btn-press");
      if (f2Refs.iconText) f2Refs.iconText.classList.add("jnh-btn-press");
      if (f2Refs.plusBtn) {
        f2Refs.plusBtn.classList.add("jnh-btn-press");
        f2Refs.plusBtn.style.zIndex = "30";
      }
      if (f2Refs.plusBg) f2Refs.plusBg.classList.add("jnh-btn-press");

      modalBackdrop.addEventListener("click", function () {
        if (state.hadithOpen) closeHadith();
        else closeModal();
      });
    }

    // 3. تجهيز نافذة الحديث المنبثقة h3f3
    var hadithBackdrop = null, hadithShell = null, f3Refs = null, hadithDims = { w: 720, h: 280 };
    if (f3Orig) {
      hadithBackdrop = document.createElement("div");
      hadithBackdrop.className = "jnh-backdrop";
      hadithBackdrop.style.cssText = "z-index:240;background:rgba(10,10,13,0.34);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);";
      wrap.appendChild(hadithBackdrop);

      hadithShell = document.createElement("div");
      hadithShell.style.cssText =
        "position:absolute;left:0;top:0;z-index:250;display:none;opacity:0;pointer-events:none;" +
        "will-change:transform,opacity,filter;";
      wrap.appendChild(hadithShell);

      hadithShell.style.display = "block";
      hadithShell.style.visibility = "hidden";
      hadithDims = normalizeGroupIntoBox(f3Orig, hadithShell, scaleX, scaleY);
      hadithShell.style.position = "absolute";
      hadithShell.style.display = "none";
      hadithShell.style.visibility = "visible";

      f3Refs = {
        text: findEl("h3f3م", f3Orig),
        bg: findEl("h3f3صورة1", f3Orig)
      };

      hadithBackdrop.addEventListener("click", closeHadith);
      hadithShell.addEventListener("click", closeHadith);
    }

    // ---------------- دوال فتح وإغلاق نافذة الحديث h3f3 بالقرب من أيقونة textalignend ----------------
    function openHadith(cardIdx, anchorEl) {
      if (!hadithShell || !f3Refs) return;
      if (state.hadithOpen && state.hadithAnchorEl === anchorEl) {
        closeHadith();
        return;
      }

      var card = CARDS_DATA[cardIdx];
      state.hadithOpen = true;
      state.hadithAnchorEl = anchorEl;
      playSfx("hadithOpen");

      // تحديث نص الحديث وتمركزه بدقة داخل h3f3م
      hadithShell.style.display = "block";
      hadithShell.style.visibility = "hidden";
      hadithShell.style.transition = "none";
      hadithShell.style.transform = "scale(1)";

      var hBox = setCenteredText(f3Refs.text, card.hadith, {
        color: colHadith3,
        fallbackColor: "#189E68",
        origId: "h3f3م",
        weight: "700",
        lineHeight: 1.48,
        maxFontSize: 34,
        minFontSize: 16,
        expand: 10
      });

      // حساب موقع أيقونة textalignend اللحظي على الشاشة (حتى أثناء السحب)
      var liveWr = wrap.getBoundingClientRect();
      var sx = liveWr.width / wrapW;
      var sy = liveWr.height / wrapH;
      var aR = anchorEl.getBoundingClientRect();

      var ax = (aR.left + aR.width * 0.5 - liveWr.left) / sx;
      var ayTop = (aR.top - liveWr.top) / sy;
      var ayBot = (aR.bottom - liveWr.top) / sy;
      var ayMid = (ayTop + ayBot) * 0.5;

      var popW = hadithDims.w;
      var popH = hadithDims.h;
      var margin = 24;
      var safeBottomLimit = wrapH - 210;

      // اختيار الظهور أعلى الأيقونة أو أسفلها تلقائياً حسب موقعها في الشاشة
      var spaceBelow = safeBottomLimit - ayBot;
      var spaceAbove = ayTop - margin;
      var placeBelow = (spaceBelow >= popH + 22) || (spaceBelow >= spaceAbove);

      var left = clamp(ax - popW * 0.5, margin, Math.max(margin, wrapW - popW - margin));
      var top = placeBelow ? (ayBot + 20) : (ayTop - popH - 20);
      top = clamp(top, margin, Math.max(margin, safeBottomLimit - popH));

      var ox = clamp(ax - left, 24, popW - 24);
      var oy = clamp(ayMid - top, 0, popH);

      hadithShell.style.left = Math.round(left) + "px";
      hadithShell.style.top = Math.round(top) + "px";
      hadithShell.style.transformOrigin = Math.round(ox) + "px " + Math.round(oy) + "px";
      hadithShell.style.visibility = "visible";
      hadithShell.style.opacity = "0";
      hadithShell.style.filter = "blur(8px)";
      hadithShell.style.transform = "scale(0.16) translateY(" + (placeBelow ? "-18px" : "18px") + ")";
      hadithShell.style.pointerEvents = "auto";

      if (hBox) {
        hBox.style.transition = "none";
        hBox.style.opacity = "0";
        hBox.style.transform = "translateY(10px)";
      }

      hadithBackdrop.classList.add("on");
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          hadithShell.style.transition =
            "transform 420ms cubic-bezier(.34,1.38,.64,1), opacity 260ms ease, filter 300ms ease";
          hadithShell.style.opacity = "1";
          hadithShell.style.filter = "blur(0px)";
          hadithShell.style.transform = "scale(1) translateY(0px)";
          if (hBox) {
            hBox.style.transition = "opacity 320ms ease 110ms, transform 360ms cubic-bezier(.22,1,.36,1) 110ms";
            hBox.style.opacity = "1";
            hBox.style.transform = "translateY(0px)";
          }
        });
      });
    }

    function closeHadith() {
      if (!state.hadithOpen || !hadithShell) return;
      state.hadithOpen = false;
      state.hadithAnchorEl = null;
      playSfx("closeModal");

      hadithBackdrop.classList.remove("on");
      hadithShell.style.pointerEvents = "none";
      hadithShell.style.transition =
        "transform 250ms cubic-bezier(.4,0,.2,1), opacity 210ms ease, filter 210ms ease";
      hadithShell.style.opacity = "0";
      hadithShell.style.filter = "blur(6px)";
      hadithShell.style.transform = "scale(0.18)";

      setTimeout(function () {
        if (!state.hadithOpen && hadithShell) {
          hadithShell.style.display = "none";
        }
      }, 260);
    }

    // ---------------- دوال فتح وإغلاق الواجهة العائمة h3f2 (العدّاد) ----------------
    function renderModalCounter(cardKey, animateBump) {
      if (!f2Refs || !f2Refs.counter) return;
      var val = memCounts[cardKey] || 0;
      var box = setCenteredText(f2Refs.counter, String(val), {
        color: colCount2,
        fallbackColor: "#189E68",
        origId: "h3f210000",
        singleLine: true,
        weight: "900",
        maxFontSize: 78,
        minFontSize: 28,
        expand: 8
      });
      if (animateBump && box) {
        box.classList.remove("jnh-count-bump");
        void box.offsetWidth;
        box.classList.add("jnh-count-bump");
      }
    }

    function openModal(cardIdx, cardRefs) {
      if (!modalShell || !f2Refs) return;
      if (state.hadithOpen) closeHadith();

      var card = CARDS_DATA[cardIdx];
      state.activeCardIdx = cardIdx;
      state.activeCardRefs = cardRefs;
      state.modalOpen = true;
      playSfx("openModal");

      var srcRewardRect = cardRefs.btnReward ? cardRefs.btnReward.getBoundingClientRect() : null;
      var srcTextRect   = cardRefs.btnText ? cardRefs.btnText.getBoundingClientRect() : null;
      var srcCardRect   = cardRefs.slot.getBoundingClientRect();

      // تعبئة بيانات h3f2 الخاصة بالبطاقة المضغوطة
      modalShell.style.display = "block";
      modalShell.style.visibility = "hidden";
      modalShell.style.transition = "none";
      modalShell.style.transform = "translate(-50%,-50%) scale(1)";

      var tBox = setCenteredText(f2Refs.title, card.title, {
        color: colTitle2, fallbackColor: "#242021", origId: "h3f2نخلة",
        singleLine: true, weight: "900", maxFontSize: 64, minFontSize: 26, expand: 12
      });
      var dBox = setCenteredText(f2Refs.deed, card.deed, {
        color: colDeed2, fallbackColor: "#189E68", origId: "h3f2ه",
        weight: "800", lineHeight: 1.44, maxFontSize: 42, minFontSize: 20, expand: 10
      });
      var icRew = setCenteredIcon(f2Refs.iconReward, card.icon, colIcon2);
      var icTxt = setCenteredIcon(f2Refs.iconText, "textAlignEnd", colIcon2);
      renderModalCounter(card.key, false);

      // قياس مواقع الدوائر المستهدفة في h3f2 قبل بدء الطيران
      var dstRewardRect = f2Refs.iconReward ? f2Refs.iconReward.getBoundingClientRect() : null;
      var dstTextRect   = f2Refs.iconText ? f2Refs.iconText.getBoundingClientRect() : null;
      var dstModalRect  = modalShell.getBoundingClientRect();

      // إخفاء الأيقونتين داخل h3f2 لحظياً حتى تصل الأيقونتان الطائرتان
      if (icRew) icRew.style.opacity = "0";
      if (icTxt) icTxt.style.opacity = "0";

      var liveWr = wrap.getBoundingClientRect();
      var sx = liveWr.width / wrapW;
      var sy = liveWr.height / wrapH;
      var dxStart = (srcCardRect.left + srcCardRect.width * 0.5 - (dstModalRect.left + dstModalRect.width * 0.5)) / sx;
      var dyStart = (srcCardRect.top + srcCardRect.height * 0.5 - (dstModalRect.top + dstModalRect.height * 0.5)) / sy;

      modalShell.style.visibility = "visible";
      modalShell.style.opacity = "0";
      modalShell.style.filter = "blur(10px)";
      modalShell.style.pointerEvents = "auto";
      modalShell.style.transform =
        "translate(calc(-50% + " + Math.round(dxStart * 0.45) + "px), calc(-50% + " + Math.round(dyStart * 0.45) + "px)) scale(0.72)";

      [tBox, dBox].forEach(function (el) {
        if (!el) return;
        el.style.transition = "none";
        el.style.opacity = "0";
        el.style.transform = "translateY(14px)";
      });

      modalBackdrop.classList.add("on");

      // إطلاق طيران الأيقونتين من البطاقة إلى دائرتي h3f2صورة4 و h3f2صورة5
      flyHeroIcon(card.icon, srcRewardRect, dstRewardRect, colIcon1, colIcon2, 430, function () {
        if (icRew) {
          icRew.style.transition = "opacity 120ms ease";
          icRew.style.opacity = "1";
          triggerWiggle(icRew);
        }
      });
      flyHeroIcon("textAlignEnd", srcTextRect, dstTextRect, colIcon1, colIcon2, 430, function () {
        if (icTxt) {
          icTxt.style.transition = "opacity 120ms ease";
          icTxt.style.opacity = "1";
        }
      });

      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          modalShell.style.transition =
            "transform 460ms cubic-bezier(.34,1.28,.64,1), opacity 280ms ease, filter 320ms ease";
          modalShell.style.opacity = "1";
          modalShell.style.filter = "blur(0px)";
          modalShell.style.transform = "translate(-50%,-50%) scale(1)";

          if (tBox) {
            tBox.style.transition = "opacity 320ms ease 110ms, transform 360ms cubic-bezier(.22,1,.36,1) 110ms";
            tBox.style.opacity = "1";
            tBox.style.transform = "translateY(0)";
          }
          if (dBox) {
            dBox.style.transition = "opacity 340ms ease 170ms, transform 380ms cubic-bezier(.22,1,.36,1) 170ms";
            dBox.style.opacity = "1";
            dBox.style.transform = "translateY(0)";
          }
        });
      });
    }

    function closeModal() {
      if (!state.modalOpen || !modalShell) return;
      if (state.hadithOpen) closeHadith();

      var card = CARDS_DATA[state.activeCardIdx];
      var cardRefs = state.activeCardRefs;
      state.modalOpen = false;
      playSfx("closeModal");

      // عكس طيران الأيقونتين إلى البطاقة الأصلية بسلاسة
      if (cardRefs && f2Refs) {
        var fromRew = f2Refs.iconReward ? f2Refs.iconReward.getBoundingClientRect() : null;
        var toRew   = cardRefs.btnReward ? cardRefs.btnReward.getBoundingClientRect() : null;
        var fromTxt = f2Refs.iconText ? f2Refs.iconText.getBoundingClientRect() : null;
        var toTxt   = cardRefs.btnText ? cardRefs.btnText.getBoundingClientRect() : null;

        var icRew = f2Refs.iconReward && f2Refs.iconReward.querySelector(".jnh-icon-overlay");
        var icTxt = f2Refs.iconText && f2Refs.iconText.querySelector(".jnh-icon-overlay");
        if (icRew) icRew.style.opacity = "0";
        if (icTxt) icTxt.style.opacity = "0";

        flyHeroIcon(card.icon, fromRew, toRew, colIcon2, colIcon1, 310);
        flyHeroIcon("textAlignEnd", fromTxt, toTxt, colIcon2, colIcon1, 310);
      }

      modalBackdrop.classList.remove("on");
      modalShell.style.pointerEvents = "none";
      modalShell.style.transition =
        "transform 280ms cubic-bezier(.4,0,.2,1), opacity 230ms ease, filter 230ms ease";
      modalShell.style.opacity = "0";
      modalShell.style.filter = "blur(8px)";
      modalShell.style.transform = "translate(-50%,-50%) scale(0.76)";

      setTimeout(function () {
        if (!state.modalOpen && modalShell) {
          modalShell.style.display = "none";
        }
      }, 290);
    }

    // ربط تفاعلات عناصر h3f2 المتطابقة مع البطاقات (الأيقونة + textalignend + زر +)
    if (f2Refs) {
      if (f2Refs.iconText) {
        f2Refs.iconText.addEventListener("click", function (ev) {
          ev.stopPropagation();
          openHadith(state.activeCardIdx, f2Refs.iconText);
        });
      }
      if (f2Refs.iconReward) {
        f2Refs.iconReward.addEventListener("click", function (ev) {
          ev.stopPropagation();
          playSfx("icon");
          triggerWiggle(f2Refs.iconReward.querySelector(".jnh-icon-overlay"));
        });
      }

      var onIncrement = function (ev) {
        ev.stopPropagation();
        var now = Date.now();
        if (now - state.lastTapTs < 45) return;
        state.lastTapTs = now;

        var card = CARDS_DATA[state.activeCardIdx];
        memCounts[card.key] = (memCounts[card.key] || 0) + 1;
        saveCounts();

        playSfx("count", memCounts[card.key]);
        renderModalCounter(card.key, true);

        // أثر نبضة وحلقة +1 متصاعدة فوق زر +
        var src = f2Refs.plusBtn || f2Refs.plusBg;
        if (src && modalShell) {
          var sR = src.getBoundingClientRect();
          var mR = modalShell.getBoundingClientRect();
          var liveWr = wrap.getBoundingClientRect();
          var sx = liveWr.width / wrapW;
          var sy = liveWr.height / wrapH;
          var bx = (sR.left + sR.width * 0.5 - mR.left) / sx;
          var by = (sR.top + sR.height * 0.5 - mR.top) / sy;
          spawnTapBurst(modalShell, bx, by, colCount2, true);
        }
      };

      if (f2Refs.plusBtn) f2Refs.plusBtn.addEventListener("click", onIncrement);
      if (f2Refs.plusBg && f2Refs.plusBg !== f2Refs.plusBtn) {
        f2Refs.plusBg.addEventListener("click", onIncrement);
      }
    }

    // 4. استنساخ القالب h3f1 إلى 4 بطاقات متكاملة داخل قائمة السحب
    CARDS_DATA.forEach(function (card, idx) {
      var slot = document.createElement("div");
      slot.className = "jnh-card-slot";
      slot.style.marginBottom = "34px";
      scroller.appendChild(slot);

      var clone = f1Orig.cloneNode(true);
      clone.removeAttribute("id");
      clone.querySelectorAll("[id]").forEach(function (node) {
        node.setAttribute("data-jnh-id", node.id);
        node.removeAttribute("id");
      });

      normalizeGroupIntoBox(clone, slot, scaleX, scaleY);

      var elTitle  = findEl("h3f1نخلة", clone);
      var elDeed   = findEl("h3f1ت", clone);
      var elReward = findEl("h3f1صورة7", clone);
      var elText   = findEl("h3f1صورة5", clone);
      var elHand   = findEl("h3f1صورة6", clone);

      setCenteredText(elTitle, card.title, {
        color: colTitle1, fallbackColor: "#EFEBE0", origId: "h3f1نخلة",
        singleLine: true, weight: "900", maxFontSize: 56, minFontSize: 24, expand: 10
      });
      setCenteredText(elDeed, card.deed, {
        color: colDeed1, fallbackColor: "#189E68", origId: "h3f1ت",
        weight: "800", lineHeight: 1.42, maxFontSize: 38, minFontSize: 18, expand: 8
      });

      var icRew  = setCenteredIcon(elReward, card.icon, colIcon1);
      var icTxt  = setCenteredIcon(elText, "textAlignEnd", colIcon1);
      var icHand = setCenteredIcon(elHand, "hand", colIcon1);

      var refs = { slot: slot, clone: clone, btnReward: elReward, btnText: elText, btnHand: elHand, icRew: icRew, icTxt: icTxt, icHand: icHand };
      state.cards.push(refs);

      // ربط الأزرار الثلاثة في كل بطاقة بحركاتها واستجابتها الموحدة
      if (elHand) {
        elHand.classList.add("jnh-btn-press");
        elHand.addEventListener("click", function (ev) {
          ev.stopPropagation();
          openModal(idx, refs);
        });
      }
      if (elText) {
        elText.classList.add("jnh-btn-press");
        elText.addEventListener("click", function (ev) {
          ev.stopPropagation();
          openHadith(idx, elText);
        });
      }
      if (elReward) {
        elReward.classList.add("jnh-btn-press");
        elReward.addEventListener("click", function (ev) {
          ev.stopPropagation();
          playSfx("icon");
          triggerWiggle(icRew);
        });
      }
    });

    // إخفاء القالب الأصلي h3f1 بعد نسخ البطاقات الأربع
    f1Orig.style.display = "none";

    // إغلاق نافذة الحديث بنعومة عند بدء السحب + تأثير عمق ناعم للبطاقات أثناء التمرير
    var scrollRaf = null;
    function updateScrollDepth() {
      scrollRaf = null;
      var vpR = scroller.getBoundingClientRect();
      var vpMid = vpR.top + vpR.height * 0.48;
      for (var i = 0; i < state.cards.length; i++) {
        var sl = state.cards[i].slot;
        if (sl.dataset._introDone !== "1") continue;
        var r = sl.getBoundingClientRect();
        var dist = Math.abs((r.top + r.height * 0.5) - vpMid) / Math.max(1, vpR.height * 0.72);
        var sc = 1 - clamp((dist - 0.55) * 0.08, 0, 0.065);
        var op = 1 - clamp((dist - 0.75) * 0.35, 0, 0.25);
        sl.style.transition = "transform 120ms linear, opacity 120ms linear";
        sl.style.transform = "scale(" + sc.toFixed(3) + ")";
        sl.style.opacity = op.toFixed(3);
      }
    }

    scroller.addEventListener("scroll", function () {
      if (state.hadithOpen && !state.modalOpen) closeHadith();
      if (!scrollRaf) scrollRaf = requestAnimationFrame(updateScrollDepth);
    }, { passive: true });

    // 5. أنيميشن دخول متدرّج ناعم لجميع البطاقات وعناصرها الداخلية
    function playCardsIntro() {
      scroller.scrollTop = 0;
      state.cards.forEach(function (refs, idx) {
        var sl = refs.slot;
        sl.dataset._introDone = "0";
        sl.style.transition = "none";
        sl.style.opacity = "0";
        sl.style.filter = "blur(8px)";
        sl.style.transform = "translateY(64px) scale(0.92)";

        var icons = [refs.btnReward, refs.btnText, refs.btnHand];
        icons.forEach(function (b) {
          if (!b) return;
          b.style.transition = "none";
          b.style.opacity = "0";
          b.style.transform = "scale(0.55)";
        });

        var delay = 70 + idx * 105;
        setTimeout(function () {
          sl.style.transition =
            "transform 540ms cubic-bezier(.22,1,.36,1), opacity 360ms ease, filter 380ms ease";
          sl.style.opacity = "1";
          sl.style.filter = "blur(0px)";
          sl.style.transform = "translateY(0) scale(1)";

          icons.forEach(function (b, bi) {
            if (!b) return;
            setTimeout(function () {
              b.style.transition = "transform 420ms cubic-bezier(.34,1.56,.64,1), opacity 240ms ease";
              b.style.opacity = "1";
              b.style.transform = "scale(1)";
            }, 130 + bi * 65);
          });

          setTimeout(function () { sl.dataset._introDone = "1"; }, 620);
        }, delay);
      });
    }

    state.playCardsIntro = playCardsIntro;
    pageEl._jnhState = state;
    if (playIntro) playCardsIntro();
  }

  function getTargetPage(el) {
    if (el && el.closest) {
      var p = el.closest(".html-page");
      if (p) return p;
    }
    return document.querySelector('.html-page[data-page="3"]');
  }

  return {
    setup: function (el) {
      var pg = getTargetPage(el);
      if (pg) mountJannahSystem(pg, false);
    },
    run: function (el) {
      var pg = getTargetPage(el);
      if (pg) mountJannahSystem(pg, true);
      return Promise.resolve();
    },
    reset: function (el) {
      var pg = getTargetPage(el);
      if (pg && pg._jnhState && pg._jnhState.playCardsIntro) {
        pg._jnhState.playCardsIntro();
      }
    }
  };
})();
