import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { DEAL_KEYS, DEALS, resolveDealKey, type DealKey } from "../lib/deals";
import { goToCheckout } from "../lib/static-hosting";

const GALLERY = [
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

export default function ProductEmbed() {
  const [searchParams] = useSearchParams();
  const deal = searchParams.get("deal");

  useEffect(() => {
    document.title = "ProstaGenix Preview";
  }, []);

  const [selected, setSelected] = useState<DealKey>(resolveDealKey(deal));
  const [heroIdx, setHeroIdx] = useState(0);
  const { h, m, s } = useCountdown();
  const cur = DEALS[selected];

  const BLUE = "#054497";
  const RED = "#d40000";
  const ORANGE = "#f39200";

  return (
    <div style={{ background: "#fff", color: "#0b1a3a", fontFamily: "'Montserrat', system-ui, sans-serif" }}>
      <style>{`
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
        }
      `}</style>

      <main className="lv-pe-main">
        <section style={{ minWidth: 0 }}>
          <div className="lv-pe-gallery">
            <div className="lv-pe-hero" style={{ position: "relative", background: "linear-gradient(180deg,#eef3fb,#fff)", borderRadius: 16, padding: 24, minHeight: 480, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e3e6ee" }}>
              <span style={{ position: "absolute", top: 12, left: 12, background: RED, color: "#fff", fontWeight: 900, padding: "6px 12px", borderRadius: 999, fontSize: 12, letterSpacing: 1, whiteSpace: "nowrap" }}>UP TO 70% OFF</span>
              <img src={GALLERY[heroIdx]} alt="ProstaGenix" style={{ maxWidth: "100%", maxHeight: 460, objectFit: "contain" }} />
            </div>
            <div className="lv-pe-thumbs">
              {GALLERY.map((src, i) => (
                <button key={i} onClick={() => setHeroIdx(i)} style={{
                  width: 78, height: 78, border: `2px solid ${i === heroIdx ? BLUE : "#e3e6ee"}`, borderRadius: 10,
                  background: "#f7f8fb", cursor: "pointer", padding: 4, overflow: "hidden",
                }}>
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
            <span style={{ background: BLUE, color: "#fff", fontWeight: 800, fontSize: 11, padding: "4px 10px", borderRadius: 999, letterSpacing: 1 }}>RECOMENDADO POR MÉDICOS</span>
          </div>

          <h1 className="lv-pe-h1" style={{ fontWeight: 900, margin: "6px 0 18px", color: "#0b1a3a" }}>
            ProstaGenix™ – Fórmula Clínica para la Próstata
          </h1>

          <div className="lv-pe-benefits" style={{ marginBottom: 18 }}>
            {[
              { t: "Reduce DHT" },
              { t: "100% Natural" },
              { t: "Clínicamente Probado" },
            ].map((b) => (
              <div key={b.t} style={{ textAlign: "center", padding: 12, border: "1px solid #e3e6ee", borderRadius: 12, background: "#fff" }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#eaf1fb", margin: "0 auto 6px", display: "flex", alignItems: "center", justifyContent: "center", color: BLUE, fontWeight: 900 }}>✓</div>
                <div style={{ fontSize: 13, fontWeight: 800 }}>{b.t}</div>
              </div>
            ))}
          </div>

          <div style={{ border: `2px solid ${RED}`, borderRadius: 14, padding: 14, marginBottom: 22, background: "#fff5f5", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 180px", minWidth: 0 }}>
              <div style={{ color: RED, fontWeight: 900, letterSpacing: 1 }}>🔥 HOT SALE</div>
              <div style={{ fontSize: 13, color: "#5a1010" }}>Ordena hoy para asegurar tu 70% de descuento y regalos GRATIS</div>
            </div>
            {[{ v: h, l: "HRS" }, { v: m, l: "MIN" }, { v: s, l: "SEG" }].map((x) => (
              <div key={x.l} style={{ background: RED, color: "#fff", padding: "6px 10px", borderRadius: 8, textAlign: "center", minWidth: 46 }}>
                <div style={{ fontWeight: 900, fontSize: 18, lineHeight: 1 }}>{x.v}</div>
                <div style={{ fontSize: 10, letterSpacing: 1 }}>{x.l}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            {DEAL_KEYS.map((k) => {
              const d = DEALS[k];
              const active = k === selected;
              return (
                <button key={k} className="lv-pe-deal-btn" onClick={() => setSelected(k)} style={{
                  textAlign: "left", cursor: "pointer",
                  border: `2px solid ${active ? BLUE : "#e3e6ee"}`,
                  background: active ? "#eef3fb" : "#fff",
                  borderRadius: 12, padding: "12px 14px", position: "relative",
                }}>
                  {d.badge && (
                    <span style={{ position: "absolute", top: -10, left: 12, background: BLUE, color: "#fff", padding: "3px 10px", borderRadius: 999, fontSize: 10, fontWeight: 800, letterSpacing: 1 }}>{d.badge}</span>
                  )}
                  <div className="lv-pe-deal-row">
                    <div className="lv-pe-deal-info" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${active ? BLUE : "#c9cee0"}`, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {active && <span style={{ width: 8, height: 8, borderRadius: "50%", background: BLUE }} />}
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <div className="lv-pe-deal-label" style={{ fontWeight: 800, fontSize: 14, lineHeight: 1.2 }}>{d.label}</div>
                        <div className="lv-pe-deal-sub" style={{ fontSize: 11, color: "#666", marginTop: 2, lineHeight: 1.2 }}>S/ {d.perUnit.toFixed(2)}/botella · {d.months}</div>
                      </div>
                    </div>
                    <div className="lv-pe-deal-price">
                      <div style={{ color: "#888", textDecoration: "line-through", fontSize: 12 }}>S/ {d.retail.toFixed(2)}</div>
                      <div style={{ fontWeight: 900, fontSize: 18, color: "#0b1a3a" }}>S/ {d.price.toFixed(2)}</div>
                      <div style={{ color: BLUE, fontSize: 10, fontWeight: 700 }}>Ahorras S/ {(d.retail - d.price).toFixed(2)}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{ background: `linear-gradient(90deg, ${BLUE}, #0a5cc7)`, color: "#fff", textAlign: "center", padding: "12px", borderRadius: 10, fontWeight: 800, marginBottom: 14 }}>
            Ordena antes de hoy a medianoche para recibir regalos GRATIS
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
            <span style={{ color: "#666" }}>Total ({cur.bottles} botellas)</span>
            <div style={{ whiteSpace: "nowrap" }}>
              <span style={{ color: "#888", textDecoration: "line-through", marginRight: 10 }}>S/ {cur.retail.toFixed(2)}</span>
              <span style={{ fontWeight: 900, fontSize: 28, color: "#0b1a3a" }}>S/ {cur.price.toFixed(2)}</span>
              <span style={{ color: "#666", marginLeft: 6 }}>PEN</span>
            </div>
          </div>
          <div style={{ textAlign: "right", color: BLUE, fontWeight: 800, marginBottom: 14 }}>Ahorras S/ {(cur.retail - cur.price).toFixed(2)}</div>

          <button onClick={() => goToCheckout(selected)} style={{
            width: "100%", padding: "14px 20px", borderRadius: 12, border: `2px solid ${BLUE}`, cursor: "pointer",
            background: "#fff", color: BLUE, fontWeight: 900, fontSize: 15, letterSpacing: 1,
          }}>
            IR A PAGAR AHORA →
          </button>
        </section>
      </main>
    </div>
  );
}
