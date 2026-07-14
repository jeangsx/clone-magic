import { useEffect, useState } from "react";

const SHOPIFY_DOMAIN = "k3btq8-6r.myshopify.com";
const SHOPIFY_TOKEN = "e703eaa742c1c9a73964e3d646ec51fd";
const SHOPIFY_URL = `https://${SHOPIFY_DOMAIN}/api/2025-07/graphql.json`;

type Variant = {
  id: string;
  title: string;
  availableForSale: boolean;
  sku: string | null;
  price: { amount: string; currencyCode: string };
  compareAtPrice: { amount: string; currencyCode: string } | null;
  selectedOptions: { name: string; value: string }[];
};

type Product = {
  id: string;
  title: string;
  handle: string;
  description: string;
  vendor: string;
  productType: string;
  tags: string[];
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  images: { edges: { node: { url: string; altText: string | null } }[] };
  options: { name: string; values: string[] }[];
  variants: { edges: { node: Variant }[] };
};

const QUERY = `query($cursor:String){products(first:50,after:$cursor){pageInfo{hasNextPage endCursor}edges{node{id title handle description vendor productType tags priceRange{minVariantPrice{amount currencyCode}}images(first:10){edges{node{url altText}}}options{name values}variants(first:50){edges{node{id title availableForSale sku price{amount currencyCode}compareAtPrice{amount currencyCode}selectedOptions{name value}}}}}}}}`;

async function fetchAll(): Promise<Product[]> {
  const all: Product[] = [];
  let cursor: string | null = null;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const res: Response = await fetch(SHOPIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": SHOPIFY_TOKEN,
      },
      body: JSON.stringify({ query: QUERY, variables: { cursor } }),
    });
    const j: { data: { products: { pageInfo: { hasNextPage: boolean; endCursor: string }; edges: { node: Product }[] } }; errors?: unknown } = await res.json();
    if (j.errors) throw new Error(JSON.stringify(j.errors));
    const p = j.data.products;
    all.push(...p.edges.map((e) => e.node));
    if (!p.pageInfo.hasNextPage) break;
    cursor = p.pageInfo.endCursor;
  }
  return all;
}

function fmt(amount: string, cur: string) {
  const n = Number(amount);
  return `${cur === "PEN" ? "S/ " : cur + " "}${n.toFixed(2)}`;
}

export default function ProductosPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    document.title = "Catálogo Shopify — Productos y variantes";
    fetchAll().then(setProducts).catch((e) => setError(String(e)));
  }, []);

  if (error) return <div style={{ padding: 24, fontFamily: "system-ui" }}>Error: {error}</div>;
  if (!products) return <div style={{ padding: 24, fontFamily: "system-ui" }}>Cargando catálogo…</div>;

  const filtered = products.filter((p) => p.title.toLowerCase().includes(q.toLowerCase()));
  const totalVariants = products.reduce((s, p) => s + p.variants.edges.length, 0);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: "#f7f8fb", minHeight: "100vh", color: "#0b1a3a" }}>
      <header style={{ background: "#054497", color: "#fff", padding: "18px 20px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900 }}>Catálogo Shopify</div>
            <div style={{ fontSize: 13, opacity: 0.85 }}>{products.length} productos · {totalVariants} variantes · {SHOPIFY_DOMAIN}</div>
          </div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar producto…"
            style={{ padding: "10px 14px", borderRadius: 8, border: 0, minWidth: 260, fontSize: 14 }}
          />
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: 20, display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))" }}>
        {filtered.map((p) => {
          const img = p.images.edges[0]?.node.url;
          const variants = p.variants.edges.map((e) => e.node);
          const hasRealVariants = !(variants.length === 1 && variants[0].title === "Default Title");
          return (
            <article key={p.id} style={{ background: "#fff", borderRadius: 12, border: "1px solid #e3e6ee", overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div style={{ background: "#eef3fb", aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {img ? <img src={img} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "contain" }} loading="lazy" /> : <span style={{ color: "#888" }}>Sin imagen</span>}
              </div>
              <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, lineHeight: 1.25 }}>{p.title}</h2>
                <div style={{ fontSize: 12, color: "#666" }}>{p.vendor || "—"} · {p.images.edges.length} img</div>
                <div style={{ fontWeight: 900, fontSize: 18, color: "#054497" }}>
                  Desde {fmt(p.priceRange.minVariantPrice.amount, p.priceRange.minVariantPrice.currencyCode)}
                </div>
                {hasRealVariants && (
                  <div style={{ marginTop: 4 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, color: "#888", marginBottom: 4 }}>VARIANTES ({variants.length})</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {variants.map((v) => (
                        <div key={v.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "6px 8px", background: "#f7f8fb", borderRadius: 6 }}>
                          <span style={{ fontWeight: 700 }}>{v.title}</span>
                          <span style={{ color: v.availableForSale ? "#2f7a3a" : "#d40000", fontWeight: 700 }}>
                            {fmt(v.price.amount, v.price.currencyCode)} · {v.availableForSale ? "Stock" : "Agotado"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {!hasRealVariants && (
                  <div style={{ fontSize: 11, color: variants[0]?.availableForSale ? "#2f7a3a" : "#d40000", fontWeight: 700 }}>
                    {variants[0]?.availableForSale ? "✓ En stock" : "✗ Agotado"} · 1 variante
                  </div>
                )}
                {p.options.length > 0 && (
                  <div style={{ fontSize: 11, color: "#666" }}>
                    Opciones: {p.options.map((o) => `${o.name} (${o.values.length})`).join(" · ")}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </main>
    </div>
  );
}