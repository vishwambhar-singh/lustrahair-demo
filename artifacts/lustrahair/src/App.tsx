import { type ReactNode, useEffect, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGenerateTryOn } from '@workspace/api-client-react';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  CloudUpload,
  Heart,
  Info,
  Instagram,
  Link2,
  Menu,
  RotateCcw,
  Scissors,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Router as WouterRouter, Route, Switch, useLocation } from 'wouter';

const queryClient = new QueryClient();

const DEMO_IMAGE = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
<svg width="900" height="1100" viewBox="0 0 900 1100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ead4cd"/><stop offset=".55" stop-color="#f5e8e0"/><stop offset="1" stop-color="#c99591"/></linearGradient>
    <linearGradient id="hair" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#3b2427"/><stop offset=".45" stop-color="#684346"/><stop offset="1" stop-color="#1d171a"/></linearGradient>
  </defs>
  <rect width="900" height="1100" fill="url(#bg)"/>
  <circle cx="170" cy="160" r="110" fill="#fff" opacity=".2"/><circle cx="740" cy="870" r="220" fill="#b87579" opacity=".15"/>
  <path d="M155 1060c18-255 68-440 202-495 90-38 208-21 287 44 117 96 165 255 177 451H155z" fill="#b68578"/>
  <path d="M285 390c-19-139 49-244 182-261 148-19 248 80 233 245l-31 166-99 66-266-56-19-160z" fill="#d69c88"/>
  <path d="M261 393c-33-125 3-277 155-302 143-24 260 49 290 191 22 103-25 259-73 330-17-146-20-235-103-291-63-43-132-46-210-5-9 72-16 148-4 230-41-30-43-91-55-153z" fill="url(#hair)"/>
  <path d="M586 358c42 45 78 127 76 222l-36 306c-27 64-80 104-122 137 23-169 35-354-11-513l93-152z" fill="#302022"/>
  <path d="M268 441c-9 142 11 254 67 359-32-33-68-60-94-113-27-55-29-145 27-246z" fill="#3d272b"/>
  <path d="M392 507c29 16 71 18 102-2-7 44-25 65-54 66-30 0-45-22-48-64z" fill="#b46e6f"/>
  <path d="M337 453c-24 21-26 64 4 73 15 4 29-8 31-29 2-21-14-50-35-44zm170 1c23 20 27 63-3 73-16 5-29-8-32-28-2-22 14-51 35-45z" fill="#d69c88"/>
  <path d="M375 461c31-23 72-26 111-7" fill="none" stroke="#6c4042" stroke-width="10" stroke-linecap="round"/>
  <path d="M418 565c25 10 52 9 74-3" fill="none" stroke="#9c565c" stroke-width="7" stroke-linecap="round"/>
</svg>`)}`;

type Look = { id: string; name: string; note: string; cut: string; texture: string };
type Gender = 'female' | 'male';
const looks: Look[] = [
  { id: 'waves', name: 'Signature Waves', note: 'Soft movement, unmistakably you.', cut: 'Long', texture: 'Wavy' },
  { id: 'sleek', name: 'Sleek Length', note: 'Polished from every angle.', cut: 'Long', texture: 'Straight' },
  { id: 'curls', name: 'Soft Curls', note: 'A little more romance.', cut: 'Long', texture: 'Curly' },
  { id: 'bob', name: 'Modern Bob', note: 'The confident reset.', cut: 'Short', texture: 'Straight' },
  { id: 'layers', name: 'Feathered Layers', note: 'Airy volume with a point of view.', cut: 'Medium', texture: 'Wavy' },
  { id: 'bangs', name: 'Curtain Bangs', note: 'Frame the moment.', cut: 'Medium', texture: 'Wavy' },
];
const colours = [
  { name: 'Black', hex: '#211c1d' },
  { name: 'Dark Brown', hex: '#49322b' },
  { name: 'Chestnut', hex: '#86584a' },
  { name: 'Honey Blonde', hex: '#c89558' },
];

function hairHex(colour: string) {
  return colours.find((item) => item.name === colour)?.hex ?? '#49322b';
}

