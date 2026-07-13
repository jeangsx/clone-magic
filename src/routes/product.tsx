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
  single: {
    label: "Compra 1 llévate 1 GRATIS",
    bottles: 2,
    months: "1 mes de suministro",
    price: 104,
    retail: 208,
    perUnit: 52,
  },
  sale5: {
    label: "Compra 2 llévate 2 GRATIS",
    bottles: 4,
    months: "2 meses de suministro",
    price: 208,
    retail: 416,
    perUnit: 52,
    badge: "MÁS POPULAR",
  },
  sale18: {
    label: "Compra 3 llévate 3 GRATIS",
    bottles: 6,
    months: "3 meses de suministro",
    price: 312,
    retail: 624,
    perUnit: 52,
    badge: "MEJOR OFERTA",
  },
  sale71: {
    label: "Compra 4 llévate 3 GRATIS",
    bottles: 7,
    months: "4 meses de suministro",
    price: 364,
    retail: 728,
    perUnit: 52,
  },
};

const GALLERY = [
  "https://www.prostagenix.com/images/product/bottle_box.png",
  "https://www.prostagenix.com/images/product/bottle.png",
  "https://www.prostagenix.com/special/special-offer/img/number-one-award.png",
  "https://www.prostagenix.com/images/home/dudley-danoff.png",
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
  const dealParam = searchParams.get("deal") ?? "single";
  const initial = (DEALS[dealParam as DealKey] ? (dealParam as DealKey) : "single") as DealKey;
  const [selected, setSelected] = useState<DealKey>(initial);
  const [heroIdx, setHeroIdx] = useState(0);
  const { h, m, s } = useCountdown();
  const cur = DEALS[selected];

  const BLUE = "#054497";
  const RED = "#d40000";
  const ORANGE = "#f39200";

  return (
    <div
      className="product-root"
      style={{
        background: "#fff",
        minHeight: "100vh",
        color: "#0b1a3a",
        fontFamily: "'Montserrat', system-ui, sans-serif",
      }}
    >
      <style>{`
        html, body { overflow-x: hidden; }
        .product-root { overflow-x: hidden; }
        .product-panel { min-width: 0; }
        .mobile-only { display: none; }
        .product-hero-scene,
        .product-doctor-note,
        .product-hero-headline,
        .product-hero-subcopy,
        .product-hero-bottle,
        .product-ingredients-btn,
        .product-sale-icon {
          display: none;
        }
        @media (max-width: 1024px) {
          .product-grid { grid-template-columns: 1fr !important; gap: 24px !important; padding: 16px !important; }
          .product-gallery-wrap { flex-direction: column-reverse !important; }
          .product-thumbs { flex-direction: row !important; overflow-x: auto; width: 100%; justify-content: center; }
        }
        @media (max-width: 640px) {
          .product-root {
            background: #fff !important;
            padding: 0 !important;
          }
          .product-shell {
            width: 100% !important;
            max-width: none !important;
            margin: 0 auto !important;
            background: #fff !important;
            box-shadow: none !important;
          }
          .product-grid {
            display: flex !important;
            flex-direction: column !important;
            gap: 14px !important;
            max-width: 430px !important;
            padding: 16px !important;
            background: #fff !important;
          }
          .gallery-panel { order: 1 !important; }
          .purchase-panel { order: 2 !important; }
          .desktop-only-mobile-hidden { display: none !important; }
          .mobile-only { display: block !important; }
          .product-header {
            max-width: 390px !important;
            padding: 12px 16px !important;
            justify-content: center !important;
            border-bottom: 0 !important;
            display: none !important;
          }
          .product-header a { font-size: 24px !important; }
          .product-header span { display: none !important; }
          .product-topbanner {
            max-width: 390px !important;
            margin: 0 auto !important;
            font-size: 11px !important;
            line-height: 1.35 !important;
            padding: 8px 14px !important;
            display: none !important;
          }
          .product-gallery-wrap {
            flex-direction: column-reverse !important;
            gap: 12px !important;
          }
          .gallery-panel {
            padding-top: 16px !important;
          }
          .product-hero {
            min-height: 0 !important;
            height: auto !important;
            aspect-ratio: 1 / 0.9 !important;
            padding: 14px !important;
            border-radius: 16px !important;
            background: linear-gradient(180deg,#f8fbff,#fff) !important;
            overflow: hidden !important;
            align-items: center !important;
            justify-content: center !important;
            box-shadow: 0 10px 26px rgba(15, 23, 42, 0.08) !important;
          }
          .product-hero-discount { display: none !important; }
          .product-hero-scene {
            display: none !important;
          }
          .product-hero-scene::before {
            content: "" !important;
            position: absolute !important;
            inset: 0 !important;
            background:
              linear-gradient(90deg, rgba(246, 230, 218, 0.96) 0%, rgba(246, 230, 218, 0.86) 45%, rgba(246, 230, 218, 0.12) 78%),
              radial-gradient(circle at 76% 20%, rgba(5, 68, 151, 0.16), transparent 40%) !important;
            z-index: 1 !important;
          }
          .product-hero-person {
            position: absolute !important;
            inset: 0 0 0 auto !important;
            width: 72% !important;
            height: 100% !important;
            object-fit: cover !important;
            object-position: 68% center !important;
            filter: saturate(1.05) contrast(1.02) !important;
          }
          .product-hero-copy {
            display: grid !important;
            align-content: start !important;
            gap: 8px !important;
            position: absolute !important;
            z-index: 2 !important;
            top: 18px !important;
            left: 16px !important;
            width: 60% !important;
            color: #151827 !important;
          }
          .product-doctor-note {
            display: block !important;
            width: fit-content !important;
            max-width: 210px !important;
            padding: 8px 10px !important;
            border-radius: 8px !important;
            background: rgba(255,255,255,0.94) !important;
            box-shadow: 0 8px 18px rgba(15, 23, 42, 0.16) !important;
            font-family: Georgia, serif !important;
            font-size: 8px !important;
            line-height: 1.15 !important;
          }
          .product-hero-headline {
            display: block !important;
            margin-top: 4px !important;
            font-family: Georgia, serif !important;
            font-size: 20px !important;
            line-height: 1.32 !important;
            font-weight: 700 !important;
            text-transform: capitalize !important;
          }
          .product-hero-subcopy {
            display: block !important;
            max-width: 178px !important;
            font-size: 9px !important;
            line-height: 1.35 !important;
            font-weight: 700 !important;
          }
          .product-hero-bottle {
            display: block !important;
            position: absolute !important;
            z-index: 3 !important;
            left: 54px !important;
            bottom: 58px !important;
            width: 88px !important;
            height: 118px !important;
            object-fit: contain !important;
            filter: drop-shadow(0 14px 16px rgba(15, 23, 42, 0.2)) !important;
          }
          .product-ingredients-btn {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 8px !important;
            position: absolute !important;
            z-index: 4 !important;
            left: 50% !important;
            bottom: 18px !important;
            transform: translateX(-50%) !important;
            min-width: 176px !important;
            padding: 11px 20px !important;
            border: 2px solid #0757c8 !important;
            border-radius: 999px !important;
            background: #fff !important;
            color: #0b4db3 !important;
            font-size: 16px !important;
            font-weight: 900 !important;
            box-shadow: 0 8px 16px rgba(15, 23, 42, 0.14) !important;
          }
          .product-standard-img {
            display: block !important;
            width: 92% !important;
            height: 92% !important;
            max-width: 330px !important;
            max-height: 330px !important;
            object-fit: contain !important;
          }
          .product-thumbs {
            justify-content: flex-start !important;
            padding: 0 0 6px !important;
            gap: 10px !important;
          }
          .product-info-card,
          .product-stats,
          .product-reviews,
          .product-rating,
          .product-title,
          .product-benefits {
            display: none !important;
          }
          .product-thumbs button {
            width: 62px !important;
            height: 62px !important;
            flex: 0 0 auto;
            border-radius: 8px !important;
            box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08) !important;
          }
          .product-rating {
            justify-content: flex-start !important;
            gap: 8px !important;
            margin: 8px 0 8px !important;
          }
          .product-rating > span:nth-child(2) { font-size: 12px !important; }
          .product-rating-badge {
            width: fit-content !important;
            margin: 0 0 12px !important;
            display: block !important;
            font-size: 11px !important;
            padding: 9px 14px !important;
            border-radius: 999px !important;
          }
          .product-title {
            font-size: 24px !important;
            line-height: 1.22 !important;
            text-align: left !important;
            letter-spacing: 0 !important;
            margin: 8px 0 16px !important;
          }
          .product-benefits {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            gap: 8px !important;
            margin-bottom: 16px !important;
          }
          .product-benefits > div {
            border: 0 !important;
            background: transparent !important;
            padding: 4px 2px !important;
          }
          .product-benefits > div > div:first-child {
            width: 46px !important;
            height: 46px !important;
            margin-bottom: 8px !important;
          }
          .product-benefits > div > div:last-child {
            font-size: 11px !important;
            line-height: 1.25 !important;
            font-weight: 700 !important;
          }
          .product-hotsale {
            display: grid !important;
            grid-template-columns: 34px minmax(0, 1fr) minmax(106px, 126px) !important;
            align-items: center !important;
            gap: 8px !important;
            padding: 14px 10px !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
            border-radius: 16px !important;
            margin-bottom: 24px !important;
          }
          .product-sale-icon {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            color: #fb3b42 !important;
          }
          .product-hotsale-title { font-size: 13px !important; line-height: 1.05 !important; }
          .product-hotsale-subtitle { font-size: 11px !important; margin-top: 2px !important; line-height: 1.16 !important; font-weight: 700 !important; }
          .product-hotsale-timer { display: grid !important; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px !important; justify-content: center; }
          .product-hotsale-timer > div { min-width: 0 !important; padding: 7px 4px !important; border-radius: 7px !important; }
          .product-hotsale-timer > div > div:first-child { font-size: 15px !important; }
          .deal-option { margin-top: 10px !important; padding-top: 20px !important; }
          .deal-badge { top: -12px !important; }
          .deal-option {
            border-radius: 14px !important;
            padding: 18px 14px 14px !important;
            min-height: 120px !important;
            box-shadow: 0 8px 22px rgba(15, 23, 42, 0.04) !important;
          }
          .deal-option-inner { align-items: center !important; }
          .deal-title { font-size: 16px !important; line-height: 1.2 !important; }
          .deal-meta { font-size: 13px !important; line-height: 1.35 !important; margin-top: 4px !important; }
          .deal-price-col {
            display: grid !important;
            justify-items: end !important;
            gap: 3px !important;
          }
          .deal-price { font-size: 22px !important; line-height: 1 !important; font-weight: 900 !important; }
          .deal-save {
            border: 1px solid #93c5fd !important;
            background: #dbeafe !important;
            border-radius: 999px !important;
            padding: 5px 8px !important;
            color: #1e40af !important;
            white-space: nowrap !important;
          }
          .product-cta-note {
            padding: 14px 18px !important;
            border-radius: 999px !important;
            line-height: 1.45 !important;
            font-size: 12px !important;
          }
          .product-total-row {
            flex-direction: column !important;
            gap: 4px !important;
            align-items: flex-start !important;
          }
          .product-total-row > div { width: 100% !important; display: flex !important; justify-content: space-between !important; align-items: baseline !important; }
          .product-add-button { font-size: 14px !important; padding: 15px 18px !important; background: #0f172a !important; }
          .product-info-card {
            padding: 18px !important;
            border-radius: 14px !important;
          }
          .product-stats { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; gap: 8px !important; }
          .product-stats > div { padding: 12px 4px !important; }
          .product-stats > div > div:first-child { font-size: 16px !important; }
          .product-gifts { grid-template-columns: 1fr !important; }
          .product-trust {
            display: grid !important;
            grid-template-columns: 1fr !important;
            gap: 8px !important;
            text-align: center !important;
          }
          .product-bottom-testimonial {
            max-width: 430px !important;
            background: #fff !important;
            padding: 16px !important;
          }
        }
        @media (max-width: 420px) {
          .product-title { font-size: 20px !important; }
          .product-grid { padding: 14px !important; }
          .deal-option-inner { gap: 8px !important; }
          .deal-price-col { min-width: 86px !important; }
          .deal-price { font-size: 17px !important; }
          .deal-save { font-size: 10px !important; padding: 4px 7px !important; }
          .product-benefits > div > div:last-child { font-size: 10px !important; }
        }
      `}</style>
      <div className="product-shell">
        {/* Top banner */}
        <div
          className="product-topbanner"
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
          🔥 OFERTÓN · Envío GRATIS en pedidos hoy · Garantía 90 Días
        </div>

        {/* Header */}
        <header
          className="product-header"
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
          <span style={{ color: "#555", fontSize: 13 }}>#1 en Cuidado Prostático en el Mundo</span>
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
        <section className="product-panel gallery-panel">
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
                className="product-hero-discount"
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
                HASTA 70% DCTO
              </span>
              <div className="product-hero-scene">
                <img className="product-hero-person" src="https://www.prostagenix.com/images/home/dudley-danoff.png" alt="" />
                <div className="product-hero-copy">
                  <div className="product-doctor-note">
                    Elección De Los Médicos · Cientos de Médicos Comparten Esto Con Sus Pacientes Sin Recibir Compensación.
                  </div>
                  <div className="product-hero-headline">
                    Reemplaza Más De 12 Productos Prostáticos Por Solo S/ 1.50 Al Día
                  </div>
                  <div className="product-hero-subcopy">
                    Formulado Por Los Mejores Doctores De Los Ángeles. Clínicamente Comprobado Para Mejorar La Salud Prostática.
                  </div>
                </div>
                <img className="product-hero-bottle" src="https://www.prostagenix.com/images/product/bottle.png" alt="" />
                <button className="product-ingredients-btn" type="button">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.5 10-10 10Z" />
                    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                  </svg>
                  Ingredientes
                </button>
              </div>
              <img
                className="product-standard-img"
                src={GALLERY[heroIdx]}
                alt="ProstaGenix"
                style={{ maxWidth: "100%", maxHeight: 460, objectFit: "contain" }}
              />
            </div>
          </div>

          {/* Descripción del producto */}
          <div
            className="product-info-card"
            style={{
              marginTop: 24,
              padding: 20,
              borderRadius: 14,
              background: "#f7f8fb",
              border: "1px solid #e3e6ee",
            }}
          >
            <div style={{ fontWeight: 900, fontSize: 17, color: BLUE, marginBottom: 8 }}>
              Sobre ProstaGenix™
            </div>
            <div style={{ fontSize: 14, color: "#333", lineHeight: 1.7 }}>
              ProstaGenix™ es la fórmula natural #1 recomendada por urólogos para el cuidado de la
              próstata. Con ingredientes clínicamente probados como <strong>Saw Palmetto</strong>,{" "}
              <strong>Zinc</strong> y <strong>Extracto de Ortiga</strong>, ayuda a reducir la
              inflamación, mejorar el flujo urinario y mantener una próstata saludable.
            </div>
            <div style={{ fontSize: 14, color: "#333", lineHeight: 1.7, marginTop: 10 }}>
              A diferencia de otros suplementos, ProstaGenix utiliza una{' '}
              <strong>tecnología de absorción avanzada</strong> que permite que los ingredientes
              activos lleguen directamente al tejido de la próstata, maximizando su efectividad desde
              la primera semana.
            </div>
          </div>

          {/* Stats */}
          <div
            className="product-stats"
            style={{
              marginTop: 18,
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 10,
            }}
          >
            {[
              { n: "150K+", t: "Clientes" },
              { n: "4.8/5", t: "Calificación" },
              { n: "90 Días", t: "Garantía" },
            ].map((s) => (
              <div
                key={s.t}
                style={{
                  textAlign: "center",
                  padding: "14px 6px",
                  borderRadius: 12,
                  background: "#f7f8fb",
                  border: "1px solid #e3e6ee",
                }}
              >
                <div style={{ fontWeight: 900, fontSize: 20, color: BLUE }}>{s.n}</div>
                <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>{s.t}</div>
              </div>
            ))}
          </div>

          {/* Testimonios */}
          <div className="product-reviews" style={{ marginTop: 18, display: "grid", gap: 10 }}>
            {[
              {
                name: "Carlos R.",
                text: "Empecé hace 3 meses y la diferencia es notable. Ya no tengo que levantarme varias veces en la noche.",
                stars: 5,
              },
              {
                name: "Miguel A.",
                text: "Mi urólogo me lo recomendó y no me arrepiento. Funcionó mejor de lo que esperaba.",
                stars: 5,
              },
              {
                name: "Roberto L.",
                text: "Llevaba años probando productos sin resultados. Con ProstaGenix noté cambios desde la segunda semana.",
                stars: 5,
              },
            ].map((r) => (
              <div
                key={r.name}
                style={{
                  padding: 14,
                  borderRadius: 12,
                  border: "1px solid #e3e6ee",
                  background: "#fff",
                }}
              >
                <div style={{ color: ORANGE, fontSize: 13, marginBottom: 4 }}>
                  {"★".repeat(r.stars)}
                </div>
                <div style={{ fontSize: 13, color: "#333", lineHeight: 1.5 }}>
                  "{r.text}"
                </div>
                <div style={{ marginTop: 6, fontSize: 12, fontWeight: 800, color: "#555" }}>
                  — {r.name}{" "}
                  <span style={{ color: "#2f7a3a", fontWeight: 700 }}>Verificado ✓</span>
                </div>
              </div>
            ))}
          </div>

        </section>

        {/* RIGHT: purchase panel */}
        <section className="product-panel purchase-panel">
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }} className="product-rating">
            <span style={{ color: ORANGE, fontSize: 20 }}>★★★★★</span>
            <span style={{ color: "#555", fontWeight: 600 }}>4.8 (13,167)</span>
            <span
              className="product-rating-badge"
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
            className="product-title"
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
            className="product-benefits"
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

          <div
            className="product-hotsale"
            style={{
              border: `2px solid ${RED}`,
              borderRadius: 14,
              padding: 14,
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 22,
              background: "#fff5f5",
              maxWidth: "100%",
              boxSizing: "border-box",
            }}
          >
            <div className="product-sale-icon">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8.5 14.5a3.5 3.5 0 1 0 7 0c0-3.5-3.5-5-3.5-8.5-2.5 2-5.5 4.7-5.5 8.5Z" />
                <path d="M12 22c4.4 0 8-3.4 8-8 0-5.5-4.5-9.5-8-12-3.5 2.5-8 6.5-8 12 0 4.6 3.6 8 8 8Z" />
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="product-hotsale-title" style={{ color: RED, fontWeight: 900, letterSpacing: 1 }}>🔥 OFERTA CALIENTE</div>
              <div className="product-hotsale-subtitle" style={{ fontSize: 13, color: "#5a1010" }}>
                Ordena hoy para recibir regalos GRATIS
              </div>
            </div>
            <div className="product-hotsale-timer" style={{ display: "flex", gap: 6, flexShrink: 0 }}>
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
          </div>

          {/* Deal options */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 18, paddingTop: 4 }}>
            {(Object.keys(DEALS) as DealKey[]).map((k) => {
              const d = DEALS[k];
              const active = k === selected;
              return (
                <button
                  key={k}
                  onClick={() => setSelected(k)}
                  className="deal-option"
                  style={{
                    textAlign: "left",
                    cursor: "pointer",
                    border: `2px solid ${active ? "#3b82f6" : "#e2e8f0"}`,
                    background: active ? "#eff6ff" : "#fff",
                    borderRadius: 14,
                    padding: d.badge ? "20px 16px 14px" : "14px 16px",
                    marginTop: d.badge ? 10 : 0,
                    position: "relative",
                    transition: "all 0.15s",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                >
                  {d.badge && (
                    <span
                      className="deal-badge"
                      style={{
                        position: "absolute",
                        top: -12,
                        left: 20,
                        background: k === "sale71" ? "#1e40af" : "#3b82f6",
                        color: "#fff",
                        padding: "3px 10px",
                        borderRadius: 999,
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: 1,
                        zIndex: 2,
                      }}
                    >
                      {d.badge}
                    </span>
                  )}
                  <div
                    className="deal-option-inner"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 8,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                      <span
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          border: `2px solid ${active ? "#3b82f6" : "#c9cee0"}`,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {active && (
                          <span
                            style={{ width: 9, height: 9, borderRadius: "50%", background: "#3b82f6" }}
                          />
                        )}
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <div className="deal-title" style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.25 }}>{d.label}</div>
                        <div className="deal-meta" style={{ fontSize: 11, color: "#666" }}>
                          S/ {d.perUnit.toFixed(2)}/botella · {d.months}
                        </div>
                      </div>
                    </div>
                    <div className="deal-price-col" style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ color: "#999", textDecoration: "line-through", fontSize: 12 }}>
                        S/ {d.retail.toFixed(2)}
                      </div>
                      <div className="deal-price" style={{ fontWeight: 800, fontSize: 17, color: "#0b1a3a" }}>
                        S/ {d.price.toFixed(2)}
                      </div>
                      <div className="deal-save" style={{ color: "#3b82f6", fontSize: 10, fontWeight: 700 }}>
                        Ahorra S/ {(d.retail - d.price).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div
            className="product-cta-note"
            style={{
              background: `linear-gradient(90deg, ${BLUE}, #0a5cc7)`,
              color: "#fff",
              textAlign: "center",
              padding: "10px",
              borderRadius: 50,
              fontWeight: 700,
              fontSize: 13,
              marginBottom: 14,
            }}
          >
            ⏰ Ordena antes de medianoche — Recibe regalos GRATIS
          </div>

          <div
            className="product-total-row"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 4,
              padding: "0 4px",
            }}
          >
            <span style={{ color: "#666", fontSize: 13 }}>
              Total ({cur.bottles} {cur.bottles === 1 ? "botella" : "botellas"})
            </span>
            <div>
              <span style={{ color: "#999", textDecoration: "line-through", marginRight: 10, fontSize: 14 }}>
                S/ {cur.retail.toFixed(2)}
              </span>
              <span style={{ fontWeight: 800, fontSize: 26, color: "#0b1a3a" }}>
                S/ {cur.price.toFixed(2)}
              </span>
            </div>
          </div>
          <div style={{ textAlign: "right", color: "#3b82f6", fontSize: 13, fontWeight: 800, marginBottom: 10, padding: "0 4px" }}>
            Ahorras S/ {(cur.retail - cur.price).toFixed(2)}
          </div>
          <button
            className="product-add-button"
            onClick={() => navigate(`/checkout?deal=${selected}`)}
            style={{
              marginTop: 4,
              width: "100%",
              padding: "14px 20px",
              borderRadius: 50,
              border: "none",
              cursor: "pointer",
              background: "#1e293b",
              color: "#fff",
              fontWeight: 700,
              fontSize: 15,
              textTransform: "uppercase" as const,
              letterSpacing: "0.05em",
            }}
          >
            Agregar al Carrito →
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
            className="product-gifts"
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
            className="product-trust"
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
      </div>

      {/* Testimonial */}
      <section
        className="product-bottom-testimonial"
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
