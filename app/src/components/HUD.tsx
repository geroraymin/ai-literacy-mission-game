import type { GameState } from '../systems/store';
import { MAPS } from '../data/maps';
import { MISSIONS, MISSION_BY_ID } from '../data/missions';
import type { MissionId } from '../data/types';

// 화면 상단 정보 바: 현재 방 이름 / 지금 할 일 / 미션 진행도 + 점수
function objectiveText(state: GameState): string {
  const { progress, room } = state;
  if (!progress.introDone) return '로비의 김탐구 소장에게 말을 걸어 보자!';
  if (progress.completed.length >= MISSIONS.length) return '김탐구 소장에게 돌아가 보고하자!';
  if (room !== 'lobby') {
    const mission = MISSION_BY_ID[room as MissionId];
    return progress.completed.includes(mission.id)
      ? '미션 완료! 로비로 돌아가 다음 방으로 가자'
      : `${mission.npcName}에게 말을 걸어 미션을 받자`;
  }
  return `문으로 들어가 미션 방을 찾아가자 (완료 ${progress.completed.length}/${MISSIONS.length})`;
}

export default function HUD({ state }: { state: GameState }) {
  const score = Object.values(state.progress.scores).reduce((a, b) => a + (b ?? 0), 0);

  return (
    <header className="hud pixel-panel">
      <div className="hud-room">{MAPS[state.room].name}</div>
      <div className="hud-objective">{objectiveText(state)}</div>
      <div className="hud-right">
        <div className="hud-badges" aria-label="미션 진행도">
          {MISSIONS.map((m) => {
            const done = state.progress.completed.includes(m.id);
            return (
              <span
                key={m.id}
                className={done ? 'badge done' : 'badge'}
                title={`${m.roomName}: ${m.topic}${done ? ' (완료)' : ''}`}
              >
                {done ? m.badge : m.order}
              </span>
            );
          })}
        </div>
        <div className="hud-score">{score}점</div>
      </div>
    </header>
  );
}
