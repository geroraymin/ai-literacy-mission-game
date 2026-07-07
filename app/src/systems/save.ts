import type { MissionId } from '../data/types';

// localStorage(브라우저에 데이터를 남겨두는 저장소)를 이용한 이어하기 기능.
const KEY = 'ai-lab-explorer-save-v1';

export interface SaveData {
  v: 1;
  introDone: boolean;
  completed: MissionId[];
  scores: Partial<Record<MissionId, number>>;
}

export function saveGame(data: Omit<SaveData, 'v'>): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ v: 1, ...data }));
  } catch (e) {
    // 시크릿 모드 등 저장이 막힌 환경에서는 이어하기 없이 진행한다.
    console.warn('저장 실패 (이어하기 없이 계속 진행):', e);
  }
}

export function loadGame(): SaveData | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      (parsed as SaveData).v === 1 &&
      Array.isArray((parsed as SaveData).completed)
    ) {
      return parsed as SaveData;
    }
    return null;
  } catch (e) {
    console.warn('저장 데이터 읽기 실패:', e);
    return null;
  }
}

export function clearSave(): void {
  try {
    localStorage.removeItem(KEY);
  } catch (e) {
    console.warn('저장 데이터 삭제 실패:', e);
  }
}
