import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  fetchAllProducts,
  fmtMoney,
  productOfferSummary,
  type ShopifyProduct,
} from "../lib/shopify";
import { useReportEmbedHeight } from "../lib/embed-height";
import { appHashUrl } from "../lib/static-hosting";

const BLUE = "#054497";
const RED = "#d40000";
const ORANGE = "#f39200";
const GREEN = "#2f7a3a";

function OfferCard({ product }: { product: ShopifyProduct }) {
  const offer = productOfferSummary(product);
  const href = appHashUrl(`/product?handle=${encodeURIComponent(product.handle)}`);

  return (
    <article className="lv-offer-pod">
      <div className="lv-offer-visual">
        <span className="lv-offer-bonus">OFERTA</span>
        <div className="lv-offer-bottles">
          <img src={offer.image} alt={product.title} />
        </div>
      </div>

      <div className="lv-offer-copy">
        <h3 className="lv-offer-title">{product.title}</h3>

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
          <div className="lv-offer-guarantee">90 DAY MONEY BACK GUARANTEE</div>
        </div>
      </div>
    </article>
  );
}

export default function ProductosPage() {
  const [searchParams] = useSearchParams();
  const embed = searchParams.get("embed") === "1";
  const [products, setProducts] = useState<ShopifyProduct[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Ofertas especiales";
    fetchAllProducts().then(setProducts).catch((e) => setError(String(e)));
  }, []);

  useReportEmbedHeight(!!products && !error);

  if (error) {
    return (
      <div style={{ padding: 24, fontFamily: "system-ui" }}>Error: {error}</div>
    );
  }
  if (!products) {
    return (
      <div style={{ padding: 24, fontFamily: "system-ui", textAlign: "center" }}>
        Cargando ofertas…
      </div>
    );
  }

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
        .lv-offers-list { display: flex; flex-direction: column; gap: 14px; }
        .lv-offer-pod {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 14px; align-items: stretch;
          background: linear-gradient(180deg,#f7f8fb,#fff);
          border: 1px solid #e3e6ee; border-radius: 14px; padding: 12px;
          box-shadow: 0 8px 28px rgba(0,0,0,.06);
        }
        .lv-offer-visual {
          position: relative; display: flex; align-items: center; justify-content: center;
          width: 100%; min-height: 0; height: 100%;
          background: linear-gradient(180deg,#eef3fb,#fff);
          border-radius: 12px; border: 1px solid #e3e6ee; padding: 8px;
          overflow: hidden;
        }
        .lv-offer-bonus {
          position: absolute; top: 8px; right: 8px; z-index: 2;
          background: ${BLUE}; color: #fff; font-size: 10px; font-weight: 900;
          letter-spacing: 1px; padding: 6px 10px; border-radius: 999px;
          box-shadow: 0 4px 12px rgba(5,68,151,.35);
        }
        .lv-offer-bottles {
          width: 100%; height: 100%;
          display: flex; align-items: stretch; justify-content: center;
        }
        .lv-offer-bottles img {
          width: 100%; height: 100%;
          object-fit: contain; object-position: center;
        }
        .lv-offer-copy {
          min-width: 0; height: 100%;
          display: flex; flex-direction: column; justify-content: space-between;
          gap: 8px; padding: 6px 4px;
        }
        .lv-offer-title {
          margin: 0; font-size: 26px; font-weight: 900; color: #0b1a3a;
          line-height: 1.15; letter-spacing: -0.2px;
        }
        .lv-offer-list { list-style: none; margin: 0; padding: 0; font-size: 16px; line-height: 1.35; }
        .lv-offer-list li { margin: 2px 0; }
        .lv-offer-price-block { margin: 0; }
        .lv-offer-instant {
          display: block; color: #3d7fd6; font-size: 13px; font-weight: 800;
          letter-spacing: 1px; margin-bottom: 2px;
        }
        .lv-offer-price {
          font-size: 44px; font-weight: 900; color: #111; line-height: 1;
          text-shadow: 0 1px 0 rgba(0,0,0,.08);
        }
        .lv-offer-pct {
          display: block; color: ${RED}; font-size: 22px; font-weight: 900;
          margin: 2px 0 0;
        }
        .lv-offer-actions { display: flex; flex-direction: column; gap: 8px; }
        .lv-offer-cta {
          display: inline-flex; align-items: center; justify-content: center;
          width: 100%; padding: 14px 20px; border-radius: 8px;
          background: linear-gradient(180deg, #ffb347, ${ORANGE} 45%, #e07800);
          color: #fff; font-weight: 900; font-size: 20px; letter-spacing: 1px;
          text-decoration: none; box-shadow: 0 6px 16px rgba(243,146,0,.4);
          box-sizing: border-box;
        }
        .lv-offer-cta:hover { filter: brightness(1.05); }
        .lv-offer-guarantee {
          margin: 0; font-size: 12px; font-weight: 800; color: ${BLUE};
          letter-spacing: .5px;
        }
        @media (max-width: 760px) {
          .lv-offers-heading { font-size: 22px; }
          .lv-offer-pod { grid-template-columns: 1fr; padding: 10px; gap: 10px; }
          .lv-offer-visual { aspect-ratio: 1 / 1; min-height: 220px; }
          .lv-offer-copy { height: auto; justify-content: flex-start; gap: 10px; }
          .lv-offer-title { font-size: 22px; }
          .lv-offer-list { font-size: 15px; }
          .lv-offer-price { font-size: 40px; }
          .lv-offer-pct { font-size: 20px; }
          .lv-offer-cta { font-size: 18px; }
        }
      `}</style>

      <div className="lv-offers-wrap">
        {!embed && (
          <h1 className="lv-offers-heading">Special Internet-Only Offer</h1>
        )}
        {embed && (
          <h2 className="lv-offers-heading">Special Internet-Only Offer</h2>
        )}
        <div className="lv-offers-list">
          {products.map((p) => (
            <OfferCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
