/** Ruta al landing estático (clone) — funciona con base relativa en subcarpetas del bucket. */
export const CLONE_HOME = `${import.meta.env.BASE_URL}clone/index.html`;

/** URL de la SPA con ruta hash, p. ej. `#/product?deal=sale18`. */
export function appHashUrl(route: string) {
  const normalized = route.startsWith("/") ? route : `/${route}`;
  return `${import.meta.env.BASE_URL}index.html#${normalized}`;
}

/** Navega al checkout desde la SPA o desde el iframe del preview en clone/. */
export function goToCheckout(deal: string) {
  const hash = `#/checkout?deal=${deal}`;
  const top = window.top ?? window;

  if (top.location.pathname.includes("/clone/")) {
    top.location.href = new URL(`../index.html${hash}`, top.location.href).href;
    return;
  }

  top.location.href = new URL(`${import.meta.env.BASE_URL}index.html${hash}`, window.location.href).href;
}
