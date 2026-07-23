/**
 * Static PWA: «Скрыть / Показать все балансы»
 * Noise masks: fixed 100×20/24 canvas, round drifting particles, smooth motion,
 * amount-row (.qxqFKvvB) replaced as one unit.
 */
(function () {
  var STORAGE_KEY = "sber-hide-balances";
  var HIDDEN_ATTR = "data-balances-hidden-node";
  var EXEMPT_ATTR = "data-balances-exempt";
  var animId = null;
  var particleMap =
    typeof WeakMap !== "undefined" ? new WeakMap() : null;

  var SVG_HIDE =
    '<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" focusable="false">' +
    '<path fill-rule="evenodd" clip-rule="evenodd" d="M19.807 2.07a.75.75 0 0 1 1.133.976l-.072.084-3.02 3.02.002.002-2.362 2.362-.002-.002-3.443 3.443.003.001-2.193 2.193-.002-.002-1.415 1.415.002.002-2.301 2.3h-.002L2.97 21.026a.75.75 0 0 1-1.134-.976l.073-.084 2.99-2.99c-1.436-1.158-2.712-2.67-3.763-4.474a1 1 0 0 1 0-1.007C3.72 7.063 7.665 4.394 11.98 4.394c1.562 0 3.077.35 4.495 1.007l3.331-3.331Zm-7.906 4.936a5 5 0 0 1 2.374.596l-3.252 3.252a2.313 2.313 0 0 1-.08-1.693 2.977 2.977 0 0 0-2.042 2.817c0 .302.045.593.13.868l-1.518 1.518a4.926 4.926 0 0 1-.612-2.386c0-2.747 2.24-4.972 5-4.972Z"></path>' +
    '<path d="M7.512 18.612c1.41.649 2.915.995 4.468.995 4.317 0 8.262-2.67 10.846-7.104a1 1 0 0 0 0-1.007c-1.047-1.795-2.316-3.3-3.742-4.457l-2.712 2.712a4.93 4.93 0 0 1 .529 2.227c0 2.747-2.24 4.971-5 4.971a5.003 5.003 0 0 1-2.214-.513l-2.175 2.176Z"></path>' +
    '<path d="M11.245 14.878c.211.046.43.071.656.071 1.658 0 3-1.332 3-2.971 0-.154-.012-.305-.035-.452a2.356 2.356 0 0 1-.816.547l-2.805 2.805Z"></path>' +
    "</svg>";

  var SVG_SHOW =
    '<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" focusable="false">' +
    '<path d="M14.866 11.526c.023.147.035.298.035.452 0 1.64-1.342 2.971-3 2.971s-3-1.332-3-2.971c0-1.308.855-2.421 2.043-2.817-.08.234-.123.485-.123.746a2.342 2.342 0 0 0 2.352 2.334 2.35 2.35 0 0 0 1.693-.715Z"></path>' +
    '<path fill-rule="evenodd" clip-rule="evenodd" d="M1.137 11.496C3.72 7.063 7.665 4.394 11.98 4.394s8.26 2.67 10.844 7.102a1 1 0 0 1 0 1.007c-2.583 4.433-6.528 7.104-10.845 7.104-4.316 0-8.26-2.67-10.843-7.104a1 1 0 0 1 0-1.007Zm5.764.482c0-2.747 2.24-4.972 5-4.972s5 2.225 5 4.972c0 2.747-2.24 4.971-5 4.971s-5-2.224-5-4.971Z"></path>' +
    "</svg>";

  function findButton() {
    return (
      document.querySelector('button[title*="балансы"]') ||
      document.querySelector('button[aria-label*="балансы"]') ||
      document.querySelector("button.VZT5ynjW") ||
      document.querySelector("button.scaffold__main-link")
    );
  }

  function markExemptSections() {
    document.querySelectorAll("[" + EXEMPT_ATTR + "]").forEach(function (el) {
      el.removeAttribute(EXEMPT_ATTR);
    });

    var ratesRoot = document.getElementById("RATES");
    if (ratesRoot) ratesRoot.setAttribute(EXEMPT_ATTR, "1");

    document.querySelectorAll(".wifeRTkh").forEach(function (el) {
      if (el.querySelector("h2") && /Курсы/.test(el.textContent || "")) {
        el.setAttribute(EXEMPT_ATTR, "1");
      }
    });

    document.querySelectorAll("h2").forEach(function (h2) {
      var title = normalizeText(h2.textContent);
      if (!/^Курсы/.test(title)) return;
      var card =
        h2.closest("#RATES") ||
        h2.closest(".wifeRTkh") ||
        h2.closest(".SBQDm1WJ") ||
        h2.closest("section");
      if (card) card.setAttribute(EXEMPT_ATTR, "1");
    });
  }

  function isExempt(el) {
    return !!(el.closest && el.closest("[" + EXEMPT_ATTR + "]"));
  }

  function normalizeText(t) {
    return String(t || "")
      .replace(/\u00a0/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function isCurrencyLabel(t) {
    return /^(₽|руб\.?|рубль|рубля|рублей)$/i.test(normalizeText(t));
  }

  function isMoneyText(raw) {
    var t = normalizeText(raw);
    if (!t || t.length > 28) return false;
    if (/^••/.test(t)) return false;
    if (/%/.test(t)) return false;
    if (/^за\s/i.test(t)) return false;
    if (/₽/.test(t) && /\d/.test(t)) return true;
    if (/руб/i.test(t) && /\d/.test(t)) return true;
    if (/^\d{1,3}(?: \d{3})+(?:[.,]\d{1,2})?$/.test(t)) return true;
    if (/^\d+[.,]\d{2}$/.test(t)) return true;
    if (/^\d{2,6}$/.test(t)) return true;
    return false;
  }

  function ownText(el) {
    var out = "";
    for (var i = 0; i < el.childNodes.length; i++) {
      var n = el.childNodes[i];
      if (n.nodeType === 3) out += n.nodeValue || "";
    }
    return normalizeText(out);
  }

  function isMoneyTarget(el) {
    if (el.querySelector("canvas")) return false;
    if (el.children.length === 0) return isMoneyText(el.textContent);

    for (var i = 0; i < el.children.length; i++) {
      var child = el.children[i];
      if (child.children.length > 0) return false;
      var ct = normalizeText(child.textContent);
      if (!(isCurrencyLabel(ct) || child.getAttribute("aria-hidden") === "true")) {
        return false;
      }
    }
    return isMoneyText(ownText(el));
  }

  // Live replaces the whole amount flex row (amount + ₽) with one canvas
  function isAmountRow(el) {
    if (!el || !el.classList || !el.classList.contains("qxqFKvvB")) return false;
    if (isExempt(el)) return false;
    if (el.querySelector("canvas")) return false;
    var kids = el.children;
    if (!kids.length) return false;
    var hasMoney = false;
    for (var i = 0; i < kids.length; i++) {
      var t = normalizeText(kids[i].textContent);
      if (isMoneyText(t) || isCurrencyLabel(t)) hasMoney = true;
      else return false;
    }
    return hasMoney;
  }

  function isCurrencySiblingTarget(el) {
    if (el.children.length > 0) return false;
    if (!isCurrencyLabel(el.textContent)) return false;
    if (el.closest(".qxqFKvvB") && isAmountRow(el.parentElement)) return false;
    var parent = el.parentElement;
    if (!parent) return false;
    for (var i = 0; i < parent.children.length; i++) {
      var sib = parent.children[i];
      if (sib === el) continue;
      if (isMoneyTarget(sib) || sib.getAttribute(HIDDEN_ATTR)) return true;
    }
    return false;
  }

  function collectTargets() {
    var out = [];
    var skip = typeof WeakSet !== "undefined" ? new WeakSet() : null;

    document.querySelectorAll(".qxqFKvvB").forEach(function (row) {
      if (!isAmountRow(row)) return;
      var r = row.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return;
      out.push(row);
      if (skip) {
        for (var i = 0; i < row.children.length; i++) skip.add(row.children[i]);
      }
    });

    var nodes = document.querySelectorAll("p, span, div, strong, b");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (skip && skip.has(el)) continue;
      if (el.getAttribute(HIDDEN_ATTR)) continue;
      if (isExempt(el)) continue;
      if (el.classList && el.classList.contains("qxqFKvvB")) continue;

      var money = isMoneyTarget(el);
      var currencySib = !money && isCurrencySiblingTarget(el);
      if (!money && !currencySib) continue;
      if (
        money &&
        el.parentElement &&
        isMoneyTarget(el.parentElement) &&
        !isExempt(el.parentElement)
      ) {
        continue;
      }
      // Already covered by amount-row parent
      if (el.closest && el.closest(".qxqFKvvB") && isAmountRow(el.closest(".qxqFKvvB"))) {
        continue;
      }
      var r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue;
      out.push(el);
    }
    return out;
  }

  function makeParticles(w, h) {
    var count = 28 + ((Math.random() * 8) | 0);
    var list = [];
    for (var i = 0; i < count; i++) {
      var r = 0.7 + Math.random() * 1.4;
      if (Math.random() < 0.12) r *= 1.35;
      var shade = 15 + ((Math.random() * 9) | 0);
      // Mostly horizontal drift with larger amplitude
      var speed = 5.5 + Math.random() * 9;
      var angle = (Math.random() - 0.5) * 0.55; // near-horizontal
      list.push({
        x: 4 + Math.random() * (w - 8),
        y: h * (0.28 + Math.random() * 0.44),
        r: r,
        baseR: r,
        shade: shade,
        g: shade + ((Math.random() * 3) | 0),
        b: shade + ((Math.random() * 5) | 0),
        a: 0.22 + Math.random() * 0.18,
        vx: Math.cos(angle) * speed * (Math.random() < 0.5 ? 1 : -1),
        vy: Math.sin(angle) * speed * 0.45,
        phase: Math.random() * Math.PI * 2,
        spin: 0.12 + Math.random() * 0.22,
        drawA: 0,
      });
    }
    return list;
  }

  function ensureParticles(canvas) {
    if (!particleMap) return makeParticles(canvas.width, canvas.height);
    var list = particleMap.get(canvas);
    if (!list) {
      list = makeParticles(canvas.width, canvas.height);
      particleMap.set(canvas, list);
    }
    return list;
  }

  function stepParticles(canvas, dt) {
    var w = canvas.width;
    var h = canvas.height;
    var list = ensureParticles(canvas);
    var t = performance.now() / 1000;
    for (var i = 0; i < list.length; i++) {
      var p = list[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      var pad = p.r + 1;
      if (p.x < pad) {
        p.x = pad;
        p.vx = Math.abs(p.vx);
      } else if (p.x > w - pad) {
        p.x = w - pad;
        p.vx = -Math.abs(p.vx);
      }
      if (p.y < pad) {
        p.y = pad;
        p.vy = Math.abs(p.vy);
      } else if (p.y > h - pad) {
        p.y = h - pad;
        p.vy = -Math.abs(p.vy);
      }

      // Slight path bend — keep motion mostly straight
      var ang = Math.sin(t * p.spin + p.phase) * 0.08 * dt * 60;
      var cos = Math.cos(ang);
      var sin = Math.sin(ang);
      var nvx = p.vx * cos - p.vy * sin;
      var nvy = p.vx * sin + p.vy * cos;
      p.vx = nvx;
      p.vy = nvy;

      var pulse = 0.5 + 0.5 * Math.sin(t * p.spin + p.phase);
      p.r = p.baseR * (0.9 + 0.12 * pulse);
      p.drawA = p.a * (0.8 + 0.25 * pulse);
    }
    return list;
  }

  function paintNoise(canvas, dt) {
    var ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    var w = canvas.width;
    var h = canvas.height;
    if (w < 1 || h < 1) return;

    var list = stepParticles(canvas, typeof dt === "number" ? dt : 0.016);
    ctx.clearRect(0, 0, w, h);
    for (var i = 0; i < list.length; i++) {
      var p = list[i];
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle =
        "rgba(" +
        p.shade +
        "," +
        p.g +
        "," +
        p.b +
        "," +
        (p.drawA || p.a) +
        ")";
      ctx.fill();
    }
  }

  function startNoiseAnim() {
    if (animId != null) return;
    var prev = 0;
    function frame(now) {
      var dt = prev ? Math.min(0.05, (now - prev) / 1000) : 0.016;
      prev = now;
      var canvases = document.querySelectorAll(
        'canvas[aria-label="Информация скрыта"]'
      );
      for (var i = 0; i < canvases.length; i++) paintNoise(canvases[i], dt);
      animId = requestAnimationFrame(frame);
    }
    animId = requestAnimationFrame(frame);
  }

  function stopNoiseAnim() {
    if (animId != null) {
      cancelAnimationFrame(animId);
      animId = null;
    }
  }

  function maskSizeFor(el) {
    // Live always uses width 100; wallet/bonus rows → 24, expense/history → 20
    var isRow =
      (el.classList && el.classList.contains("qxqFKvvB")) ||
      (el.children.length > 0 && isAmountRow(el));
    return { w: 100, h: isRow ? 24 : 20 };
  }

  function maskElement(el) {
    if (el.getAttribute(HIDDEN_ATTR)) return;
    var size = maskSizeFor(el);
    var w = size.w;
    var h = size.h;

    el.setAttribute(HIDDEN_ATTR, "1");
    el.setAttribute("data-balances-orig-html", el.innerHTML);
    el.setAttribute("data-balances-orig-text", el.textContent);
    if (el.hasAttribute("title")) {
      el.setAttribute("data-balances-orig-title", el.getAttribute("title"));
      el.removeAttribute("title");
    }

    var canvas = document.createElement("canvas");
    canvas.setAttribute("aria-label", "Информация скрыта");
    canvas.setAttribute("role", "img");
    canvas.width = w;
    canvas.height = h;
    // Match live style attribute exactly (no display/verticalAlign overrides)
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";

    el.textContent = "";
    el.appendChild(canvas);
    paintNoise(canvas);
  }

  function unmaskElement(el) {
    if (!el.getAttribute(HIDDEN_ATTR)) return;
    var html = el.getAttribute("data-balances-orig-html");
    if (html != null) el.innerHTML = html;
    var title = el.getAttribute("data-balances-orig-title");
    if (title != null) el.setAttribute("title", title);
    el.removeAttribute(HIDDEN_ATTR);
    el.removeAttribute("data-balances-orig-html");
    el.removeAttribute("data-balances-orig-text");
    el.removeAttribute("data-balances-orig-title");
  }

  function scrubLabel(orig) {
    var next = orig;
    next = next.replace(
      /\d[\d\s\u00a0.,]*\s*бонус[а-яА-ЯёЁ]*/gi,
      "Информация скрыта"
    );
    next = next.replace(
      /Категория\s+([^.]+?)\s+[\d\s\u00a0.,]+₽?\s*рублей?/gi,
      "Категория $1. Сумма скрыта"
    );
    next = next.replace(
      /составляют\s+[\d\s\u00a0.,]*\s*₽?\s*рублей?/gi,
      "составляют. Сумма скрыта"
    );
    next = next.replace(
      /Всего средств[^.]*?на всех счетах[\s\u00a0\d.,]*руб[а-яА-ЯёЁ]*/gi,
      "Всего средств на всех счетах. Сумма скрыта"
    );
    next = next.replace(/Баланс[\s\u00a0\d.,₽руб]*\.?/gi, "Баланс скрыт.");
    next = next.replace(/\d[\d\s\u00a0.,]*\s*₽/g, "");
    next = next.replace(/[\d\s\u00a0.,]+\s*руб(?:л[а-яА-ЯёЁ]*)?\.?/gi, "");
    if (/Баланс/i.test(orig) && !/скрыт/i.test(next)) {
      next = orig.replace(/[\d\s\u00a0.,]+₽?/g, " ").replace(/\s+/g, " ").trim();
      if (!/\.$/.test(next)) next += ".";
      next += " Баланс скрыт.";
    }
    return next.replace(/\s{2,}/g, " ").replace(/\s+\./g, ".").trim();
  }

  function updateLinkLabels(hidden) {
    document
      .querySelectorAll("a[aria-label], a[title], button[aria-label], button[title]")
      .forEach(function (a) {
        var probe =
          (a.getAttribute("aria-label") || "") +
          " " +
          (a.getAttribute("title") || "");
        if (/все балансы/i.test(probe) && a.tagName === "BUTTON") return;
        if (isExempt(a)) return;

        ["aria-label", "title"].forEach(function (attr) {
          var v = a.getAttribute(attr);
          if (!v) return;
          if (!a.getAttribute("data-balances-orig-" + attr)) {
            a.setAttribute("data-balances-orig-" + attr, v);
          }
          var orig = a.getAttribute("data-balances-orig-" + attr);
          if (!hidden) {
            a.setAttribute(attr, orig);
            return;
          }
          a.setAttribute(attr, scrubLabel(orig));
        });
      });
  }

  function setButtonState(btn, hidden) {
    var label = hidden ? "Показать все балансы" : "Скрыть все балансы";
    btn.setAttribute("title", label);
    btn.setAttribute("aria-label", label);
    var iconWrap = btn.querySelector("._icon_4ffxe_1") || btn;
    var svg = iconWrap.querySelector("svg");
    if (svg) {
      svg.outerHTML = hidden ? SVG_SHOW : SVG_HIDE;
    } else {
      iconWrap.insertAdjacentHTML("beforeend", hidden ? SVG_SHOW : SVG_HIDE);
    }
  }

  function applyHidden(hidden) {
    markExemptSections();
    stopNoiseAnim();
    document.querySelectorAll("[" + HIDDEN_ATTR + "]").forEach(unmaskElement);
    if (hidden) {
      collectTargets().forEach(maskElement);
      startNoiseAnim();
    }
    updateLinkLabels(hidden);
    document.documentElement.classList.toggle("balances-hidden", hidden);
    var btn = findButton();
    if (btn) setButtonState(btn, hidden);
  }

  function readStored() {
    try {
      return localStorage.getItem(STORAGE_KEY) === "1";
    } catch (e) {
      return false;
    }
  }

  function writeStored(hidden) {
    try {
      localStorage.setItem(STORAGE_KEY, hidden ? "1" : "0");
    } catch (e) {}
  }

  function toggle() {
    var next = !document.documentElement.classList.contains("balances-hidden");
    writeStored(next);
    applyHidden(next);
  }

  function bind() {
    var btn = findButton();
    if (!btn || btn.getAttribute("data-balances-bound")) return;
    btn.setAttribute("data-balances-bound", "1");
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      toggle();
    });
  }

  function init() {
    bind();
    applyHidden(readStored());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
  setTimeout(function () {
    bind();
    if (readStored()) applyHidden(true);
  }, 300);
})();
