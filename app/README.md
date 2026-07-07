# AI 연구소 탐험대

중학생 대상 AI 리터러시 교육용 2D 탑다운 미션 게임.
AI 연구소를 탐험하며 미션 5개(개인정보 보호, 프롬프트 작성, 데이터 편향, AI 결과 검증, AI 윤리)를 해결한다.

## 실행

```bash
npm install
npm run dev        # http://localhost:5173
npm run dev -- --host   # 같은 와이파이의 태블릿에서 접속할 때
npm run build      # 배포용 빌드 (dist/)
```

## 조작

- PC: 방향키/WASD 이동, Space·Enter 상호작용
- 태블릿: 화면 가상 방향패드 + A 버튼 (터치 기기에서 자동 표시)

## 구조

```
src/
  components/  React UI (대화창, 퀴즈, HUD, 가상패드, 타이틀, 엔딩)
  game/        Canvas 게임 루프, 렌더링, 입력, 충돌
  systems/     상태 스토어, 채점, localStorage 저장
  data/        맵·NPC 대사·퀴즈 문항·팔레트 ← 교육 내용 수정은 여기만
```

- 퀴즈 수정: `src/data/quizzes.ts` (문장만 고치면 됨, 자세한 방법은 프로젝트 `outputs/2-수업활용가이드.md`)
- 대사 수정: `src/data/dialogues.ts`

## 크레딧

- 그래픽: [Kenney](https://kenney.nl) — Tiny Town, Tiny Dungeon (CC0)
- 폰트: [Galmuri](https://galmuri.quiple.dev) (SIL OFL)
