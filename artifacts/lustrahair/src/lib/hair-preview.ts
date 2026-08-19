import demoPortrait from '@assets/lustrahair-demo.jpg';
import demoAfterWaves from '@assets/generated_images/demo-after-waves.png';
import demoAfterSleek from '@assets/generated_images/demo-after-sleek.png';
import demoAfterCurls from '@assets/generated_images/demo-after-curls.png';
import demoAfterBob from '@assets/generated_images/demo-after-bob.png';
import demoAfterLayers from '@assets/generated_images/demo-after-layers.png';
import demoAfterBangs from '@assets/generated_images/demo-after-bangs.png';
import demoWavesBlack from '@assets/generated_images/demo-waves-black.png';
import demoWavesChestnut from '@assets/generated_images/demo-waves-chestnut.png';
import demoWavesHoney from '@assets/generated_images/demo-waves-honey.png';
import demoBobBlack from '@assets/generated_images/demo-bob-black.png';
import demoBobChestnut from '@assets/generated_images/demo-bob-chestnut.png';
import demoBobHoney from '@assets/generated_images/demo-bob-honey.png';
import demoCurlsBlack from '@assets/generated_images/demo-curls-black.png';
import demoCurlsChestnut from '@assets/generated_images/demo-curls-chestnut.png';
import demoCurlsHoney from '@assets/generated_images/demo-curls-honey.png';
import demoSleekHoney from '@assets/generated_images/demo-sleek-honey.png';
import demoLayersBlack from '@assets/generated_images/demo-layers-black.png';
import demoLayersHoney from '@assets/generated_images/demo-layers-honey.png';
import femaleWaves from '@assets/generated_images/female-waves-overlay.png';
import femaleSleek from '@assets/generated_images/female-sleek-overlay.png';
import femaleCurls from '@assets/generated_images/female-curls-overlay.png';
import femaleBob from '@assets/generated_images/female-bob-overlay.png';
import femaleLayers from '@assets/generated_images/female-layers-overlay.png';
import femaleBangs from '@assets/generated_images/female-bangs-overlay.png';
import maleTextured from '@assets/generated_images/male-textured-overlay-v2.png';
import maleWaves from '@assets/generated_images/male-waves-overlay.png';
import maleSleek from '@assets/generated_images/male-sleek-overlay.png';

export const DEMO_PHOTO = demoPortrait;

const COLOUR_KEY: Record<string, string> = {
  Black: 'black',
  'Dark Brown': 'dark-brown',
  Chestnut: 'chestnut',
  'Honey Blonde': 'honey',
};

const DEMO_MOCKUPS: Record<string, Record<string, string>> = {
  waves: {
    black: demoWavesBlack,
    'dark-brown': demoAfterWaves,
    chestnut: demoWavesChestnut,
    honey: demoWavesHoney,
  },
  sleek: {
    black: demoAfterSleek,
    'dark-brown': demoAfterSleek,
    chestnut: demoAfterSleek,
    honey: demoSleekHoney,
  },
  curls: {
    black: demoCurlsBlack,
    'dark-brown': demoAfterCurls,
    chestnut: demoCurlsChestnut,
    honey: demoCurlsHoney,
  },
  bob: {
    black: demoBobBlack,
    'dark-brown': demoAfterBob,
    chestnut: demoBobChestnut,
    honey: demoBobHoney,
  },
  layers: {
    black: demoLayersBlack,
    'dark-brown': demoAfterLayers,
    chestnut: demoAfterLayers,
    honey: demoLayersHoney,
  },
  bangs: {
    black: demoAfterBangs,
    'dark-brown': demoAfterBangs,
    chestnut: demoAfterBangs,
    honey: demoAfterBangs,
  },
};

const FEMALE_OVERLAY: Record<string, string> = {
  waves: femaleWaves,
  sleek: femaleSleek,
  curls: femaleCurls,
  bob: femaleBob,
  layers: femaleLayers,
  bangs: femaleBangs,
};

const MALE_OVERLAY: Record<string, string> = {
  waves: maleWaves,
  sleek: maleSleek,
  curls: maleWaves,
  bob: maleTextured,
  layers: maleTextured,
  bangs: maleTextured,
};

export function overlayFor(gender: 'female' | 'male', lookId: string) {
  const pack = gender === 'male' ? MALE_OVERLAY : FEMALE_OVERLAY;
  return pack[lookId] ?? pack.waves;
}

