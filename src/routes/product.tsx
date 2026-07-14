import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DEAL_KEYS, DEALS, resolveDealKey, type DealKey } from "../lib/deals";
import { CLONE_HOME } from "../lib/static-hosting";

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

export default function ProductPage() {
  const [searchParams] = useSearchParams();
  const deal = searchParams.get("deal");
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "ProstaGenix - Preview del Producto";
  }, []);
  const [selected, setSelected] = useState<DealKey>(resolveDealKey(deal));
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
          .lv-p-badge { font-size: 10px !important; padding: 4px 10px !important; }
          .lv-p-deal-row { flex-wrap: nowrap; gap: 8px; align-items: center; }
          .lv-p-deal-btn { padding: 10px 12px !important; }
          .lv-p-deal-info .lv-p-deal-label { font-size: 13px !important; line-height: 1.2; }
          .lv-p-deal-info .lv-p-deal-sub { font-size: 11px !important; line-height: 1.2; margin-top: 2px; }
          .lv-p-deal-price > div:nth-child(1) { font-size: 11px !important; }
          .lv-p-deal-price > div:nth-child(2) { font-size: 16px !important; }
          .lv-p-deal-price > div:nth-child(3) { font-size: 10px !important; }
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
        <a href={CLONE_HOME} style={{ color: BLUE, fontWeight: 900, fontSize: 26, textDecoration: "none", letterSpacing: -0.5 }}>Prosta<span style={{ color: RED }}>Genix</span></a>
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

          {/* Beneficios detallados */}
          <div style={{ marginTop: 24, padding: 20, borderRadius: 14, background: "#fff", border: "1px solid #e3e6ee" }}>
            <div style={{ fontWeight: 900, color: BLUE, marginBottom: 12, fontSize: 16 }}>¿Por qué ProstaGenix™?</div>
            {[
              { t: "Alivia la urgencia urinaria", d: "Reduce las visitas nocturnas al baño." },
              { t: "Mejora el flujo urinario", d: "Con Beta-Sitosterol y esteroles vegetales." },
              { t: "Salud prostática integral", d: "Fórmula multifase con +1,000 mg de esteroles totales." },
              { t: "Testado por ConsumerLab", d: "Verificado por laboratorios independientes." },
            ].map((b) => (
              <div key={b.t} style={{ display: "flex", gap: 10, padding: "10px 0", borderTop: "1px dashed #e3e6ee" }}>
                <div style={{ color: "#2f7a3a", fontWeight: 900 }}>✓</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>{b.t}</div>
                  <div style={{ fontSize: 13, color: "#555" }}>{b.d}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Garantía */}
          <div style={{ marginTop: 18, padding: 20, borderRadius: 14, background: `linear-gradient(135deg, ${BLUE}, #0a5cc7)`, color: "#fff", display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{ fontSize: 42, lineHeight: 1 }}>🛡️</div>
            <div>
              <div style={{ fontWeight: 900, letterSpacing: 1, marginBottom: 4 }}>GARANTÍA 90 DÍAS</div>
              <div style={{ fontSize: 13, opacity: 0.95 }}>Si no notas mejora, te devolvemos tu dinero. Sin preguntas.</div>
            </div>
          </div>

          {/* Testimonio breve */}
          <div style={{ marginTop: 18, padding: 20, borderRadius: 14, background: "#f7f8fb", border: "1px solid #e3e6ee" }}>
            <div style={{ color: ORANGE, fontSize: 18 }}>★★★★★</div>
            <div style={{ fontStyle: "italic", color: "#333", margin: "8px 0", fontSize: 14 }}>
              "Después de 2 semanas ya dormía toda la noche sin levantarme. Lo recomiendo 100%."
            </div>
            <div style={{ fontSize: 13, color: "#666" }}>— <strong>Luis A.</strong> · <span style={{ color: "#2f7a3a", fontWeight: 700 }}>Compra verificada</span></div>
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
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            {DEAL_KEYS.map((k) => {
              const d = DEALS[k];
              const active = k === selected;
              return (
                <button key={k} className="lv-p-deal-btn" onClick={() => setSelected(k)} style={{
                  textAlign: "left", cursor: "pointer",
                  border: `2px solid ${active ? BLUE : "#e3e6ee"}`,
                  background: active ? "#eef3fb" : "#fff",
                  borderRadius: 12, padding: "12px 14px", position: "relative",
                }}>
                  {d.badge && (
                    <span style={{ position: "absolute", top: -10, left: 12, background: BLUE, color: "#fff", padding: "3px 10px", borderRadius: 999, fontSize: 10, fontWeight: 800, letterSpacing: 1 }}>{d.badge}</span>
                  )}
                  <div className="lv-p-deal-row">
                    <div className="lv-p-deal-info" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${active ? BLUE : "#c9cee0"}`, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {active && <span style={{ width: 8, height: 8, borderRadius: "50%", background: BLUE }} />}
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <div className="lv-p-deal-label" style={{ fontWeight: 800, fontSize: 14, lineHeight: 1.2 }}>{d.label}</div>
                        <div className="lv-p-deal-sub" style={{ fontSize: 11, color: "#666", marginTop: 2, lineHeight: 1.2 }}>S/ {d.perUnit.toFixed(2)}/botella · {d.months}</div>
                      </div>
                    </div>
                    <div className="lv-p-deal-price">
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

          <button onClick={() => navigate(`/checkout?deal=${selected}`)} style={{
            width: "100%", padding: "14px 20px", borderRadius: 12, border: `2px solid ${BLUE}`, cursor: "pointer",
            background: "#fff", color: BLUE, fontWeight: 900, fontSize: 15, letterSpacing: 1,
          }}>
            IR A PAGAR AHORA →
          </button>

          <div style={{ marginTop: 18, display: "flex", justifyContent: "space-around", alignItems: "center", padding: 14, border: "1px solid #e3e6ee", borderRadius: 12, fontSize: 13, color: "#333" }}>
            <span>🔄 Garantía 90 Días</span>
            <span>🚚 Envío Rápido</span>
            <span>🔒 Pago Seguro</span>
          </div>

          <div style={{ marginTop: 14, textAlign: "center", color: "#2f7a3a", fontWeight: 700 }}>
            🎉 ¡Envío Gratis Aplicado en Tu Primer Pedido!
          </div>

          <div style={{ marginTop: 18 }}>
            <a href={CLONE_HOME} style={{ color: BLUE, fontWeight: 700, textDecoration: "none" }}>← Volver a la oferta</a>
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
