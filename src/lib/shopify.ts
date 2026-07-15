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

type Mf = { value: string } | null;

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
  shortPitch?: Mf;
  benefit1?: Mf;
  benefit2?: Mf;
  benefit3?: Mf;
  badgeText?: Mf;
};

export type LandingSettings = {
  heroTitle: string;
  heroSubtitle: string;
  heroUrgency: string;
  hotSaleText: string;
  benefit1: string;
  benefit2: string;
  benefit3: string;
  doctorBadgeText: string;
  guaranteeText: string;
  offersHeading: string;
  bannerImage: string | null;
};

export const DEFAULT_LANDING_SETTINGS: LandingSettings = {
  heroTitle: "One Day Super Sale Stock Up Now!",
  heroSubtitle: "GREAT DEAL - Order Now!",
  heroUrgency: "HUGE SAVINGS - 70% OFF NOW!",
  hotSaleText: "Ordena hoy para asegurar tu descuento y regalos GRATIS",
  benefit1: "Reduce DHT",
  benefit2: "100% Natural",
  benefit3: "Clínicamente Probado",
  doctorBadgeText: "RECOMENDADO POR MÉDICOS",
  guaranteeText: "90 DAY MONEY BACK GUARANTEE",
  offersHeading: "Special Internet-Only Offer",
  bannerImage: null,
};

const PRODUCT_FIELDS = `
  id title handle description vendor productType tags
  priceRange{minVariantPrice{amount currencyCode}}
  compareAtPriceRange{minVariantPrice{amount currencyCode}}
  images(first:10){edges{node{url altText}}}
  options{name values}
  variants(first:50){edges{node{
    id title availableForSale sku
    price{amount currencyCode}
    compareAtPrice{amount currencyCode}
    selectedOptions{name value}
    image{url altText}
  }}}
  shortPitch: metafield(namespace: "custom", key: "short_pitch") { value }
  benefit1: metafield(namespace: "custom", key: "benefit_1") { value }
  benefit2: metafield(namespace: "custom", key: "benefit_2") { value }
  benefit3: metafield(namespace: "custom", key: "benefit_3") { value }
  badgeText: metafield(namespace: "custom", key: "badge_text") { value }
`;

const PRODUCTS_QUERY = `query($cursor:String){products(first:50,after:$cursor){pageInfo{hasNextPage endCursor}edges{node{${PRODUCT_FIELDS}}}}}`;

const PRODUCT_BY_HANDLE_QUERY = `query($handle:String!){product(handle:$handle){${PRODUCT_FIELDS}}}`;

const LANDING_SETTINGS_QUERY = `
  query LandingSettings($handle: String!, $type: String!) {
    metaobject(handle: { handle: $handle, type: $type }) {
      handle
      fields {
        key
        value
        reference {
          ... on MediaImage {
            image { url }
          }
        }
      }
    }
  }
`;

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

function fieldMap(
  fields: { key: string; value: string | null; reference?: { image?: { url: string } | null } | null }[],
): Record<string, { value: string | null; imageUrl: string | null }> {
  const out: Record<string, { value: string | null; imageUrl: string | null }> = {};
  for (const f of fields) {
    out[f.key] = {
      value: f.value,
      imageUrl: f.reference?.image?.url ?? null,
    };
  }
  return out;
}

export async function fetchLandingSettings(): Promise<LandingSettings> {
  try {
    const data = await shopifyFetch<{
      metaobject: {
        fields: {
          key: string;
          value: string | null;
          reference?: { image?: { url: string } | null } | null;
        }[];
      } | null;
    }>(LANDING_SETTINGS_QUERY, {
      handle: "main",
      type: "landing_settings",
    });

    if (!data.metaobject) return DEFAULT_LANDING_SETTINGS;

    const m = fieldMap(data.metaobject.fields);
    const pick = (key: string, fallback: string) => {
      const v = m[key]?.value?.trim();
      return v ? v : fallback;
    };

    return {
      heroTitle: pick("hero_title", DEFAULT_LANDING_SETTINGS.heroTitle),
      heroSubtitle: pick("hero_subtitle", DEFAULT_LANDING_SETTINGS.heroSubtitle),
      heroUrgency: pick("hero_urgency", DEFAULT_LANDING_SETTINGS.heroUrgency),
      hotSaleText: pick("hot_sale_text", DEFAULT_LANDING_SETTINGS.hotSaleText),
      benefit1: pick("benefit_1", DEFAULT_LANDING_SETTINGS.benefit1),
      benefit2: pick("benefit_2", DEFAULT_LANDING_SETTINGS.benefit2),
      benefit3: pick("benefit_3", DEFAULT_LANDING_SETTINGS.benefit3),
      doctorBadgeText: pick("doctor_badge_text", DEFAULT_LANDING_SETTINGS.doctorBadgeText),
      guaranteeText: pick("guarantee_text", DEFAULT_LANDING_SETTINGS.guaranteeText),
      offersHeading: pick("offers_heading", DEFAULT_LANDING_SETTINGS.offersHeading),
      bannerImage: m.banner_image?.imageUrl || m.banner_image?.value || null,
    };
  } catch {
    // Si el metaobject aún no existe en Admin, usar defaults
    return DEFAULT_LANDING_SETTINGS;
  }
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

/** Beneficios: producto sobrescribe settings globales. */
export function resolveBenefits(product: ShopifyProduct | null, settings: LandingSettings): string[] {
  const fromProduct = [
    product?.benefit1?.value?.trim(),
    product?.benefit2?.value?.trim(),
    product?.benefit3?.value?.trim(),
  ].filter(Boolean) as string[];

  if (fromProduct.length >= 3) return fromProduct.slice(0, 3);
  if (fromProduct.length > 0) {
    const globals = [settings.benefit1, settings.benefit2, settings.benefit3];
    return [0, 1, 2].map((i) => fromProduct[i] || globals[i]);
  }
  return [settings.benefit1, settings.benefit2, settings.benefit3];
}

export function productShortPitch(product: ShopifyProduct): string | null {
  const v = product.shortPitch?.value?.trim();
  return v || null;
}

export function productBadgeText(product: ShopifyProduct): string | null {
  const v = product.badgeText?.value?.trim();
  return v || null;
}
