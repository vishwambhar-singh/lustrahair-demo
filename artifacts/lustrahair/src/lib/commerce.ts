export const PRODUCT_PRICE = 12999;
export const PRODUCT_NAME = 'Premium Remy Human Hair Collection';

export type Gender = 'female' | 'male';

export type LookRef = {
  lookId: string;
  lookName: string;
  colour: string;
  gender: Gender;
};

export type CartItem = LookRef & {
  id: string;
  qty: number;
  price: number;
};

export type SavedLook = LookRef & {
  id: string;
  savedAt: number;
  demo: boolean;
};

export type ConsultationRequest = LookRef & {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  slot: string;
  notes: string;
  createdAt: number;
};

export type Order = {
  id: string;
  items: CartItem[];
  total: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  payment: 'upi' | 'card' | 'cod';
  createdAt: number;
};

const KEYS = {
  cart: 'lustra-cart',
  saved: 'lustra-saved-looks',
  consults: 'lustra-consultations',
  orders: 'lustra-orders',
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / private mode */
  }
}

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function loadCart(): CartItem[] {
  return read<CartItem[]>(KEYS.cart, []);
}

export function saveCart(items: CartItem[]) {
  write(KEYS.cart, items);
}

export function loadSavedLooks(): SavedLook[] {
  return read<SavedLook[]>(KEYS.saved, []);
}

export function saveSavedLooks(items: SavedLook[]) {
  write(KEYS.saved, items);
}

export function loadConsultations(): ConsultationRequest[] {
  return read<ConsultationRequest[]>(KEYS.consults, []);
}

export function saveConsultations(items: ConsultationRequest[]) {
  write(KEYS.consults, items);
}

export function loadOrders(): Order[] {
  return read<Order[]>(KEYS.orders, []);
}

export function saveOrders(items: Order[]) {
  write(KEYS.orders, items);
}

export function cartKey(look: LookRef) {
  return `${look.lookId}|${look.colour}|${look.gender}`;
}

export function addCartItem(cart: CartItem[], look: LookRef): CartItem[] {
  const key = cartKey(look);
  const existing = cart.find((item) => cartKey(item) === key);
  if (existing) {
    return cart.map((item) => (cartKey(item) === key ? { ...item, qty: item.qty + 1 } : item));
  }
  return [...cart, { ...look, id: uid('bag'), qty: 1, price: PRODUCT_PRICE }];
}

export function newSavedLook(look: LookRef, demo: boolean): SavedLook {
  return { ...look, id: uid('look'), savedAt: Date.now(), demo };
}

export function formatInr(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

export function cartTotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0);
}

export function shareUrl(look: LookRef) {
  const url = new URL(window.location.href);
  url.searchParams.set('look', look.lookId);
  url.searchParams.set('colour', look.colour);
  url.searchParams.set('gender', look.gender);
  url.hash = 'studio';
  return url.toString();
}

export function lookFromSearch(search = window.location.search): LookRef | null {
  const params = new URLSearchParams(search);
  const lookId = params.get('look');
  const colour = params.get('colour');
  const gender = params.get('gender');
  if (!lookId || !colour || (gender !== 'female' && gender !== 'male')) return null;
  return { lookId, lookName: lookId, colour, gender };
}

export function createOrderId() {
  return `LH-${Date.now().toString(36).toUpperCase()}`;
}

export function createConsultId() {
  return uid('consult');
}