function isDemoPhoto(src: string) {
  return src === demoPortrait || src.includes('lustrahair-demo');
}

function colourSlug(colour: string) {
  return COLOUR_KEY[colour] ?? 'dark-brown';
}

function demoMockup(lookId: string, colour: string) {
  const pack = DEMO_MOCKUPS[lookId] ?? DEMO_MOCKUPS.waves;
  const key = colourSlug(colour);
  return pack[key] ?? pack['dark-brown'];
}

type RGB = { r: number; g: number; b: number };

function parseHex(hex: string): RGB {
  const n = hex.replace('#', '');
  return {
    r: Number.parseInt(n.slice(0, 2), 16),
    g: Number.parseInt(n.slice(2, 4), 16),
    b: Number.parseInt(n.slice(4, 6), 16),
  };
}

function lum(r: number, g: number, b: number) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load ${src}`));
    img.src = src;
  });
}

function coverDraw(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  iw: number,
  ih: number,
  cw: number,
  ch: number,
) {
  const scale = Math.max(cw / iw, ch / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
}

function isSkin(r: number, g: number, b: number) {
  const yv = lum(r, g, b);
  if (yv < 50 || yv > 215) return false;
  const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
  const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
  return cr >= 133 && cr <= 183 && cb >= 77 && cb <= 135 && r + 12 >= g && r > b;
}

function detectHead(image: ImageData) {
  const { data, width: w, height: h } = image;
  const step = Math.max(1, Math.floor(Math.min(w, h) / 150));
  let minX = w;
  let minY = h;
  let maxX = 0;
  let maxY = 0;
  let count = 0;
  const yLimit = Math.floor(h * 0.7);
  for (let y = Math.floor(h * 0.02); y < yLimit; y += step) {
    for (let x = Math.floor(w * 0.1); x < w * 0.9; x += step) {
      const i = (y * w + x) * 4;
      if (!isSkin(data[i], data[i + 1], data[i + 2])) continue;
      count += 1;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
  if (count < 28) {
    return { x: w * 0.31, y: h * 0.1, w: w * 0.38, h: h * 0.46 };
  }
  const boxW = maxX - minX;
  const boxH = maxY - minY;
  const x = Math.max(0, minX - boxW * 0.08);
  const y = Math.max(0, minY - boxH * 0.06);
  return {
    x,
    y,
    w: Math.min(w - x, Math.max(w * 0.18, Math.min(w * 0.48, boxW * 1.15))),
    h: Math.min(h - y, Math.max(h * 0.22, Math.min(h * 0.55, boxH * 1.2))),
  };
}

async function detectFaceBox(source: HTMLCanvasElement, image: ImageData) {
  try {
    const Detector = (globalThis as unknown as { FaceDetector?: new (opts: object) => { detect: (input: HTMLCanvasElement) => Promise<Array<{ boundingBox: DOMRectReadOnly }>> } }).FaceDetector;
    if (Detector) {
      const faces = await new Detector({ maxDetectedFaces: 1, fastMode: false }).detect(source);
      const box = faces[0]?.boundingBox;
      if (box && box.width > 24 && box.height > 24) {
        return { x: box.x, y: box.y, w: box.width, h: box.height };
      }
    }
  } catch {
    /* fall through */
  }
  return detectHead(image);
}

function isBackdropPixel(r: number, g: number, b: number, a: number) {
  if (a < 12) return true;
  const yv = lum(r, g, b);
  if (yv < 16) return true;
  if (yv > 226) return true;
  if (r > 175 && g > 155 && b < 170 && r + g > b * 2.15) return true;
  if (r > 198 && g > 180 && b > 130 && yv > 185) return true;
  return false;
}

function knockoutBackdrop(image: ImageData) {
  const { data, width: w, height: h } = image;
  const seen = new Uint8Array(w * h);
  const stack: number[] = [];
  const tryPush = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const i = y * w + x;
    if (seen[i]) return;
    const p = i * 4;
    if (!isBackdropPixel(data[p], data[p + 1], data[p + 2], data[p + 3])) return;
    seen[i] = 1;
    stack.push(i);
  };
  for (let x = 0; x < w; x += 1) {
    tryPush(x, 0);
    tryPush(x, h - 1);
  }
  for (let y = 0; y < h; y += 1) {
    tryPush(0, y);
    tryPush(w - 1, y);
  }
  while (stack.length) {
    const i = stack.pop()!;
    data[i * 4 + 3] = 0;
    const x = i % w;
    const y = (i / w) | 0;
    tryPush(x + 1, y);
    tryPush(x - 1, y);
    tryPush(x, y + 1);
    tryPush(x, y - 1);
  }
}

function alphaBounds(image: ImageData) {
  const { data, width: w, height: h } = image;
  let minX = w;
  let minY = h;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      if (data[(y * w + x) * 4 + 3] < 28) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
  if (maxX <= minX || maxY <= minY) return null;
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

function dyeOverlayHair(image: ImageData, target: RGB) {
  const { data } = image;
  const targetLum = Math.max(lum(target.r, target.g, target.b), 18);
  const lift = targetLum > 90 ? 1.2 : targetLum > 55 ? 1.02 : 0.86;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 28) continue;
    if (isSkin(data[i], data[i + 1], data[i + 2])) {
      data[i + 3] = 0;
      continue;
    }
    const yv = lum(data[i], data[i + 1], data[i + 2]);
    const spec = yv > 150 ? (yv - 150) / 105 : 0;
    const shade = Math.min(1.5, ((yv / 118) * lift) ** 0.9);
    data[i] = Math.min(255, target.r * shade + 255 * spec * 0.4);
    data[i + 1] = Math.min(255, target.g * shade + 236 * spec * 0.32);
    data[i + 2] = Math.min(255, target.b * shade + 210 * spec * 0.22);
  }
}

function openFace(
  ctx: CanvasRenderingContext2D,
  face: { x: number; y: number; w: number; h: number },
  gender: 'female' | 'male',
) {
  const cx = face.x + face.w / 2;
  const cy = face.y + face.h * (gender === 'male' ? 0.64 : 0.56);
  const rx = face.w * (gender === 'male' ? 0.5 : 0.42);
  const ry = face.h * (gender === 'male' ? 0.66 : 0.5);
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  const gradient = ctx.createRadialGradient(cx, cy, rx * 0.4, cx, cy, Math.max(rx, ry));
  gradient.addColorStop(0, 'rgba(0,0,0,1)');
  gradient.addColorStop(0.78, 'rgba(0,0,0,0.94)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export async function composeHairPreview(
  canvas: HTMLCanvasElement,
  input: {
    photo: string;
    lookId: string;
    colourHex: string;
    colourName: string;
    gender: 'female' | 'male';
  },
) {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;

  const { width: w, height: h } = canvas;
  ctx.clearRect(0, 0, w, h);

  if (isDemoPhoto(input.photo) && input.gender === 'female') {
    const mockup = await loadImage(demoMockup(input.lookId, input.colourName));
    coverDraw(ctx, mockup, mockup.naturalWidth, mockup.naturalHeight, w, h);
    return;
  }

  const photo = await loadImage(input.photo);
  coverDraw(ctx, photo, photo.naturalWidth, photo.naturalHeight, w, h);
  const portrait = ctx.getImageData(0, 0, w, h);
  const face = await detectFaceBox(canvas, portrait);

  const overlayImg = await loadImage(overlayFor(input.gender, input.lookId));
  const prepared = document.createElement('canvas');
  prepared.width = overlayImg.naturalWidth;
  prepared.height = overlayImg.naturalHeight;
  const px = prepared.getContext('2d', { willReadFrequently: true });
  if (!px) return;
  px.drawImage(overlayImg, 0, 0);
  const overlayPixels = px.getImageData(0, 0, prepared.width, prepared.height);
  knockoutBackdrop(overlayPixels);
  dyeOverlayHair(overlayPixels, parseHex(input.colourHex));
  px.putImageData(overlayPixels, 0, 0);
  const hair = alphaBounds(overlayPixels);
  if (!hair) return;

  const aspect = hair.w / Math.max(hair.h, 1);
  const maxW = w * (input.gender === 'male' ? 0.42 : 0.52);
  const destW = Math.min(maxW, Math.max(face.w * (input.gender === 'male' ? 1.35 : 1.7), w * 0.24));
  const destH = destW / Math.max(aspect, 0.55);
  const destX = face.x + face.w / 2 - destW / 2;
  const destY = face.y - destH * (input.gender === 'male' ? 0.48 : 0.38);

  const layer = document.createElement('canvas');
  layer.width = w;
  layer.height = h;
  const lx = layer.getContext('2d');
  if (!lx) return;
  lx.drawImage(prepared, hair.x, hair.y, hair.w, hair.h, destX, destY, destW, destH);
  openFace(lx, face, input.gender);
  ctx.drawImage(layer, 0, 0);
}
