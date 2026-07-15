/**
 * Carga Metaobject landing_settings (handle: main) y rellena el banner/hero del clone.
 * Fallback: deja el HTML estático si no hay metaobject o falla la API.
 */
(function () {
  var DOMAIN = "k3btq8-6r.myshopify.com";
  var TOKEN = "e703eaa742c1c9a73964e3d646ec51fd";
  var URL = "https://" + DOMAIN + "/api/2025-07/graphql.json";

  var QUERY =
    "query($handle:String!,$type:String!){metaobject(handle:{handle:$handle,type:$type}){fields{key value reference{...on MediaImage{image{url}}}}}}";

  function setText(sel, value) {
    if (!value) return;
    var nodes = document.querySelectorAll(sel);
    for (var i = 0; i < nodes.length; i++) nodes[i].textContent = value;
  }

  function apply(map) {
    var pick = function (key) {
      var f = map[key];
      return f && f.value && String(f.value).trim() ? String(f.value).trim() : "";
    };

    var subtitle = pick("hero_subtitle");
    var title = pick("hero_title");
    var urgency = pick("hero_urgency");
    var bannerImage = (map.banner_image && map.banner_image.imageUrl) || pick("banner_image");

    if (subtitle) setText("[data-lv-field='hero_subtitle']", subtitle);
    if (title) setText("[data-lv-field='hero_title']", title);
    if (urgency) setText("[data-lv-field='hero_urgency']", urgency);

    if (bannerImage) {
      var imgs = document.querySelectorAll("[data-lv-field='banner_image']");
      for (var j = 0; j < imgs.length; j++) {
        imgs[j].setAttribute("src", bannerImage);
        imgs[j].style.display = "";
      }
      // Si hay imagen editable, oculta botellas por defecto
      var bottles = document.querySelectorAll("[data-lv-hide-when-banner]");
      for (var k = 0; k < bottles.length; k++) bottles[k].style.display = "none";
    }
  }

  fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": TOKEN,
    },
    body: JSON.stringify({
      query: QUERY,
      variables: { handle: "main", type: "landing_settings" },
    }),
  })
    .then(function (r) {
      return r.json();
    })
    .then(function (json) {
      var mo = json && json.data && json.data.metaobject;
      if (!mo || !mo.fields) return;
      var map = {};
      for (var i = 0; i < mo.fields.length; i++) {
        var f = mo.fields[i];
        map[f.key] = {
          value: f.value,
          imageUrl: f.reference && f.reference.image ? f.reference.image.url : null,
        };
      }
      apply(map);
    })
    .catch(function () {
      /* sin metaobject: se mantiene copy estático */
    });
})();
