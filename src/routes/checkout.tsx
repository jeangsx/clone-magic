import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { useCartStore } from "../stores/cartStore";

export default function CheckoutPage() {
  const checkoutUrl = useCartStore((state) => state.checkoutUrl);

  const openCheckout = () => {
    if (checkoutUrl) window.open(checkoutUrl, "_blank", "noopener");
  };

  return (
    <main style={pageStyle}>
      <section style={panelStyle}>
        <h1 style={{ margin: 0, fontSize: 28 }}>Checkout seguro</h1>
        {checkoutUrl ? (
          <>
            <p style={textStyle}>Tu carrito Shopify ya está listo.</p>
            <button type="button" onClick={openCheckout} style={buttonStyle}>Abrir checkout seguro →</button>
          </>
        ) : (
          <>
            <p style={textStyle}>Tu carrito está vacío. Elige una oferta para crear tu checkout.</p>
            <Link to="/product?deal=single" style={linkButtonStyle}>Ver oferta Excalvo</Link>
          </>
        )}
        <Link to="/" style={{ color: "#1d4ed8", fontWeight: 800, textDecoration: "none" }}>← Volver al inicio</Link>
      </section>
    </main>
  );
}

const pageStyle: CSSProperties = { minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#f8fafc", color: "#101a2d", fontFamily: "Montserrat, system-ui, sans-serif" };
const panelStyle: CSSProperties = { width: "min(100%, 520px)", display: "grid", gap: 18, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 28, textAlign: "center" };
const textStyle: CSSProperties = { margin: 0, color: "#475569", lineHeight: 1.55 };
const buttonStyle: CSSProperties = { border: 0, borderRadius: 999, background: "#172033", color: "#fff", padding: "15px 22px", fontWeight: 900, cursor: "pointer" };
const linkButtonStyle: CSSProperties = { ...buttonStyle, display: "inline-block", textDecoration: "none" };