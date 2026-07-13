import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

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
  sale71: { label: "Compra 4 llévate 3 GRATIS", bottles: 7, months: "7 meses de suministro", price: 159.95, retail: 490, perUnit: 22.85, badge: "MEJOR OFERTA" },
  sale18: { label: "Compra 3 llévate 2 GRATIS", bottles: 5, months: "5 meses de suministro", price: 119.95, retail: 350, perUnit: 23.99, badge: "MÁS POPULAR" },
  sale5:  { label: "Compra 2 llévate 1 GRATIS", bottles: 3, months: "3 meses de suministro", price: 79.95, retail: 210, perUnit: 26.65 },
  single: { label: "1 Mes de Suministro", bottles: 1, months: "1 mes de suministro", price: 39.95, retail: 70, perUnit: 39.95 },
};

const GALLERY = [
  "https://www.prostagenix.com/images/product/bottle_box.png",
  "https://www.prostagenix.com/images/product/bottle.png",
  "https://www.prostagenix.com/images/home/dudley-danoff.png",
  "https://www.prostagenix.com/special/special-offer/img/number-one-award.png",
];

export const Route = createFileRoute("/product")({
  validateSearch: (s: Record<string, unknown>) => ({ deal: (s.deal as string) ?? "sale18" }),
  component: ProductPage,
  head: () => ({
    meta: [
      { title: "ProstaGenix - Preview del Producto" },
      { name: "description", content: "El suplemento de próstata #1 - Preview del producto con oferta especial." },
    ],
  }),
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

function ProductPage() {
  const { deal } = Route.useSearch();
  const navigate = useNavigate();
  const initial = (DEALS[deal as DealKey] ? (deal as DealKey) : "sale18") as DealKey;
  const [selected, setSelected] = useState<DealKey>(initial);
  const [heroIdx, setHeroIdx] = useState(0);
  const { h, m, s } = useCountdown();
  const cur = DEALS[selected];

  const BLUE = "#054497";
  const RED = "#d40000";
  const ORANGE = "#f39200";

  return (
    <div style={{ background: "#fff", minHeight: "100vh", color: "#0b1a3a", fontFamily: "'Montserrat', system-ui, sans-serif" }}>
      <style>{`
        .lv-p-main { max-width: 1280px; margin: 0 auto; padding: 32px 24px; display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1fr); gap: 40px; }
        .lv-p-gallery { display: flex; gap: 12px; }
        .lv-p-thumbs { display: flex; flex-direction: column; gap: 10px; }
        .lv-p-hero { flex: 1; min-width: 0; }
        .lv-p-h1 { font-size: 34px; line-height: 1.15; }
        .lv-p-hot { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
        .lv-p-benefits { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; }
        @media (max-width: 900px) {
          .lv-p-main { grid-template-columns: 1fr; gap: 24px; padding: 20px 14px; }
          .lv-p-h1 { font-size: 24px; }
          .lv-p-thumbs { flex-direction: row; overflow-x: auto; }
          .lv-p-thumbs button { width: 64px !important; height: 64px !important; flex: 0 0 auto; }
          .lv-p-gallery { flex-direction: column-reverse; }
          .lv-p-hero { min-height: 320px !important; padding: 12px !important; }
          .lv-p-hero img { max-height: 300px !important; }
          .lv-p-badge { font-size: 10px !important; padding: 4px 10px !important; }
        }
        @media (max-width: 480px) {
          .lv-p-benefits { gap: 6px; }
          .lv-p-benefits > div { padding: 8px 4px !important; }
          .lv-p-benefits > div > div:first-child { width: 28px !important; height: 28px !important; font-size: 13px; }
          .lv-p-benefits > div > div:last-child { font-size: 11px !important; line-height: 1.15; }
          .lv-p-hot { flex-wrap: nowrap; gap: 6px; padding: 10px !important; }
          .lv-p-hot > div:first-child { flex: 1 1 auto !important; min-width: 0; }
          .lv-p-hot > div:first-child > div:last-child { font-size: 11px !important; }
          .lv-p-timebox { padding: 4px 6px !important; min-width: 36px !important; }
          .lv-p-timebox > div:first-child { font-size: 14px !important; }
          .lv-p-timebox > div:last-child { font-size: 8px !important; }
        }
      `}</style>
      {/* Top banner */}
      <div style={{ background: BLUE, color: "#fff", textAlign: "center", padding: "10px 16px", fontWeight: 700, fontSize: 14, letterSpacing: 1 }}>
        GREAT DEAL · Envío GRATIS en pedidos hoy · Garantía 90 Días
      </div>

      {/* Header */}
      <header style={{ borderBottom: "1px solid #eee", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 1280, margin: "0 auto" }}>
        <a href="/" style={{ color: BLUE, fontWeight: 900, fontSize: 26, textDecoration: "none", letterSpacing: -0.5 }}>Prosta<span style={{ color: RED }}>Genix</span></a>
        <span style={{ color: "#555", fontSize: 13 }}>#1 Rated Prostate Pill in the World</span>
      </header>

      <main className="lv-p-main">
        {/* LEFT: gallery */}
        <section style={{ minWidth: 0 }}>
          <div className="lv-p-gallery">
            <div className="lv-p-thumbs">
              {GALLERY.map((src, i) => (
                <button key={i} onClick={() => setHeroIdx(i)} style={{
                  width: 78, height: 78, border: `2px solid ${i === heroIdx ? BLUE : "#e3e6ee"}`, borderRadius: 10,
                  background: "#f7f8fb", cursor: "pointer", padding: 4, overflow: "hidden",
                }}>
                  <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                </button>
              ))}
            </div>
            <div className="lv-p-hero" style={{ position: "relative", background: "linear-gradient(180deg,#eef3fb,#fff)", borderRadius: 16, padding: 24, minHeight: 480, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e3e6ee" }}>
              <span className="lv-p-badge" style={{ position: "absolute", top: 12, left: 12, background: RED, color: "#fff", fontWeight: 900, padding: "6px 12px", borderRadius: 999, fontSize: 12, letterSpacing: 1, whiteSpace: "nowrap" }}>UP TO 70% OFF</span>
              <img src={GALLERY[heroIdx]} alt="ProstaGenix" style={{ maxWidth: "100%", maxHeight: 460, objectFit: "contain" }} />
            </div>
          </div>

          <div style={{ marginTop: 24, padding: 20, borderRadius: 14, background: "#f7f8fb", border: "1px solid #e3e6ee" }}>
            <div style={{ fontWeight: 800, marginBottom: 6, color: BLUE }}>{"{ ⚕ Elección de Médicos }"}</div>
            <div style={{ fontSize: 14, color: "#333" }}><strong>Cientos de urólogos</strong> lo recomiendan a sus pacientes sin recibir compensación.</div>
          </div>
        </section>

        {/* RIGHT: purchase panel */}
        <section style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <span style={{ color: ORANGE, fontSize: 20 }}>★★★★★</span>
            <span style={{ color: "#555", fontWeight: 600 }}>4.8 (13,167)</span>
            <span style={{ background: BLUE, color: "#fff", fontWeight: 800, fontSize: 11, padding: "4px 10px", borderRadius: 999, letterSpacing: 1 }}>RECOMENDADO POR MÉDICOS</span>
          </div>

          <h1 className="lv-p-h1" style={{ fontWeight: 900, margin: "6px 0 18px", color: "#0b1a3a" }}>
            ProstaGenix™ – Fórmula Clínica para la Próstata
          </h1>

          <div className="lv-p-benefits" style={{ marginBottom: 18 }}>
            {[
              { t: "Reduce DHT", d: "Bloquea la dihidrotestosterona" },
              { t: "100% Natural", d: "Sin químicos agresivos" },
              { t: "Clínicamente Probado", d: "Testado por ConsumerLab" },
            ].map((b) => (
              <div key={b.t} style={{ textAlign: "center", padding: 12, border: "1px solid #e3e6ee", borderRadius: 12, background: "#fff" }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#eaf1fb", margin: "0 auto 6px", display: "flex", alignItems: "center", justifyContent: "center", color: BLUE, fontWeight: 900 }}>✓</div>
                <div style={{ fontSize: 13, fontWeight: 800 }}>{b.t}</div>
              </div>
            ))}
          </div>

          {/* HOT SALE countdown */}
          <div className="lv-p-hot" style={{ border: `2px solid ${RED}`, borderRadius: 14, padding: 14, marginBottom: 22, background: "#fff5f5" }}>
            <div style={{ flex: "1 1 180px", minWidth: 0 }}>
              <div style={{ color: RED, fontWeight: 900, letterSpacing: 1 }}>🔥 HOT SALE</div>
              <div style={{ fontSize: 13, color: "#5a1010" }}>Ordena hoy para asegurar tu 70% de descuento y regalos GRATIS</div>
            </div>
            {[{ v: h, l: "HRS" }, { v: m, l: "MIN" }, { v: s, l: "SEG" }].map((x) => (
              <div key={x.l} className="lv-p-timebox" style={{ background: RED, color: "#fff", padding: "6px 10px", borderRadius: 8, textAlign: "center", minWidth: 46, flex: "0 0 auto" }}>
                <div style={{ fontWeight: 900, fontSize: 18, lineHeight: 1 }}>{x.v}</div>
                <div style={{ fontSize: 10, letterSpacing: 1 }}>{x.l}</div>
              </div>
            ))}
          </div>

          {/* Deal options */}
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
                        <div style={{ fontSize: 12, color: "#666" }}>${d.perUnit.toFixed(2)}/botella · {d.months}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ color: "#888", textDecoration: "line-through", fontSize: 13 }}>${d.retail.toFixed(2)}</div>
                      <div style={{ fontWeight: 900, fontSize: 20, color: "#0b1a3a" }}>${d.price.toFixed(2)}</div>
                      <div style={{ color: BLUE, fontSize: 11, fontWeight: 700 }}>Ahorras ${(d.retail - d.price).toFixed(2)}</div>
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
              <span style={{ color: "#888", textDecoration: "line-through", marginRight: 10 }}>${cur.retail.toFixed(2)}</span>
              <span style={{ fontWeight: 900, fontSize: 28, color: "#0b1a3a" }}>${cur.price.toFixed(2)}</span>
              <span style={{ color: "#666", marginLeft: 6 }}>USD</span>
            </div>
          </div>
          <div style={{ textAlign: "right", color: BLUE, fontWeight: 800, marginBottom: 14 }}>Ahorras ${(cur.retail - cur.price).toFixed(2)}</div>

          <button onClick={() => navigate({ to: "/checkout", search: { deal: selected } })} style={{
            width: "100%", padding: "18px 20px", borderRadius: 12, border: 0, cursor: "pointer",
            background: `linear-gradient(180deg, ${ORANGE}, #d97900)`, color: "#fff",
            fontWeight: 900, fontSize: 17, letterSpacing: 1, boxShadow: "0 8px 20px rgba(243,146,0,0.35)",
          }}>
            AGREGAR AL CARRITO →
          </button>

          <button onClick={() => navigate({ to: "/checkout", search: { deal: selected } })} style={{
            marginTop: 10, width: "100%", padding: "14px 20px", borderRadius: 12, border: `2px solid ${BLUE}`, cursor: "pointer",
            background: "#fff", color: BLUE, fontWeight: 900, fontSize: 15, letterSpacing: 1,
          }}>
            IR A PAGAR AHORA →
          </button>

          {/* Free gifts */}
          <div style={{ marginTop: 18, background: `linear-gradient(135deg, ${BLUE}, #0a5cc7)`, color: "#fff", borderRadius: 14, padding: 18 }}>
            <div style={{ textAlign: "center", fontWeight: 900, letterSpacing: 1, marginBottom: 12 }}>REGALOS GRATIS CON TU COMPRA</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, textAlign: "center", fontSize: 12 }}>
              {[
                { t: "Ebook Exclusivo", i: "📘" },
                { t: "Envío Gratis", i: "🚚" },
                { t: "Comunidad VIP", i: "🌟" },
              ].map((g) => (
                <div key={g.t} style={{ background: "rgba(255,255,255,0.12)", borderRadius: 10, padding: 12 }}>
                  <div style={{ fontSize: 28 }}>{g.i}</div>
                  <div style={{ fontWeight: 800, marginTop: 6 }}>{g.t}</div>
                  <div style={{ opacity: 0.9 }}>✓ Incluido</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 16, display: "flex", justifyContent: "space-around", alignItems: "center", padding: 14, border: "1px solid #e3e6ee", borderRadius: 12, fontSize: 13, color: "#333" }}>
            <span>🔄 Garantía 90 Días</span>
            <span>🚚 Envío Rápido</span>
            <span>🔒 Pago Seguro</span>
          </div>

          <div style={{ marginTop: 14, textAlign: "center", color: "#2f7a3a", fontWeight: 700 }}>
            🎉 ¡Envío Gratis Aplicado en Tu Primer Pedido!
          </div>

          <div style={{ marginTop: 18 }}>
            <a href="/" style={{ color: BLUE, fontWeight: 700, textDecoration: "none" }}>← Volver a la oferta</a>
          </div>
        </section>
      </main>

      {/* Testimonial */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "24px", borderTop: "1px solid #eee" }}>
        <div style={{ padding: 18, border: "1px solid #e3e6ee", borderRadius: 14 }}>
          <div style={{ color: ORANGE, fontSize: 18 }}>★★★★★</div>
          <div style={{ fontWeight: 800, margin: "6px 0" }}>Resultados desde la primera semana</div>
          <div style={{ color: "#333", fontSize: 14 }}>
            "Después de años probando otros suplementos, ProstaGenix realmente hizo la diferencia. Mi urólogo notó la mejora y ahora lo recomienda a sus pacientes." — <strong>Jorge M.</strong> <span style={{ color: "#2f7a3a", fontWeight: 700 }}>Verificado</span>
          </div>
        </div>
      </section>
    </div>
  );
}
