import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { DEALS, resolveDealKey } from "../lib/deals";
import {
  fetchProductByHandle,
  fmtMoney,
  productImages,
  productVariants,
  variantCompare,
  variantPrice,
} from "../lib/shopify";
import { CLONE_HOME } from "../lib/static-hosting";

const BLUE = "#054497";
const RED = "#d40000";
const ORANGE = "#f39200";

type Summary = {
  title: string;
  label: string;
  image: string;
  price: number;
  retail: number;
  currency: string;
  editTo: string;
};

export default function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const deal = searchParams.get("deal");
  const handle = searchParams.get("handle");
  const variantId = searchParams.get("variant");

  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pay, setPay] = useState<"card" | "paypal">("card");
  const [placed, setPlaced] = useState(false);

  useEffect(() => {
    document.title = "ProstaGenix - Checkout Seguro";
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (handle) {
          const product = await fetchProductByHandle(handle);
          if (!product) throw new Error("Producto no encontrado");
          const variants = productVariants(product);
          const selected =
            variants.find((v) => v.id === variantId) ?? variants[0];
          if (!selected) throw new Error("Variante no encontrada");
          if (cancelled) return;
          setSummary({
            title: product.title,
            label:
              selected.title === "Default Title" ? product.title : selected.title,
            image: productImages(product)[0],
            price: variantPrice(selected),
            retail: variantCompare(selected),
            currency: selected.price.currencyCode,
            editTo: `/product?handle=${encodeURIComponent(handle)}`,
          });
          return;
        }

        const d = DEALS[resolveDealKey(deal)];
        if (cancelled) return;
        setSummary({
          title: "ProstaGenix™",
          label: d.label,
          image: "https://www.prostagenix.com/images/product/bottle_box.png",
          price: d.price,
          retail: d.retail,
          currency: "PEN",
          editTo: `/product?deal=${resolveDealKey(deal)}`,
        });
      } catch (e) {
        if (!cancelled) setError(String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [deal, handle, variantId]);

  if (placed && summary) {
    return (
      <div style={{ minHeight: "100vh", background: "#f7f8fb", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Montserrat',system-ui,sans-serif", padding: 24 }}>
        <div style={{ maxWidth: 520, background: "#fff", borderRadius: 16, padding: 32, textAlign: "center", border: "1px solid #e3e6ee" }}>
          <div style={{ fontSize: 48 }}>✅</div>
          <h1 style={{ color: BLUE, fontWeight: 900, marginTop: 8 }}>¡Pedido Confirmado!</h1>
          <p style={{ color: "#333" }}>Recibirás un correo con los detalles de tu envío. Gracias por confiar en ProstaGenix.</p>
          <a href={CLONE_HOME} style={{ display: "inline-block", marginTop: 16, background: ORANGE, color: "#fff", padding: "12px 20px", borderRadius: 10, fontWeight: 900, textDecoration: "none" }}>Volver al inicio</a>
        </div>
      </div>
    );
  }

  if (error) {
    return <div style={{ padding: 24, fontFamily: "system-ui" }}>Error: {error}</div>;
  }
  if (!summary) {
    return <div style={{ padding: 24, fontFamily: "system-ui", textAlign: "center" }}>Cargando checkout…</div>;
  }

  const shipping = 0;
  const tax = 0;
  const total = +(summary.price + shipping + tax).toFixed(2);

  return (
    <div style={{ background: "#f7f8fb", minHeight: "100vh", color: "#0b1a3a", fontFamily: "'Montserrat',system-ui,sans-serif" }}>
      <style>{`
        .lv-co-grid { display: grid; grid-template-columns: minmax(0,1.3fr) minmax(0,1fr); gap: 28px; max-width: 1100px; margin: 0 auto; padding: 28px 20px; }
        .lv-co-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .lv-co-aside { position: sticky; top: 20px; }
        @media (max-width: 860px) {
          .lv-co-grid { grid-template-columns: 1fr; gap: 16px; padding: 16px 12px; }
          .lv-co-aside { position: static; order: -1; }
          .lv-co-form { padding: 18px !important; }
          .lv-co-h2 { font-size: 17px !important; }
        }
        @media (max-width: 420px) {
          .lv-co-row2 { grid-template-columns: 1fr; }
        }
      `}</style>
      <div style={{ background: BLUE, color: "#fff", textAlign: "center", padding: "10px 16px", fontWeight: 700, fontSize: 13, letterSpacing: 1 }}>
        🔒 CHECKOUT 100% SEGURO · Envío GRATIS · Garantía 90 Días
      </div>

      <header style={{ borderBottom: "1px solid #eee", padding: "16px 24px", maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff" }}>
        <a href={CLONE_HOME} style={{ color: BLUE, fontWeight: 900, fontSize: 24, textDecoration: "none" }}>Prosta<span style={{ color: RED }}>Genix</span></a>
        <span style={{ color: "#555", fontSize: 13 }}>🔒 Conexión Segura SSL</span>
      </header>

      <main className="lv-co-grid">
        <form className="lv-co-form" onSubmit={(e) => { e.preventDefault(); setPlaced(true); }} style={{ background: "#fff", borderRadius: 14, padding: 24, border: "1px solid #e3e6ee", minWidth: 0 }}>
          <h2 className="lv-co-h2" style={{ margin: 0, color: BLUE, fontWeight: 900, fontSize: 20 }}>1. Información de Contacto</h2>
          <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
            <input required type="email" placeholder="Correo electrónico" style={inp} />
            <div className="lv-co-row2">
              <input required placeholder="Nombre" style={inp} />
              <input required placeholder="Apellido" style={inp} />
            </div>
            <input required placeholder="Teléfono" style={inp} />
          </div>

          <h2 className="lv-co-h2" style={{ marginTop: 24, color: BLUE, fontWeight: 900, fontSize: 20 }}>2. Dirección de Envío</h2>
          <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
            <input required placeholder="Dirección" style={inp} />
            <div className="lv-co-row2">
              <input required placeholder="Ciudad" style={inp} />
              <input required placeholder="Código Postal" style={inp} />
            </div>
            <input required placeholder="País" defaultValue="Perú" style={inp} />
          </div>

          <h2 className="lv-co-h2" style={{ marginTop: 24, color: BLUE, fontWeight: 900, fontSize: 20 }}>3. Método de Pago</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
            {(["card", "paypal"] as const).map((k) => (
              <button type="button" key={k} onClick={() => setPay(k)} style={{
                border: `2px solid ${pay === k ? BLUE : "#e3e6ee"}`, background: pay === k ? "#eef3fb" : "#fff",
                borderRadius: 10, padding: "12px", cursor: "pointer", fontWeight: 800, color: "#0b1a3a",
              }}>{k === "card" ? "💳 Tarjeta" : "🅿️ PayPal"}</button>
            ))}
          </div>

          {pay === "card" && (
            <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
              <input required placeholder="Número de tarjeta" style={inp} />
              <div className="lv-co-row2">
                <input required placeholder="MM / AA" style={inp} />
                <input required placeholder="CVV" style={inp} />
              </div>
              <input required placeholder="Nombre en la tarjeta" style={inp} />
            </div>
          )}

          <button type="submit" style={{
            marginTop: 22, width: "100%", padding: "18px", borderRadius: 12, border: 0, cursor: "pointer",
            background: `linear-gradient(180deg, ${ORANGE}, #d97900)`, color: "#fff",
            fontWeight: 900, fontSize: 17, letterSpacing: 1, boxShadow: "0 8px 20px rgba(243,146,0,0.35)",
          }}>PAGAR {fmtMoney(total, summary.currency)} →</button>

          <div style={{ marginTop: 14, display: "flex", justifyContent: "space-around", fontSize: 12, color: "#555" }}>
            <span>🔒 Pago Seguro</span><span>🔄 Garantía 90 Días</span><span>🚚 Envío Gratis</span>
          </div>
        </form>

        <aside className="lv-co-aside" style={{ background: "#fff", borderRadius: 14, padding: 22, border: "1px solid #e3e6ee", height: "fit-content", minWidth: 0 }}>
          <h3 style={{ margin: 0, color: BLUE, fontWeight: 900 }}>Resumen del Pedido</h3>
          <div style={{ marginTop: 14, padding: 14, background: "#f7f8fb", borderRadius: 10, display: "flex", gap: 12, alignItems: "center" }}>
            <img src={summary.image} alt="" style={{ width: 70, height: 70, objectFit: "contain" }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 14 }}>{summary.title}</div>
              <div style={{ fontSize: 12, color: "#666" }}>{summary.label}</div>
            </div>
            <div style={{ fontWeight: 900, whiteSpace: "nowrap" }}>{fmtMoney(summary.price, summary.currency)}</div>
          </div>

          <div style={{ marginTop: 14, fontSize: 14, display: "grid", gap: 6 }}>
            <Row k="Subtotal" v={fmtMoney(summary.price, summary.currency)} />
            <Row k="Descuento" v={`- ${fmtMoney(Math.max(0, summary.retail - summary.price), summary.currency)}`} color="#2f7a3a" />
            <Row k="Envío" v="GRATIS" color="#2f7a3a" />
            <Row k="Impuestos" v={fmtMoney(tax, summary.currency)} />
          </div>
          <div style={{ borderTop: "1px dashed #ccc", marginTop: 12, paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontWeight: 800 }}>Total</span>
            <span style={{ fontWeight: 900, fontSize: 22, color: BLUE, whiteSpace: "nowrap" }}>{fmtMoney(total, summary.currency)}</span>
          </div>

          <div style={{ marginTop: 14, padding: 12, background: "#fff5f5", border: `1px solid ${RED}`, borderRadius: 10, fontSize: 12, color: "#5a1010" }}>
            🔥 Precio con descuento válido solo por hoy.
          </div>

          <Link to={summary.editTo} style={{ display: "inline-block", marginTop: 14, color: BLUE, fontWeight: 700, textDecoration: "none", fontSize: 13 }}>← Editar pedido</Link>
        </aside>
      </main>
    </div>
  );
}

function Row({ k, v, color }: { k: string; v: string; color?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span style={{ color: "#555" }}>{k}</span>
      <span style={{ color: color ?? "#0b1a3a", fontWeight: 700 }}>{v}</span>
    </div>
  );
}

const inp: React.CSSProperties = {
  padding: "12px 14px", border: "1px solid #d7dbe8", borderRadius: 10, fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box", fontFamily: "inherit",
};
