// 게임 전체 고정 팔레트 (11색).
// UI 색은 반드시 여기서만 가져다 쓴다 — main.tsx가 CSS 변수(--c-*)로 주입한다.
export const PALETTE = {
  night: '#262137', // 화면 배경 (Kenney 타일시트 배경과 같은 계열)
  panel: '#fff3e0', // 대화창/카드 바탕
  panelDark: '#f3dfc1', // 패널 안쪽 구분 영역
  ink: '#3d3327', // 기본 글자
  brown: '#6e5a47', // 패널 테두리
  orange: '#ff9752', // 포인트 (주요 버튼)
  yellow: '#ffd76a', // 강조/점수/배지
  green: '#57b06b', // 정답
  red: '#e2606b', // 오답
  blue: '#5ca8e8', // 안내
  gray: '#9a8f80', // 보조 텍스트
} as const;

export type PaletteKey = keyof typeof PALETTE;
