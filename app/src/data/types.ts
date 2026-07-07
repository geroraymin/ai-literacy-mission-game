// 게임 전체에서 공유하는 타입 정의.
// 데이터 파일(맵/대사/퀴즈)을 수정할 때 이 타입을 기준으로 형식을 맞춘다.

export type SheetId = 'town' | 'dungeon';

export type RoomId = 'lobby' | 'security' | 'prompt' | 'data' | 'studio' | 'ethics';

/** 미션 방 5개 (로비 제외) */
export type MissionId = Exclude<RoomId, 'lobby'>;

/** 타일시트(town/dungeon)와 그 안의 타일 번호(0~131, 12열 기준) */
export interface TileRef {
  sheet: SheetId;
  idx: number;
}

/** 맵 격자 한 칸의 정의 */
export interface CellDef {
  base: TileRef;
  overlay?: TileRef;
  solid?: boolean;
  /** 밟으면 이동하는 문: 목적지 방 id */
  door?: RoomId;
}

export interface NpcDef {
  id: string;
  name: string;
  sprite: TileRef;
  /** 타일 좌표 (칸 단위) */
  tx: number;
  ty: number;
}

export interface MapDef {
  id: RoomId;
  name: string;
  /** 20칸 × 15줄 문자열 격자. legend의 글자와 1:1 대응 */
  grid: string[];
  legend: Record<string, CellDef>;
  npcs: NpcDef[];
}

export interface DialogueLine {
  speaker: string;
  sprite?: TileRef;
  text: string;
}

export type QuizType = 'choice' | 'ox' | 'find';

export interface QuizChoice {
  text: string;
  correct?: boolean;
  /** 이 선택지를 골랐을 때 보여줄 설명 (정답이면 개념 정리, 오답이면 왜 틀렸는지) */
  explain: string;
}

export interface QuizQuestion {
  id: string;
  type: QuizType;
  prompt: string;
  choices: QuizChoice[];
}

export interface MissionDef {
  id: MissionId;
  order: number;
  roomName: string;
  topic: string;
  badge: string;
  badgeName: string;
  npcId: string;
  npcName: string;
  /** 엔딩 화면의 복습 카드 */
  reviewCard: { title: string; body: string };
}
