import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  fetchFirstProduct,
  fetchProductByHandle,
  fmtMoney,
  getCachedFirstProduct,
  productBadgeText,
  productImages,
  productShortPitch,
  productVariants,
  resolveBenefits,
  shopifyCheckoutUrl,
  variantCompare,
  variantPrice,
  type ShopifyProduct,
  type ShopifyVariant,
} from "../lib/shopify";
import { useLandingSettings } from "../lib/use-landing-settings";
import { useReportEmbedHeight } from "../lib/embed-height";

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

export default function ProductEmbed() {
  const [searchParams] = useSearchParams();
  const handle = searchParams.get("handle");
  const [product, setProduct] = useState<ShopifyProduct | null>(() =>
    handle ? null : getCachedFirstProduct(),
  );
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    const cached = handle ? null : getCachedFirstProduct();
    return cached ? productVariants(cached)[0]?.id ?? null : null;
  });
  const [heroIdx, setHeroIdx] = useState(0);
  const { h, m, s } = useCountdown();
  const { settings } = useLandingSettings();

  useEffect(() => {
    document.title = "ProstaGenix Preview";
    let cancelled = false;
    (async () => {
      try {
        let p: ShopifyProduct | null = null;
        if (handle) p = await fetchProductByHandle(handle);
        if (!p) p = await fetchFirstProduct();
        if (cancelled) return;
        if (!p) throw new Error("No hay productos en Shopify");
        setProduct(p);
        setSelectedId((prev) => prev ?? productVariants(p!)[0]?.id ?? null);
        const firstImg = productImages(p)[0];
        if (firstImg) {
          const img = new Image();
          img.decoding = "async";
          img.src = firstImg;
        }
      } catch (e) {
        if (!cancelled) setError(String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [handle]);

  const variants = useMemo(() => (product ? productVariants(product) : []), [product]);
  const gallery = useMemo(() => (product ? productImages(product) : []), [product]);
  const selected: ShopifyVariant | null =
    variants.find((v) => v.id === selectedId) ?? variants[0] ?? null;

  useReportEmbedHeight(!!product && !!selected && !error);

  if (error) {
    return <div style={{ padding: 24, fontFamily: "system-ui" }}>Error: {error}</div>;
  }
  if (!product || !selected) {
    return (
      <div style={{ padding: 24, fontFamily: "system-ui", textAlign: "center" }}>
        Cargando producto…
      </div>
    );
  }

  const price = variantPrice(selected);
  const retail = variantCompare(selected);
  const save = Math.max(0, +(retail - price).toFixed(2));
  const currency = selected.price.currencyCode;
  const pct = retail > price ? Math.round(((retail - price) / retail) * 100) : 0;
  const benefits = resolveBenefits(product, settings);
  const pitch = productShortPitch(product);
  const badgeOverride = productBadgeText(product);

  return (
    <div data-embed-root style={{ background: "#fff", color: "#0b1a3a", fontFamily: "'Montserrat', system-ui, sans-serif", minHeight: 0, height: "auto", display: "block" }}>
      <style>{`
        html, body, #root { height: auto !important; min-height: 0 !important; max-height: none !important; background: #fff !important; overflow: hidden !important; }
        .lv-pe-main { max-width: 1280px; margin: 0 auto; padding: 24px; display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1fr); gap: 40px; }
        .lv-pe-gallery { display: flex; flex-direction: column; gap: 12px; }
        .lv-pe-thumbs { display: flex; flex-direction: row; gap: 10px; justify-content: center; flex-wrap: wrap; }
        .lv-pe-hero { flex: 1; min-width: 0; }
        .lv-pe-h1 { font-size: 34px; line-height: 1.15; }
        .lv-pe-benefits { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; }
        .lv-pe-deal-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
        .lv-pe-deal-info { min-width: 0; flex: 1 1 auto; }
        .lv-pe-deal-price { text-align: right; flex: 0 0 auto; }
        .lv-pe-deal-price > div { white-space: nowrap; line-height: 1.2; }
        .lv-pe-deal-btn { padding: 12px 14px !important; margin-top: 4px; }
        .lv-pe-hot {
          border: 1px solid #ffc9c9; border-radius: 16px; padding: 14px 16px; margin-bottom: 22px;
          background: linear-gradient(135deg, #fff7f7 0%, #ffe8e8 55%, #fff5f0 100%);
          box-shadow: 0 8px 22px rgba(212,0,0,.08);
          display: flex; align-items: center; gap: 14px;
        }
        .lv-pe-hot-copy { flex: 1 1 auto; min-width: 0; }
        .lv-pe-hot-timers {
          display: flex; flex-direction: row; flex-wrap: nowrap; align-items: center;
          gap: 8px; flex: 0 0 auto;
        }
        .lv-pe-hot-box {
          background: linear-gradient(180deg, #ff4444 0%, ${RED} 55%, #b00000 100%);
          color: #fff; padding: 8px 10px; border-radius: 12px;
          text-align: center; min-width: 54px; flex: 0 0 auto;
          box-shadow: 0 6px 14px rgba(212,0,0,.35), inset 0 1px 0 rgba(255,255,255,.25);
          border: 1px solid rgba(255,255,255,.18);
        }
        .lv-pe-hot-num { font-weight: 900; font-size: 22px; line-height: 1; letter-spacing: 0.5px;
          text-shadow: 0 1px 2px rgba(0,0,0,.25); font-variant-numeric: tabular-nums; }
        .lv-pe-hot-lbl { font-size: 10px; letter-spacing: 1.2px; opacity: .92; margin-top: 3px; font-weight: 800; }
        .lv-pe-hot-sep { color: ${RED}; font-weight: 900; font-size: 18px; opacity: .55; line-height: 1; }
        @media (max-width: 900px) {
          .lv-pe-main { grid-template-columns: 1fr; gap: 24px; padding: 16px; }
          .lv-pe-h1 { font-size: 24px; }
          .lv-pe-thumbs button { width: 64px !important; height: 64px !important; flex: 0 0 auto; }
          .lv-pe-hero { min-height: 320px !important; padding: 12px !important; }
          .lv-pe-hero img { max-height: 300px !important; }
          .lv-pe-deal-row { flex-wrap: nowrap; gap: 8px; align-items: center; }
          .lv-pe-deal-btn { padding: 10px 12px !important; }
          .lv-pe-deal-info .lv-pe-deal-label { font-size: 13px !important; line-height: 1.2; }
          .lv-pe-deal-info .lv-pe-deal-sub { font-size: 11px !important; line-height: 1.2; margin-top: 2px; }
          .lv-pe-deal-price > div:nth-child(1) { font-size: 11px !important; }
          .lv-pe-deal-price > div:nth-child(2) { font-size: 16px !important; }
          .lv-pe-deal-price > div:nth-child(3) { font-size: 10px !important; }
          .lv-pe-hot { flex-direction: column; align-items: stretch; gap: 12px; padding: 12px; }
          .lv-pe-hot-timers { width: 100%; display: grid; grid-template-columns: 1fr auto 1fr auto 1fr; gap: 6px; align-items: center; }
          .lv-pe-hot-box { min-width: 0; width: 100%; padding: 10px 4px; }
          .lv-pe-hot-num { font-size: 20px; }
          .lv-pe-hot-sep { text-align: center; }
        }
      `}</style>

      <main className="lv-pe-main">
        <section style={{ minWidth: 0 }}>
          <div className="lv-pe-gallery">
            <div
              className="lv-pe-hero"
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
              {pct > 0 && (
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
              )}
              <img
                src={gallery[heroIdx] || gallery[0]}
                alt={product.title}
                fetchPriority="high"
                decoding="async"
                style={{ maxWidth: "100%", maxHeight: 460, objectFit: "contain" }}
              />
            </div>
            <div className="lv-pe-thumbs">
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
          </div>
        </section>

        <section style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
            <span style={{ color: ORANGE, fontSize: 20 }}>★★★★★</span>
            <span style={{ color: "#555", fontWeight: 600 }}>4.8 (13,167)</span>
            <span
              style={{
                background: BLUE,
                color: "#fff",
                fontWeight: 800,
                fontSize: 11,
                padding: "4px 10px",
                borderRadius: 999,
                letterSpacing: 1,
              }}
            >
              {settings.doctorBadgeText}
            </span>
          </div>

          <h1 className="lv-pe-h1" style={{ fontWeight: 900, margin: "6px 0 8px", color: "#0b1a3a" }}>
            {product.title}
          </h1>
          {pitch && (
            <p style={{ margin: "0 0 14px", color: "#555", fontSize: 15, fontWeight: 600 }}>{pitch}</p>
          )}

          <div className="lv-pe-benefits" style={{ marginBottom: 18 }}>
            {benefits.map((t, i) => {
              const icons = ["✓", "★", "♥"];
              return (
              <div
                key={t + i}
                style={{
                  textAlign: "center",
                  padding: 12,
                  border: "1px solid #e3e6ee",
                  borderRadius: 12,
                  background: "#fff",
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background: "#eaf1fb",
                    margin: "0 auto 6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: BLUE,
                    fontWeight: 900,
                    fontSize: 18,
                  }}
                >
                  {icons[i % icons.length]}
                </div>
                <div style={{ fontSize: 13, fontWeight: 800 }}>{t}</div>
              </div>
              );
            })}
          </div>

          {product.description?.trim() && (
            <div
              style={{
                marginBottom: 16,
                padding: 12,
                borderRadius: 12,
                background: "#f7f8fb",
                border: "1px solid #e3e6ee",
                fontSize: 13,
                color: "#333",
                lineHeight: 1.45,
                maxHeight: 120,
                overflow: "auto",
              }}
            >
              {product.description}
            </div>
          )}

          <div className="lv-pe-hot">
            <div className="lv-pe-hot-copy">
              <div style={{ color: RED, fontWeight: 900, letterSpacing: 1 }}>🔥 HOT SALE</div>
              <div style={{ fontSize: 13, color: "#5a1010" }}>
                {settings.hotSaleText}
                {pct ? ` (${pct}% OFF)` : ""}
              </div>
            </div>
            <div className="lv-pe-hot-timers">
              {[
                { v: h, l: "HRS" },
                { v: m, l: "MIN" },
                { v: s, l: "SEG" },
              ].map((x, i, arr) => (
                <span key={x.l} style={{ display: "contents" }}>
                  <div className="lv-pe-hot-box">
                    <div className="lv-pe-hot-num">{x.v}</div>
                    <div className="lv-pe-hot-lbl">{x.l}</div>
                  </div>
                  {i < arr.length - 1 && <span className="lv-pe-hot-sep" aria-hidden>:</span>}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            {variants.map((v, idx) => {
              const active = v.id === selected.id;
              const vPrice = variantPrice(v);
              const vRetail = variantCompare(v);
              const label =
                v.title === "Default Title" ? product.title : v.title;
              return (
                <button
                  key={v.id}
                  className="lv-pe-deal-btn"
                  onClick={() => setSelectedId(v.id)}
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
                  {idx === 0 && (badgeOverride || variants.length > 1) && (
                    <span
                      style={{
                        position: "absolute",
                        top: -10,
                        left: 12,
                        background: BLUE,
                        color: "#fff",
                        padding: "3px 10px",
                        borderRadius: 999,
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: 1,
                      }}
                    >
                      {badgeOverride || "MEJOR OFERTA"}
                    </span>
                  )}
                  {idx === 1 && !badgeOverride && (
                    <span
                      style={{
                        position: "absolute",
                        top: -10,
                        left: 12,
                        background: BLUE,
                        color: "#fff",
                        padding: "3px 10px",
                        borderRadius: 999,
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: 1,
                      }}
                    >
                      MÁS POPULAR
                    </span>
                  )}
                  <div className="lv-pe-deal-row">
                    <div className="lv-pe-deal-info" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          border: `2px solid ${active ? BLUE : "#c9cee0"}`,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {active && (
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: BLUE }} />
                        )}
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <div className="lv-pe-deal-label" style={{ fontWeight: 800, fontSize: 14, lineHeight: 1.2 }}>
                          {label}
                        </div>
                        <div
                          className="lv-pe-deal-sub"
                          style={{ fontSize: 11, color: "#666", marginTop: 2, lineHeight: 1.2 }}
                        >
                          {v.availableForSale ? "En stock" : "Agotado"}
                          {v.sku ? ` · SKU ${v.sku}` : ""}
                        </div>
                      </div>
                    </div>
                    <div className="lv-pe-deal-price">
                      <div style={{ color: "#888", textDecoration: "line-through", fontSize: 12 }}>
                        {fmtMoney(vRetail, v.price.currencyCode)}
                      </div>
                      <div style={{ fontWeight: 900, fontSize: 18, color: "#0b1a3a" }}>
                        {fmtMoney(vPrice, v.price.currencyCode)}
                      </div>
                      <div style={{ color: BLUE, fontSize: 10, fontWeight: 700 }}>
                        Ahorras {fmtMoney(Math.max(0, vRetail - vPrice), v.price.currencyCode)}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div
            style={{
              background: `linear-gradient(90deg, ${BLUE}, #0a5cc7)`,
              color: "#fff",
              textAlign: "center",
              padding: "12px",
              borderRadius: 10,
              fontWeight: 800,
              marginBottom: 14,
            }}
          >
            Ordena antes de hoy a medianoche para recibir regalos GRATIS
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 10,
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <span style={{ color: "#666" }}>Total</span>
            <div style={{ whiteSpace: "nowrap" }}>
              <span style={{ color: "#888", textDecoration: "line-through", marginRight: 10 }}>
                {fmtMoney(retail, currency)}
              </span>
              <span style={{ fontWeight: 900, fontSize: 28, color: "#0b1a3a" }}>
                {fmtMoney(price, currency)}
              </span>
            </div>
          </div>
          <div style={{ textAlign: "right", color: BLUE, fontWeight: 800, marginBottom: 14 }}>
            Ahorras {fmtMoney(save, currency)}
          </div>

          <a
            href={shopifyCheckoutUrl(selected.id, 1)}
            target="_top"
            rel="noopener noreferrer"
            style={{
              display: "block",
              width: "100%",
              boxSizing: "border-box",
              padding: "14px 20px",
              borderRadius: 12,
              border: `2px solid ${BLUE}`,
              cursor: "pointer",
              background: "#fff",
              color: BLUE,
              fontWeight: 900,
              fontSize: 15,
              letterSpacing: 1,
              textAlign: "center",
              textDecoration: "none",
            }}
          >
            IR A PAGAR AHORA →
          </a>
        </section>
      </main>
    </div>
  );
}
