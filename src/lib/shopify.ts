export const SHOPIFY_DOMAIN = "k3btq8-6r.myshopify.com";
export const SHOPIFY_TOKEN = "e703eaa742c1c9a73964e3d646ec51fd";
const SHOPIFY_URL = `https://${SHOPIFY_DOMAIN}/api/2025-07/graphql.json`;

export type ShopifyVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  sku: string | null;
  price: { amount: string; currencyCode: string };
  compareAtPrice: { amount: string; currencyCode: string } | null;
  selectedOptions: { name: string; value: string }[];
  image?: { url: string; altText: string | null } | null;
};

export type ShopifyProduct = {
  id: string;
  title: string;
  handle: string;
  description: string;
  vendor: string;
  productType: string;
  tags: string[];
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  compareAtPriceRange?: {
    minVariantPrice: { amount: string; currencyCode: string } | null;
  };
  images: { edges: { node: { url: string; altText: string | null } }[] };
  options: { name: string; values: string[] }[];
  variants: { edges: { node: ShopifyVariant }[] };
};

const PRODUCTS_QUERY = `query($cursor:String){products(first:50,after:$cursor){pageInfo{hasNextPage endCursor}edges{node{id title handle description vendor productType tags priceRange{minVariantPrice{amount currencyCode}}compareAtPriceRange{minVariantPrice{amount currencyCode}}images(first:10){edges{node{url altText}}}options{name values}variants(first:50){edges{node{id title availableForSale sku price{amount currencyCode}compareAtPrice{amount currencyCode}selectedOptions{name value}image{url altText}}}}}}}}`;

const PRODUCT_BY_HANDLE_QUERY = `query($handle:String!){product(handle:$handle){id title handle description vendor productType tags priceRange{minVariantPrice{amount currencyCode}}compareAtPriceRange{minVariantPrice{amount currencyCode}}images(first:10){edges{node{url altText}}}options{name values}variants(first:50){edges{node{id title availableForSale sku price{amount currencyCode}compareAtPrice{amount currencyCode}selectedOptions{name value}image{url altText}}}}}}`;

async function shopifyFetch<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch(SHOPIFY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = (await res.json()) as { data?: T; errors?: unknown };
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  if (!json.data) throw new Error("Shopify sin datos");
  return json.data;
}

export async function fetchAllProducts(): Promise<ShopifyProduct[]> {
  const all: ShopifyProduct[] = [];
  let cursor: string | null = null;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const data = await shopifyFetch<{
      products: {
        pageInfo: { hasNextPage: boolean; endCursor: string };
        edges: { node: ShopifyProduct }[];
      };
    }>(PRODUCTS_QUERY, { cursor });
    all.push(...data.products.edges.map((e) => e.node));
    if (!data.products.pageInfo.hasNextPage) break;
    cursor = data.products.pageInfo.endCursor;
  }
  return all;
}

export async function fetchProductByHandle(handle: string): Promise<ShopifyProduct | null> {
  const data = await shopifyFetch<{ product: ShopifyProduct | null }>(PRODUCT_BY_HANDLE_QUERY, {
    handle,
  });
  return data.product;
}

export function fmtMoney(amount: string | number, currency = "PEN") {
  const n = Number(amount);
  const prefix = currency === "PEN" ? "S/ " : `${currency} `;
  return `${prefix}${n.toFixed(2)}`;
}

export function productVariants(product: ShopifyProduct): ShopifyVariant[] {
  return product.variants.edges.map((e) => e.node);
}

export function productImages(product: ShopifyProduct): string[] {
  const imgs = product.images.edges.map((e) => e.node.url).filter(Boolean);
  return imgs.length ? imgs : ["https://www.prostagenix.com/images/product/bottle_box.png"];
}

export function variantPrice(v: ShopifyVariant) {
  return Number(v.price.amount);
}

export function variantCompare(v: ShopifyVariant) {
  if (v.compareAtPrice?.amount) return Number(v.compareAtPrice.amount);
  const price = variantPrice(v);
  return +(price * 2.5).toFixed(2);
}

export function savingsPct(price: number, retail: number) {
  if (retail <= price) return 0;
  return Math.round(((retail - price) / retail) * 100);
}

export function productOfferSummary(product: ShopifyProduct) {
  const variants = productVariants(product);
  const first = variants[0];
  const price = first
    ? variantPrice(first)
    : Number(product.priceRange.minVariantPrice.amount);
  const retail = first
    ? variantCompare(first)
    : Number(product.compareAtPriceRange?.minVariantPrice?.amount || price * 2.5);
  const currency = first?.price.currencyCode || product.priceRange.minVariantPrice.currencyCode;
  return {
    price,
    retail,
    save: Math.max(0, +(retail - price).toFixed(2)),
    pct: savingsPct(price, retail),
    currency,
    image: productImages(product)[0],
    variants,
  };
}
