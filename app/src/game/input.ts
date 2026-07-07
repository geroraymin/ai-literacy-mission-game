// 키보드 + 가상 방향패드 입력을 한 곳에서 관리한다.
// 방향은 "누르고 있는 상태"로, 상호작용(Space/Enter/A버튼)은 "이벤트"로 다룬다.

export type Dir = 'up' | 'down' | 'left' | 'right';

export const dirs: Record<Dir, boolean> = {
  up: false,
  down: false,
  left: false,
  right: false,
};

type ActionListener = () => void;
const actionListeners = new Set<ActionListener>();

/** 상호작용(말 걸기/대화 넘기기) 이벤트 구독. 해제 함수를 돌려준다 */
export function onAction(fn: ActionListener): () => void {
  actionListeners.add(fn);
  return () => actionListeners.delete(fn);
}

/** 상호작용 발동 (Space/Enter/가상 A버튼 공용) */
export function fireAction(): void {
  actionListeners.forEach((fn) => fn());
}

/** 가상 패드에서 방향 버튼을 누르거나 뗄 때 호출 */
export function setDir(dir: Dir, pressed: boolean): void {
  dirs[dir] = pressed;
}

const KEY_TO_DIR: Record<string, Dir> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  W: 'up',
  s: 'down',
  S: 'down',
  a: 'left',
  A: 'left',
  d: 'right',
  D: 'right',
};

let initialized = false;

/** 키보드 리스너 등록 (여러 번 불러도 한 번만 등록됨) */
export function initInput(): void {
  if (initialized) return;
  initialized = true;

  window.addEventListener('keydown', (e) => {
    const dir = KEY_TO_DIR[e.key];
    if (dir) {
      dirs[dir] = true;
      e.preventDefault(); // 화살표 키로 화면이 스크롤되는 것 방지
      return;
    }
    if (e.key === ' ') {
      e.preventDefault(); // Space가 버튼을 누르거나 스크롤하는 것 방지
      if (!e.repeat) fireAction();
    } else if (e.key === 'Enter') {
      if (!e.repeat) fireAction();
    }
  });

  window.addEventListener('keyup', (e) => {
    const dir = KEY_TO_DIR[e.key];
    if (dir) dirs[dir] = false;
  });

  // 창이 비활성화되면 누르고 있던 키를 모두 해제 (키가 눌린 채 고정되는 버그 방지)
  window.addEventListener('blur', () => {
    dirs.up = dirs.down = dirs.left = dirs.right = false;
  });
}
