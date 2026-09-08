import DitherBackground from './dither-background';

export default function Guardrails() {
  return (
    <main className="background-scene" aria-label="蓝白颗粒云雾背景">
      <DitherBackground />
      <div className="bottom-fade" aria-hidden="true" />
    </main>
  );
}
