import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DEAL_KEYS, DEALS, resolveDealKey, type DealKey } from "../lib/deals";
import {
  fetchAllProducts,
  fetchProductByHandle,
  fmtMoney,
  productBadgeText,
  productImages,
  productShortPitch,
  productVariants,
  resolveBenefits,
  variantCompare,
  variantPrice,
  type ShopifyProduct,
  type ShopifyVariant,
} from "../lib/shopify";
import { SHOPIFY_DOMAIN, SHOPIFY_TOKEN } from "../lib/shopify";
import { useLandingSettings } from "../lib/use-landing-settings";
import { CLONE_HOME } from "../lib/static-hosting";

const GALLERY_FALLBACK = [
  "https://www.prostagenix.com/images/product/bottle_box.png",
  "https://www.prostagenix.com/images/product/bottle.png",
  "https://www.prostagenix.com/images/home/dudley-danoff.png",
  "https://www.prostagenix.com/special/special-offer/img/number-one-award.png",
];

function useCountdown() {
  const [diff, setDiff] = useState(24 * 3_600_000 - 1000);
  useEffect(() => {
    const t = new Date();
    t.setHours(23, 59, 59, 999);
    const target = t.getTime();
    const tick = () => setDiff(Math.max(0, target - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  const h = String(Math.floor(diff / 3_600_000)).padStart(2, "0");
  const m = String(Math.floor((diff % 3_600_000) / 60_000)).padStart(2, "0");
  const s = String(Math.floor((diff % 60_000) / 1000)).padStart(2, "0");
  return { h, m, s };
}

const BLUE = "#054497";
const RED = "#d40000";
const ORANGE = "#f39200";

export default function ProductPage() {
  const [searchParams] = useSearchParams();
  const deal = searchParams.get("deal");
  const handle = searchParams.get("handle");
  const navigate = useNavigate();
  const { h, m, s } = useCountdown();
  const { settings } = useLandingSettings();

  const [product, setProduct] = useState<ShopifyProduct | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<DealKey>(resolveDealKey(deal));
  const [heroIdx, setHeroIdx] = useState(0);
  const [loading, setLoading] = useState(!!handle || !deal);
  const [descOpen, setDescOpen] = useState(false);

  function goToShopifyCheckout(variantId: string, quantity = 1) {
    // Extract numeric variant id from GID: gid://shopify/ProductVariant/12345
    const numeric = variantId.split("/").pop();
    // Direct Shopify cart permalink — instant redirect, no API round trip
    const url = `https://${SHOPIFY_DOMAIN}/cart/${numeric}:${quantity}?channel=online_store`;
    window.location.href = url;
  }

  useEffect(() => {
    document.title = "ProstaGenix - Preview del Producto";
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Si hay handle (o no hay deal), cargar Shopify y usar plantilla PDP con ese producto
      if (!handle && deal) {
        setLoading(false);
        return;
      }
      try {
        let p: ShopifyProduct | null = null;
        if (handle) p = await fetchProductByHandle(handle);
        if (!p) {
          const all = await fetchAllProducts();
          p = all[0] ?? null;
        }
        if (cancelled) return;
        setProduct(p);
        setSelectedVariantId(p ? productVariants(p)[0]?.id ?? null : null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [handle, deal]);

  const variants = useMemo(() => (product ? productVariants(product) : []), [product]);
  const gallery = useMemo(
    () => (product ? productImages(product) : GALLERY_FALLBACK),
    [product],
  );
  const selectedVariant: ShopifyVariant | null =
    variants.find((v) => v.id === selectedVariantId) ?? variants[0] ?? null;

  const useShopify = !!product && !!selectedVariant;
  const curDeal = DEALS[selectedDeal];

  const title = useShopify
    ? product!.title
    : "ProstaGenix™ – Fórmula Clínica para la Próstata";
  const price = useShopify ? variantPrice(selectedVariant!) : curDeal.price;
  const retail = useShopify ? variantCompare(selectedVariant!) : curDeal.retail;
  const currency = useShopify ? selectedVariant!.price.currencyCode : "PEN";
  const save = Math.max(0, +(retail - price).toFixed(2));
  const pct = retail > price ? Math.round(((retail - price) / retail) * 100) : 70;
  const benefits = resolveBenefits(useShopify ? product : null, settings);
  const pitch = useShopify ? productShortPitch(product!) : null;
  const badgeOverride = useShopify ? productBadgeText(product!) : null;

  const descBlocks = useMemo(() => {
    if (!product) return [] as Array<{ type: "image" | "text"; content: string }>;
    const html = product.descriptionHtml?.trim() || (product.description || "").replace(/\n/g, "<br/>");
    if (!html) return [];
    if (typeof window === "undefined") return [{ type: "text" as const, content: html }];
    const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
    const root = doc.body.firstElementChild;
    if (!root) return [{ type: "text" as const, content: html }];
    const blocks: Array<{ type: "image" | "text"; content: string }> = [];
    let textBuf = "";
    const flush = () => {
      const trimmed = textBuf.replace(/^(?:\s|&nbsp;|<br\s*\/?\s*>)+|(?:\s|&nbsp;|<br\s*\/?\s*>)+$/gi, "").trim();
      if (trimmed) blocks.push({ type: "text", content: trimmed });
      textBuf = "";
    };
    root.childNodes.forEach((node) => {
      if (node.nodeType === 1) {
        const el = node as HTMLElement;
        const imgs = el.tagName === "IMG" ? [el as HTMLImageElement] : Array.from(el.querySelectorAll("img"));
        if (imgs.length && el.textContent!.trim() === "") {
          flush();
          imgs.forEach((img) => blocks.push({ type: "image", content: img.getAttribute("src") || "" }));
          return;
        }
        if (imgs.length) {
          flush();
          imgs.forEach((img) => blocks.push({ type: "image", content: img.getAttribute("src") || "" }));
          imgs.forEach((img) => img.remove());
          const remaining = el.innerHTML.trim();
          if (remaining) blocks.push({ type: "text", content: `<${el.tagName.toLowerCase()}>${remaining}</${el.tagName.toLowerCase()}>` });
          return;
        }
        textBuf += el.outerHTML;
      } else if (node.nodeType === 3) {
        textBuf += node.textContent || "";
      }
    });
    flush();
    return blocks.filter((b) => b.content);
  }, [product]);

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center", fontFamily: "system-ui" }}>
        Cargando producto…
      </div>
    );
  }

  return (
    <div style={{ background: "#fff", minHeight: "100vh", color: "#0b1a3a", fontFamily: "'Montserrat', system-ui, sans-serif" }}>
      <style>{`
        .lv-p-main { max-width: 1280px; margin: 0 auto; padding: 32px 24px; display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1fr); gap: 40px; }
        .lv-p-gallery { display: flex; gap: 12px; }
        .lv-p-thumbs { display: flex; flex-direction: column; gap: 10px; }
        .lv-p-hero { flex: 1; min-width: 0; }
        .lv-p-h1 { font-size: 34px; line-height: 1.15; }
        .lv-p-hot {
          display: flex; align-items: center; gap: 14px;
          border: 1px solid #ffc9c9 !important;
          background: linear-gradient(135deg, #fff7f7 0%, #ffe8e8 55%, #fff5f0 100%) !important;
          box-shadow: 0 8px 22px rgba(212,0,0,.08);
          border-radius: 16px !important;
        }
        .lv-p-hot-copy { flex: 1 1 auto; min-width: 0; }
        .lv-p-hot-timers {
          display: flex; flex-direction: row; flex-wrap: nowrap; align-items: center;
          gap: 8px; flex: 0 0 auto;
        }
        .lv-p-hot-box {
          background: linear-gradient(180deg, #ff4444 0%, ${RED} 55%, #b00000 100%);
          color: #fff; padding: 8px 10px; border-radius: 12px;
          text-align: center; min-width: 54px; flex: 0 0 auto;
          box-shadow: 0 6px 14px rgba(212,0,0,.35), inset 0 1px 0 rgba(255,255,255,.25);
          border: 1px solid rgba(255,255,255,.18);
        }
        .lv-p-hot-num { font-weight: 900; font-size: 22px; line-height: 1; letter-spacing: 0.5px;
          text-shadow: 0 1px 2px rgba(0,0,0,.25); font-variant-numeric: tabular-nums; }
        .lv-p-hot-lbl { font-size: 10px; letter-spacing: 1.2px; opacity: .92; margin-top: 3px; font-weight: 800; }
        .lv-p-hot-sep { color: ${RED}; font-weight: 900; font-size: 18px; opacity: .55; line-height: 1; }
        .lv-p-benefits { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; }
        .lv-p-desc-panel { margin-top: 18px; }
        .lv-p-desc { padding: 14px; border-radius: 12px; background: #f7f8fb; border: 1px solid #e3e6ee; color: #333; line-height: 1.5; }
        .lv-p-desc img, .lv-p-desc video, .lv-p-desc iframe { width: 100%; max-height: 140px; height: auto; object-fit: contain; border-radius: 8px; margin: 6px 0; display: block; }
        .lv-p-desc p { margin: 0 0 8px; font-size: 13.5px; }
        .lv-p-desc ul, .lv-p-desc ol { margin: 0 0 8px 18px; font-size: 13.5px; }
        .lv-p-desc h1, .lv-p-desc h2, .lv-p-desc h3 { margin: 2px 0 4px; color: #0b1a3a; font-size: 14px; font-weight: 800; }
        .lv-p-desc a { color: #054497; text-decoration: underline; }
        .lv-p-desc-text { color: #1a2540; font-size: 13.5px; }
        .lv-p-desc-title { font-size: 15px; font-weight: 900; color: ${BLUE}; margin: 0 0 8px; letter-spacing: -0.2px; border-bottom: 2px solid ${ORANGE}; padding-bottom: 4px; display: inline-block; }
        .lv-p-deal-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
        .lv-p-deal-info { min-width: 0; flex: 1 1 auto; }
        .lv-p-deal-price { text-align: right; flex: 0 0 auto; }
        .lv-p-deal-price > div { white-space: nowrap; line-height: 1.2; }
        .lv-p-deal-btn { padding: 12px 14px !important; margin-top: 4px; }
        @media (max-width: 900px) {
          .lv-p-main { grid-template-columns: 1fr; gap: 24px; padding: 20px 14px; }
          .lv-p-h1 { font-size: 24px; }
          .lv-p-thumbs { flex-direction: row; overflow-x: auto; }
          .lv-p-thumbs button { width: 64px !important; height: 64px !important; flex: 0 0 auto; }
          .lv-p-gallery { flex-direction: column-reverse; }
          .lv-p-hero { min-height: 320px !important; padding: 12px !important; }
          .lv-p-hero img { max-height: 300px !important; }
          .lv-p-deal-row { flex-wrap: nowrap; gap: 8px; align-items: center; }
          .lv-p-hot { flex-direction: column; align-items: stretch; gap: 12px; padding: 12px !important; }
          .lv-p-hot-timers { width: 100%; display: grid; grid-template-columns: 1fr auto 1fr auto 1fr; gap: 6px; align-items: center; }
          .lv-p-hot-box { min-width: 0; width: 100%; padding: 10px 4px; }
          .lv-p-hot-num { font-size: 20px; }
          .lv-p-hot-sep { text-align: center; }
        }
      `}</style>

      <div style={{ background: BLUE, color: "#fff", textAlign: "center", padding: "10px 16px", fontWeight: 700, fontSize: 14, letterSpacing: 1 }}>
        GREAT DEAL · Envío GRATIS en pedidos hoy · Garantía 90 Días
      </div>

      <main className="lv-p-main">
        <section style={{ minWidth: 0 }}>
          <div className="lv-p-gallery">
            <div className="lv-p-thumbs">
              {gallery.map((src, i) => (
                <button
                  key={src + i}
                  onClick={() => setHeroIdx(i)}
                  style={{
                    width: 78,
                    height: 78,
                    border: `2px solid ${i === heroIdx ? BLUE : "#e3e6ee"}`,
                    borderRadius: 10,
                    background: "#f7f8fb",
                    cursor: "pointer",
                    padding: 4,
                    overflow: "hidden",
                  }}
                >
                  <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                </button>
              ))}
            </div>
            <div
              className="lv-p-hero"
              style={{
                position: "relative",
                background: "linear-gradient(180deg,#eef3fb,#fff)",
                borderRadius: 16,
                padding: 24,
                minHeight: 480,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #e3e6ee",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: 12,
                  left: 12,
                  background: RED,
                  color: "#fff",
                  fontWeight: 900,
                  padding: "6px 12px",
                  borderRadius: 999,
                  fontSize: 12,
                  letterSpacing: 1,
                  whiteSpace: "nowrap",
                }}
              >
                UP TO {pct}% OFF
              </span>
              <img
                src={gallery[heroIdx] || gallery[0]}
                alt={title}
                style={{ maxWidth: "100%", maxHeight: 460, objectFit: "contain" }}
              />
            </div>
          </div>

          {useShopify && descBlocks.length > 0 && (
            <div className="lv-p-desc-panel">
              <div className="lv-p-desc-title">Descripción</div>
              <div
                className="lv-p-desc"
                style={{ maxHeight: descOpen ? "none" : 220, overflow: "hidden", position: "relative" }}
              >
                <div>
                  {descBlocks.map((b, i) =>
                    b.type === "image" ? (
                      <img key={i} src={b.content} alt="" loading="lazy" />
                    ) : (
                      <div
                        key={i}
                        className="lv-p-desc-text"
                        dangerouslySetInnerHTML={{ __html: b.content }}
                      />
                    ),
                  )}
                </div>
                {!descOpen && (
                  <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 60, background: "linear-gradient(180deg, rgba(247,248,251,0), #f7f8fb 85%)", pointerEvents: "none" }} />
                )}
              </div>
              <div style={{ textAlign: "center", marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setDescOpen((v) => !v)}
                  style={{ background: "transparent", border: `2px solid ${BLUE}`, color: BLUE, fontWeight: 800, padding: "8px 18px", borderRadius: 999, cursor: "pointer", fontSize: 12, letterSpacing: 0.5 }}
                >
                  {descOpen ? "Ver menos ▲" : "Ver más ▼"}
                </button>
              </div>
            </div>
          )}
        </section>

        <section style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
            <span style={{ color: ORANGE, fontSize: 20 }}>★★★★★</span>
            <span style={{ color: "#555", fontWeight: 600 }}>4.8 (13,167)</span>
            <span style={{ background: BLUE, color: "#fff", fontWeight: 800, fontSize: 11, padding: "4px 10px", borderRadius: 999, letterSpacing: 1 }}>
              {settings.doctorBadgeText}
            </span>
          </div>

          <h1 className="lv-p-h1" style={{ fontWeight: 900, margin: "6px 0 8px", color: "#0b1a3a" }}>
            {title}
          </h1>
          {pitch && (
            <p style={{ margin: "0 0 14px", color: "#555", fontSize: 15, fontWeight: 600 }}>{pitch}</p>
          )}

          <div className="lv-p-benefits" style={{ marginBottom: 18 }}>
            {benefits.map((t, i) => {
              const icons = ["✓", "★", "♥"];
              return (
              <div key={t + i} style={{ textAlign: "center", padding: 12, border: "1px solid #e3e6ee", borderRadius: 12, background: "#fff" }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#eaf1fb", margin: "0 auto 6px", display: "flex", alignItems: "center", justifyContent: "center", color: BLUE, fontWeight: 900, fontSize: 18 }}>
                  {icons[i % icons.length]}
                </div>
                <div style={{ fontSize: 13, fontWeight: 800 }}>{t}</div>
              </div>
              );
            })}
          </div>

          <div className="lv-p-hot" style={{ padding: 14, marginBottom: 22 }}>
            <div className="lv-p-hot-copy">
              <div style={{ color: RED, fontWeight: 900, letterSpacing: 1 }}>🔥 HOT SALE</div>
              <div style={{ fontSize: 13, color: "#5a1010" }}>
                {settings.hotSaleText}
                {pct ? ` (${pct}% OFF)` : ""}
              </div>
            </div>
            <div className="lv-p-hot-timers">
              {[
                { v: h, l: "HRS" },
                { v: m, l: "MIN" },
                { v: s, l: "SEG" },
              ].map((x, i, arr) => (
                <span key={x.l} style={{ display: "contents" }}>
                  <div className="lv-p-hot-box">
                    <div className="lv-p-hot-num">{x.v}</div>
                    <div className="lv-p-hot-lbl">{x.l}</div>
                  </div>
                  {i < arr.length - 1 && <span className="lv-p-hot-sep" aria-hidden>:</span>}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            {useShopify
              ? variants.map((v, idx) => {
                  const active = v.id === selectedVariant!.id;
                  const vPrice = variantPrice(v);
                  const vRetail = variantCompare(v);
                  const label = v.title === "Default Title" ? product!.title : v.title;
                  return (
                    <button
                      key={v.id}
                      className="lv-p-deal-btn"
                      onClick={() => setSelectedVariantId(v.id)}
                      style={{
                        textAlign: "left",
                        cursor: "pointer",
                        border: `2px solid ${active ? BLUE : "#e3e6ee"}`,
                        background: active ? "#eef3fb" : "#fff",
                        borderRadius: 12,
                        padding: "12px 14px",
                        position: "relative",
                      }}
                    >
                      {idx === 0 && (
                        <span style={{ position: "absolute", top: -10, left: 12, background: BLUE, color: "#fff", padding: "3px 10px", borderRadius: 999, fontSize: 10, fontWeight: 800, letterSpacing: 1 }}>
                          {badgeOverride || "MEJOR OFERTA"}
                        </span>
                      )}
                      <div className="lv-p-deal-row">
                        <div className="lv-p-deal-info" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${active ? BLUE : "#c9cee0"}`, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            {active && <span style={{ width: 8, height: 8, borderRadius: "50%", background: BLUE }} />}
                          </span>
                          <div style={{ minWidth: 0 }}>
                            <div className="lv-p-deal-label" style={{ fontWeight: 800, fontSize: 14 }}>{label}</div>
                            <div className="lv-p-deal-sub" style={{ fontSize: 11, color: "#666", marginTop: 2 }}>
                              {v.availableForSale ? "En stock" : "Agotado"}
                            </div>
                          </div>
                        </div>
                        <div className="lv-p-deal-price">
                          <div style={{ color: "#888", textDecoration: "line-through", fontSize: 12 }}>{fmtMoney(vRetail, v.price.currencyCode)}</div>
                          <div style={{ fontWeight: 900, fontSize: 18 }}>{fmtMoney(vPrice, v.price.currencyCode)}</div>
                          <div style={{ color: BLUE, fontSize: 10, fontWeight: 700 }}>
                            Ahorras {fmtMoney(Math.max(0, vRetail - vPrice), v.price.currencyCode)}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })
              : DEAL_KEYS.map((k) => {
                  const d = DEALS[k];
                  const active = k === selectedDeal;
                  return (
                    <button
                      key={k}
                      className="lv-p-deal-btn"
                      onClick={() => setSelectedDeal(k)}
                      style={{
                        textAlign: "left",
                        cursor: "pointer",
                        border: `2px solid ${active ? BLUE : "#e3e6ee"}`,
                        background: active ? "#eef3fb" : "#fff",
                        borderRadius: 12,
                        padding: "12px 14px",
                        position: "relative",
                      }}
                    >
                      {d.badge && (
                        <span style={{ position: "absolute", top: -10, left: 12, background: BLUE, color: "#fff", padding: "3px 10px", borderRadius: 999, fontSize: 10, fontWeight: 800, letterSpacing: 1 }}>
                          {d.badge}
                        </span>
                      )}
                      <div className="lv-p-deal-row">
                        <div className="lv-p-deal-info" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${active ? BLUE : "#c9cee0"}`, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            {active && <span style={{ width: 8, height: 8, borderRadius: "50%", background: BLUE }} />}
                          </span>
                          <div>
                            <div className="lv-p-deal-label" style={{ fontWeight: 800, fontSize: 14 }}>{d.label}</div>
                            <div className="lv-p-deal-sub" style={{ fontSize: 11, color: "#666", marginTop: 2 }}>
                              S/ {d.perUnit.toFixed(2)}/botella · {d.months}
                            </div>
                          </div>
                        </div>
                        <div className="lv-p-deal-price">
                          <div style={{ color: "#888", textDecoration: "line-through", fontSize: 12 }}>S/ {d.retail.toFixed(2)}</div>
                          <div style={{ fontWeight: 900, fontSize: 18 }}>S/ {d.price.toFixed(2)}</div>
                          <div style={{ color: BLUE, fontSize: 10, fontWeight: 700 }}>Ahorras S/ {(d.retail - d.price).toFixed(2)}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
            <span style={{ color: "#666" }}>Total</span>
            <div style={{ whiteSpace: "nowrap" }}>
              <span style={{ color: "#888", textDecoration: "line-through", marginRight: 10 }}>{fmtMoney(retail, currency)}</span>
              <span style={{ fontWeight: 900, fontSize: 28 }}>{fmtMoney(price, currency)}</span>
            </div>
          </div>
          <div style={{ textAlign: "right", color: BLUE, fontWeight: 800, marginBottom: 14 }}>
            Ahorras {fmtMoney(save, currency)}
          </div>

          <button
            onClick={() => {
              if (useShopify) {
                goToShopifyCheckout(selectedVariant!.id, 1);
              } else {
                navigate(`/checkout?deal=${selectedDeal}`);
              }
            }}
            style={{
              width: "100%",
              padding: "14px 20px",
              borderRadius: 12,
              border: `2px solid ${BLUE}`,
              cursor: "pointer",
              background: "#fff",
              color: BLUE,
              fontWeight: 900,
              fontSize: 15,
              letterSpacing: 1,
            }}
          >
            IR A PAGAR →
          </button>

          <div style={{ marginTop: 18 }}>
            <a href={CLONE_HOME} style={{ color: BLUE, fontWeight: 700, textDecoration: "none" }}>
              ← Volver a la oferta
            </a>
          </div>
        </section>
      </main>

    </div>
  );
}
