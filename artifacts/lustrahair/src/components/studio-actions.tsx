import { type FormEvent, type ReactNode, createContext, useContext, useMemo, useState } from 'react';
import {
  Check,
  Heart,
  Link2,
  ShoppingBag,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  type CartItem,
  type ConsultationRequest,
  type Gender,
  type LookRef,
  type Order,
  type SavedLook,
  addCartItem,
  cartTotal,
  createConsultId,
  createOrderId,
  formatInr,
  loadCart,
  loadConsultations,
  loadOrders,
  loadSavedLooks,
  newSavedLook,
  saveCart,
  saveConsultations,
  saveOrders,
  saveSavedLooks,
  shareUrl,
} from '@/lib/commerce';

type Panel = 'none' | 'checkout' | 'consult' | 'saved' | 'share';

type CommerceContextValue = {
  cart: CartItem[];
  savedLooks: SavedLook[];
  bagCount: number;
  restoreLook: SavedLook | null;
  addToBag: (look: LookRef) => void;
  openCheckout: () => void;
  openConsult: (look: LookRef) => void;
  openSaved: () => void;
  saveLook: (look: LookRef, demo: boolean) => boolean;
  isSaved: (look: LookRef) => boolean;
  shareLook: (look: LookRef) => void;
  consumeRestore: () => void;
  toast: (message: string) => void;
};

const CommerceContext = createContext<CommerceContextValue | null>(null);

export function useCommerce() {
  const value = useContext(CommerceContext);
  if (!value) throw new Error('useCommerce must be used inside CommerceProvider');
  return value;
}

const fieldClass = 'h-11 rounded-xl border-[#e2d6d0] bg-white text-[#493538]';

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <Label className="text-[11px] font-semibold uppercase tracking-[.14em] text-[#6d5552]">{label}</Label>
      {children}
    </label>
  );
}

