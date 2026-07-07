import { useEffect, useRef } from 'react';
import { loadAssets } from './assets';
import { bindInteraction, engine, resetEngine, update } from './engine';
import { initInput } from './input';
import { store } from '../systems/store';
import { render, VIEW_W, VIEW_H } from './renderer';

// 게임 화면(Canvas)을 담당하는 컴포넌트.
// 내부 해상도는 320×240으로 고정하고, CSS로 정수 배율만 확대해서
// 픽셀아트가 뭉개지지 않게 한다.
export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    initInput();
    resetEngine();
    const unbindAction = bindInteraction();

    // 개발 모드 전용: 자동 플레이 테스트에서 상태를 읽기 위한 훅 (배포 빌드에는 포함 안 됨)
    if (import.meta.env.DEV) {
      (window as unknown as Record<string, unknown>).__game = { engine, store };
    }

    // 화면 크기에 맞는 최대 정수 배율 계산 (1배 미만으로는 줄이지 않음)
    const applyScale = () => {
      const scale = Math.max(
        1,
        Math.min(Math.floor(wrap.clientWidth / VIEW_W), Math.floor(wrap.clientHeight / VIEW_H)),
      );
      canvas.style.width = `${VIEW_W * scale}px`;
      canvas.style.height = `${VIEW_H * scale}px`;
    };
    applyScale();
    const observer = new ResizeObserver(applyScale);
    observer.observe(wrap);

    let rafId = 0;
    let last = performance.now();
    let running = false;
    // StrictMode처럼 effect가 두 번 실행돼도 루프가 중복 생성되지 않게,
    // 정리(cleanup) 이후 도착한 비동기 로딩은 무시한다
    let cancelled = false;

    loadAssets()
      .then((sheets) => {
        if (cancelled) return;
        running = true;
        const loop = (now: number) => {
          if (!running) return;
          // 탭 전환 등으로 프레임이 크게 밀려도 한 번에 크게 움직이지 않게 제한
          const dt = Math.min((now - last) / 1000, 0.05);
          last = now;
          update(dt);
          render(ctx, sheets, now);
          rafId = requestAnimationFrame(loop);
        };
        rafId = requestAnimationFrame(loop);
      })
      .catch((err: unknown) => {
        console.error(err);
        ctx.fillStyle = '#fff';
        ctx.font = '12px sans-serif';
        ctx.fillText('이미지 로딩에 실패했습니다. 새로고침 해주세요.', 20, 120);
      });

    return () => {
      cancelled = true;
      running = false;
      cancelAnimationFrame(rafId);
      observer.disconnect();
      unbindAction();
    };
  }, []);

  return (
    <div ref={wrapRef} className="canvas-wrap">
      <canvas ref={canvasRef} width={VIEW_W} height={VIEW_H} className="game-canvas" />
    </div>
  );
}