function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${light ? 'text-[#fffaf5]' : 'text-[#322528]'}`}>
      <div className="relative flex h-8 w-8 items-center justify-center rounded-full border border-current">
        <span className="font-editorial text-[19px] italic leading-none">L</span>
        <span className="absolute -bottom-1.5 right-0.5 h-2 w-2 rounded-full bg-[#c48688]" />
      </div>
      <span className="text-[15px] font-semibold tracking-[.22em]">LUSTRA</span>
    </div>
  );
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timeout = window.setTimeout(onClose, 3200);
    return () => window.clearTimeout(timeout);
  }, [onClose]);
  return (
    <div className="fixed bottom-5 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-3 rounded-full bg-[#332629] px-4 py-3 text-sm text-[#fffaf5] shadow-[0_16px_40px_rgba(50,35,36,.24)]">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#c48688]"><Check size={13} strokeWidth={3} /></span>
      <span data-testid="status-toast">{message}</span>
      <button onClick={onClose} className="ml-1 opacity-70 transition hover:opacity-100" data-testid="button-close-toast" aria-label="Close notification"><X size={15} /></button>
    </div>
  );
}

function Header({ onStart }: { onStart: () => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const go = (id: string) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <header className="absolute left-0 right-0 top-0 z-40 border-b border-[#5b4747]/10">
      <div className="mx-auto flex h-[76px] max-w-[1320px] items-center justify-between px-5 lg:px-10">
        <Logo light />
        <nav className="hidden items-center gap-9 text-[12px] font-medium uppercase tracking-[.16em] text-[#fffaf5]/80 md:flex">
          <button onClick={() => go('studio')} className="transition hover:text-white" data-testid="link-try-on">Try on</button>
          <button onClick={() => go('story')} className="transition hover:text-white" data-testid="link-our-story">How it works</button>
          <button onClick={() => go('trust')} className="transition hover:text-white" data-testid="link-trust">Collections</button>
        </nav>
        <button onClick={onStart} className="hidden rounded-full border border-white/40 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[.16em] text-white transition hover:bg-white hover:text-[#332629] md:block" data-testid="button-header-start">Try your look</button>
        <button onClick={() => setMobileOpen((v) => !v)} className="rounded-full p-2 text-white md:hidden" data-testid="button-mobile-menu" aria-label="Toggle menu">
          {mobileOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>
      {mobileOpen && <div className="mx-4 mb-4 rounded-2xl bg-[#fffaf5] p-3 text-[#332629] shadow-lg md:hidden">
        {['studio', 'story', 'trust'].map((id, index) => <button key={id} onClick={() => go(id)} className="block w-full rounded-xl px-4 py-3 text-left text-sm capitalize hover:bg-[#f4e8e1]" data-testid={`link-mobile-${id}`}>{['Virtual try-on', 'Our philosophy', 'The Lustra standard'][index]}</button>)}
      </div>}
    </header>
  );
}

function Hero({ onStart }: { onStart: () => void }) {
  return (
    <section className="relative min-h-[720px] overflow-hidden bg-[#4a3538] text-[#fffaf5] lg:min-h-[790px]">
      <div className="absolute inset-0 opacity-70" style={{ background: 'radial-gradient(circle at 12% 70%, #936466 0, transparent 35%), radial-gradient(circle at 78% 20%, #7b5558 0, transparent 38%), linear-gradient(112deg, #412e31, #63484b)' }} />
      <div className="absolute -right-24 top-28 h-[480px] w-[480px] rounded-full border border-[#efd8d0]/15 lg:h-[700px] lg:w-[700px]" />
      <div className="absolute right-[9%] top-40 h-[380px] w-[380px] rounded-full border border-[#efd8d0]/10 lg:h-[570px] lg:w-[570px]" />
      <Header onStart={onStart} />
      <div className="relative mx-auto grid max-w-[1320px] items-center gap-12 px-5 pb-20 pt-36 lg:grid-cols-[1.05fr_.95fr] lg:px-10 lg:pb-24 lg:pt-48">
        <div className="relative z-10 max-w-[700px]">
          <p className="reveal mb-6 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[.28em] text-[#f1c7bf]"><span className="h-px w-9 bg-[#f1c7bf]" />Private beauty, reimagined</p>
           <h1 className="reveal reveal-delay-1 font-editorial text-[clamp(4.2rem,9vw,8.5rem)] leading-[.88] tracking-[-.06em]">See your next look<br /><em className="text-[#efc9c0]">before you buy.</em></h1>
          <p className="reveal reveal-delay-2 mt-8 max-w-[420px] text-[15px] leading-7 text-[#f9e9e3]/75">See yourself in exceptional human hair before it ever reaches your doorstep. A private, intelligent preview made for your features.</p>
          <div className="reveal reveal-delay-3 mt-10 flex flex-wrap items-center gap-5">
             <button onClick={onStart} className="group flex items-center gap-4 rounded-full bg-[#f7e4dc] px-6 py-4 text-[12px] font-semibold uppercase tracking-[.16em] text-[#483336] transition hover:-translate-y-0.5 hover:bg-white" data-testid="button-hero-try-on">Try it now <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#c48688] text-white transition group-hover:translate-x-1"><ArrowRight size={15} /></span></button>
            <button onClick={() => document.getElementById('story')?.scrollIntoView({ behavior: 'smooth' })} className="text-[12px] font-medium uppercase tracking-[.15em] text-white/70 underline decoration-white/30 underline-offset-8 transition hover:text-white" data-testid="button-hero-discover">Discover the Lustra standard</button>
          </div>
          <div className="mt-16 flex items-center gap-6 text-xs text-[#f9e9e3]/65">
            <div className="flex -space-x-2">
              {['M', 'S', 'A'].map((letter, i) => <span key={letter} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#594145] bg-[#d6aaa0] text-[10px] font-semibold text-[#4a3538]" style={{ background: ['#d9b4a6', '#b7847d', '#edd4c5'][i] }}>{letter}</span>)}
            </div>
            <span>Joined by 12,400+ women<br /><span className="text-white/45">finding their signature</span></span>
          </div>
        </div>
        <div className="relative hidden h-[510px] lg:block">
          <div className="absolute right-8 top-0 h-[510px] w-[390px] rotate-[4deg] overflow-hidden rounded-[220px_220px_30px_30px] bg-[#b8837f] shadow-2xl">
            <div className="absolute inset-0 opacity-80" style={{ background: 'radial-gradient(ellipse at 50% 12%, #f4d6c9 0 15%, transparent 16%), radial-gradient(ellipse at 50% 44%, #d49c8d 0 23%, transparent 24%), linear-gradient(120deg,#6c4749,#c9958e 48%,#4d3438)' }} />
            <div className="absolute bottom-[-8%] left-[12%] h-[74%] w-[76%] rounded-[49%_49%_20%_20%] bg-[#2f2022] shadow-[-30px_8px_0_#482d31,30px_12px_0_#56363a]" />
            <div className="absolute left-[28%] top-[20%] h-[42%] w-[44%] rounded-[45%] bg-[#d9a08d]" />
            <div className="absolute left-[26%] top-[15%] h-[20%] w-[48%] rounded-[50%_50%_15%_15%] bg-[#372326]" />
            <div className="absolute left-[41%] top-[39%] h-2 w-2 rounded-full bg-[#523237]" />
            <p className="absolute bottom-6 left-7 text-[10px] uppercase tracking-[.25em] text-white/70">The Lustra edit / 01</p>
          </div>
          <div className="absolute bottom-12 left-0 z-10 rounded-2xl border border-white/20 bg-[#fffaf5]/10 p-5 backdrop-blur-md">
            <div className="mb-3 flex items-center gap-2 text-[#f3c6bc]"><Sparkles size={15} /><span className="text-[10px] uppercase tracking-[.18em]">A considered match</span></div>
            <p className="max-w-[160px] text-sm leading-5 text-white/85">Shape, movement,<br />colour — made personal.</p>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#f8f5f0] to-transparent" />
    </section>
  );
}

function Progress({ step }: { step: number }) {
  return <div className="mx-auto mb-10 flex max-w-2xl items-center justify-between px-2">
    {['Upload your photo', 'Choose your look', 'See the preview'].map((label, index) => {
      const number = index + 1;
      const active = step >= number;
      return <div className="flex flex-1 items-center last:flex-none" key={label}>
        <div className="flex items-center gap-2.5">
          <span className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition ${active ? 'border-[#b66f78] bg-[#b66f78] text-white' : 'border-[#d9c9c2] bg-transparent text-[#927d78]'}`} data-testid={`step-${number}`}>{active && step > number ? <Check size={14} /> : `0${number}`}</span>
          <span className={`hidden text-[10px] font-semibold uppercase tracking-[.15em] sm:block ${active ? 'text-[#4a3538]' : 'text-[#a79590]'}`}>{label}</span>
        </div>
        {index < 2 && <span className={`mx-3 h-px flex-1 transition ${step > number ? 'bg-[#b66f78]' : 'bg-[#ddcfca]'}`} />}
      </div>;
    })}
  </div>;
}

