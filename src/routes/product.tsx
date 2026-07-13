import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getExcalvoProduct, type ShopifyProduct } from "../lib/shopify";
import { useCartStore } from "../stores/cartStore";

type DealKey = "single" | "sale5" | "sale18" | "sale71";

const DEALS: Record<DealKey, { label: string; quantity: number; badge?: string }> = {
  single: { label: "Compra 1 oferta 2x1", quantity: 1 },
  sale5: { label: "Compra 2 ofertas 2x1", quantity: 2, badge: "MÁS POPULAR" },
  sale18: { label: "Compra 3 ofertas 2x1", quantity: 3, badge: "MEJOR OFERTA" },
  sale71: { label: "Compra 4 ofertas 2x1", quantity: 4 },
};

function useCountdown() {
  const target = useMemo(() => {
    const date = new Date();
    date.setHours(23, 59, 59, 999);
    return date.getTime();
  }, []);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const diff = Math.max(0, target - now);
  return {
    h: String(Math.floor(diff / 3_600_000)).padStart(2, "0"),
    m: String(Math.floor((diff % 3_600_000) / 60_000)).padStart(2, "0"),
    s: String(Math.floor((diff % 60_000) / 1000)).padStart(2, "0"),
  };
}

function money(amount: string | number, currencyCode = "PEN") {
  const symbol = currencyCode === "PEN" ? "S/" : currencyCode;
  return `${symbol}${Number(amount).toFixed(2)}`;
}