export function CommerceProvider({ children, toast }: { children: ReactNode; toast: (message: string) => void }) {
  const [cart, setCart] = useState<CartItem[]>(() => loadCart());
  const [savedLooks, setSavedLooks] = useState<SavedLook[]>(() => loadSavedLooks());
  const [orders, setOrders] = useState<Order[]>(() => loadOrders());
  const [consults, setConsults] = useState<ConsultationRequest[]>(() => loadConsultations());
  const [panel, setPanel] = useState<Panel>('none');
  const [consultLook, setConsultLook] = useState<LookRef | null>(null);
  const [shareLookRef, setShareLookRef] = useState<LookRef | null>(null);
  const [shareLink, setShareLink] = useState('');
  const [restoreLook, setRestoreLook] = useState<SavedLook | null>(null);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  const persistCart = (next: CartItem[]) => {
    setCart(next);
    saveCart(next);
  };

  const value = useMemo<CommerceContextValue>(
    () => ({
      cart,
      savedLooks,
      bagCount: cart.reduce((sum, item) => sum + item.qty, 0),
      restoreLook,
      addToBag: (look) => {
        persistCart(addCartItem(cart, look));
        toast(`${look.lookName} in ${look.colour} added to your bag.`);
      },
      openCheckout: () => {
        setPlacedOrder(null);
        setPanel('checkout');
      },
      openConsult: (look) => {
        setConsultLook(look);
        setPanel('consult');
      },
      openSaved: () => setPanel('saved'),
      saveLook: (look, demo) => {
        const exists = savedLooks.some(
          (item) => item.lookId === look.lookId && item.colour === look.colour && item.gender === look.gender,
        );
        if (exists) {
          toast('This look is already saved on this device.');
          return true;
        }
        const next = [newSavedLook(look, demo), ...savedLooks].slice(0, 24);
        setSavedLooks(next);
        saveSavedLooks(next);
        toast('Look saved on this device.');
        return true;
      },
      isSaved: (look) =>
        savedLooks.some((item) => item.lookId === look.lookId && item.colour === look.colour && item.gender === look.gender),
      shareLook: (look) => {
        const url = shareUrl(look);
        setShareLookRef(look);
        setShareLink(url);
        setPanel('share');
      },
      consumeRestore: () => setRestoreLook(null),
      toast,
    }),
    [cart, restoreLook, savedLooks, toast],
  );

  const placeOrder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!cart.length) {
      toast('Add a look to your bag first.');
      return;
    }
    const form = new FormData(event.currentTarget);
    const order: Order = {
      id: createOrderId(),
      items: cart,
      total: cartTotal(cart),
      name: String(form.get('name') || '').trim(),
      email: String(form.get('email') || '').trim(),
      phone: String(form.get('phone') || '').trim(),
      address: String(form.get('address') || '').trim(),
      city: String(form.get('city') || '').trim(),
      pincode: String(form.get('pincode') || '').trim(),
      payment: (String(form.get('payment') || 'cod') as Order['payment']),
      createdAt: Date.now(),
    };
    if (!order.name || !order.email || !order.phone || !order.address || !order.city || !order.pincode) {
      toast('Please complete your delivery details.');
      return;
    }
    const next = [order, ...orders];
    setOrders(next);
    saveOrders(next);
    persistCart([]);
    setPlacedOrder(order);
    toast(`Order ${order.id} confirmed.`);
  };

  const sendConsult = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!consultLook) return;
    const form = new FormData(event.currentTarget);
    const request: ConsultationRequest = {
      ...consultLook,
      id: createConsultId(),
      name: String(form.get('name') || '').trim(),
      email: String(form.get('email') || '').trim(),
      phone: String(form.get('phone') || '').trim(),
      city: String(form.get('city') || '').trim(),
      slot: String(form.get('slot') || 'Anytime'),
      notes: String(form.get('notes') || '').trim(),
      createdAt: Date.now(),
    };
    if (!request.name || !request.email || !request.phone) {
      toast('Please add your name, email and phone.');
      return;
    }
    const next = [request, ...consults];
    setConsults(next);
    saveConsultations(next);
    setPanel('none');
    toast(`Consultation booked for ${request.lookName} in ${request.colour}.`);
  };

  const copyShare = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      toast('Share link copied.');
    } catch {
      toast('Copy the link from the field below.');
    }
  };

  const nativeShare = async () => {
    if (!shareLookRef) return;
    const text = `My Lustra preview: ${shareLookRef.lookName} in ${shareLookRef.colour}.`;
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({ title: 'My Lustra preview', text, url: shareLink });
        toast('Preview ready to share.');
        return;
      }
      await copyShare();
    } catch {
      /* user cancelled */
    }
  };

  const downloadPreview = () => {
    const canvas = document.querySelector<HTMLCanvasElement>('[data-testid="img-after-preview"]');
    if (!canvas) {
      toast('Generate a preview first, then download.');
      return;
    }
    const link = document.createElement('a');
    link.download = `lustra-${shareLookRef?.lookId || 'preview'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast('Preview image downloaded.');
  };

  return (
    <CommerceContext.Provider value={value}>
      {children}

      <Dialog open={panel === 'checkout'} onOpenChange={(open) => setPanel(open ? 'checkout' : 'none')}>
        <DialogContent className="max-w-lg border-[#e2d6d0] bg-[#fffaf5] text-[#493538] sm:rounded-[1.6rem]">
          <DialogHeader>
            <DialogTitle className="font-editorial text-3xl font-normal tracking-[-.03em]">
              {placedOrder ? 'Order confirmed' : 'Checkout'}
            </DialogTitle>
            <DialogDescription className="text-[#806e69]">
              {placedOrder
                ? `We’ve reserved your look. Reference ${placedOrder.id}.`
                : 'A private checkout for the look you just tried on.'}
            </DialogDescription>
          </DialogHeader>
          {placedOrder ? (
            <div className="space-y-4 text-sm text-[#6d5b58]">
              <p>We’ll email {placedOrder.email} with fitting notes and delivery for {placedOrder.city}.</p>
              <p className="font-semibold text-[#493538]">{formatInr(placedOrder.total)} · {placedOrder.payment.toUpperCase()}</p>
              <button type="button" onClick={() => setPanel('none')} className="flex w-full items-center justify-center rounded-full bg-[#b66f78] py-3 text-[11px] font-semibold uppercase tracking-[.15em] text-white" data-testid="button-close-order">
                Back to studio
              </button>
            </div>
          ) : (
            <form onSubmit={placeOrder} className="space-y-4">
              <div className="space-y-2 rounded-2xl bg-[#f6ebe6] p-4 text-sm">
                {cart.length === 0 ? (
                  <p className="text-[#806e69]">Your bag is empty.</p>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-3" data-testid={`cart-item-${item.lookId}`}>
                      <div>
                        <p className="font-semibold text-[#493538]">{item.lookName}</p>
                        <p className="text-xs text-[#806e69]">{item.colour} · {item.gender === 'male' ? 'Male' : 'Female'} · Qty {item.qty}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{formatInr(item.price * item.qty)}</span>
                        <button type="button" aria-label="Remove from bag" className="text-[#a3636b]" onClick={() => persistCart(cart.filter((row) => row.id !== item.id))}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
                {cart.length > 0 && (
                  <div className="flex justify-between border-t border-[#e2cfc8] pt-3 font-semibold">
                    <span>Total</span>
                    <span data-testid="text-checkout-total">{formatInr(cartTotal(cart))}</span>
                  </div>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Full name"><Input name="name" required className={fieldClass} data-testid="input-checkout-name" /></Field>
                <Field label="Email"><Input name="email" type="email" required className={fieldClass} data-testid="input-checkout-email" /></Field>
                <Field label="Phone"><Input name="phone" required className={fieldClass} data-testid="input-checkout-phone" /></Field>
                <Field label="City"><Input name="city" required className={fieldClass} data-testid="input-checkout-city" /></Field>
              </div>
              <Field label="Address"><Input name="address" required className={fieldClass} data-testid="input-checkout-address" /></Field>
              <Field label="PIN code"><Input name="pincode" required className={fieldClass} data-testid="input-checkout-pincode" /></Field>
              <fieldset className="space-y-2">
                <legend className="text-[11px] font-semibold uppercase tracking-[.14em] text-[#6d5552]">Payment</legend>
                <div className="grid grid-cols-3 gap-2">
                  {([['upi', 'UPI'], ['card', 'Card'], ['cod', 'COD']] as const).map(([value, label]) => (
                    <label key={value} className="flex cursor-pointer items-center justify-center gap-2 rounded-full border border-[#e2d6d0] bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-[.12em] has-[:checked]:border-[#b66f78] has-[:checked]:bg-[#f8e6e1]">
                      <input type="radio" name="payment" value={value} defaultChecked={value === 'upi'} className="sr-only" />
                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>
              <button type="submit" disabled={!cart.length} className="flex w-full items-center justify-center rounded-full bg-[#b66f78] py-3.5 text-[11px] font-semibold uppercase tracking-[.15em] text-white disabled:opacity-50" data-testid="button-place-order">
                Place order
              </button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={panel === 'consult'} onOpenChange={(open) => setPanel(open ? 'consult' : 'none')}>
        <DialogContent className="max-w-lg border-[#e2d6d0] bg-[#fffaf5] text-[#493538] sm:rounded-[1.6rem]">
          <DialogHeader>
            <DialogTitle className="font-editorial text-3xl font-normal tracking-[-.03em]">Request a consultation</DialogTitle>
            <DialogDescription className="text-[#806e69]">
              {consultLook ? `A stylist will review ${consultLook.lookName} in ${consultLook.colour} with you.` : 'Tell us how to reach you.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={sendConsult} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Full name"><Input name="name" required className={fieldClass} data-testid="input-consult-name" /></Field>
              <Field label="Email"><Input name="email" type="email" required className={fieldClass} data-testid="input-consult-email" /></Field>
              <Field label="Phone"><Input name="phone" required className={fieldClass} data-testid="input-consult-phone" /></Field>
              <Field label="City"><Input name="city" className={fieldClass} data-testid="input-consult-city" /></Field>
            </div>
            <fieldset className="space-y-2">
              <legend className="text-[11px] font-semibold uppercase tracking-[.14em] text-[#6d5552]">Preferred time</legend>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {['Weekday morning', 'Weekday evening', 'Weekend', 'Anytime'].map((slot, index) => (
                  <label key={slot} className="flex cursor-pointer items-center justify-center rounded-full border border-[#e2d6d0] bg-white px-2 py-2 text-center text-[10px] font-semibold uppercase tracking-[.1em] has-[:checked]:border-[#b66f78] has-[:checked]:bg-[#f8e6e1]">
                    <input type="radio" name="slot" value={slot} defaultChecked={index === 3} className="sr-only" />
                    {slot}
                  </label>
                ))}
              </div>
            </fieldset>
            <Field label="Notes">
              <Textarea name="notes" rows={3} placeholder="Length, density, occasion…" className="rounded-xl border-[#e2d6d0] bg-white text-[#493538]" data-testid="input-consult-notes" />
            </Field>
            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-full bg-[#b66f78] py-3.5 text-[11px] font-semibold uppercase tracking-[.15em] text-white" data-testid="button-submit-consultation">
              <Sparkles size={14} /> Book consultation
            </button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={panel === 'saved'} onOpenChange={(open) => setPanel(open ? 'saved' : 'none')}>
        <DialogContent className="max-w-lg border-[#e2d6d0] bg-[#fffaf5] text-[#493538] sm:rounded-[1.6rem]">
          <DialogHeader>
            <DialogTitle className="font-editorial text-3xl font-normal tracking-[-.03em]">Saved looks</DialogTitle>
            <DialogDescription className="text-[#806e69]">Kept on this device so you can return to an edit.</DialogDescription>
          </DialogHeader>
          {savedLooks.length === 0 ? (
            <p className="text-sm text-[#806e69]">You haven’t saved a look yet.</p>
          ) : (
            <div className="space-y-2">
              {savedLooks.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border border-[#e2d6d0] bg-white px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold">{item.lookName}</p>
                    <p className="text-xs text-[#806e69]">{item.colour} · {item.gender === 'male' ? 'Male' : 'Female'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="rounded-full bg-[#493538] px-3 py-2 text-[10px] font-semibold uppercase tracking-[.12em] text-white"
                      data-testid={`button-restore-look-${item.lookId}`}
                      onClick={() => {
                        setRestoreLook(item);
                        setPanel('none');
                        document.getElementById('studio')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        toast(`Restored ${item.lookName} in ${item.colour}.`);
                      }}
                    >
                      Open
                    </button>
                    <button
                      type="button"
                      aria-label="Remove saved look"
                      className="text-[#a3636b]"
                      onClick={() => {
                        const next = savedLooks.filter((row) => row.id !== item.id);
                        setSavedLooks(next);
                        saveSavedLooks(next);
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={panel === 'share'} onOpenChange={(open) => setPanel(open ? 'share' : 'none')}>
        <DialogContent className="max-w-lg border-[#e2d6d0] bg-[#fffaf5] text-[#493538] sm:rounded-[1.6rem]">
          <DialogHeader>
            <DialogTitle className="font-editorial text-3xl font-normal tracking-[-.03em]">Share this look</DialogTitle>
            <DialogDescription className="text-[#806e69]">
              {shareLookRef ? `${shareLookRef.lookName} in ${shareLookRef.colour}` : 'Send a private preview link.'}
            </DialogDescription>
          </DialogHeader>
          <Input readOnly value={shareLink} className={fieldClass} data-testid="input-share-url" />
          <div className="grid gap-2 sm:grid-cols-3">
            <button type="button" onClick={copyShare} className="rounded-full bg-[#b66f78] py-3 text-[11px] font-semibold uppercase tracking-[.12em] text-white" data-testid="button-copy-share-link">
              Copy link
            </button>
            <button type="button" onClick={() => void nativeShare()} className="rounded-full border border-[#d9c5bd] py-3 text-[11px] font-semibold uppercase tracking-[.12em] text-[#68484c]" data-testid="button-native-share">
              Share sheet
            </button>
            <button type="button" onClick={downloadPreview} className="rounded-full border border-[#d9c5bd] py-3 text-[11px] font-semibold uppercase tracking-[.12em] text-[#68484c]" data-testid="button-download-preview">
              Save image
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </CommerceContext.Provider>
  );
}

export function CommerceButtons({ light = false }: { light?: boolean }) {
  const { bagCount, savedLooks, openCheckout, openSaved } = useCommerce();
  const tone = light ? 'text-white hover:bg-white/10' : 'text-[#493538] hover:bg-[#f4e8e1]';
  return (
    <div className="flex items-center gap-1">
      <button type="button" onClick={openSaved} className={`relative rounded-full p-2 ${tone}`} data-testid="button-open-saved" aria-label="Saved looks">
        <Heart size={18} />
        {savedLooks.length > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#c48688] px-1 text-[9px] font-semibold text-white">{savedLooks.length}</span>
        )}
      </button>
      <button type="button" onClick={openCheckout} className={`relative rounded-full p-2 ${tone}`} data-testid="button-open-bag" aria-label="Bag and checkout">
        <ShoppingBag size={18} />
        {bagCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#c48688] px-1 text-[9px] font-semibold text-white" data-testid="badge-bag-count">{bagCount}</span>
        )}
      </button>
    </div>
  );
}

export function ResultActions({ look, colour, gender, demo }: { look: { id: string; name: string }; colour: string; gender: Gender; demo: boolean }) {
  const { addToBag, openCheckout, openConsult, saveLook, isSaved, shareLook, cart } = useCommerce();
  const ref: LookRef = { lookId: look.id, lookName: look.name, colour, gender };
  const saved = isSaved(ref);
  const inBag = cart.some((item) => item.lookId === look.id && item.colour === colour && item.gender === gender);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          addToBag(ref);
          openCheckout();
        }}
        className={`mt-5 flex w-full items-center justify-center gap-2 rounded-full py-4 text-[11px] font-semibold uppercase tracking-[.15em] transition ${inBag ? 'bg-[#60494b] text-white' : 'bg-[#b66f78] text-white hover:bg-[#a35e68]'}`}
        data-testid="button-add-to-bag"
      >
        {inBag ? <><Check size={15} /> Checkout</> : <>Add to bag & checkout</>}
      </button>
      <button
        type="button"
        onClick={() => openConsult(ref)}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-[#d9c5bd] py-3 text-[11px] font-semibold uppercase tracking-[.15em] text-[#68484c] transition hover:bg-[#f6e9e4]"
        data-testid="button-colour-match"
      >
        <Sparkles size={14} /> Request consultation
      </button>
      <div className="mt-5 flex justify-between border-t border-[#e7dcd7] pt-4">
        <button type="button" onClick={() => saveLook(ref, demo)} className="flex items-center gap-1.5 text-[11px] font-semibold text-[#806e69] transition hover:text-[#b66f78]" data-testid="button-save-preview">
          <Heart size={14} fill={saved ? 'currentColor' : 'none'} />{saved ? 'Saved' : 'Save this look'}
        </button>
        <button type="button" onClick={() => shareLook(ref)} className="flex items-center gap-1.5 text-[11px] font-semibold text-[#806e69] transition hover:text-[#b66f78]" data-testid="button-share-preview">
          <Link2 size={14} /> Share
        </button>
      </div>
    </>
  );
}
