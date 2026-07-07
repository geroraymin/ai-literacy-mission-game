import { QUIZZES } from '../data/quizzes';

// 채점 규칙: 한 번에 맞히면 20점, 한 번 틀린 뒤 맞히면 10점, 그 이후는 5점.
// (틀려도 다시 도전할 수 있게 해서 "배우는 것"이 목적임을 살린다)
export function pointsForAttempts(wrongCount: number): number {
  if (wrongCount === 0) return 20;
  if (wrongCount === 1) return 10;
  return 5;
}

/** 전체 만점 (문항 수 × 20점) */
export const MAX_SCORE = Object.values(QUIZZES).reduce((sum, qs) => sum + qs.length * 20, 0);

/** 점수 비율에 따른 엔딩 칭호 */
export function titleForScore(score: number): { title: string; comment: string } {
  const rate = score / MAX_SCORE;
  if (rate >= 0.9)
    return {
      title: '🏆 AI 리터러시 마스터',
      comment: '완벽에 가까운 실력! 친구들에게 AI 사용법을 알려줄 수 있는 수준이에요.',
    };
  if (rate >= 0.7)
    return {
      title: '🎖️ 노련한 AI 탐험가',
      comment: '핵심 개념을 잘 이해했어요. 몇 가지만 복습하면 마스터!',
    };
  if (rate >= 0.5)
    return {
      title: '🌟 성장하는 AI 견습생',
      comment: '기본기를 갖췄어요. 복습 카드를 다시 읽어보면 실력이 쑥 올라요.',
    };
  return {
    title: '🌱 AI 새싹 탐험가',
    comment: '틀리면서 배우는 게 진짜 공부! 한 번 더 도전해 볼까요?',
  };
}