export default function ProductPage() {
  const [searchParams] = useSearchParams();
  const initialDeal = (searchParams.get("deal") || "single") as DealKey;
  const [selected, setSelected] = useState<DealKey>(DEALS[initialDeal] ? initialDeal : "single");
  const [product, setProduct] = useState<ShopifyProduct | null>(null);
  const [heroIdx, setHeroIdx] = useState(0);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [checkoutError, setCheckoutError] = useState("");
  const { h, m, s } = useCountdown();
  const addItem = useCartStore((state) => state.addItem);
  const isLoading = useCartStore((state) => state.isLoading);

  useEffect(() => {
    let mounted = true;
    getExcalvoProduct()
      .then((result) => {
        if (mounted) setProduct(result);
      })
      .catch(() => {
        if (mounted) setProduct(null);
      })
      .finally(() => {
        if (mounted) setLoadingProduct(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const variant = product?.node.variants.edges.find((edge) => edge.node.availableForSale)?.node;
  const images = product?.node.images.edges.map((edge) => edge.node) || [];
  const currentImage = images[heroIdx] || images[0];
  const deal = DEALS[selected];
  const unitPrice = Number(variant?.price.amount || 0);
  const total = unitPrice * deal.quantity;

  const handleCheckout = async () => {
    if (!product || !variant) return;
    setCheckoutError("");
    try {
      await addItem({
        product,
        variantId: variant.id,
        variantTitle: variant.title,
        price: variant.price,
        quantity: deal.quantity,
        selectedOptions: variant.selectedOptions || [],
      });
      const checkoutUrl = useCartStore.getState().getCheckoutUrl();
      if (!checkoutUrl) {
        setCheckoutError("No se pudo crear el checkout. Intenta otra vez.");
        return;
      }
      window.open(checkoutUrl, "_blank", "noopener");
    } catch {
      setCheckoutError("No se pudo conectar con el checkout. Intenta otra vez.");
    }
  };

  if (loadingProduct) return <CenteredMessage title="Cargando producto..." text="" />;
  if (!product) {
    return <CenteredMessage title="No products found" text="No encontramos el producto Excalvo en Shopify." />;
  }

  return (
    <main className="excalvo-page">
      <style>{styles}</style>
      <section className="excalvo-layout">
        <div className="excalvo-left">
          <div className="excalvo-gallery">
            <div className="excalvo-thumbs">
              {images.map((image, index) => (
                <button key={image.url} type="button" className={index === heroIdx ? "active" : ""} onClick={() => setHeroIdx(index)} aria-label={`Ver imagen ${index + 1}`}>
                  <img src={image.url} alt={image.altText || product.node.title} />
                </button>
              ))}
            </div>
            <div className="excalvo-hero">
              <div className="excalvo-hero-copy">
                <div className="excalvo-seal">Elección de especialistas capilares</div>
                <h2>Recupera la confianza en tu cabello</h2>
                <p>Tratamiento capilar Excalvo para fortalecer y revitalizar tu cabello.</p>
              </div>
              {currentImage ? <img className="excalvo-main-img" src={currentImage.url} alt={currentImage.altText || product.node.title} /> : null}
              <button className="ingredients-btn" type="button">Ingredientes</button>
            </div>
          </div>
          <div className="specialist-note">
            <strong>Elección de tricólogos</strong>
            <span>Producto capilar conectado con checkout real de Shopify.</span>
          </div>
        </div>

        <div className="excalvo-right">
          <div className="rating-row">
            <span className="no-reviews">Sin reseñas todavía</span>
            <span className="badge">RECOMENDADO POR TRICÓLOGOS</span>
          </div>
          <h1>{product.node.title}</h1>
          <div className="benefit-grid">
            <Benefit icon="🛡️" label="Bloquea la DHT" />
            <Benefit icon="🌱" label="100% Natural" />
            <Benefit icon="⚗️" label="Fórmula capilar" />
          </div>
          <div className="hot-sale">
            <span className="fire">♨</span>
            <div><strong>HOT SALE</strong><p>Ordena hoy para recibir regalos GRATIS</p></div>
            <div className="timer"><TimeBox value={h} label="HRS" /><TimeBox value={m} label="MIN" /><TimeBox value={s} label="SEG" /></div>
          </div>
          <div className="deal-list">
            {(Object.keys(DEALS) as DealKey[]).map((key) => {
              const option = DEALS[key];
              const active = selected === key;
              const optionTotal = unitPrice * option.quantity;
              return (
                <button key={key} type="button" className={`deal-card ${active ? "active" : ""}`} onClick={() => setSelected(key)}>
                  {option.badge ? <span className="deal-badge">{option.badge}</span> : null}
                  <span className="radio-dot">{active ? <span /> : null}</span>
                  <span className="deal-text"><strong>{option.label}</strong><small>{option.quantity} {option.quantity === 1 ? "unidad" : "unidades"} · {variant?.title || "Default Title"}</small></span>
                  <span className="deal-price">{money(optionTotal, variant?.price.currencyCode)}</span>
                </button>
              );
            })}
          </div>
          <div className="total-row"><span>Total</span><strong>{money(total, variant?.price.currencyCode)}</strong></div>
          <button className="checkout-btn" type="button" onClick={handleCheckout} disabled={!variant || isLoading}>{isLoading ? "Creando checkout..." : "Agregar al carrito →"}</button>
          {checkoutError ? <p className="checkout-error">{checkoutError}</p> : null}
          <div className="trust-row"><span>Garantía de devolución</span><span>Envío rápido</span><span>Pago seguro</span></div>
          <Link className="back-link" to="/">← Volver a la oferta</Link>
        </div>
      </section>
    </main>
  );
}

function Benefit({ icon, label }: { icon: string; label: string }) {
  return <div className="benefit"><span>{icon}</span><strong>{label}</strong></div>;
}

function TimeBox({ value, label }: { value: string; label: string }) {
  return <span><strong>{value}</strong><small>{label}</small></span>;
}

function CenteredMessage({ title, text }: { title: string; text: string }) {
  return <main className="centered-message"><style>{styles}</style><div><h1>{title}</h1>{text ? <p>{text}</p> : null}<Link to="/">Volver</Link></div></main>;
}

const styles = `
  html, body { margin: 0; overflow-x: hidden; background: #fff; }
  .excalvo-page { min-height: 100vh; background: #fff; color: #101a2d; font-family: Montserrat, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
  .excalvo-layout { max-width: 1500px; margin: 0 auto; padding: 56px 44px; display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(460px, .95fr); gap: 56px; align-items: start; }
  .excalvo-gallery { display: grid; grid-template-columns: 96px minmax(0, 1fr); gap: 18px; }
  .excalvo-thumbs { display: grid; align-content: start; gap: 14px; }
  .excalvo-thumbs button { width: 78px; height: 92px; border: 1px solid #e6ebf3; border-radius: 10px; background: #fff; padding: 5px; cursor: pointer; overflow: hidden; }
  .excalvo-thumbs button.active { border: 3px solid #3b82f6; }
  .excalvo-thumbs img { width: 100%; height: 100%; object-fit: contain; }
  .excalvo-hero { position: relative; min-height: 610px; border-radius: 18px; overflow: hidden; background: linear-gradient(90deg, #f4dfd7 0%, #f7e8df 42%, #d9e9df 100%); display: flex; align-items: center; justify-content: center; padding: 36px; }
  .excalvo-hero-copy { position: absolute; top: 38px; left: 38px; z-index: 2; width: min(420px, 56%); }
  .excalvo-seal { width: fit-content; max-width: 310px; background: rgba(255,255,255,.96); border-radius: 10px; box-shadow: 0 10px 24px rgba(15,23,42,.14); padding: 13px 18px; font-family: Georgia, serif; font-size: 13px; line-height: 1.25; }
  .excalvo-hero-copy h2 { margin: 26px 0 12px; font-family: Georgia, serif; font-size: 37px; line-height: 1.15; color: #1f1f24; font-weight: 500; }
  .excalvo-hero-copy p { margin: 0; max-width: 330px; font-size: 15px; line-height: 1.35; color: #1f1f24; font-weight: 700; }
  .excalvo-main-img { max-width: 68%; max-height: 440px; object-fit: contain; filter: drop-shadow(0 18px 28px rgba(15, 23, 42, .2)); transform: translate(82px, 58px); }
  .ingredients-btn { position: absolute; left: 50%; bottom: 26px; transform: translateX(-50%); border: 3px solid #2563eb; background: #fff; color: #1d4ed8; border-radius: 999px; padding: 16px 42px; font-size: 20px; font-weight: 900; cursor: pointer; box-shadow: 0 12px 24px rgba(15,23,42,.14); }
  .specialist-note { margin: 42px 0 0 96px; display: grid; gap: 16px; font-size: 20px; color: #26344d; }
  .specialist-note strong { font-size: 23px; color: #101a2d; }
  .excalvo-right h1 { margin: 16px 0 22px; font-size: 36px; line-height: 1.14; font-weight: 950; letter-spacing: 0; }
  .rating-row { display: flex; flex-wrap: wrap; align-items: center; gap: 14px; color: #4c5b73; font-weight: 700; }
  .no-reviews { color: #64748b; }
  .badge, .deal-badge { background: #3b82f6; color: #fff; border-radius: 999px; padding: 7px 16px; font-size: 13px; font-weight: 900; letter-spacing: .02em; }
  .benefit-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin: 22px 0 30px; }
  .benefit { display: grid; justify-items: center; gap: 10px; text-align: center; font-size: 14px; }
  .benefit span { width: 58px; height: 58px; display: grid; place-items: center; border-radius: 50%; background: #eff6ff; font-size: 24px; }
  .hot-sale { border: 2px solid #ff434a; border-radius: 16px; padding: 20px 24px; display: grid; grid-template-columns: 40px minmax(0, 1fr) auto; gap: 16px; align-items: center; color: #ff434a; }
  .fire { font-size: 34px; }
  .hot-sale strong { font-size: 20px; }
  .hot-sale p { margin: 2px 0 0; font-size: 14px; font-weight: 800; }
  .timer { display: flex; gap: 8px; }
  .timer span { min-width: 52px; padding: 8px 7px; border-radius: 8px; background: #ff434a; color: #fff; display: grid; justify-items: center; line-height: 1; }
  .timer strong { font-size: 18px; }
  .timer small { margin-top: 4px; font-size: 10px; font-weight: 900; }
  .deal-list { margin-top: 20px; display: grid; gap: 14px; }
  .deal-card { min-height: 104px; position: relative; display: grid; grid-template-columns: 28px minmax(0,1fr) auto; align-items: center; gap: 16px; width: 100%; padding: 20px 24px; border: 2px solid #e2e8f0; border-radius: 16px; background: #fff; text-align: left; cursor: pointer; color: #101a2d; }
  .deal-card.active { border-color: #3b82f6; background: #eff6ff; }
  .deal-badge { position: absolute; top: -13px; left: 24px; padding: 5px 14px; font-size: 12px; }
  .radio-dot { width: 22px; height: 22px; border: 3px solid #cbd5e1; border-radius: 50%; display: grid; place-items: center; }
  .deal-card.active .radio-dot { border-color: #3b82f6; }
  .radio-dot span { width: 10px; height: 10px; border-radius: 50%; background: #3b82f6; }
  .deal-text { display: grid; gap: 4px; }
  .deal-text strong { font-size: 20px; }
  .deal-text small { color: #64748b; font-size: 14px; }
  .deal-price { font-size: 25px; font-weight: 950; white-space: nowrap; }
  .total-row { display: flex; justify-content: space-between; align-items: baseline; margin: 22px 0 14px; font-size: 16px; color: #64748b; }
  .total-row strong { color: #101a2d; font-size: 31px; }
  .checkout-btn { width: 100%; border: 0; border-radius: 999px; background: #172033; color: #fff; padding: 19px 22px; font-size: 17px; font-weight: 950; letter-spacing: .05em; text-transform: uppercase; cursor: pointer; }
  .checkout-btn:disabled { opacity: .65; cursor: wait; }
  .checkout-error { color: #dc2626; font-weight: 800; text-align: center; }
  .trust-row { margin-top: 18px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; text-align: center; color: #475569; font-size: 13px; }
  .back-link { display: inline-block; margin-top: 20px; color: #0f55bd; font-weight: 800; text-decoration: none; }
  .centered-message { min-height: 100vh; display: grid; place-items: center; padding: 24px; font-family: Montserrat, system-ui, sans-serif; background: #fff; color: #101a2d; }
  .centered-message div { max-width: 520px; text-align: center; }
  .centered-message a { color: #0f55bd; font-weight: 800; }
  @media (max-width: 980px) {
    .excalvo-layout { grid-template-columns: 1fr; padding: 22px 16px; gap: 26px; }
    .excalvo-gallery { grid-template-columns: 1fr; }
    .excalvo-thumbs { display: flex; overflow-x: auto; order: 2; }
    .excalvo-hero { min-height: 430px; }
    .excalvo-main-img { max-height: 300px; transform: translate(50px, 50px); }
    .specialist-note { margin-left: 0; }
    .hot-sale { grid-template-columns: 32px minmax(0,1fr); }
    .timer { grid-column: 1 / -1; }
  }
  @media (max-width: 560px) {
    .excalvo-right h1 { font-size: 28px; }
    .benefit-grid, .trust-row { grid-template-columns: 1fr; }
    .deal-card { grid-template-columns: 24px minmax(0,1fr); }
    .deal-price { grid-column: 2; font-size: 23px; }
    .excalvo-hero-copy { width: 62%; top: 20px; left: 18px; }
    .excalvo-hero-copy h2 { font-size: 24px; }
    .excalvo-hero-copy p { font-size: 12px; }
    .excalvo-seal { font-size: 10px; padding: 9px 11px; }
    .ingredients-btn { font-size: 16px; padding: 12px 26px; }
  }
`;