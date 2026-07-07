import type { TileRef } from '../data/types';

// Kenney 타일시트 로딩과 타일 그리기.
// 시트 규격: 16px 타일이 가로 12개 × 세로 11개 (tilemap_packed.png, 간격 없음)
const SHEET_COLS = 12;
export const TILE_SIZE = 16;

export interface Sheets {
  town: HTMLImageElement;
  dungeon: HTMLImageElement;
}

let cached: Promise<Sheets> | null = null;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`이미지 로딩 실패: ${src}`));
    img.src = src;
  });
}

/** 두 타일시트를 로딩한다 (한 번만 로딩하고 이후엔 재사용) */
export function loadAssets(): Promise<Sheets> {
  if (!cached) {
    cached = Promise.all([
      loadImage(`${import.meta.env.BASE_URL}assets/town.png`),
      loadImage(`${import.meta.env.BASE_URL}assets/dungeon.png`),
    ]).then(([town, dungeon]) => ({ town, dungeon }));
  }
  return cached;
}

/** 타일 하나를 캔버스에 그린다. flip이면 좌우 반전(걷기 애니메이션용) */
export function drawTile(
  ctx: CanvasRenderingContext2D,
  sheets: Sheets,
  ref: TileRef,
  dx: number,
  dy: number,
  flip = false,
): void {
  const img = sheets[ref.sheet];
  const sx = (ref.idx % SHEET_COLS) * TILE_SIZE;
  const sy = Math.floor(ref.idx / SHEET_COLS) * TILE_SIZE;
  if (flip) {
    ctx.save();
    ctx.translate(dx + TILE_SIZE, dy);
    ctx.scale(-1, 1);
    ctx.drawImage(img, sx, sy, TILE_SIZE, TILE_SIZE, 0, 0, TILE_SIZE, TILE_SIZE);
    ctx.restore();
  } else {
    ctx.drawImage(img, sx, sy, TILE_SIZE, TILE_SIZE, dx, dy, TILE_SIZE, TILE_SIZE);
  }
}
