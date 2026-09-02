import { useState } from "react";
import { sound } from "../audio";
import { media } from "../media";
import { useParallax } from "./Chrome";

export function WelcomeScreen({ onEnter, onAwaken }: { onEnter: () => void; onAwaken: () => void }) {
  const [knocks, setKnocks] = useState(0);
  const [swing, setSwing] = useState(false);
  const [shake, setShake] = useState("");
  const [opening, setOpening] = useState(false);
  const p = useParallax();

  const handleKnock = () => {
    if (opening || knocks >= 3) return;
    if (knocks === 0) onAwaken();
    void sound.unlock();
    const next = knocks + 1;
    sound.knock(next);
    try {
      navigator.vibrate?.(next === 1 ? 40 : next === 2 ? [50, 30, 80] : [80, 40, 120, 40, 200]);
    } catch {
      /* ignore */
    }
    setSwing(true);
    window.setTimeout(() => setSwing(false), 450);
    setShake(next >= 3 ? "shake-hard" : "shake");
    window.setTimeout(() => setShake(""), 700);
    setKnocks(next);

    if (next === 3) {
      setOpening(true);
      window.setTimeout(() => sound.thunder(), 180);
      window.setTimeout(() => sound.creak(), 520);
      window.setTimeout(() => onEnter(), 2700);
    }
  };

  const eyeClass = knocks >= 3 || opening ? "blaze" : knocks >= 1 ? "lit" : "";

  return (
    <section className={`relative min-h-dvh w-full overflow-hidden ${shake}`}>
      <div
        className="absolute inset-0 scale-110 bg-cover bg-center"
        style={{
          backgroundImage: `url(${media.castle})`,
          transform: `translate(${p.x * -12}px, ${p.y * -8}px) scale(1.12)`,
          transition: "transform 0.15s ease-out",
        }}
      />
      <div
        className="moon absolute top-[7%] right-[12%] h-20 w-20 rounded-full md:h-28 md:w-28"
        style={{ transform: `translate(${p.x * -22}px, ${p.y * -14}px)` }}
      />
      <div className="branches" style={{ transform: `translate(${p.x * 18}px, ${p.y * 10}px)` }} />
      <div className="fog-layer fog-1" />
      <div className="fog-layer fog-2" />
      <div className="fog-layer fog-3" />

      <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-obsidian/50 via-transparent to-obsidian/80" />

      <div className={`door-panel left ${opening ? "open" : ""}`} />
      <div className={`door-panel right ${opening ? "open" : ""}`} />
      <div className={`lightning ${opening ? "flash" : ""}`} />
      <div className={`fog-wipe ${opening ? "active" : ""}`} />

      <div className="relative z-10 flex h-full flex-col items-center justify-between px-4 pb-8 pt-16">
        <div className="text-center">
          <p className="font-cinzel text-[11px] uppercase tracking-[0.45em] text-gold/70">Интерактивное приглашение</p>
          <h1 className="font-display gold-text mt-3 text-3xl leading-tight md:text-5xl">
            Тайна Заброшенного
            <br />
            Особняка
          </h1>
          <p className={`font-body mt-5 max-w-md text-lg italic text-parchment/80 hint-glow ${knocks > 0 ? "opacity-60" : ""}`}>
            Постучи трижды, чтобы пробудить древних...
          </p>
        </div>

        <button
          type="button"
          onClick={handleKnock}
          disabled={opening}
          aria-label="Дверной молоток. Постучите трижды"
          className="group relative mt-2 mb-4"
        >
          <div className={`relative h-48 w-48 md:h-64 md:w-64 ${swing ? "knocker-swing" : ""}`}>
            <div className="absolute left-1/2 top-[-18px] z-10 h-7 w-7 -translate-x-1/2 rounded-full border-2 border-bronze bg-gradient-to-br from-gold to-bronze shadow-lg" />
            <img
              src={media.gargoyle}
              alt="Молоток-горгулья"
              className={`h-full w-full rounded-full object-cover shadow-[0_20px_50px_rgba(0,0,0,0.65)] ring-2 ring-bronze/70 transition group-hover:ring-gold ${knocks === 0 ? "animate-pulse" : ""}`}
              draggable={false}
            />
            <span className={`gargoyle-eye ${eyeClass}`} style={{ left: "28%", top: "34%" }} />
            <span className={`gargoyle-eye ${eyeClass}`} style={{ left: "58%", top: "34%" }} />
            <svg className={`crack-svg ${knocks >= 2 ? "show" : ""}`} viewBox="0 0 200 200">
              <path className="crack-path" d="M100 18 L92 50 L108 72 L84 110 L118 140 L96 188" />
              <path className="crack-path" d="M92 50 L60 64 L48 90" />
              <path className="crack-path" d="M108 72 L150 80 L168 108" />
              <path className="crack-path" d="M84 110 L50 130" />
            </svg>
          </div>
          <span className="mt-4 block font-cinzel text-[10px] uppercase tracking-[0.35em] text-gold/60">
            {opening ? "Двери отверзаются..." : knocks === 0 ? "Коснись горгульи" : knocks === 1 ? "Ещё два удара" : knocks === 2 ? "Последний стук..." : ""}
          </span>
        </button>

        <div className="flex gap-3">
          {[1, 2, 3].map((i) => (
            <span
              key={i}
              className={`h-2 w-2 rounded-full border border-gold/50 transition ${
                knocks >= i ? "bg-scarlet shadow-[0_0_10px_#c01c28]" : "bg-transparent"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
