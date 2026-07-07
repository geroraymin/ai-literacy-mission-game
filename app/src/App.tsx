import { useGameState } from './systems/store';
import { MAPS } from './data/maps';
import GameCanvas from './game/GameCanvas';
import DialogueBox from './components/DialogueBox';
import EndingScreen from './components/EndingScreen';
import HUD from './components/HUD';
import QuizModal from './components/QuizModal';
import TitleScreen from './components/TitleScreen';
import VirtualPad from './components/VirtualPad';

export default function App() {
  const state = useGameState();

  if (state.phase === 'title') return <TitleScreen />;
  if (state.phase === 'ending') return <EndingScreen />;

  const hintNpc = state.interactHint
    ? MAPS[state.room].npcs.find((n) => n.id === state.interactHint)
    : undefined;

  return (
    <div className="game-screen">
      <HUD state={state} />
      <GameCanvas />
      {state.phase === 'playing' && hintNpc && (
        <div className="interact-hint pixel-panel">
          <strong>{hintNpc.name}</strong>에게 말 걸기 — Space / A 버튼
        </div>
      )}
      {state.phase === 'dialogue' && state.dialogue && <DialogueBox dialogue={state.dialogue} />}
      {state.phase === 'quiz' && state.quiz && <QuizModal quiz={state.quiz} />}
      <VirtualPad />
    </div>
  );
}
