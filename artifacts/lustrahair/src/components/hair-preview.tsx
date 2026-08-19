import { useEffect, useRef } from 'react';
import { composeHairPreview } from '@/lib/hair-preview';

type HairPreviewProps = {
  photo: string;
  lookId: string;
  colourHex: string;
  colourName: string;
  gender: 'female' | 'male';
  className?: string;
  testId?: string;
};

export function HairPreview({
  photo,
  lookId,
  colourHex,
  colourName,
  gender,
  className,
  testId,
}: HairPreviewProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    let cancelled = false;
    const paint = async () => {
      const rect = wrap.getBoundingClientRect();
      if (rect.width < 4 || rect.height < 4) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      try {
        await composeHairPreview(canvas, { photo, lookId, colourHex, colourName, gender });
      } catch (error) {
        if (!cancelled) console.error(error);
      }
    };

    void paint();
    const observer = new ResizeObserver(() => {
      void paint();
    });
    observer.observe(wrap);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [photo, lookId, colourHex, colourName, gender]);

  return (
    <div ref={wrapRef} className={className}>
      <canvas ref={canvasRef} className="h-full w-full" data-testid={testId} />
    </div>
  );
}
