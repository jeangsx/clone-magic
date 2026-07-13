import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  CART_QUERY,
  addLineToShopifyCart,
  createShopifyCart,
  removeLineFromShopifyCart,
  storefrontApiRequest,
  updateShopifyCartLine,
  type ShopifyProduct,
} from "../lib/shopify";

export interface CartItem {
  lineId: string | null;
  product: ShopifyProduct;
  variantId: string;
  variantTitle: string;
  price: { amount: string; currencyCode: string };
  quantity: number;
  selectedOptions: Array<{ name: string; value: string }>;
}

interface CartStore {
  items: CartItem[];
  cartId: string | null;
  checkoutUrl: string | null;
  isLoading: boolean;
  isSyncing: boolean;
  addItem: (item: Omit<CartItem, "lineId">) => Promise<void>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  clearCart: () => void;
  syncCart: () => Promise<void>;
  getCheckoutUrl: () => string | null;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      cartId: null,
      checkoutUrl: null,
      isLoading: false,
      isSyncing: false,
      addItem: async (item) => {
        const { items, cartId, clearCart } = get();
        const existingItem = items.find((cartItem) => cartItem.variantId === item.variantId);
        set({ isLoading: true });
        try {
          if (!cartId) {
            const result = await createShopifyCart(item);
            if (result) set({ cartId: result.cartId, checkoutUrl: result.checkoutUrl, items: [{ ...item, lineId: result.lineId }] });
          } else if (existingItem) {
            if (!existingItem.lineId) return;
            const newQuantity = existingItem.quantity + item.quantity;
            const result = await updateShopifyCartLine(cartId, existingItem.lineId, newQuantity);
            if (result.success) set({ items: get().items.map((cartItem) => (cartItem.variantId === item.variantId ? { ...cartItem, quantity: newQuantity } : cartItem)) });
            else if (result.cartNotFound) clearCart();
          } else {
            const result = await addLineToShopifyCart(cartId, item);
            if (result.success) set({ items: [...get().items, { ...item, lineId: result.lineId ?? null }] });
            else if (result.cartNotFound) clearCart();
          }
        } finally {
          set({ isLoading: false });
        }
      },
      updateQuantity: async (variantId, quantity) => {
        if (quantity <= 0) return get().removeItem(variantId);
        const { items, cartId, clearCart } = get();
        const item = items.find((cartItem) => cartItem.variantId === variantId);
        if (!item?.lineId || !cartId) return;
        set({ isLoading: true });
        try {
          const result = await updateShopifyCartLine(cartId, item.lineId, quantity);
          if (result.success) set({ items: get().items.map((cartItem) => (cartItem.variantId === variantId ? { ...cartItem, quantity } : cartItem)) });
          else if (result.cartNotFound) clearCart();
        } finally {
          set({ isLoading: false });
        }
      },
      removeItem: async (variantId) => {
        const { items, cartId, clearCart } = get();
        const item = items.find((cartItem) => cartItem.variantId === variantId);
        if (!item?.lineId || !cartId) return;
        set({ isLoading: true });
        try {
          const result = await removeLineFromShopifyCart(cartId, item.lineId);
          if (result.success) {
            const newItems = get().items.filter((cartItem) => cartItem.variantId !== variantId);
            newItems.length === 0 ? clearCart() : set({ items: newItems });
          } else if (result.cartNotFound) clearCart();
        } finally {
          set({ isLoading: false });
        }
      },
      clearCart: () => set({ items: [], cartId: null, checkoutUrl: null }),
      getCheckoutUrl: () => get().checkoutUrl,
      syncCart: async () => {
        const { cartId, isSyncing, clearCart } = get();
        if (!cartId || isSyncing) return;
        set({ isSyncing: true });
        try {
          const data = await storefrontApiRequest(CART_QUERY, { id: cartId });
          const cart = data?.data?.cart;
          if (!cart || cart.totalQuantity === 0) clearCart();
        } finally {
          set({ isSyncing: false });
        }
      },
    }),
    {
      name: "shopify-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items, cartId: state.cartId, checkoutUrl: state.checkoutUrl }),
    },
  ),
);