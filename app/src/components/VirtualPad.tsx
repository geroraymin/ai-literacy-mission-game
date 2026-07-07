import { useState } from 'react';
import type { Dir } from '../game/input';
import { fireAction, setDir } from '../game/input';

// 태블릿/스마트폰용 가상 조작 버튼.
// 터치 화면(포인터가 손가락인 기기)에서만 자동으로 나타난다.
function detectTouch(): boolean {
  return window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
}

function PadButton({ dir, label }: { dir: Dir; label: string }) {
  return (
    <button
      type="button"
      className={`pad-btn pad-${dir}`}
      aria-label={`${label} 이동`}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        setDir(dir, true);
      }}
      onPointerUp={() => setDir(dir, false)}
      onPointerCancel={() => setDir(dir, false)}
      onPointerLeave={() => setDir(dir, false)}
      onContextMenu={(e) => e.preventDefault()}
    >
      {label}
    </button>
  );
}

export default function VirtualPad() {
  const [visible] = useState(detectTouch);
  if (!visible) return null;

  return (
    <>
      <div className="vpad-move" aria-label="이동 패드">
        <PadButton dir="up" label="▲" />
        <div className="vpad-mid">
          <PadButton dir="left" label="◀" />
          <PadButton dir="right" label="▶" />
        </div>
        <PadButton dir="down" label="▼" />
      </div>
      <button
        type="button"
        className="vpad-action"
        aria-label="말 걸기 / 대화 넘기기"
        onPointerDown={() => fireAction()}
        onContextMenu={(e) => e.preventDefault()}
      >
        A
      </button>
    </>
  );
}
