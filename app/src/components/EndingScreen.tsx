import { store, useGameState } from '../systems/store';
import { MISSIONS } from '../data/missions';
import { MAX_SCORE, titleForScore } from '../systems/scoring';

// 엔딩 화면: 총점 + 칭호 + 배지 + 복습 카드 + 다시 시작
export default function EndingScreen() {
  const { progress } = useGameState();
  const score = Object.values(progress.scores).reduce((a, b) => a + (b ?? 0), 0);
  const rank = titleForScore(score);

  return (
    <div className="ending-screen">
      <div className="ending-card pixel-panel">
        <p className="title-sub">탐험 완료 보고서</p>
        <h1 className="ending-title">{rank.title}</h1>
        <p className="ending-score">
          총점 <strong>{score}</strong> / {MAX_SCORE}점
        </p>
        <p className="ending-comment">{rank.comment}</p>

        <div className="ending-badges">
          {MISSIONS.map((m) => (
            <div key={m.id} className="ending-badge pixel-inset">
              <span className="ending-badge-icon">{m.badge}</span>
              <span className="ending-badge-name">{m.badgeName}</span>
              <span className="ending-badge-score">{progress.scores[m.id] ?? 0}점</span>
            </div>
          ))}
        </div>

        <h2 className="ending-review-title">오늘 배운 다섯 가지</h2>
        <div className="ending-reviews">
          {MISSIONS.map((m) => (
            <div key={m.id} className="review-card pixel-inset">
              <strong>
                {m.badge} {m.reviewCard.title}
              </strong>
              <p>{m.reviewCard.body}</p>
            </div>
          ))}
        </div>

        <div className="title-buttons">
          <button type="button" className="btn btn-primary btn-big" onClick={() => store.resetAll()}>
            처음부터 다시 하기
          </button>
        </div>
      </div>
    </div>
  );
}
