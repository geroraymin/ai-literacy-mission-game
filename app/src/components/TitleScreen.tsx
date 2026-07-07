import { store, useGameState } from '../systems/store';

// 시작 화면: 새로 시작 / 이어하기 + 조작법 안내
export default function TitleScreen() {
  const { hasSave } = useGameState();

  return (
    <div className="title-screen">
      <div className="title-card pixel-panel">
        <p className="title-sub">AI 리터러시 미션 게임</p>
        <h1 className="title-logo">
          AI 연구소
          <br />
          탐험대
        </h1>
        <p className="title-story">
          연구소의 AI 비서 "아리"가 잘못된 사용법 때문에 뒤죽박죽!
          <br />
          다섯 개의 방을 탐험하며 배지를 모아 아리를 구하자.
        </p>
        <div className="title-buttons">
          <button type="button" className="btn btn-primary btn-big" onClick={() => store.startNew()}>
            새로 시작
          </button>
          {hasSave && (
            <button type="button" className="btn btn-big" onClick={() => store.continueGame()}>
              이어하기
            </button>
          )}
        </div>
        <div className="title-help pixel-inset">
          <strong>조작법</strong>
          <span>이동: 방향키 또는 WASD (태블릿: 화면 방향 버튼)</span>
          <span>말 걸기·대화 넘기기: Space 또는 Enter (태블릿: A 버튼)</span>
        </div>
        <p className="title-credit">그래픽: Kenney (kenney.nl) CC0 · 폰트: Galmuri</p>
      </div>
    </div>
  );
}
