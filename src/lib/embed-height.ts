import { useEffect } from "react";

export const EMBED_HEIGHT_MSG = "lv-embed-height";

function measureContentHeight(): number {
  const marked = document.querySelector<HTMLElement>("[data-embed-root]");
  const root = document.getElementById("root");
  const target = marked || (root?.firstElementChild as HTMLElement | null) || document.body;

  // Usar el contenido real, NO el viewport del iframe (evita el hueco blanco).
  const height = Math.ceil(
    Math.max(
      target.scrollHeight,
      target.offsetHeight,
      target.getBoundingClientRect().height,
    ),
  );
  return height;
}

/** Avisa al clone (padre) la altura real del contenido para que el iframe crezca/encoga. */
export function reportEmbedHeight() {
  if (window.parent === window) return;
  const height = measureContentHeight();
  if (!height || height < 40) return;
  window.parent.postMessage({ type: EMBED_HEIGHT_MSG, height }, "*");
}

/** Reporta altura al padre mientras el embed está visible / cambia de tamaño. */
export function useReportEmbedHeight(ready = true) {
  useEffect(() => {
    if (!ready || window.parent === window) return;

    const send = () => reportEmbedHeight();
    send();
    const t1 = window.setTimeout(send, 50);
    const t2 = window.setTimeout(send, 250);
    const t3 = window.setTimeout(send, 800);
    const raf = requestAnimationFrame(send);

    const root = document.querySelector("[data-embed-root]") || document.getElementById("root");
    const ro =
      typeof ResizeObserver !== "undefined" && root
        ? new ResizeObserver(() => send())
        : null;
    if (root) ro?.observe(root);

    window.addEventListener("load", send);
    window.addEventListener("resize", send);
    const onPing = (event: MessageEvent) => {
      if (event.data?.type === "lv-embed-height-ping") send();
    };
    window.addEventListener("message", onPing);

    const onImg = () => send();
    const imgs = Array.from(document.images);
    imgs.forEach((img) => {
      if (!img.complete) img.addEventListener("load", onImg);
    });

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      ro?.disconnect();
      window.removeEventListener("load", send);
      window.removeEventListener("resize", send);
      window.removeEventListener("message", onPing);
      imgs.forEach((img) => img.removeEventListener("load", onImg));
    };
  }, [ready]);
}