function UploadPanel({ image, onImage, onError, onNext }: { image: string | null; onImage: (value: string) => void; onError: (value: string) => void; onNext: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const readFile = (file?: File) => {
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) { onError('Please use a JPG, PNG or WEBP image.'); return; }
    if (file.size > 10 * 1024 * 1024) { onError('That image is larger than 10MB. Please choose a smaller file.'); return; }
    const reader = new FileReader();
    reader.onload = () => onImage(String(reader.result));
    reader.readAsDataURL(file);
  };
  return <div className="mx-auto max-w-3xl">
    <div className="mb-9 text-center">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-[.23em] text-[#b66f78]">First, a little context</p>
      <h2 className="font-editorial text-4xl tracking-[-.03em] text-[#433034] sm:text-5xl">Let’s start with you.</h2>
      <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#806e69]">A clear, front-facing photo helps us create the most natural preview. Your photo stays yours.</p>
    </div>
    {image ? <div className="relative mx-auto max-w-[380px] overflow-hidden rounded-[2rem] border border-[#ddcbc4] bg-[#eee1db] shadow-[0_20px_50px_rgba(98,67,62,.12)]">
      <img src={image} alt="Your uploaded preview" className="aspect-[4/5] w-full object-cover" data-testid="img-upload-preview" />
      <div className="absolute left-4 top-4 rounded-full bg-[#fffaf5]/85 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.15em] text-[#554143] backdrop-blur">Photo ready</div>
      <div className="absolute bottom-4 left-4 right-4 flex gap-2">
        <button onClick={() => inputRef.current?.click()} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#fffaf5] py-3 text-xs font-semibold text-[#4a3538] shadow-sm transition hover:bg-white" data-testid="button-replace-photo"><RotateCcw size={14} /> Replace</button>
        <button onClick={() => onImage('')} className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fffaf5] text-[#8a5c61] shadow-sm transition hover:bg-white" data-testid="button-remove-photo" aria-label="Remove photo"><Trash2 size={15} /></button>
      </div>
    </div> : <div onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); readFile(event.dataTransfer.files[0]); }} className={`group rounded-[2rem] border border-dashed p-8 text-center transition sm:p-14 ${dragging ? 'border-[#b66f78] bg-[#f6e6e1]' : 'border-[#d8c4bd] bg-[#fbf8f4] hover:border-[#b66f78] hover:bg-[#faf2ed]'}`} data-testid="dropzone-photo">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f1dfd9] text-[#ae7377] transition group-hover:scale-105"><CloudUpload size={25} strokeWidth={1.5} /></div>
      <h3 className="mt-5 text-base font-semibold text-[#4a3538]">Drop a photo here</h3>
      <p className="mt-1 text-sm text-[#9b8983]">or choose one from your device</p>
      <button onClick={() => inputRef.current?.click()} className="mt-6 rounded-full bg-[#493538] px-5 py-3 text-[11px] font-semibold uppercase tracking-[.15em] text-white transition hover:bg-[#65474a]" data-testid="button-upload-photo"><Upload size={14} className="mr-2 inline" /> Choose photo</button>
      <p className="mt-5 text-[11px] text-[#aa9891]">JPG, JPEG, PNG or WEBP · max 10MB</p>
      <button onClick={() => onImage(DEMO_IMAGE)} className="mt-4 text-[11px] font-semibold text-[#a5636a] underline underline-offset-4" data-testid="button-use-demo-photo">Use our demo photo instead</button>
    </div>}
    <input ref={inputRef} onChange={(event) => readFile(event.target.files?.[0])} type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" className="hidden" data-testid="input-photo-picker" />
    <div className="mt-6 flex items-start justify-center gap-2 text-center text-[11px] leading-5 text-[#9b8983]"><ShieldCheck size={15} className="mt-0.5 shrink-0 text-[#b66f78]" /> Your photo is encrypted and never used to train our models.</div>
    {image && <button onClick={onNext} className="mx-auto mt-8 flex items-center gap-3 rounded-full bg-[#b66f78] px-7 py-4 text-xs font-semibold uppercase tracking-[.16em] text-white shadow-[0_12px_26px_rgba(182,111,120,.22)] transition hover:-translate-y-0.5 hover:bg-[#a35e68]" data-testid="button-continue-look">Continue to looks <ArrowRight size={16} /></button>}
  </div>;
}

