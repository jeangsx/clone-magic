import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

type DealKey = "sale71" | "sale18" | "sale5" | "single";

const DEALS: Record<DealKey, {
  label: string;
  bottles: number;
  months: string;
  price: number;
  retail: number;
  perUnit: number;
  badge?: string;
}> = {
  sale71: { label: "Compra 4 llévate 3 GRATIS", bottles: 7, months: "7 meses de suministro", price: 599.95, retail: 1839.95, perUnit: 85.7, badge: "MEJOR OFERTA" },
  sale18: { label: "Compra 3 llévate 2 GRATIS", bottles: 5, months: "5 meses de suministro", price: 449.95, retail: 1299.95, perUnit: 89.99, badge: "MÁS POPULAR" },
  sale5:  { label: "Compra 2 llévate 1 GRATIS", bottles: 3, months: "3 meses de suministro", price: 299.95, retail: 789.95, perUnit: 99.98 },
  single: { label: "1 Mes de Suministro", bottles: 1, months: "1 mes de suministro", price: 149.95, retail: 259.95, perUnit: 149.95 },
};

const GALLERY = [
  "https://www.prostagenix.com/images/product/bottle_box.png",
  "https://www.prostagenix.com/images/product/bottle.png",
  "https://www.prostagenix.com/images/home/dudley-danoff.png",
  "https://www.prostagenix.com/special/special-offer/img/number-one-award.png",
];

export const Route = createFileRoute("/product-embed")({
  validateSearch: (s: Record<string, unknown>) => ({ deal: (s.deal as string) ?? "sale18" }),
  component: ProductEmbed,
  head: () => ({ meta: [{ title: "ProstaGenix Preview" }] }),
});

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

function ProductEmbed() {
  const { deal } = Route.useSearch();
  const initial = (DEALS[deal as DealKey] ? (deal as DealKey) : "sale18") as DealKey;
  const [selected, setSelected] = useState<DealKey>(initial);
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
        @media (max-width: 900px) {
          .lv-pe-main { grid-template-columns: 1fr; gap: 24px; padding: 16px; }
          .lv-pe-h1 { font-size: 24px; }
          .lv-pe-thumbs button { width: 64px !important; height: 64px !important; flex: 0 0 auto; }
          .lv-pe-hero { min-height: 320px !important; padding: 12px !important; }
          .lv-pe-hero img { max-height: 300px !important; }
        }
      `}</style>

      <main className="lv-pe-main">
        {/* LEFT: gallery */}
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

        {/* RIGHT: purchase panel */}
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

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
            {(Object.keys(DEALS) as DealKey[]).map((k) => {
              const d = DEALS[k];
              const active = k === selected;
              return (
                <button key={k} onClick={() => setSelected(k)} style={{
                  textAlign: "left", cursor: "pointer",
                  border: `2px solid ${active ? BLUE : "#e3e6ee"}`,
                  background: active ? "#eef3fb" : "#fff",
                  borderRadius: 14, padding: "16px 18px", position: "relative",
                }}>
                  {d.badge && (
                    <span style={{ position: "absolute", top: -12, left: 16, background: BLUE, color: "#fff", padding: "4px 12px", borderRadius: 999, fontSize: 11, fontWeight: 800, letterSpacing: 1 }}>{d.badge}</span>
                  )}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${active ? BLUE : "#c9cee0"}`, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                        {active && <span style={{ width: 10, height: 10, borderRadius: "50%", background: BLUE }} />}
                      </span>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 15 }}>{d.label}</div>
                        <div style={{ fontSize: 12, color: "#666" }}>S/ {d.perUnit.toFixed(2)}/botella · {d.months}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ color: "#888", textDecoration: "line-through", fontSize: 13 }}>S/ {d.retail.toFixed(2)}</div>
                      <div style={{ fontWeight: 900, fontSize: 20, color: "#0b1a3a" }}>S/ {d.price.toFixed(2)}</div>
                      <div style={{ color: BLUE, fontSize: 11, fontWeight: 700 }}>Ahorras S/ {(d.retail - d.price).toFixed(2)}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{ background: `linear-gradient(90deg, ${BLUE}, #0a5cc7)`, color: "#fff", textAlign: "center", padding: "12px", borderRadius: 10, fontWeight: 800, marginBottom: 14 }}>
            Ordena antes de hoy a medianoche para recibir regalos GRATIS
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
            <span style={{ color: "#666" }}>Total ({cur.bottles} {cur.bottles === 1 ? "botella" : "botellas"})</span>
            <div>
              <span style={{ color: "#888", textDecoration: "line-through", marginRight: 10 }}>S/ {cur.retail.toFixed(2)}</span>
              <span style={{ fontWeight: 900, fontSize: 28, color: "#0b1a3a" }}>S/ {cur.price.toFixed(2)}</span>
              <span style={{ color: "#666", marginLeft: 6 }}>PEN</span>
            </div>
          </div>
          <div style={{ textAlign: "right", color: BLUE, fontWeight: 800, marginBottom: 14 }}>Ahorras S/ {(cur.retail - cur.price).toFixed(2)}</div>

          <button onClick={() => { window.top!.location.href = `/checkout?deal=${selected}`; }} style={{
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