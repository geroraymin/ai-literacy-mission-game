import { useSyncExternalStore } from 'react';
import type { DialogueLine, MissionId, RoomId } from '../data/types';
import { DIALOGUES } from '../data/dialogues';
import { MISSIONS, MISSION_BY_NPC } from '../data/missions';
import { QUIZZES } from '../data/quizzes';
import { pointsForAttempts } from './scoring';
import { clearSave, loadGame, saveGame } from './save';

// 게임 전체 상태를 담는 작은 스토어.
// 게임 루프(Canvas)와 React UI가 같은 상태를 공유해야 해서
// React 바깥에 두고 useSyncExternalStore로 연결한다.

export type Phase = 'title' | 'playing' | 'dialogue' | 'quiz' | 'ending';

export interface Progress {
  introDone: boolean;
  completed: MissionId[];
  scores: Partial<Record<MissionId, number>>;
}

export interface DialogueSession {
  lines: readonly DialogueLine[];
  index: number;
  /** 대화가 끝난 뒤 이어질 일: 퀴즈 시작 / 엔딩 / 없음 */
  after: 'quiz' | 'ending' | null;
  missionId: MissionId | null;
}

export interface QuizFeedback {
  kind: 'correct' | 'wrong';
  text: string;
  points?: number;
}

export interface QuizSession {
  missionId: MissionId;
  qIndex: number;
  /** 현재 문항에서 틀린 횟수 (점수 계산용) */
  wrongCount: number;
  feedback: QuizFeedback | null;
  earned: number[];
  finished: boolean;
}

export interface GameState {
  phase: Phase;
  progress: Progress;
  dialogue: DialogueSession | null;
  quiz: QuizSession | null;
  /** 근처에 말 걸 수 있는 NPC id */
  interactHint: string | null;
  room: RoomId;
  hasSave: boolean;
}

const freshProgress = (): Progress => ({ introDone: false, completed: [], scores: {} });

let state: GameState = {
  phase: 'title',
  progress: freshProgress(),
  dialogue: null,
  quiz: null,
  interactHint: null,
  room: 'lobby',
  hasSave: loadGame() !== null,
};

const listeners = new Set<() => void>();

function setState(patch: Partial<GameState>): void {
  state = { ...state, ...patch };
  listeners.forEach((fn) => fn());
}

function persist(progress: Progress): void {
  saveGame({
    introDone: progress.introDone,
    completed: progress.completed,
    scores: progress.scores,
  });
}