function LookPanel({ gender, setGender, selectedLook, setSelectedLook, selectedColour, setSelectedColour, onBack, onGenerate }: { gender: Gender; setGender: (gender: Gender) => void; selectedLook: Look; setSelectedLook: (look: Look) => void; selectedColour: string; setSelectedColour: (colour: string) => void; onBack: () => void; onGenerate: () => void }) {
  return <div className="mx-auto max-w-5xl">
    <div className="mb-9 text-center">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-[.23em] text-[#b66f78]">Your edit starts here</p>
      <h2 className="font-editorial text-4xl tracking-[-.03em] text-[#433034] sm:text-5xl">What feels like you?</h2>
      <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#806e69]">Choose a silhouette and a colour. You can change either one before your preview.</p>
    </div>
    <div className="grid gap-10 lg:grid-cols-[1fr_260px]">
      <div>
        <div className="mb-8 rounded-2xl border border-[#e2d6d0] bg-[#fcfaf7] p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div><p className="text-[11px] font-semibold uppercase tracking-[.18em] text-[#5a4342]">Who are we styling?</p><p className="mt-1 text-xs text-[#9b8983]">This helps place the hairline and volume naturally.</p></div>
            <span className="rounded-full bg-[#f5e4df] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.12em] text-[#a3636b]">Required</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {([{ id: 'female', label: 'Female', detail: 'Longer movement + framing' }, { id: 'male', label: 'Male', detail: 'Shorter structure + taper' }] as const).map((option) => (
              <button key={option.id} onClick={() => setGender(option.id)} className={`rounded-xl border p-4 text-left transition ${gender === option.id ? 'border-[#b66f78] bg-[#f8e7e2] shadow-[0_8px_20px_rgba(182,111,120,.1)]' : 'border-[#e2d6d0] bg-white hover:border-[#caa6a0]'}`} data-testid={`button-gender-${option.id}`}>
                <span className="flex items-center justify-between"><span className="text-sm font-semibold text-[#4a3538]">{option.label}</span><span className={`h-3 w-3 rounded-full border ${gender === option.id ? 'border-[#b66f78] bg-[#b66f78] ring-4 ring-[#f2d8d2]' : 'border-[#bda8a1]'}`} /></span>
                <span className="mt-2 block text-[11px] text-[#9b8983]">{option.detail}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {looks.map((look, index) => <button key={look.id} onClick={() => setSelectedLook(look)} className={`group relative overflow-hidden rounded-2xl border text-left transition duration-300 hover:-translate-y-1 ${selectedLook.id === look.id ? 'border-[#b66f78] bg-[#f6e5df] shadow-[0_10px_28px_rgba(182,111,120,.13)]' : 'border-[#e2d6d0] bg-[#fcfaf7] hover:border-[#caa6a0]'}`} data-testid={`button-look-${look.id}`}>
            <div className={`relative h-36 overflow-hidden ${['bg-[#d9beb4]', 'bg-[#d7c3b4]', 'bg-[#d1afa9]', 'bg-[#ceb7b4]', 'bg-[#e3ccc0]', 'bg-[#d8bbb2]'][index]}`}>
              <div className={`absolute left-1/2 top-4 h-24 w-20 -translate-x-1/2 rounded-[48%] bg-[#e2ab96] ${look.id === 'bob' ? 'rounded-[42%_42%_22%_22%]' : ''}`} />
              <div className={`absolute left-1/2 top-1 h-28 w-[104px] -translate-x-1/2 rounded-[50%_50%_35%_35%] bg-[#4a2e30] shadow-[-15px_16px_0_#3b2528,15px_14px_0_#5e3b3c] ${look.id === 'sleek' ? 'h-32 rounded-[50%_50%_15%_15%]' : ''} ${look.id === 'curls' ? 'rounded-[45%] shadow-[-18px_16px_0_#4a2e30,18px_18px_0_#4a2e30]' : ''} ${look.id === 'bob' ? 'h-24 w-24 rounded-[45%_45%_25%_25%]' : ''}`} />
              <div className="absolute bottom-2 left-3 text-[9px] font-semibold uppercase tracking-[.17em] text-[#6d4948]/70">0{index + 1}</div>
              {selectedLook.id === look.id && <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#b66f78] text-white"><Check size={13} /></span>}
            </div>
            <div className="p-3.5"><p className="text-sm font-semibold text-[#4a3538]">{look.name}</p><p className="mt-1 text-[11px] text-[#9b8983]">{look.note}</p></div>
          </button>)}
        </div>
        <div className="mt-8 border-t border-[#e2d6d0] pt-7">
          <div className="mb-4 flex items-center justify-between"><p className="text-[11px] font-semibold uppercase tracking-[.18em] text-[#5a4342]">Choose a colour</p><span className="text-xs text-[#9b8983]">{selectedColour}</span></div>
          <div className="flex flex-wrap gap-3">{colours.map((colour) => <button key={colour.name} onClick={() => setSelectedColour(colour.name)} className={`flex items-center gap-2 rounded-full border px-3 py-2 text-xs transition ${selectedColour === colour.name ? 'border-[#b66f78] bg-[#f8e6e1] text-[#684248]' : 'border-[#e2d6d0] bg-[#fcfaf7] text-[#806e69] hover:border-[#caa6a0]'}`} data-testid={`button-colour-${colour.name.toLowerCase().replace(' ', '-')}`}><span className="h-5 w-5 rounded-full border border-white shadow-sm" style={{ backgroundColor: colour.hex }} />{colour.name}{selectedColour === colour.name && <Check size={13} />}</button>)}</div>
        </div>
      </div>
      <aside className="h-fit rounded-2xl bg-[#f0e1db] p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#a3636b]">Your selection</p>
         <div className="my-7 flex items-center gap-4"><div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#d9b9af] text-[#6c494a]"><Scissors size={24} strokeWidth={1.2} /></div><div><h3 className="font-editorial text-2xl text-[#493538]">{selectedLook.name}</h3><p className="mt-1 text-xs text-[#806e69]">{gender === 'male' ? 'Male' : 'Female'} · {selectedColour} · {selectedLook.texture}</p></div></div>
         <p className="border-t border-[#d8beb5] pt-5 text-sm leading-6 text-[#806e69]">The preview places a strand-rendered hair shape over the head, tuned to the selected presentation, cut, texture and colour.</p>
        <div className="mt-7 flex gap-2"><button onClick={onBack} className="flex h-11 w-11 items-center justify-center rounded-full border border-[#d5b9b0] text-[#745154] transition hover:bg-[#f8ebe6]" data-testid="button-back-upload" aria-label="Back to upload"><ChevronLeft size={17} /></button><button onClick={onGenerate} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#b66f78] px-4 py-3 text-[11px] font-semibold uppercase tracking-[.14em] text-white transition hover:bg-[#a35e68]" data-testid="button-generate-preview">Generate preview <Sparkles size={14} /></button></div>
      </aside>
    </div>
  </div>;
}

function Processing({ look, colour }: { look: Look; colour: string }) {
  return <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center sm:py-24">
    <div className="relative mb-8 h-28 w-28"><div className="absolute inset-0 rounded-full border border-[#dcbab3]" /><div className="absolute inset-3 rounded-full border border-[#c48688] border-t-transparent animate-spin" style={{ animationDuration: '1.8s' }} /><div className="absolute inset-0 flex items-center justify-center text-[#b66f78]"><Sparkles size={24} strokeWidth={1.3} /></div></div>
    <p className="text-[10px] font-semibold uppercase tracking-[.22em] text-[#b66f78]">Private preview in progress</p>
    <h2 className="mt-3 font-editorial text-4xl text-[#433034]">Finding your movement.</h2>
    <p className="mt-4 text-sm leading-6 text-[#806e69]">We’re mapping {look.name.toLowerCase()} in {colour.toLowerCase()} to your proportions. This takes a few quiet seconds.</p>
    <div className="mt-10 h-1 w-full overflow-hidden rounded-full bg-[#eadbd5]"><div className="h-full w-2/3 rounded-full bg-[#b66f78] transition-all" /></div>
    <div className="mt-4 flex w-full justify-between text-[10px] uppercase tracking-[.16em] text-[#a3918b]"><span>Reading shape</span><span>3–5 seconds</span></div>
  </div>;
}

function HairOverlay({ gender, look, colour }: { gender: Gender; look: Look; colour: string }) {
  const fill = hairHex(colour);
  const highlight = colour === 'Honey Blonde' ? '#f0c98d' : colour === 'Chestnut' ? '#b2785e' : '#8a5f58';
  const female = gender === 'female';
  const long = ['waves', 'sleek', 'curls'].includes(look.id);
  const bob = look.id === 'bob';
  return <svg className="pointer-events-none absolute inset-0 z-[2] h-full w-full" viewBox="0 0 900 1100" preserveAspectRatio="xMidYMid slice" aria-label={`${gender} ${look.name} hair overlay`}>
    <defs><linearGradient id="hair-shine" x1="0" x2="1"><stop offset="0" stopColor={fill} /><stop offset=".45" stopColor={highlight} stopOpacity=".72" /><stop offset="1" stopColor={fill} /></linearGradient></defs>
    <path d={female ? (long ? 'M255 430C205 245 290 102 448 95c180-8 257 143 205 335l-25 360c-32 122-105 204-180 238 39-176 22-340-2-478-18-102-39-173-91-196-55 24-93 103-100 196-8 113-1 275 27 478-95-54-142-160-153-294z' : 'M284 438C248 268 319 135 452 126c151-10 232 111 197 287l-30 112c-51-76-94-105-168-106-68-1-122 29-172 102z') : (bob ? 'M286 433C254 271 336 148 459 148c144 0 222 118 189 285l-16 168c-38 67-92 105-170 111-78-9-132-48-169-114z' : 'M312 433C278 274 353 160 460 160c126 0 199 110 173 274l-19 103c-34 58-83 89-154 96-73-9-122-41-157-100z')} fill="url(#hair-shine)" opacity=".98" />
    <path d={female ? 'M324 317C365 186 521 148 594 295M300 354C350 235 522 204 617 341M292 399C355 306 530 286 638 405' : 'M333 316C371 224 515 194 579 294M319 363C381 286 518 271 607 352'} fill="none" stroke={highlight} strokeWidth="13" strokeLinecap="round" opacity=".56" />
    <path d={female && long ? 'M306 445C292 620 332 793 370 916M350 438C342 635 383 823 414 962M568 431C590 600 552 806 507 964M615 438C637 606 606 764 563 900' : 'M335 443C327 546 346 629 371 694M568 436C584 527 568 624 543 687'} fill="none" stroke={highlight} strokeWidth="8" strokeLinecap="round" opacity=".45" />
    {look.id === 'curls' && <g fill="none" stroke={highlight} strokeWidth="16" opacity=".7"><path d="M294 466c-48 76 64 96 4 168s77 100 11 177" /><path d="M620 456c58 75-58 98 1 175s-72 103-7 184" /></g>}
    {!female && <path d="M346 226C397 164 518 158 584 228" fill="none" stroke="#1d1619" strokeWidth="24" strokeLinecap="round" opacity=".52" />}
  </svg>;
}

function Compare({ image, look, colour, gender, onReset, onToast }: { image: string; look: Look; colour: string; gender: Gender; onReset: () => void; onToast: (message: string) => void }) {
  const [position, setPosition] = useState(52);
  const [saved, setSaved] = useState(false);
  const [bagged, setBagged] = useState(false);
  const share = async () => {
    const text = `My Lustra preview: ${look.name} in ${colour}.`;
    const canShare = typeof navigator.share === 'function';
    try { if (canShare) await navigator.share({ title: 'My Lustra preview', text }); else await navigator.clipboard.writeText(text); onToast(canShare ? 'Preview ready to share.' : 'Preview link copied to clipboard.'); } catch { onToast('Your preview is ready to share.'); }
  };
  const save = () => { try { localStorage.setItem('lustra-preview', JSON.stringify({ image, look: look.name, colour })); } catch { /* local fallback unavailable */ } setSaved(true); onToast('Preview saved to this device.'); };
  return <div className="mx-auto max-w-6xl">
    <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="mb-3 text-[10px] font-semibold uppercase tracking-[.23em] text-[#b66f78]">Your private preview</p><h2 className="font-editorial text-4xl tracking-[-.03em] text-[#433034] sm:text-5xl">A new point of view.</h2><p className="mt-3 text-sm text-[#806e69]">Drag the line to compare your original photo with your {look.name.toLowerCase()} preview.</p></div><span className="flex w-fit items-center gap-2 rounded-full bg-[#f3e3dd] px-3 py-2 text-[10px] font-semibold uppercase tracking-[.13em] text-[#a3636b]"><Info size={13} /> Preview simulation</span></div>
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div>
        <div className="relative mx-auto aspect-[4/3] max-h-[610px] overflow-hidden rounded-[1.6rem] bg-[#e9d5cc] shadow-[0_24px_70px_rgba(76,49,46,.14)]">
           <img src={image || DEMO_IMAGE} alt="After preview" className="absolute inset-0 h-full w-full object-cover" data-testid="img-after-preview" /><HairOverlay gender={gender} look={look} colour={colour} />
           <div className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${position}%` }}><img src={image || DEMO_IMAGE} alt="Before preview" className="h-full max-w-none object-cover" style={{ width: `calc(100% * ${100 / position})` }} data-testid="img-before-preview" /><div className="absolute inset-0 bg-[#c9a99e]/10" /></div>
          <div className="absolute inset-y-0 z-10 w-px bg-white shadow-[0_0_0_1px_rgba(75,52,51,.18)]" style={{ left: `${position}%` }}><div className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#fffaf5] text-[#594042] shadow-lg"><ChevronLeft size={14} /><ChevronRight size={14} /></div></div>
          <div className="absolute left-4 top-4 rounded-full bg-[#493538]/70 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.15em] text-white backdrop-blur">Before</div><div className="absolute right-4 top-4 rounded-full bg-[#fffaf5]/85 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.15em] text-[#493538] backdrop-blur">After</div>
          <input type="range" min="15" max="85" value={position} onChange={(event) => setPosition(Number(event.target.value))} className="absolute inset-0 z-20 h-full w-full cursor-ew-resize opacity-0" aria-label="Compare before and after" data-testid="input-compare-slider" />
        </div>
        <div className="mt-4 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[.16em] text-[#9b8983]"><span>Original photo</span><span>Drag to compare</span><span>Your preview</span></div>
      </div>
       <aside className="rounded-[1.6rem] border border-[#e3d5cf] bg-[#fcfaf7] p-6 sm:p-7">
         <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#b66f78]">The edit</p><h3 className="mt-3 font-editorial text-3xl text-[#493538]" data-testid="text-result-style">LustraHair {look.name}</h3><p className="mt-1 text-sm text-[#806e69]">Premium Remy Human Hair Collection · {colour}</p>
        <div className="my-6 space-y-3 border-y border-[#e7dcd7] py-5 text-sm text-[#6d5b58]"><div className="flex gap-3"><Check className="mt-0.5 shrink-0 text-[#b66f78]" size={16} /><span>Remy human hair with natural movement</span></div><div className="flex gap-3"><Check className="mt-0.5 shrink-0 text-[#b66f78]" size={16} /><span>Heat-friendly, reusable and quietly luxurious</span></div><div className="flex gap-3"><Check className="mt-0.5 shrink-0 text-[#b66f78]" size={16} /><span>Hand-finished to your selected silhouette</span></div></div>
        <div className="flex items-end justify-between"><span className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#9b8983]">From</span><span className="font-editorial text-3xl text-[#493538]" data-testid="text-product-price">₹12,999</span></div>
         <button onClick={() => { setBagged(true); onToast('Your edit has been added to the bag.'); }} className={`mt-5 flex w-full items-center justify-center gap-2 rounded-full py-4 text-[11px] font-semibold uppercase tracking-[.15em] transition ${bagged ? 'bg-[#60494b] text-white' : 'bg-[#b66f78] text-white hover:bg-[#a35e68]'}`} data-testid="button-add-to-bag">{bagged ? <><Check size={15} /> Added to bag</> : <>Add to bag <ArrowRight size={15} /></>}</button>
        <button onClick={() => onToast(`Colour match requested for ${colour}.`)} className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-[#d9c5bd] py-3 text-[11px] font-semibold uppercase tracking-[.15em] text-[#68484c] transition hover:bg-[#f6e9e4]" data-testid="button-colour-match"><Sparkles size={14} /> Ask for a colour match</button>
         <div className="mt-5 flex justify-between border-t border-[#e7dcd7] pt-4"><button onClick={save} className="flex items-center gap-1.5 text-[11px] font-semibold text-[#806e69] transition hover:text-[#b66f78]" data-testid="button-save-preview"><Heart size={14} fill={saved ? 'currentColor' : 'none'} />{saved ? 'Saved' : 'Save this look'}</button><button onClick={share} className="flex items-center gap-1.5 text-[11px] font-semibold text-[#806e69] transition hover:text-[#b66f78]" data-testid="button-share-preview"><Link2 size={14} /> Share</button></div>
        <button onClick={onReset} className="mt-5 flex w-full items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[.12em] text-[#a3918b] transition hover:text-[#68484c]" data-testid="button-start-over"><RotateCcw size={13} /> Start with another photo</button>
      </aside>
    </div>
  </div>;
}

function Studio({ toast }: { toast: (message: string) => void }) {
  const [image, setImage] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [gender, setGender] = useState<Gender>('female');
  const [selectedLook, setSelectedLook] = useState(looks[0]);
  const [selectedColour, setSelectedColour] = useState('Dark Brown');
  const mutation = useGenerateTryOn();
  const [result, setResult] = useState<string | null>(null);
  const start = () => { setStep(1); document.getElementById('studio')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  const generate = () => {
    if (!image) return;
    setStep(3);
     mutation.mutate({ data: { imageData: image, style: selectedLook.name, color: selectedColour, gender } }, {
      onSuccess: (data) => { window.setTimeout(() => { setResult(data.previewImage || image); }, 3000); },
      onError: () => { window.setTimeout(() => { setResult(image); toast('We used a local preview so you can keep exploring.'); }, 2200); },
    });
  };
  useEffect(() => { if (mutation.isPending && step !== 3) setStep(3); }, [mutation.isPending, step]);
  const reset = () => { setResult(null); setImage(null); setStep(1); start(); };
  return <section id="studio" className="scroll-mt-8 bg-[#f8f5f0] px-5 py-24 lg:px-10 lg:py-32">
    <div className="mx-auto max-w-[1320px]">
       <div className="mb-14 flex flex-col justify-between gap-5 border-b border-[#e2d6d0] pb-7 sm:flex-row sm:items-end"><div><p className="mb-3 text-[10px] font-semibold uppercase tracking-[.23em] text-[#b66f78]">The Lustra studio</p><h2 className="font-editorial text-4xl tracking-[-.03em] text-[#433034] sm:text-5xl">Your look, in the making.</h2></div><p className="max-w-xs text-sm leading-6 text-[#806e69]">No guesswork. Just a considered first look at what could be yours.</p></div>
      <Progress step={result ? 3 : step} />
       {result ? <Compare image={result} look={selectedLook} colour={selectedColour} gender={gender} onReset={reset} onToast={toast} /> : step === 1 ? <UploadPanel image={image} onImage={(value) => setImage(value || null)} onError={toast} onNext={() => setStep(2)} /> : step === 2 ? <LookPanel gender={gender} setGender={setGender} selectedLook={selectedLook} setSelectedLook={setSelectedLook} selectedColour={selectedColour} setSelectedColour={setSelectedColour} onBack={() => setStep(1)} onGenerate={generate} /> : <Processing look={selectedLook} colour={selectedColour} />}
      {step === 3 && !result && <button onClick={() => { setStep(2); mutation.reset(); }} className="mx-auto mt-4 flex items-center gap-2 text-xs font-semibold text-[#9b8983] hover:text-[#68484c]" data-testid="button-cancel-processing"><ChevronLeft size={14} /> Back to edit</button>}
    </div>
  </section>;
}

function Story() {
  return <section id="story" className="hero-wash overflow-hidden px-5 py-24 lg:px-10 lg:py-32">
    <div className="mx-auto grid max-w-[1200px] items-center gap-16 lg:grid-cols-[.82fr_1.18fr]">
      <div><p className="mb-4 text-[10px] font-semibold uppercase tracking-[.23em] text-[#b66f78]">Not just a try-on</p><h2 className="font-editorial text-5xl leading-[.95] tracking-[-.04em] text-[#433034] sm:text-6xl">The luxury of<br /><em>knowing.</em></h2><p className="mt-7 max-w-md text-[15px] leading-7 text-[#806e69]">The right hair changes the way you enter a room. Lustra turns the most personal part of shopping into a moment of clarity — quiet, visual and entirely yours.</p><div className="mt-8 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[.16em] text-[#68484c]"><span className="h-px w-8 bg-[#b66f78]" />Made for the pause before yes</div></div>
      <div className="relative min-h-[420px]">
        <div className="absolute right-0 top-0 h-[370px] w-[74%] overflow-hidden rounded-[2rem] bg-[#e5c8be] shadow-[0_20px_55px_rgba(83,55,54,.1)]"><div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 62% 25%, #e9b8a7 0 14%, transparent 15%), radial-gradient(ellipse at 63% 37%, #3b2427 0 24%, transparent 25%), linear-gradient(135deg, #d4a99e, #f1d9cc)' }} /><div className="absolute bottom-[-15%] left-[20%] h-[68%] w-[60%] rounded-[50%_50%_16%_16%] bg-[#4b2e32] shadow-[-25px_0_0_#654044,25px_0_0_#3c272b]" /><p className="absolute bottom-6 right-6 text-[10px] uppercase tracking-[.22em] text-[#fffaf5]/75">A point of view</p></div>
        <div className="absolute bottom-0 left-0 w-[48%] rounded-2xl bg-[#493538] p-6 text-[#fffaf5] shadow-xl"><p className="font-editorial text-3xl leading-tight">“I could finally<br /><em>see it.</em>”</p><p className="mt-5 text-[10px] uppercase tracking-[.17em] text-[#e9c4bb]">— Naina, early Lustra client</p></div>
      </div>
    </div>
  </section>;
}

function Trust() {
  const points = [{ icon: ShieldCheck, title: 'Privacy by design', copy: 'Your photo is used for your preview, then left alone.' }, { icon: Scissors, title: 'Hair worth keeping', copy: 'Remy human hair, hand-finished and made for real life.' }, { icon: Sparkles, title: 'A better first step', copy: 'Take the uncertainty out of choosing your next signature.' }];
  return <section id="trust" className="bg-[#f1e3dc] px-5 py-24 lg:px-10 lg:py-28"><div className="mx-auto max-w-[1200px]"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="mb-3 text-[10px] font-semibold uppercase tracking-[.23em] text-[#a3636b]">The Lustra standard</p><h2 className="font-editorial text-4xl tracking-[-.03em] text-[#433034] sm:text-5xl">Good hair is<br /><em>a feeling.</em></h2></div><p className="max-w-xs text-sm leading-6 text-[#806e69]">Every detail is designed to help you choose with confidence — from the first upload to the first wear.</p></div><div className="mt-16 grid gap-10 border-t border-[#d9beb6] pt-9 md:grid-cols-3">{points.map(({ icon: Icon, title, copy }, index) => <div key={title} className="flex gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f9f0eb] text-[#b66f78]"><Icon size={19} strokeWidth={1.5} /></span><div><p className="mb-2 text-[10px] font-semibold uppercase tracking-[.16em] text-[#a3636b]">0{index + 1}</p><h3 className="text-lg font-semibold text-[#493538]">{title}</h3><p className="mt-2 max-w-[220px] text-sm leading-6 text-[#806e69]">{copy}</p></div></div>)}</div></div></section>;
}

function Footer({ onStart }: { onStart: () => void }) {
  return <footer className="bg-[#493538] px-5 pb-8 pt-20 text-[#fffaf5] lg:px-10"><div className="mx-auto max-w-[1200px]"><div className="flex flex-col justify-between gap-10 border-b border-white/15 pb-14 sm:flex-row"><div><Logo light /><p className="mt-6 max-w-xs text-sm leading-6 text-white/55">The private beauty consultation for your next signature.</p></div><div><p className="mb-4 text-[10px] font-semibold uppercase tracking-[.18em] text-[#e9c4bb]">Ready when you are?</p><button onClick={onStart} className="flex items-center gap-3 rounded-full bg-[#f7e4dc] px-5 py-3 text-[11px] font-semibold uppercase tracking-[.15em] text-[#493538] transition hover:bg-white" data-testid="button-footer-start">Try your look <ArrowUpRight size={15} /></button></div></div><div className="flex flex-col justify-between gap-4 pt-6 text-[11px] text-white/45 sm:flex-row"><span>© 2025 Lustra Hair. Made for your next chapter.</span><div className="flex gap-5"><button className="hover:text-white" data-testid="link-privacy">Privacy</button><button className="hover:text-white" data-testid="link-terms">Terms</button><Instagram size={15} /></div></div></div></footer>;
}

function Home() {
  const [toastMessage, setToastMessage] = useState('');
  const showToast = (message: string) => setToastMessage(message);
  const start = () => document.getElementById('studio')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return <div className="noise min-h-[100dvh] overflow-hidden"><Hero onStart={start} /><Studio toast={showToast} /><Story /><Trust /><Footer onStart={start} />{toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}</div>;
}

function Router() {
  return <RoutedErrorBoundary><Switch><Route path="/" component={Home} /><Route component={NotFound} /></Switch></RoutedErrorBoundary>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function NotFound() {
  return <div className="flex min-h-screen items-center justify-center bg-[#f8f5f0] text-center"><div><p className="font-editorial text-6xl text-[#493538]">404</p><p className="mt-3 text-sm text-[#806e69]">This page has gone missing.</p></div></div>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;