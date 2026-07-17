import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  fetchAllProducts,
  fetchCollections,
  fmtMoney,
  productBadgeText,
  productOfferSummary,
  productImages,
  productShortPitch,
  type ShopifyCollection,
  type ShopifyProduct,
} from "../lib/shopify";
import { useLandingSettings } from "../lib/use-landing-settings";
import { useReportEmbedHeight } from "../lib/embed-height";
import { appHashUrl } from "../lib/static-hosting";

const BLUE = "#054497";
const RED = "#d40000";
const ORANGE = "#f39200";
const GREEN = "#2f7a3a";

function OfferCard({
  product,
  guaranteeText,
}: {
  product: ShopifyProduct;
  guaranteeText: string;
}) {
  const offer = productOfferSummary(product);
  const href = appHashUrl(`/product?handle=${encodeURIComponent(product.handle)}`);
  const pitch = productShortPitch(product);
  const badge = productBadgeText(product) || "OFERTA";
  const images = productImages(product);
  const [activeImg, setActiveImg] = useState(0);
  const mainImg = images[activeImg] || offer.image;

  return (
    <article className="lv-offer-pod">
      <div className="lv-offer-visual">
        <span className="lv-offer-bonus">{badge}</span>
        <div className="lv-offer-bottles">
          <img src={mainImg} alt={product.title} />
        </div>
        {images.length > 1 && (
          <div className="lv-offer-thumbs">
            {images.map((src, i) => (
              <button
                key={src + i}
                type="button"
                className={`lv-offer-thumb${i === activeImg ? " is-active" : ""}`}
                onClick={() => setActiveImg(i)}
                aria-label={`Imagen ${i + 1}`}
              >
                <img src={src} alt="" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="lv-offer-copy">
        <h3 className="lv-offer-title">{product.title}</h3>
        {pitch && <p className="lv-offer-pitch">{pitch}</p>}

        <ul className="lv-offer-list">
          <li>
            Precio retail: <s style={{ color: RED }}>{fmtMoney(offer.retail, offer.currency)}</s>
          </li>
          <li>
            Ahorras:{" "}
            <strong style={{ color: GREEN }}>{fmtMoney(offer.save, offer.currency)}</strong>
          </li>
        </ul>

        <div className="lv-offer-price-block">
          <span className="lv-offer-instant">INSTANT SAVINGS</span>
          <div className="lv-offer-price">{fmtMoney(offer.price, offer.currency)}</div>
          <span className="lv-offer-pct">{offer.pct}% SAVINGS</span>
        </div>

        <div className="lv-offer-actions">
          <a href={href} target="_top" className="lv-offer-cta">
            ORDER NOW
          </a>
          <div className="lv-offer-guarantee">{guaranteeText}</div>
        </div>
      </div>
    </article>
  );
}

export default function ProductosPage() {
  const [searchParams] = useSearchParams();
  const embed = searchParams.get("embed") === "1";
  const CACHE_KEY = "lv-shopify-cache-v2";
  const CACHE_TTL = 30 * 60 * 1000; // 30 min
  const initial = (() => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { t: number; collections: ShopifyCollection[]; orphans: ShopifyProduct[] };
      if (Date.now() - parsed.t > CACHE_TTL) return null;
      return parsed;
    } catch { return null; }
  })();
  const [collections, setCollections] = useState<ShopifyCollection[] | null>(initial?.collections ?? null);
  const [orphans, setOrphans] = useState<ShopifyProduct[]>(initial?.orphans ?? []);
  const [error, setError] = useState<string | null>(null);
  const { settings } = useLandingSettings();

  useEffect(() => {
    document.title = settings.offersHeading || "Ofertas especiales";
    Promise.all([fetchCollections(), fetchAllProducts()])
      .then(([cols, all]) => {
        const inCol = new Set<string>();
        cols.forEach((c) => c.products.forEach((p) => inCol.add(p.id)));
        const orph = all.filter((p) => !inCol.has(p.id));
        setOrphans(orph);
        setCollections(cols);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), collections: cols, orphans: orph }));
        } catch { /* ignore */ }
      })
      .catch((e) => setError(String(e)));
  }, [settings.offersHeading]);

  useReportEmbedHeight(!!collections && !error);

  if (error) {
    return (
      <div style={{ padding: 24, fontFamily: "system-ui" }}>Error: {error}</div>
    );
  }
  if (!collections) {
    return (
      <div style={{ padding: 24, fontFamily: "system-ui", textAlign: "center" }}>
        Cargando ofertas…
      </div>
    );
  }

  const visibleCollections = collections.filter((c) => c.products.length > 0);
  const hasAnything = visibleCollections.length > 0 || orphans.length > 0;

  return (
    <div
      data-embed-root
      style={{
        fontFamily: "'Montserrat', system-ui, sans-serif",
        background: embed ? "#fff" : "#f7f8fb",
        minHeight: embed ? 0 : "100vh",
        height: "auto",
        color: "#0b1a3a",
        padding: embed ? "12px 8px 24px" : "24px 16px 40px",
      }}
    >
      <style>{`
        html, body, #root { height: auto !important; min-height: 0 !important; max-height: none !important; background: #fff !important; overflow: hidden !important; }
        .lv-offers-wrap { max-width: 1100px; margin: 0 auto; }
        .lv-offers-heading {
          text-align: center; font-size: 28px; font-weight: 900; color: ${BLUE};
          margin: 0 0 20px; letter-spacing: -0.3px;
        }
        .lv-collection { margin: 28px 0 8px; }
        .lv-collection-title {
          font-size: 22px; font-weight: 900; color: ${BLUE};
          margin: 0 0 4px; letter-spacing: -0.2px;
          border-bottom: 3px solid ${ORANGE}; padding-bottom: 6px;
        }
        .lv-collection-desc { margin: 0 0 12px; color: #555; font-size: 14px; }
        .lv-offers-list { display: flex; flex-direction: column; gap: 12px; }
        .lv-offer-pod {
          display: grid; grid-template-columns: 1.05fr 0.95fr;
          gap: 12px; align-items: center;
          background: linear-gradient(180deg,#f7f8fb,#fff);
          border: 1px solid #e3e6ee; border-radius: 14px; padding: 10px;
          box-shadow: 0 8px 28px rgba(0,0,0,.06);
        }
        .lv-offer-visual {
          position: relative; display: flex; align-items: center; justify-content: center;
          width: 100%;
          background: linear-gradient(180deg,#eef3fb,#fff);
          border-radius: 12px; border: 1px solid #e3e6ee; padding: 6px;
          overflow: hidden;
        }
        .lv-offer-bonus {
          position: absolute; top: 8px; right: 8px; z-index: 2;
          background: ${BLUE}; color: #fff; font-size: 10px; font-weight: 900;
          letter-spacing: 1px; padding: 6px 10px; border-radius: 999px;
          box-shadow: 0 4px 12px rgba(5,68,151,.35);
        }
        .lv-offer-bottles {
          width: 100%;
          display: flex; align-items: center; justify-content: center;
        }
        .lv-offer-bottles img {
          display: block;
          width: 100%;
          height: auto;
          max-height: 320px;
          object-fit: contain; object-position: center;
        }
        .lv-offer-thumbs {
          position: absolute; bottom: 6px; left: 6px; right: 6px;
          display: flex; gap: 4px; justify-content: center; flex-wrap: wrap;
          z-index: 2;
        }
        .lv-offer-thumb {
          width: 40px; height: 40px; padding: 0; border-radius: 6px;
          border: 2px solid #d4dbe8; background: #fff; cursor: pointer;
          overflow: hidden; flex-shrink: 0;
        }
        .lv-offer-thumb.is-active { border-color: ${ORANGE}; }
        .lv-offer-thumb img { width: 100%; height: 100%; object-fit: contain; display: block; }
        .lv-offer-desc {
          margin: 8px 6px 4px; font-size: 13px; color: #333; line-height: 1.4;
          white-space: pre-line;
          display: -webkit-box; -webkit-line-clamp: 6; -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .lv-offer-copy {
          min-width: 0;
          display: flex; flex-direction: column; justify-content: center;
          gap: 6px; padding: 4px 6px 4px 2px;
        }
        .lv-offer-title {
          margin: 0; font-size: 22px; font-weight: 900; color: #0b1a3a;
          line-height: 1.2; letter-spacing: -0.2px;
        }
        .lv-offer-pitch {
          margin: 0; font-size: 14px; color: #555; font-weight: 600; line-height: 1.3;
        }
        .lv-offer-list { list-style: none; margin: 0; padding: 0; font-size: 15px; line-height: 1.3; }
        .lv-offer-list li { margin: 0; }
        .lv-offer-price-block { margin: 0; }
        .lv-offer-instant {
          display: block; color: #3d7fd6; font-size: 12px; font-weight: 800;
          letter-spacing: 1px; margin-bottom: 0;
        }
        .lv-offer-price {
          font-size: 40px; font-weight: 900; color: #111; line-height: 1.05;
          text-shadow: 0 1px 0 rgba(0,0,0,.08);
        }
        .lv-offer-pct {
          display: block; color: ${RED}; font-size: 20px; font-weight: 900;
          margin: 0;
        }
        .lv-offer-actions { display: flex; flex-direction: column; gap: 6px; margin-top: 2px; }
        .lv-offer-cta {
          display: inline-flex; align-items: center; justify-content: center;
          width: 100%; padding: 12px 18px; border-radius: 8px;
          background: linear-gradient(180deg, #ffb347, ${ORANGE} 45%, #e07800);
          color: #fff; font-weight: 900; font-size: 18px; letter-spacing: 1px;
          text-decoration: none; box-shadow: 0 6px 16px rgba(243,146,0,.4);
          box-sizing: border-box;
        }
        .lv-offer-cta:hover { filter: brightness(1.05); }
        .lv-offer-guarantee {
          margin: 0; font-size: 11px; font-weight: 800; color: ${BLUE};
          letter-spacing: .5px;
        }
        @media (max-width: 760px) {
          .lv-offers-heading { font-size: 22px; }
          .lv-offer-pod { grid-template-columns: 1fr; padding: 10px; gap: 8px; }
          .lv-offer-bottles img { max-height: 260px; }
          .lv-offer-title { font-size: 20px; }
          .lv-offer-list { font-size: 14px; }
          .lv-offer-price { font-size: 36px; }
          .lv-offer-pct { font-size: 18px; }
          .lv-offer-cta { font-size: 17px; }
        }
      `}</style>

      <div className="lv-offers-wrap">
        {!embed && <h1 className="lv-offers-heading">{settings.offersHeading}</h1>}
        {embed && <h2 className="lv-offers-heading">{settings.offersHeading}</h2>}

        {!hasAnything && (
          <p style={{ textAlign: "center", color: "#555" }}>No hay productos aún.</p>
        )}

        {visibleCollections.map((col) => (
          <section key={col.id} className="lv-collection">
            <h2 className="lv-collection-title">{col.title}</h2>
            {col.description && <p className="lv-collection-desc">{col.description}</p>}
            <div className="lv-offers-list">
              {col.products.map((p) => (
                <OfferCard key={p.id} product={p} guaranteeText={settings.guaranteeText} />
              ))}
            </div>
          </section>
        ))}

        {orphans.length > 0 && (
          <section className="lv-collection">
            <h2 className="lv-collection-title">Otros productos</h2>
            <div className="lv-offers-list">
              {orphans.map((p) => (
                <OfferCard key={p.id} product={p} guaranteeText={settings.guaranteeText} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