// ── 액션들 ──────────────────────────────────────────────────────
export const store = {
  getState: (): GameState => state,

  subscribe(fn: () => void): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  startNew(): void {
    clearSave();
    setState({ phase: 'playing', progress: freshProgress(), hasSave: false, room: 'lobby' });
  },

  continueGame(): void {
    const save = loadGame();
    const progress: Progress = save
      ? { introDone: save.introDone, completed: save.completed, scores: save.scores }
      : freshProgress();
    setState({ phase: 'playing', progress, room: 'lobby' });
  },

  setRoom(room: RoomId): void {
    if (state.room !== room) setState({ room });
  },

  setInteractHint(npcId: string | null): void {
    if (state.interactHint !== npcId) setState({ interactHint: npcId });
  },

  /** NPC에게 말 걸기 — 상황에 맞는 대사를 고른다 */
  talkTo(npcId: string): void {
    if (state.phase !== 'playing') return;

    if (npcId === 'director') {
      const { introDone, completed } = state.progress;
      if (!introDone) {
        openDialogue(DIALOGUES.directorIntro, null, null);
      } else if (completed.length >= MISSIONS.length) {
        openDialogue(DIALOGUES.directorFinal, 'ending', null);
      } else {
        openDialogue(DIALOGUES.directorWait, null, null);
      }
      return;
    }

    const mission = MISSION_BY_NPC[npcId];
    if (!mission) return;
    if (state.progress.completed.includes(mission.id)) {
      openDialogue(doneLines(npcId), null, null);
    } else {
      openDialogue(introLines(npcId), 'quiz', mission.id);
    }
  },

  advanceDialogue(): void {
    const dlg = state.dialogue;
    if (!dlg) return;
    if (dlg.index + 1 < dlg.lines.length) {
      setState({ dialogue: { ...dlg, index: dlg.index + 1 } });
      return;
    }
    // 대화 끝 — 소장 첫 대화였다면 introDone 기록
    let progress = state.progress;
    if (!progress.introDone && dlg.lines === DIALOGUES.directorIntro) {
      progress = { ...progress, introDone: true };
      persist(progress);
    }
    if (dlg.after === 'quiz' && dlg.missionId) {
      setState({
        progress,
        dialogue: null,
        phase: 'quiz',
        quiz: {
          missionId: dlg.missionId,
          qIndex: 0,
          wrongCount: 0,
          feedback: null,
          earned: [],
          finished: false,
        },
      });
    } else if (dlg.after === 'ending') {
      setState({ progress, dialogue: null, phase: 'ending' });
    } else {
      setState({ progress, dialogue: null, phase: 'playing' });
    }
  },

  /** 퀴즈 보기 선택 */
  answerQuiz(choiceIndex: number): void {
    const quiz = state.quiz;
    if (!quiz || quiz.feedback || quiz.finished) return;
    const question = QUIZZES[quiz.missionId][quiz.qIndex];
    const choice = question.choices[choiceIndex];
    if (!choice) return;

    if (choice.correct) {
      const points = pointsForAttempts(quiz.wrongCount);
      setState({
        quiz: { ...quiz, feedback: { kind: 'correct', text: choice.explain, points } },
      });
    } else {
      setState({
        quiz: {
          ...quiz,
          wrongCount: quiz.wrongCount + 1,
          feedback: { kind: 'wrong', text: choice.explain },
        },
      });
    }
  },

  /** 피드백 확인 버튼 — 오답이면 재도전, 정답이면 다음 문항/완료 */
  dismissFeedback(): void {
    const quiz = state.quiz;
    if (!quiz || !quiz.feedback) return;

    if (quiz.feedback.kind === 'wrong') {
      setState({ quiz: { ...quiz, feedback: null } });
      return;
    }

    const earned = [...quiz.earned, quiz.feedback.points ?? 0];
    const questions = QUIZZES[quiz.missionId];
    if (quiz.qIndex + 1 < questions.length) {
      setState({
        quiz: { ...quiz, qIndex: quiz.qIndex + 1, wrongCount: 0, feedback: null, earned },
      });
      return;
    }

    // 미션 완료 — 진행도에 즉시 반영하고 저장
    const missionScore = earned.reduce((a, b) => a + b, 0);
    const progress: Progress = {
      ...state.progress,
      completed: [...state.progress.completed, quiz.missionId],
      scores: { ...state.progress.scores, [quiz.missionId]: missionScore },
    };
    persist(progress);
    setState({
      progress,
      hasSave: true,
      quiz: { ...quiz, feedback: null, earned, finished: true },
    });
  },

  /** 미션 완료 화면에서 "연구소로 돌아가기" */
  closeQuiz(): void {
    if (!state.quiz?.finished) return;
    setState({ quiz: null, phase: 'playing' });
  },

  /** 엔딩에서 처음부터: 저장을 지우고 타이틀로 */
  resetAll(): void {
    clearSave();
    setState({
      phase: 'title',
      progress: freshProgress(),
      dialogue: null,
      quiz: null,
      interactHint: null,
      room: 'lobby',
      hasSave: false,
    });
  },
};

function openDialogue(
  lines: readonly DialogueLine[],
  after: 'quiz' | 'ending' | null,
  missionId: MissionId | null,
): void {
  setState({ phase: 'dialogue', dialogue: { lines, index: 0, after, missionId } });
}

function introLines(npcId: string): readonly DialogueLine[] {
  const key = `${npcId}Intro` as keyof typeof DIALOGUES;
  return DIALOGUES[key];
}

function doneLines(npcId: string): readonly DialogueLine[] {
  const key = `${npcId}Done` as keyof typeof DIALOGUES;
  return DIALOGUES[key];
}

/** React 컴포넌트에서 게임 상태를 구독하는 훅 */
export function useGameState(): GameState {
  return useSyncExternalStore(store.subscribe, store.getState);
}
