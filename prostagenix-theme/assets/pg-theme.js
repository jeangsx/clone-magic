(function () {
  var designMode =
    (window.Shopify && Shopify.designMode) ||
    document.documentElement.classList.contains("shopify-design-mode") ||
    (document.body && document.body.classList.contains("shopify-design-mode"));

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function timeParts() {
    var end = new Date();
    end.setHours(23, 59, 59, 999);
    var diff = Math.max(0, end.getTime() - Date.now());
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      mins: Math.floor((diff % 3600000) / 60000),
      secs: Math.floor((diff % 60000) / 1000),
      hOnly: Math.floor(diff / 3600000),
    };
  }

  function flipUnit(value) {
    var digits = pad(value).split("");
    var html = '<ul class="flip">';
    for (var i = 0; i < digits.length; i++) {
      var d = digits[i];
      html +=
        '<li class="d' +
        (i + 1) +
        '"><section class="ready">' +
        '<div class="up"><div class="inn">' +
        d +
        "</div></div>" +
        '<div class="down"><div class="inn">' +
        d +
        "</div></div>" +
        "</section></li>";
    }
    html += "</ul>";
    return html;
  }

  function ensureTicker(el, parts) {
    if (!el.getAttribute("data-pg-built")) {
      el.innerHTML =
        flipUnit(parts.days) +
        flipUnit(parts.hours) +
        flipUnit(parts.mins) +
        flipUnit(parts.secs);
      el.setAttribute("data-pg-built", "1");
      return;
    }
    var inns = el.querySelectorAll(".inn");
    var str =
      pad(parts.days) + pad(parts.hours) + pad(parts.mins) + pad(parts.secs);
    for (var i = 0; i < str.length; i++) {
      var up = inns[i * 2];
      var down = inns[i * 2 + 1];
      if (up) up.textContent = str.charAt(i);
      if (down) down.textContent = str.charAt(i);
    }
  }

  function tickHeroCounters() {
    var tickers = document.querySelectorAll("#ticker, [data-pg-ticker]");
    if (!tickers.length) return;
    var parts = timeParts();
    for (var i = 0; i < tickers.length; i++) {
      ensureTicker(tickers[i], parts);
    }
  }

  function tickPgCountdowns() {
    var roots = document.querySelectorAll("[data-pg-countdown]");
    if (!roots.length) return;
    var parts = timeParts();
    for (var i = 0; i < roots.length; i++) {
      var root = roots[i];
      var dEl = root.querySelector("[data-d]");
      var hEl = root.querySelector("[data-h]");
      var mEl = root.querySelector("[data-m]");
      var sEl = root.querySelector("[data-s]");
      if (dEl) dEl.textContent = pad(parts.days);
      if (hEl) {
        hEl.textContent = pad(
          root.hasAttribute("data-hours-only") ? parts.hOnly : parts.hours
        );
      }
      if (mEl) mEl.textContent = pad(parts.mins);
      if (sEl) sEl.textContent = pad(parts.secs);
    }
  }

  function setupWhatsApp() {
    var btn = document.getElementById("lvWaBtn");
    if (!btn) return;
    var host = document.getElementById("lvWaHost");
    if (!host) {
      host = document.createElement("div");
      host.id = "lvWaHost";
      document.body.appendChild(host);
    }
    if (btn.parentNode !== host) host.appendChild(btn);
  }

  function setupYear() {
    var years = document.getElementsByClassName("currentYear");
    var y = String(new Date().getFullYear());
    for (var i = 0; i < years.length; i++) years[i].textContent = y;
  }

  function setupGallery() {
    document.querySelectorAll("[data-pg-gallery]").forEach(function (gallery) {
      if (gallery.getAttribute("data-pg-bound")) return;
      gallery.setAttribute("data-pg-bound", "1");
      var hero = gallery.querySelector("[data-pg-hero]");
      gallery.querySelectorAll("[data-pg-thumb]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          gallery.querySelectorAll("[data-pg-thumb]").forEach(function (b) {
            b.classList.remove("is-active");
          });
          btn.classList.add("is-active");
          if (hero) hero.src = btn.getAttribute("data-src") || hero.src;
        });
      });
    });
  }

  function applyVariant(root, btn) {
    var input = root.querySelector('input[name="id"]');
    var checkout = root.querySelector("[data-pg-checkout]");
    var totalPrice = root.querySelector("[data-pg-total-price]");
    var totalCompare = root.querySelector("[data-pg-total-compare]");
    var totalSave = root.querySelector("[data-pg-total-save]");
    var shop =
      root.getAttribute("data-shop") || (window.Shopify && Shopify.shop);

    function money(cents) {
      try {
        return (Number(cents) / 100).toLocaleString(undefined, {
          style: "currency",
          currency: root.getAttribute("data-currency") || "PEN",
        });
      } catch (e) {
        return "S/ " + (Number(cents) / 100).toFixed(2);
      }
    }

    root.querySelectorAll("[data-pg-variant]").forEach(function (b) {
      b.classList.remove("is-active");
    });
    btn.classList.add("is-active");
    var id = btn.getAttribute("data-id");
    var price = Number(btn.getAttribute("data-price") || 0);
    var compare = Number(btn.getAttribute("data-compare") || price);
    if (compare < price) compare = Math.round(price * 2.5);
    var save = Math.max(0, compare - price);
    if (input) input.value = id;
    if (totalPrice) totalPrice.textContent = money(price);
    if (totalCompare) totalCompare.textContent = money(compare);
    if (totalSave) totalSave.textContent = money(save);
    if (checkout && id) {
      var numeric = String(id).replace(/\D/g, "");
      var host =
        root.getAttribute("data-checkout-host") ||
        "https://" + (shop || location.host);
      checkout.href = host.replace(/\/$/, "") + "/cart/" + numeric + ":1";
    }
  }

  function setupVariants() {
    document.querySelectorAll("[data-pg-product]").forEach(function (root) {
      if (root.getAttribute("data-pg-bound")) return;
      root.setAttribute("data-pg-bound", "1");
      root.querySelectorAll("[data-pg-variant]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          applyVariant(root, btn);
        });
      });
      var active =
        root.querySelector("[data-pg-variant].is-active") ||
        root.querySelector("[data-pg-variant]");
      if (active) applyVariant(root, active);
    });
  }

  function setupOfferThumbs() {
    document.querySelectorAll("[data-pg-offer-thumbs]").forEach(function (row) {
      if (row.getAttribute("data-pg-bound")) return;
      row.setAttribute("data-pg-bound", "1");
      var visual = row.closest(".lv-offer-visual");
      var main = visual && visual.querySelector(".lv-offer-bottles img");
      if (!main) return;
      row.querySelectorAll(".lv-offer-thumb").forEach(function (btn) {
        btn.addEventListener("click", function () {
          row.querySelectorAll(".lv-offer-thumb").forEach(function (b) {
            b.classList.remove("is-active");
          });
          btn.classList.add("is-active");
          var src = btn.getAttribute("data-src");
          if (src) main.src = src;
        });
      });
    });
  }

  function init() {
    setupYear();
    setupWhatsApp();
    setupGallery();
    setupOfferThumbs();
    setupVariants();
    tickHeroCounters();
    tickPgCountdowns();
    if (designMode) return;
    setInterval(function () {
      tickHeroCounters();
      tickPgCountdowns();
    }, 1000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
