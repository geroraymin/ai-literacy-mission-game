import type { QuizSession } from '../systems/store';
import { store } from '../systems/store';
import { MISSION_BY_ID } from '../data/missions';
import { QUIZZES } from '../data/quizzes';
import type { QuizType } from '../data/types';

const TYPE_LABEL: Record<QuizType, string> = {
  choice: '알맞은 답 고르기',
  ox: 'OX 퀴즈',
  find: '찾아내기',
};

// 퀴즈 화면: 문제 → 보기 선택 → 정답/오답 피드백 → 다음 문제 → 미션 완료
export default function QuizModal({ quiz }: { quiz: QuizSession }) {
  const mission = MISSION_BY_ID[quiz.missionId];
  const questions = QUIZZES[quiz.missionId];

  // 미션 완료 화면
  if (quiz.finished) {
    const total = quiz.earned.reduce((a, b) => a + b, 0);
    return (
      <div className="overlay">
        <div className="quiz pixel-panel quiz-clear">
          <div className="quiz-clear-badge">{mission.badge}</div>
          <h2>미션 완료!</h2>
          <p className="quiz-clear-name">
            「{mission.badgeName}」 배지 획득 · <strong>+{total}점</strong>
          </p>
          <div className="quiz-concept">
            <strong>{mission.reviewCard.title}</strong>
            <p>{mission.reviewCard.body}</p>
          </div>
          <button type="button" className="btn btn-primary" onClick={() => store.closeQuiz()}>
            연구소로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const question = questions[quiz.qIndex];
  const feedback = quiz.feedback;

  return (
    <div className="overlay">
      <div className="quiz pixel-panel">
        <div className="quiz-head">
          <span className="quiz-tag">{TYPE_LABEL[question.type]}</span>
          <span className="quiz-progress">
            {mission.roomName} 미션 · 문제 {quiz.qIndex + 1}/{questions.length}
          </span>
        </div>
        <p className="quiz-prompt">{question.prompt}</p>

        {feedback ? (
          <div className={`quiz-feedback ${feedback.kind}`}>
            <div className="quiz-feedback-title">
              {feedback.kind === 'correct'
                ? `🎉 정답! +${feedback.points}점`
                : '😅 아쉬워! 다시 생각해 보자'}
            </div>
            <p>{feedback.text}</p>
            <button type="button" className="btn btn-primary" onClick={() => store.dismissFeedback()}>
              {feedback.kind === 'correct'
                ? quiz.qIndex + 1 < questions.length
                  ? '다음 문제'
                  : '결과 보기'
                : '다시 도전'}
            </button>
          </div>
        ) : (
          <div className="quiz-choices">
            {question.choices.map((choice, i) => (
              <button
                key={choice.text}
                type="button"
                className="btn quiz-choice"
                onClick={() => store.answerQuiz(i)}
              >
                <span className="quiz-choice-no">{i + 1}</span>
                {choice.text}
              </button>
            ))}
          </div>
        )}

        {quiz.wrongCount > 0 && !feedback && (
          <p className="quiz-retry-note">다시 도전 중 — 맞히면 {quiz.wrongCount === 1 ? 10 : 5}점</p>
        )}
      </div>
    </div>
  );
}
