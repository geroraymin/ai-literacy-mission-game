import { PALETTE } from '../data/palette';
import { SPRITES } from '../data/dialogues';
import { MISSION_BY_NPC } from '../data/missions';
import { MAP_COLS, MAP_ROWS, TILE } from '../data/maps';
import { store } from '../systems/store';
import { drawTile, type Sheets } from './assets';
import { currentMap, engine } from './engine';

// 캔버스에 맵/NPC/플레이어를 그린다. 내부 해상도는 320×240 고정(20×15타일).
export const VIEW_W = MAP_COLS * TILE; // 320
export const VIEW_H = MAP_ROWS * TILE; // 240

interface Entity {
  y: number;
  draw: () => void;
}

export function render(ctx: CanvasRenderingContext2D, sheets: Sheets, time: number): void {
  const map = currentMap();
  const state = store.getState();

  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = PALETTE.night;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  // 1) 바닥/벽/가구
  for (let y = 0; y < MAP_ROWS; y++) {
    for (let x = 0; x < MAP_COLS; x++) {
      const cell = map.cells[y][x];
      drawTile(ctx, sheets, cell.base, x * TILE, y * TILE);
      if (cell.overlay) drawTile(ctx, sheets, cell.overlay, x * TILE, y * TILE);
    }
  }

  // 2) NPC + 플레이어를 y좌표 순으로 그려서 앞뒤가 자연스럽게 겹치게 한다
  const entities: Entity[] = map.npcs.map((npc) => ({
    y: npc.ty * TILE,
    draw: () => drawTile(ctx, sheets, npc.sprite, npc.tx * TILE, npc.ty * TILE),
  }));

  // 걷기 애니메이션: 0.16초마다 프레임 교대 (좌우 반전 + 1px 들썩임)
  const frame = engine.moving ? Math.floor(engine.animTime / 0.16) % 2 : 0;
  const flip = engine.facing === 'left' ? frame === 0 : frame === 1;
  const bob = frame === 1 ? -1 : 0;
  const px = Math.round(engine.x - TILE / 2);
  const py = Math.round(engine.y - TILE + 4) + bob;
  entities.push({
    y: py,
    draw: () => drawTile(ctx, sheets, SPRITES.player, px, py, flip),
  });

  entities.sort((a, b) => a.y - b.y);
  entities.forEach((e) => e.draw());

  // 3) NPC 머리 위 표시: 미션 남음(!) / 완료(✓)
  const markerBob = Math.sin(time / 250) * 1.5;
  ctx.font = 'bold 8px monospace';
  ctx.textAlign = 'center';
  for (const npc of map.npcs) {
    const mx = npc.tx * TILE + TILE / 2;
    const my = npc.ty * TILE - 4 + markerBob;
    const mission = MISSION_BY_NPC[npc.id];
    let mark: string | null = null;
    let color: string = PALETTE.yellow;
    if (mission) {
      if (state.progress.completed.includes(mission.id)) {
        mark = 'v';
        color = PALETTE.green;
      } else {
        mark = '!';
      }
    } else if (npc.id === 'director') {
      // 소장: 첫 안내 전이거나, 배지를 다 모아 보고할 차례일 때 표시
      if (!state.progress.introDone || state.progress.completed.length >= 5) mark = '!';
    }
    if (mark) {
      ctx.fillStyle = PALETTE.ink;
      ctx.fillText(mark, mx + 1, my + 1);
      ctx.fillStyle = color;
      ctx.fillText(mark, mx, my);
    }
  }
}
