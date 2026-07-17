import { goToShopifyCheckout, fetchFirstProduct, productVariants } from "./shopify";

/** Ruta al landing estático (clone) — funciona con base relativa en subcarpetas del bucket. */
export const CLONE_HOME = `${import.meta.env.BASE_URL}clone/index.html`;

/** URL absoluta al preview del producto (SPA), segura desde iframes en /clone/. */
export function appHashUrl(route: string) {
  const normalized = route.startsWith("/") ? route : `/${route}`;
  const hash = `#${normalized}`;
  if (typeof window !== "undefined") {
    return `${window.location.origin}/index.html${hash}`;
  }
  return `./index.html${hash}`;
}

/** Navega el frame superior al preview (nunca al checkout). */
export function goToProductPreview(handle: string) {
  const url = appHashUrl(`/product?handle=${encodeURIComponent(handle)}`);
  try {
    (window.top ?? window).location.assign(url);
  } catch {
    window.location.assign(url);
  }
}

/**
 * Siempre lleva al checkout nativo de Shopify (nunca al formulario falso).
 */
export function goToCheckout(query: string) {
  // shopify:handle:gid://shopify/ProductVariant/123
  if (query.startsWith("shopify:")) {
    const parts = query.split(":");
    const variantRaw = parts.slice(2).join(":");
    if (variantRaw) {
      goToShopifyCheckout(decodeURIComponent(variantRaw), 1);
      return;
    }
  }

  if (query.includes("variant=")) {
    const params = new URLSearchParams(query.includes("?") ? query.split("?").pop()! : query);
    const variant = params.get("variant");
    if (variant) {
      goToShopifyCheckout(variant, 1);
      return;
    }
  }

  // Deal estático u otro → primer producto de Shopify
  void (async () => {
    try {
      const product = await fetchFirstProduct();
      const variant = product ? productVariants(product)[0] : null;
      if (variant) {
        goToShopifyCheckout(variant.id, 1);
        return;
      }
    } catch {
      // fall through
    }
    // Último recurso: página de redirección
    const hash = `#/checkout`;
    const top = window.top ?? window;
    if (top.location.pathname.includes("/clone/")) {
      top.location.href = new URL(`../index.html${hash}`, top.location.href).href;
      return;
    }
    top.location.href = new URL(`${import.meta.env.BASE_URL}index.html${hash}`, window.location.href).href;
  })();
}
