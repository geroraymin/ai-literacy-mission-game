import { useEffect, useRef } from 'react';
import type { TileRef } from '../data/types';
import { drawTile, loadAssets, TILE_SIZE } from '../game/assets';

// 대화창에 나오는 캐릭터 얼굴. 타일시트의 16px 스프라이트를 4배로 확대해 그린다.
const SCALE = 4;

export default function Portrait({ sprite }: { sprite: TileRef }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let mounted = true;
    loadAssets().then((sheets) => {
      const canvas = ref.current;
      if (!mounted || !canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(SCALE, SCALE);
      drawTile(ctx, sheets, sprite, 0, 0);
      ctx.restore();
    });
    return () => {
      mounted = false;
    };
  }, [sprite]);

  return (
    <canvas
      ref={ref}
      width={TILE_SIZE * SCALE}
      height={TILE_SIZE * SCALE}
      className="portrait"
      aria-hidden="true"
    />
  );
}
