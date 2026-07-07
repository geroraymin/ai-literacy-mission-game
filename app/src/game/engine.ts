import type { CellDef, NpcDef, RoomId } from '../data/types';
import { MAPS, MAP_COLS, MAP_ROWS, TILE, START } from '../data/maps';
import { store } from '../systems/store';
import { dirs, onAction } from './input';

// 게임 월드의 실시간 상태(플레이어 위치, 현재 방)와 이동/충돌/문/상호작용 처리.

interface RuntimeMap {
  id: RoomId;
  cells: CellDef[][]; // cells[y][x]
  npcs: NpcDef[];
}

// 문자열 격자를 실제 칸 배열로 변환 (시작 시 한 번만)
const runtimeMaps: Record<RoomId, RuntimeMap> = Object.fromEntries(
  Object.values(MAPS).map((def) => {
    const cells: CellDef[][] = def.grid.map((row, y) =>
      row.split('').map((ch, x) => {
        const cell = def.legend[ch];
        if (!cell) throw new Error(`맵 ${def.id} (${x},${y})의 알 수 없는 기호: "${ch}"`);
        return cell;
      }),
    );
    if (cells.length !== MAP_ROWS || cells.some((r) => r.length !== MAP_COLS)) {
      throw new Error(`맵 ${def.id}의 크기가 ${MAP_COLS}x${MAP_ROWS}가 아닙니다`);
    }
    return [def.id, { id: def.id, cells, npcs: def.npcs }];
  }),
) as Record<RoomId, RuntimeMap>;

export type Facing = 'up' | 'down' | 'left' | 'right';

export interface EngineState {
  room: RoomId;
  /** 플레이어 발밑 중심의 픽셀 좌표 */
  x: number;
  y: number;
  facing: Facing;
  moving: boolean;
  animTime: number;
}

export const engine: EngineState = {
  room: START.room,
  x: START.tx * TILE + TILE / 2,
  y: START.ty * TILE + TILE / 2,
  facing: 'down',
  moving: false,
  animTime: 0,
};

export function currentMap(): RuntimeMap {
  return runtimeMaps[engine.room];
}

export function resetEngine(): void {
  engine.room = START.room;
  engine.x = START.tx * TILE + TILE / 2;
  engine.y = START.ty * TILE + TILE / 2;
  engine.facing = 'down';
  engine.moving = false;
  engine.animTime = 0;
  store.setRoom(START.room);
}

/** Space/Enter/A버튼 → 근처 NPC에게 말 걸기. 해제 함수를 돌려준다 */
export function bindInteraction(): () => void {
  return onAction(() => {
    const s = store.getState();
    if (s.phase === 'playing' && s.interactHint) {
      store.talkTo(s.interactHint);
    }
  });
}

const SPEED = 72; // 초당 픽셀
const HALF_W = 5; // 발밑 충돌 상자 절반 너비
const HALF_H = 4; // 발밑 충돌 상자 절반 높이
const INTERACT_RANGE = 26; // NPC에게 말 걸 수 있는 거리(픽셀)

function isSolidAt(map: RuntimeMap, px: number, py: number): boolean {
  const tx = Math.floor(px / TILE);
  const ty = Math.floor(py / TILE);
  if (tx < 0 || ty < 0 || tx >= MAP_COLS || ty >= MAP_ROWS) return true;
  if (map.cells[ty][tx].solid) return true;
  // NPC가 서 있는 칸도 지나갈 수 없다
  return map.npcs.some((n) => n.tx === tx && n.ty === ty);
}

function boxBlocked(map: RuntimeMap, cx: number, cy: number): boolean {
  return (
    isSolidAt(map, cx - HALF_W, cy - HALF_H) ||
    isSolidAt(map, cx + HALF_W, cy - HALF_H) ||
    isSolidAt(map, cx - HALF_W, cy + HALF_H) ||
    isSolidAt(map, cx + HALF_W, cy + HALF_H)
  );
}

