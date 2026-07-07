import { useEffect } from 'react';
import type { DialogueSession } from '../systems/store';
import { store } from '../systems/store';
import { onAction } from '../game/input';
import Portrait from './Portrait';

// 화면 아래 대화창. 클릭하거나 Space/Enter/A버튼으로 다음 대사로 넘어간다.
export default function DialogueBox({ dialogue }: { dialogue: DialogueSession }) {
  useEffect(() => {
    return onAction(() => store.advanceDialogue());
  }, []);

  const line = dialogue.lines[dialogue.index];
  const isLast = dialogue.index === dialogue.lines.length - 1;

  return (
    <div
      className="dialogue pixel-panel"
      onClick={() => store.advanceDialogue()}
      role="button"
      tabIndex={0}
      aria-label="대화 넘기기"
    >
      {line.sprite && <Portrait sprite={line.sprite} />}
      <div className="dialogue-body">
        <div className="dialogue-name">{line.speaker}</div>
        <p className="dialogue-text">{line.text}</p>
        <div className="dialogue-next">
          {isLast ? '눌러서 닫기' : '눌러서 계속'} ({dialogue.index + 1}/{dialogue.lines.length}) ▾
        </div>
      </div>
    </div>
  );
}
