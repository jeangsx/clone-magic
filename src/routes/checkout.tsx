import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  fetchFirstProduct,
  fetchProductByHandle,
  goToShopifyCheckout,
  productVariants,
} from "../lib/shopify";
import { CLONE_HOME } from "../lib/static-hosting";

/**
 * Ya no hay checkout falso: esta ruta solo redirige al checkout nativo de Shopify.
 */
export default function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const handle = searchParams.get("handle");
  const variantId = searchParams.get("variant");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Redirigiendo al checkout…";
    let cancelled = false;

    (async () => {
      try {
        // Si ya tenemos la variante, ir directo (sin esperar fetch)
        if (variantId) {
          goToShopifyCheckout(decodeURIComponent(variantId), 1);
          return;
        }

        let product = handle ? await fetchProductByHandle(handle) : null;
        if (!product) product = await fetchFirstProduct();
        if (cancelled) return;
        if (!product) throw new Error("No hay productos en Shopify");

        const variants = productVariants(product);
        const selected = variants[0];
        if (!selected) throw new Error("Sin variantes disponibles");

        goToShopifyCheckout(selected.id, 1);
      } catch (e) {
        if (!cancelled) setError(String(e));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [handle, variantId]);

  if (error) {
    return (
      <div style={{ padding: 32, fontFamily: "system-ui", textAlign: "center" }}>
        <p>No se pudo abrir el checkout de Shopify.</p>
        <p style={{ color: "#666", fontSize: 14 }}>{error}</p>
        <a href={CLONE_HOME} style={{ color: "#054497", fontWeight: 700 }}>
          Volver al inicio
        </a>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui",
        background: "#f7f8fb",
        color: "#0b1a3a",
      }}
    >
      <p style={{ fontWeight: 700 }}>Redirigiendo al checkout de Shopify…</p>
    </div>
  );
}