/** 문을 통과했을 때: 목적지 방에서 "돌아오는 문" 옆의 걸을 수 있는 칸에 등장 */
function transition(to: RoomId): void {
  const from = engine.room;
  const target = runtimeMaps[to];

  let doorX = Math.floor(MAP_COLS / 2);
  let doorY = Math.floor(MAP_ROWS / 2);
  outer: for (let y = 0; y < MAP_ROWS; y++) {
    for (let x = 0; x < MAP_COLS; x++) {
      if (target.cells[y][x].door === from) {
        doorX = x;
        doorY = y;
        break outer;
      }
    }
  }

  // 문 안쪽(맵 중앙 쪽) 이웃 칸부터 순서대로 시도
  const candidates: Array<[number, number]> = [
    [doorX, doorY + 1],
    [doorX, doorY - 1],
    [doorX + 1, doorY],
    [doorX - 1, doorY],
  ].sort((a, b) => {
    const center = (p: [number, number]) =>
      Math.abs(p[0] - MAP_COLS / 2) + Math.abs(p[1] - MAP_ROWS / 2);
    return center(a as [number, number]) - center(b as [number, number]);
  }) as Array<[number, number]>;

  let spawn = candidates[0];
  for (const [cx, cy] of candidates) {
    if (
      cx >= 0 &&
      cy >= 0 &&
      cx < MAP_COLS &&
      cy < MAP_ROWS &&
      !target.cells[cy][cx].solid &&
      !target.cells[cy][cx].door
    ) {
      spawn = [cx, cy];
      break;
    }
  }

  engine.room = to;
  engine.x = spawn[0] * TILE + TILE / 2;
  engine.y = spawn[1] * TILE + TILE / 2;
  store.setRoom(to);
  store.setInteractHint(null);
}

/** 매 프레임 호출. dt는 초 단위 경과 시간 */
export function update(dt: number): void {
  if (store.getState().phase !== 'playing') {
    engine.moving = false;
    return;
  }

  const map = currentMap();
  let vx = (dirs.right ? 1 : 0) - (dirs.left ? 1 : 0);
  let vy = (dirs.down ? 1 : 0) - (dirs.up ? 1 : 0);

  if (vx !== 0 || vy !== 0) {
    if (vx !== 0 && vy !== 0) {
      // 대각선 이동이 더 빨라지지 않게 보정
      vx *= Math.SQRT1_2;
      vy *= Math.SQRT1_2;
    }
    engine.facing =
      Math.abs(vx) >= Math.abs(vy) ? (vx > 0 ? 'right' : 'left') : vy > 0 ? 'down' : 'up';
    engine.moving = true;
    engine.animTime += dt;
  } else {
    engine.moving = false;
    engine.animTime = 0;
  }

  // 축을 나눠서 이동 — 벽에 비스듬히 부딪혀도 미끄러지듯 움직인다
  const nx = engine.x + vx * SPEED * dt;
  if (!boxBlocked(map, nx, engine.y)) engine.x = nx;
  const ny = engine.y + vy * SPEED * dt;
  if (!boxBlocked(map, engine.x, ny)) engine.y = ny;

  // 문 밟으면 방 이동
  const cell = map.cells[Math.floor(engine.y / TILE)]?.[Math.floor(engine.x / TILE)];
  if (cell?.door) {
    transition(cell.door);
    return;
  }

  // 말 걸 수 있는 NPC 탐색
  let hint: string | null = null;
  let best = INTERACT_RANGE;
  for (const npc of map.npcs) {
    const cx = npc.tx * TILE + TILE / 2;
    const cy = npc.ty * TILE + TILE / 2;
    const dist = Math.hypot(cx - engine.x, cy - engine.y);
    if (dist < best) {
      best = dist;
      hint = npc.id;
    }
  }
  store.setInteractHint(hint);
}
