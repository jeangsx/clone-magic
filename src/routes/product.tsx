import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

type DealKey = "sale71" | "sale18" | "sale5" | "single";

const DEALS: Record<
  DealKey,
  {
    label: string;
    bottles: number;
    months: string;
    price: number;
    retail: number;
    perUnit: number;
    badge?: string;
  }
> = {
  sale71: {
    label: "Compra 4 llévate 3 GRATIS",
    bottles: 7,
    months: "7 meses de suministro",
    price: 159.95,
    retail: 490,
    perUnit: 22.85,
    badge: "MEJOR OFERTA",
  },
  sale18: {
    label: "Compra 3 llévate 2 GRATIS",
    bottles: 5,
    months: "5 meses de suministro",
    price: 119.95,
    retail: 350,
    perUnit: 23.99,
    badge: "MÁS POPULAR",
  },
  sale5: {
    label: "Compra 2 llévate 1 GRATIS",
    bottles: 3,
    months: "3 meses de suministro",
    price: 79.95,
    retail: 210,
    perUnit: 26.65,
  },
  single: {
    label: "1 Mes de Suministro",
    bottles: 1,
    months: "1 mes de suministro",
    price: 39.95,
    retail: 70,
    perUnit: 39.95,
  },
};

const GALLERY = [
  "https://www.prostagenix.com/images/product/bottle_box.png",
  "https://www.prostagenix.com/images/product/bottle.png",
  "https://www.prostagenix.com/images/home/dudley-danoff.png",
  "https://www.prostagenix.com/special/special-offer/img/number-one-award.png",
];

function useCountdown() {
  const target = useMemo(() => {
    const t = new Date();
    t.setHours(23, 59, 59, 999);
    return t.getTime();
  }, []);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target - now);
  const h = String(Math.floor(diff / 3_600_000)).padStart(2, "0");
  const m = String(Math.floor((diff % 3_600_000) / 60_000)).padStart(2, "0");
  const s = String(Math.floor((diff % 60_000) / 1000)).padStart(2, "0");
  return { h, m, s };
}

