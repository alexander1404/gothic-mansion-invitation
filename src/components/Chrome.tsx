import { useEffect, useState, type CSSProperties } from "react";
import { sound } from "../audio";

export function Grain() {
  return (
    <>
      <div className="grain" />
      <div className="vignette" />
    </>
  );
}

export function SoundToggle({
  on,
  setOn,
}: {
  on: boolean;
  setOn: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      aria-label={on ? "Выключить звук" : "Включить звук"}
      onClick={() => {
        const next = !on;
        setOn(next);
        sound.setEnabled(next);
        if (next) void sound.unlock();
      }}
      className="fixed top-4 left-4 z-[86] grid h-11 w-11 place-items-center rounded-full border border-gold/50 bg-oak/80 text-lg text-gold shadow-[0_0_16px_rgba(197,160,89,0.2)] backdrop-blur-sm transition hover:scale-105"
    >
      {on ? "🔊" : "🔇"}
    </button>
  );
}

export function Spider() {
  const [flee, setFlee] = useState(false);
  const [bats, setBats] = useState<{ id: number; x: number; dx: number; rot: number; delay: number }[]>([]);
  const [hidden, setHidden] = useState(false);

  return (
    <>
      {!hidden && (
      <button
        type="button"
        aria-label="Паук"
        className={`spider ${flee ? "flee" : ""}`}
        onClick={() => {
          if (flee) return;
          sound.hover();
          setFlee(true);
          const next = Array.from({ length: 14 }, (_, i) => ({
            id: Date.now() + i,
            x: 8 + Math.random() * 84,
            dx: (Math.random() - 0.5) * 180,
            rot: (Math.random() - 0.5) * 420,
            delay: Math.random() * 0.4,
          }));
          setBats(next);
          window.setTimeout(() => setHidden(true), 900);
          window.setTimeout(() => setBats([]), 2800);
        }}
      >
        <span className="web-thread" />
        <svg viewBox="0 0 64 64" className="h-full w-full drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
          <ellipse cx="32" cy="38" rx="10" ry="12" fill="#1a1214" stroke="#3a3032" strokeWidth="1" />
          <circle cx="32" cy="24" r="8" fill="#22181a" stroke="#3a3032" strokeWidth="1" />
          <circle cx="29" cy="22" r="1.4" fill="#c01c28" />
          <circle cx="35" cy="22" r="1.4" fill="#c01c28" />
          <path d="M22 24 Q8 12 4 8" stroke="#1a1214" strokeWidth="1.6" fill="none" />
          <path d="M22 30 Q6 28 2 24" stroke="#1a1214" strokeWidth="1.6" fill="none" />
          <path d="M22 38 Q8 42 4 50" stroke="#1a1214" strokeWidth="1.6" fill="none" />
          <path d="M24 46 Q14 54 10 60" stroke="#1a1214" strokeWidth="1.6" fill="none" />
          <path d="M42 24 Q56 12 60 8" stroke="#1a1214" strokeWidth="1.6" fill="none" />
          <path d="M42 30 Q58 28 62 24" stroke="#1a1214" strokeWidth="1.6" fill="none" />
          <path d="M42 38 Q56 42 60 50" stroke="#1a1214" strokeWidth="1.6" fill="none" />
          <path d="M40 46 Q50 54 54 60" stroke="#1a1214" strokeWidth="1.6" fill="none" />
        </svg>
      </button>
      )}
      {bats.map((b) => (
        <span
          key={b.id}
          className="bat"
          style={
            {
              left: `${b.x}%`,
              top: "0px",
              animationDelay: `${b.delay}s`,
              "--dx": `${b.dx}px`,
              "--rot": `${b.rot}deg`,
            } as CSSProperties
          }
        >
          🦇
        </span>
      ))}
    </>
  );
}

export function DarknessVeil({ on }: { on: boolean }) {
  return <div className={`darkness-veil ${on ? "on" : ""}`} />;
}

export function Candle({
  className = "",
  melt = 0,
  onBlow,
}: {
  className?: string;
  melt?: number;
  onBlow?: () => void;
}) {
  const [out, setOut] = useState(false);
  const [sparks, setSparks] = useState<{ id: number; sx: number; sy: number }[]>([]);

  const relight = () => {
    setSparks(
      Array.from({ length: 8 }, (_, i) => ({
        id: i,
        sx: (Math.random() - 0.5) * 30,
        sy: -20 - Math.random() * 40,
      })),
    );
    setOut(false);
    sound.ignite();
    window.setTimeout(() => setSparks([]), 900);
  };

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      <button
        type="button"
        className={`flame ${out ? "out" : ""}`}
        aria-label="Пламя свечи"
        onClick={() => {
          if (out) return;
          setOut(true);
          sound.blow();
          onBlow?.();
          window.setTimeout(relight, 1100);
        }}
      />
      <div className="wick" />
      <div className="candle-body" style={{ height: `${Math.max(28, 64 - melt * 28)}px` }} />
      {sparks.map((s) => (
        <span
          key={s.id}
          className="spark"
          style={
            {
              left: "50%",
              top: "-20px",
              "--sx": `${s.sx}px`,
              "--sy": `${s.sy}px`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

export function useParallax() {
  const [p, setP] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setP({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      });
    };
    const onOrient = (e: DeviceOrientationEvent) => {
      const x = Math.max(-1, Math.min(1, (e.gamma ?? 0) / 35));
      const y = Math.max(-1, Math.min(1, ((e.beta ?? 45) - 45) / 35));
      setP({ x, y });
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("deviceorientation", onOrient);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("deviceorientation", onOrient);
    };
  }, []);

  return p;
}
