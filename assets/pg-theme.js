(function () {
  // Year in footer
  var years = document.getElementsByClassName("currentYear");
  var y = String(new Date().getFullYear());
  for (var i = 0; i < years.length; i++) years[i].textContent = y;

  // Countdown to end of day
  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }
  function tickCountdowns() {
    var end = new Date();
    end.setHours(23, 59, 59, 999);
    var diff = Math.max(0, end.getTime() - Date.now());
    var h = Math.floor(diff / 3600000);
    var m = Math.floor((diff % 3600000) / 60000);
    var s = Math.floor((diff % 60000) / 1000);
    document.querySelectorAll("[data-pg-countdown]").forEach(function (root) {
      var hEl = root.querySelector("[data-h]");
      var mEl = root.querySelector("[data-m]");
      var sEl = root.querySelector("[data-s]");
      if (hEl) hEl.textContent = pad(h);
      if (mEl) mEl.textContent = pad(m);
      if (sEl) sEl.textContent = pad(s);
    });
  }
  tickCountdowns();
  setInterval(tickCountdowns, 1000);

  // Product gallery thumbs
  document.querySelectorAll("[data-pg-gallery]").forEach(function (gallery) {
    var hero = gallery.querySelector("[data-pg-hero]");
    gallery.querySelectorAll("[data-pg-thumb]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        gallery.querySelectorAll("[data-pg-thumb]").forEach(function (b) {
          b.classList.remove("is-active");
        });
        btn.classList.add("is-active");
        if (hero) {
          hero.src = btn.getAttribute("data-src") || hero.src;
        }
      });
    });
  });

  // Variant picker → update form + totals
  document.querySelectorAll("[data-pg-product]").forEach(function (root) {
    var input = root.querySelector('input[name="id"]');
    var checkout = root.querySelector("[data-pg-checkout]");
    var totalPrice = root.querySelector("[data-pg-total-price]");
    var totalCompare = root.querySelector("[data-pg-total-compare]");
    var totalSave = root.querySelector("[data-pg-total-save]");
    var shop = root.getAttribute("data-shop") || window.Shopify && Shopify.shop;

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

    root.querySelectorAll("[data-pg-variant]").forEach(function (btn) {
      btn.addEventListener("click", function () {
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
          var host = root.getAttribute("data-checkout-host") || ("https://" + (shop || location.host));
          checkout.href = host.replace(/\/$/, "") + "/cart/" + numeric + ":1";
        }
      });
    });

    var active = root.querySelector("[data-pg-variant].is-active") || root.querySelector("[data-pg-variant]");
    if (active) active.click();
  });
})();