export default function ProductPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dealParam = searchParams.get("deal") ?? "sale18";
  const initial = (DEALS[dealParam as DealKey] ? (dealParam as DealKey) : "sale18") as DealKey;
  const [selected, setSelected] = useState<DealKey>(initial);
  const [heroIdx, setHeroIdx] = useState(0);
  const { h, m, s } = useCountdown();
  const cur = DEALS[selected];

  const BLUE = "#054497";
  const RED = "#d40000";
  const ORANGE = "#f39200";

  return (
    <div
      style={{
        background: "#fff",
        minHeight: "100vh",
        color: "#0b1a3a",
        fontFamily: "'Montserrat', system-ui, sans-serif",
      }}
    >
      <style>{`
        @media (max-width: 860px) {
          .product-grid { grid-template-columns: 1fr !important; gap: 24px !important; padding: 16px !important; }
          .product-hero { min-height: 320px !important; padding: 16px !important; }
          .product-hero img { max-height: 300px !important; }
          .product-thumbs { flex-direction: row !important; overflow-x: auto; }
          .product-thumbs button { width: 64px !important; height: 64px !important; flex: 0 0 auto; }
          .product-gallery-wrap { flex-direction: column !important; }
          .product-title { font-size: 24px !important; }
          .product-benefits { grid-template-columns: repeat(3,1fr) !important; gap: 6px !important; }
          .product-hotsale { flex-wrap: wrap !important; }
          .product-gifts { grid-template-columns: 1fr !important; }
          .product-trust { flex-direction: column !important; gap: 8px !important; align-items: flex-start !important; }
        }
      `}</style>
      {/* Top banner */}
      <div
        style={{
          background: BLUE,
          color: "#fff",
          textAlign: "center",
          padding: "10px 16px",
          fontWeight: 700,
          fontSize: 14,
          letterSpacing: 1,
        }}
      >
        GREAT DEAL · Envío GRATIS en pedidos hoy · Garantía 90 Días
      </div>

      {/* Header */}
      <header
        style={{
          borderBottom: "1px solid #eee",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          maxWidth: 1280,
          margin: "0 auto",
        }}
      >
        <a
          href="/"
          style={{
            color: BLUE,
            fontWeight: 900,
            fontSize: 26,
            textDecoration: "none",
            letterSpacing: -0.5,
          }}
        >
          Prosta<span style={{ color: RED }}>Genix</span>
        </a>
        <span style={{ color: "#555", fontSize: 13 }}>#1 Rated Prostate Pill in the World</span>
      </header>

      <main
        className="product-grid"
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "32px 24px",
          display: "grid",
          gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
          gap: 40,
        }}
      >
        {/* LEFT: gallery */}
        <section>
          <div className="product-gallery-wrap" style={{ display: "flex", gap: 12 }}>
            <div className="product-thumbs" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {GALLERY.map((src, i) => (
                <button
                  key={i}
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
                  <img
                    src={src}
                    alt=""
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                </button>
              ))}
            </div>
            <div
              className="product-hero"
              style={{
                flex: 1,
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
                  top: 16,
                  left: 16,
                  background: RED,
                  color: "#fff",
                  fontWeight: 900,
                  padding: "6px 12px",
                  borderRadius: 999,
                  fontSize: 12,
                  letterSpacing: 1,
                }}
              >
                UP TO 70% OFF
              </span>
              <img
                src={GALLERY[heroIdx]}
                alt="ProstaGenix"
                style={{ maxWidth: "100%", maxHeight: 460, objectFit: "contain" }}
              />
            </div>
          </div>

          <div
            style={{
              marginTop: 24,
              padding: 20,
              borderRadius: 14,
              background: "#f7f8fb",
              border: "1px solid #e3e6ee",
            }}
          >
            <div style={{ fontWeight: 800, marginBottom: 6, color: BLUE }}>
              {"{ ⚕ Elección de Médicos }"}
            </div>
            <div style={{ fontSize: 14, color: "#333" }}>
              <strong>Cientos de urólogos</strong> lo recomiendan a sus pacientes sin recibir
              compensación.
            </div>
          </div>
        </section>

        {/* RIGHT: purchase panel */}
        <section>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
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
              RECOMENDADO POR MÉDICOS
            </span>
          </div>

          <h1
            style={{
              fontSize: 34,
              lineHeight: 1.15,
              fontWeight: 900,
              margin: "6px 0 18px",
              color: "#0b1a3a",
            }}
          >
            ProstaGenix™ – Fórmula Clínica para la Próstata
          </h1>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 10,
              marginBottom: 18,
            }}
          >
            {[
              {
                t: "Reduce DHT",
                icon: (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={BLUE}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <polyline points="9 12 11 14 15 10" />
                  </svg>
                ),
              },
              {
                t: "100% Natural",
                icon: (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={BLUE}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.5 10-10 10Z" />
                    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                  </svg>
                ),
              },
              {
                t: "Clínicamente Probado",
                icon: (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={BLUE}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 11H5a2 2 0 0 0-2 2v3c0 1.5 1 2.5 2 2.5h1" />
                    <path d="M15 11h4a2 2 0 0 1 2 2v3c0 1.5-1 2.5-2 2.5h-1" />
                    <path d="M12 2a3 3 0 0 0-3 3v0" />
                    <path d="M12 2a3 3 0 0 1 3 3v0" />
                    <rect x="8" y="8" width="8" height="14" rx="1" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                ),
              },
            ].map((b) => (
              <div
                key={b.t}
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
                  }}
                >
                  {b.icon}
                </div>
                <div style={{ fontSize: 13, fontWeight: 800 }}>{b.t}</div>
              </div>
            ))}
          </div>

          {/* HOT SALE countdown */}
          <div
            style={{
              border: `2px solid ${RED}`,
              borderRadius: 14,
              padding: 14,
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 22,
              background: "#fff5f5",
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ color: RED, fontWeight: 900, letterSpacing: 1 }}>🔥 HOT SALE</div>
              <div style={{ fontSize: 13, color: "#5a1010" }}>
                Ordena hoy para asegurar tu 70% de descuento y regalos GRATIS
              </div>
            </div>
            {[
              { v: h, l: "HRS" },
              { v: m, l: "MIN" },
              { v: s, l: "SEG" },
            ].map((x) => (
              <div
                key={x.l}
                style={{
                  background: RED,
                  color: "#fff",
                  padding: "6px 10px",
                  borderRadius: 8,
                  textAlign: "center",
                  minWidth: 46,
                }}
              >
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
                <button
                  key={k}
                  onClick={() => setSelected(k)}
                  style={{
                    textAlign: "left",
                    cursor: "pointer",
                    border: `2px solid ${active ? BLUE : "#e3e6ee"}`,
                    background: active ? "#eef3fb" : "#fff",
                    borderRadius: 14,
                    padding: "16px 18px",
                    position: "relative",
                  }}
                >
                  {d.badge && (
                    <span
                      style={{
                        position: "absolute",
                        top: -12,
                        left: 16,
                        background: BLUE,
                        color: "#fff",
                        padding: "4px 12px",
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: 800,
                        letterSpacing: 1,
                      }}
                    >
                      {d.badge}
                    </span>
                  )}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          border: `2px solid ${active ? BLUE : "#c9cee0"}`,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {active && (
                          <span
                            style={{ width: 10, height: 10, borderRadius: "50%", background: BLUE }}
                          />
                        )}
                      </span>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 15 }}>{d.label}</div>
                        <div style={{ fontSize: 12, color: "#666" }}>
                          S/ {d.perUnit.toFixed(2)}/botella · {d.months}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ color: "#888", textDecoration: "line-through", fontSize: 13 }}>
                        S/ {d.retail.toFixed(2)}
                      </div>
                      <div style={{ fontWeight: 900, fontSize: 20, color: "#0b1a3a" }}>
                        S/ {d.price.toFixed(2)}
                      </div>
                      <div style={{ color: BLUE, fontSize: 11, fontWeight: 700 }}>
                        Ahorras S/ {(d.retail - d.price).toFixed(2)}
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
            }}
          >
            <span style={{ color: "#666" }}>
              Total ({cur.bottles} {cur.bottles === 1 ? "botella" : "botellas"})
            </span>
            <div>
              <span style={{ color: "#888", textDecoration: "line-through", marginRight: 10 }}>
                S/ {cur.retail.toFixed(2)}
              </span>
              <span style={{ fontWeight: 900, fontSize: 28, color: "#0b1a3a" }}>
                S/ {cur.price.toFixed(2)}
              </span>
            </div>
          </div>
          <div style={{ textAlign: "right", color: BLUE, fontWeight: 800, marginBottom: 14 }}>
            Ahorras S/ {(cur.retail - cur.price).toFixed(2)}
          </div>

          <button
            onClick={() => navigate(`/checkout?deal=${selected}`)}
            style={{
              width: "100%",
              padding: "18px 20px",
              borderRadius: 12,
              border: 0,
              cursor: "pointer",
              background: `linear-gradient(180deg, ${ORANGE}, #d97900)`,
              color: "#fff",
              fontWeight: 900,
              fontSize: 17,
              letterSpacing: 1,
              boxShadow: "0 8px 20px rgba(243,146,0,0.35)",
            }}
          >
            AGREGAR AL CARRITO →
          </button>

          <button
            onClick={() => navigate(`/checkout?deal=${selected}`)}
            style={{
              marginTop: 10,
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
            IR A PAGAR AHORA →
          </button>

          {/* Free gifts */}
          <div
            style={{
              marginTop: 18,
              background: `linear-gradient(135deg, ${BLUE}, #0a5cc7)`,
              color: "#fff",
              borderRadius: 14,
              padding: 18,
            }}
          >
            <div
              style={{ textAlign: "center", fontWeight: 900, letterSpacing: 1, marginBottom: 12 }}
            >
              REGALOS GRATIS CON TU COMPRA
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 10,
                textAlign: "center",
                fontSize: 12,
              }}
            >
              {[
                { t: "Ebook Exclusivo", i: "📘" },
                { t: "Envío Gratis", i: "🚚" },
                { t: "Comunidad VIP", i: "🌟" },
              ].map((g) => (
                <div
                  key={g.t}
                  style={{ background: "rgba(255,255,255,0.12)", borderRadius: 10, padding: 12 }}
                >
                  <div style={{ fontSize: 28 }}>{g.i}</div>
                  <div style={{ fontWeight: 800, marginTop: 6 }}>{g.t}</div>
                  <div style={{ opacity: 0.9 }}>✓ Incluido</div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              marginTop: 16,
              display: "flex",
              justifyContent: "space-around",
              alignItems: "center",
              padding: 14,
              border: "1px solid #e3e6ee",
              borderRadius: 12,
              fontSize: 13,
              color: "#333",
            }}
          >
            <span>🔄 Garantía 90 Días</span>
            <span>🚚 Envío Rápido</span>
            <span>🔒 Pago Seguro</span>
          </div>

          <div style={{ marginTop: 14, textAlign: "center", color: "#2f7a3a", fontWeight: 700 }}>
            🎉 ¡Envío Gratis Aplicado en Tu Primer Pedido!
          </div>

          <div style={{ marginTop: 18 }}>
            <a href="/" style={{ color: BLUE, fontWeight: 700, textDecoration: "none" }}>
              ← Volver a la oferta
            </a>
          </div>
        </section>
      </main>

      {/* Testimonial */}
      <section
        style={{ maxWidth: 1280, margin: "0 auto", padding: "24px", borderTop: "1px solid #eee" }}
      >
        <div style={{ padding: 18, border: "1px solid #e3e6ee", borderRadius: 14 }}>
          <div style={{ color: ORANGE, fontSize: 18 }}>★★★★★</div>
          <div style={{ fontWeight: 800, margin: "6px 0" }}>Resultados desde la primera semana</div>
          <div style={{ color: "#333", fontSize: 14 }}>
            "Después de años probando otros suplementos, ProstaGenix realmente hizo la diferencia.
            Mi urólogo notó la mejora y ahora lo recomienda a sus pacientes." —{" "}
            <strong>Jorge M.</strong>{" "}
            <span style={{ color: "#2f7a3a", fontWeight: 700 }}>Verificado</span>
          </div>
        </div>
      </section>
    </div>
  );
}
