import type { CellDef, MapDef, RoomId, TileRef } from './types';
import { SPRITES } from './dialogues';

// ── 타일 정의 (Kenney 타일시트의 타일 번호) ──────────────────────
const dun = (idx: number): TileRef => ({ sheet: 'dungeon', idx });
const town = (idx: number): TileRef => ({ sheet: 'town', idx });

const FLOOR = dun(48); // 밝은 모래빛 바닥
const FLOOR2 = dun(49); // 얼룩 있는 바닥 (변화용)
const WALL = dun(57); // 회색 벽돌 벽
const WALL_TECH = dun(41); // 장비가 붙은 벽 (연구소 느낌)
const DOOR = dun(45); // 문

// 격자 글자 → 칸 정의. 모든 맵이 공통으로 쓰는 기호들.
const baseLegend = (doors: Record<string, RoomId>): Record<string, CellDef> => {
  const legend: Record<string, CellDef> = {
    '#': { base: WALL, solid: true },
    W: { base: WALL_TECH, solid: true },
    '.': { base: FLOOR },
    ',': { base: FLOOR2 },
    B: { base: FLOOR, overlay: dun(63), solid: true }, // 책장
    T: { base: FLOOR, overlay: dun(54), solid: true }, // 서버/단말기
    C: { base: FLOOR, overlay: dun(65), solid: true }, // 컴퓨터 콘솔
    c: { base: FLOOR, overlay: dun(89), solid: true }, // 상자
    t: { base: FLOOR, overlay: dun(72), solid: true }, // 테이블
    s: { base: FLOOR, overlay: dun(73), solid: true }, // 의자
    p: { base: FLOOR, overlay: town(17) }, // 화분 (지나갈 수 있음)
  };
  for (const [ch, to] of Object.entries(doors)) {
    legend[ch] = { base: DOOR, door: to };
  }
  return legend;
};

// ── 맵 데이터 (20칸 × 15줄) ─────────────────────────────────────
// 기호: # 벽 / W 장비벽 / . , 바닥 / B책장 T서버 C콘솔 c상자 t테이블 s의자 p화분
// a~e = 로비에서 각 방으로 가는 문, L = 방에서 로비로 돌아가는 문
export const MAPS: Record<RoomId, MapDef> = {
  lobby: {
    id: 'lobby',
    name: '연구소 로비',
    grid: [
      '####a#####b####c####',
      '#,.......,........,#',
      '#.B..T........T..B.#',
      '#..................#',
      '#...,........,.....#',
      '#..................#',
      '#..................#',
      'd..................e',
      '#..................#',
      '#....,.......,.....#',
      '#..................#',
      '#.p..............p.#',
      '#......,....,......#',
      '#..................#',
      '####################',
    ],
    legend: baseLegend({ a: 'security', b: 'prompt', c: 'data', d: 'studio', e: 'ethics' }),
    npcs: [{ id: 'director', name: '김탐구 소장', sprite: SPRITES.director, tx: 10, ty: 6 }],
  },

  security: {
    id: 'security',
    name: '보안실',
    grid: [
      '####W#####W####W####',
      '#,................,#',
      '#.c..............c.#',
      '#..................#',
      '#....,........,....#',
      '#..................#',
      '#...c..........c...#',
      '#..................#',
      '#.......,..........#',
      '#..................#',
      '#.p..............p.#',
      '#..................#',
      '#..........,.......#',
      '#..................#',
      '#########L##########',
    ],
    legend: baseLegend({ L: 'lobby' }),
    npcs: [{ id: 'guard', name: '강철벽 요원', sprite: SPRITES.guard, tx: 10, ty: 4 }],
  },

  prompt: {
    id: 'prompt',
    name: '프롬프트 랩',
    grid: [
      '####W#####W####W####',
      '#,................,#',
      '#.B.B.B......B.B.B.#',
      '#..................#',
      '#...t.........t....#',
      '#...s.........s....#',
      '#......,...........#',
      '#..................#',
      '#...t.........t....#',
      '#...s.........s....#',
      '#..................#',
      '#.p....,.........p.#',
      '#..................#',
      '#..................#',
      '#########L##########',
    ],
    legend: baseLegend({ L: 'lobby' }),
    npcs: [{ id: 'writer', name: '한줄기 연구원', sprite: SPRITES.writer, tx: 9, ty: 6 }],
  },

  data: {
    id: 'data',
    name: '데이터실',
    grid: [
      '####W#####W####W####',
      '#,................,#',
      '#.T.T.T....T.T.T...#',
      '#..................#',
      '#.T.T.T....T.T.T...#',
      '#..................#',
      '#.....,......,.....#',
      '#..................#',
      '#..................#',
      '#.C..............C.#',
      '#..................#',
      '#.p..............p.#',
      '#.......,..........#',
      '#..................#',
      '#########L##########',
    ],
    legend: baseLegend({ L: 'lobby' }),
    npcs: [{ id: 'doctor', name: '나균형 박사', sprite: SPRITES.doctor, tx: 10, ty: 7 }],
  },

  studio: {
    id: 'studio',
    name: '생성 AI 스튜디오',
    grid: [
      '####################',
      '#,.........,.......#',
      '#.B......C.......B.#',
      '#..................#',
      '#...t.........t....#',
      '#...s.........s....#',
      '#......,...........#',
      '#..................L',
      '#..................#',
      '#....c........c....#',
      '#..................#',
      '#.p......,.......p.#',
      '#..................#',
      '#..................#',
      '####################',
    ],
    legend: baseLegend({ L: 'lobby' }),
    npcs: [{ id: 'artist', name: '오팩트 아티스트', sprite: SPRITES.artist, tx: 9, ty: 6 }],
  },

  ethics: {
    id: 'ethics',
    name: 'AI 윤리위원회',
    grid: [
      '####################',
      '#,.........,.......#',
      '#.B..............B.#',
      '#..................#',
      '#....s.s..s.s......#',
      '#...tttttttttt.....#',
      '#..................#',
      'L..................#',
      '#..................#',
      '#......,......,....#',
      '#.c..............c.#',
      '#.p..............p.#',
      '#..................#',
      '#..................#',
      '####################',
    ],
    legend: baseLegend({ L: 'lobby' }),
    npcs: [{ id: 'chief', name: '정의로 위원장', sprite: SPRITES.chief, tx: 15, ty: 5 }],
  },
};

export const MAP_COLS = 20;
export const MAP_ROWS = 15;
export const TILE = 16;

/** 게임 시작 시 플레이어가 서 있는 곳 (로비) */
export const START = { room: 'lobby' as RoomId, tx: 10, ty: 11 };
