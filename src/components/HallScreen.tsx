import { useEffect, useRef, useState } from "react";
import { EVENT, getEventDate, googleMapsUrl, navigatorUrl, pad, yandexMapsUrl } from "../event";
import { sound } from "../audio";
import { media } from "../media";
import { Candle } from "./Chrome";

function useCountdown() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const target = getEventDate().getTime();
  const diff = Math.max(0, target - now);
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

function Portrait() {
  const ref = useRef<HTMLDivElement>(null);
  const [eyes, setEyes] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height * 0.38;
      const dx = (e.clientX - cx) / window.innerWidth;
      const dy = (e.clientY - cy) / window.innerHeight;
      setEyes({ x: Math.max(-1, Math.min(1, dx * 3)) * 5, y: Math.max(-1, Math.min(1, dy * 3)) * 4 });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div ref={ref} className="portrait-frame relative hidden w-[118px] shrink-0 md:block lg:w-[148px]">
      <div className="relative overflow-hidden bg-oak">
        <img src={media.portrait} alt="Портрет предка" className="block w-full" />
        <span
          className="pointer-events-none absolute h-[9px] w-[9px] rounded-full bg-black shadow-[0_0_6px_#c01c28]"
          style={{ left: `calc(38% + ${eyes.x}px)`, top: `calc(34% + ${eyes.y}px)` }}
        />
        <span
          className="pointer-events-none absolute h-[9px] w-[9px] rounded-full bg-black shadow-[0_0_6px_#c01c28]"
          style={{ left: `calc(55% + ${eyes.x}px)`, top: `calc(34.5% + ${eyes.y}px)` }}
        />
      </div>
    </div>
  );
}

function MapModal({ onClose }: { onClose: () => void }) {
  const [zoomed, setZoomed] = useState(false);

  return (
    <div className="fixed inset-0 z-[50] flex items-center justify-center bg-obsidian/80 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative max-h-[90dvh] w-full max-w-2xl overflow-hidden rounded-sm border border-gold/40 p-3 md:p-5"
        style={{ background: "#1a100c" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-lg text-gold md:text-xl">Карта владений</h3>
          <button type="button" onClick={onClose} className="font-cinzel text-xs tracking-widest text-parchment/70 hover:text-gold">
            Закрыть ✕
          </button>
        </div>
        <div className="vintage-map relative h-[420px] overflow-hidden rounded-sm border border-bronze/40 md:h-[480px]">
          <div className={`map-stage absolute inset-0 ${zoomed ? "zoomed" : ""}`}>
            <svg viewBox="0 0 400 400" className="h-full w-full opacity-80">
              <rect width="400" height="400" fill="none" />
              <path d="M20 80 H380" stroke="#6b4f2a" strokeWidth="3" />
              <path d="M40 20 V380" stroke="#6b4f2a" strokeWidth="2.5" />
              <path d="M20 200 H380" stroke="#6b4f2a" strokeWidth="4" />
              <path d="M180 20 V380" stroke="#6b4f2a" strokeWidth="3" />
              <path d="M300 20 V380" stroke="#6b4f2a" strokeWidth="2" />
              <path d="M20 310 H380" stroke="#6b4f2a" strokeWidth="2" />
              <path d="M20 140 H380" stroke="#8a6a3c" strokeWidth="1.5" strokeDasharray="6 4" />
              <rect x="230" y="155" width="90" height="70" fill="#5c3a1a" opacity="0.35" stroke="#4a2e12" />
              <circle cx="70" cy="250" r="36" fill="#4a6a48" opacity="0.35" />
              <path d="M0 360 Q200 330 400 370" stroke="#3a5a7a" strokeWidth="18" fill="none" opacity="0.35" />
            </svg>
            <span className="font-cinzel absolute left-8 top-[62px] text-[10px] tracking-widest text-[#5a3a18]/80">УЛ. ВОРОНОВ</span>
            <span className="font-cinzel absolute left-[48px] top-[188px] text-[10px] tracking-widest text-[#5a3a18]/80">НАБЕРЕЖНАЯ ТЕНЕЙ</span>
            <span className="font-cinzel absolute left-[188px] top-8 origin-left -rotate-90 text-[10px] tracking-widest text-[#5a3a18]/80">
              ТУМАННЫЙ ПЕР.
            </span>
            <span className="font-cinzel absolute left-[308px] top-16 origin-left -rotate-90 text-[10px] tracking-widest text-[#5a3a18]/80">
              ПОДСОСЕНСКИЙ ПЕР.
            </span>
            <span className="font-body absolute left-10 top-[238px] text-xs italic text-[#2f4a2e]">Сад воронов</span>
            <span className="font-body absolute left-8 top-[350px] text-xs italic text-[#2a4058]">Река Теней</span>

            <button
              type="button"
              className="absolute grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center"
              style={{ left: "62%", top: "46%" }}
              onClick={() => {
                setZoomed(true);
                sound.seal();
              }}
              aria-label="Место проведения"
            >
              <span className="blood-mark block" />
            </button>
          </div>

          {zoomed && (
            <div className="absolute inset-x-4 bottom-4 z-10 rounded-sm border border-scarlet/50 bg-obsidian/85 p-4 text-center shadow-2xl backdrop-blur-sm">
              <div className="mx-auto mb-2 wax-seal text-2xl">M</div>
              <p className="font-display text-base text-gold">{EVENT.venue}</p>
              <p className="font-body text-parchment">
                {EVENT.address}, {EVENT.city}
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                <a href={yandexMapsUrl()} target="_blank" rel="noreferrer" className="gold-btn rounded-sm px-3 py-2 text-[10px]">
                  Яндекс Карты
                </a>
                <a href={googleMapsUrl()} target="_blank" rel="noreferrer" className="ornate-btn rounded-sm px-3 py-2 text-[10px]">
                  Google Maps
                </a>
                <a href={navigatorUrl()} className="ornate-btn rounded-sm px-3 py-2 text-[10px]">
                  Навигатор
                </a>
              </div>
            </div>
          )}
        </div>
        <p className="font-body mt-2 text-center text-sm italic text-parchment/60">
          {zoomed ? "Алая метка указывает врата." : "Коснись алой метки, чтобы открыть адрес."}
        </p>
      </div>
    </div>
  );
}

export function HallScreen({ onNext, onDark }: { onNext: () => void; onDark: (v: boolean) => void }) {
  const t = useCountdown();
  const [map, setMap] = useState(false);
  const melt = Math.min(1, t.days === 0 ? 0.7 : t.days < 10 ? 0.4 : 0.15);

  return (
    <section className="screen-fade-in relative min-h-dvh overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${media.library})` }}
      />
      <div className="absolute inset-0 bg-obsidian/55" />
      <div className="fog-layer fog-2 opacity-40" />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col gap-6 px-4 py-20 md:flex-row md:items-start md:py-24">
        <Portrait />

        <div className="scroll-sheet relative flex-1 rounded-sm px-5 py-8 md:px-10 md:py-10">
          <div className="absolute -top-7 left-1/2 -translate-x-1/2">
            <div className="wax-seal">M</div>
          </div>
          <p className="font-cinzel text-center text-[10px] uppercase tracking-[0.4em] text-bronze">Свиток события</p>
          <h2 className="font-display mt-3 text-center text-3xl text-[#5c0d1b] md:text-4xl">{EVENT.ballName}</h2>
          <div className="mx-auto my-4 h-px w-40 bg-gradient-to-r from-transparent via-bronze to-transparent" />
          <p className="font-body text-center text-lg leading-relaxed text-[#3a2418]">
            В ночь, когда завеса тонка, врата Особняка отверзаются.
            <br />
            Явись в чёрном бархате и золоте — или не явись вовсе.
          </p>
          <div className="mt-6 grid gap-3 text-center md:grid-cols-3">
            <div>
              <p className="font-cinzel text-[10px] uppercase tracking-[0.3em] text-bronze">Дата</p>
              <p className="font-display text-xl text-[#5c0d1b]">{EVENT.dateLabel}</p>
            </div>
            <div>
              <p className="font-cinzel text-[10px] uppercase tracking-[0.3em] text-bronze">Начало</p>
              <p className="font-display text-xl text-[#5c0d1b]">
                {EVENT.timeLabel}
                <span className="font-body block text-sm italic text-[#3a2418]/80">{EVENT.gathering}</span>
              </p>
            </div>
            <div>
              <p className="font-cinzel text-[10px] uppercase tracking-[0.3em] text-bronze">Локация</p>
              <p className="font-display text-lg text-[#5c0d1b]">{EVENT.venue}</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-end justify-center gap-4">
            <Candle melt={melt} onBlow={() => { onDark(true); window.setTimeout(() => onDark(false), 900); }} />
            <div className="grid grid-cols-4 gap-2">
              {[
                { v: pad(t.days), l: "дни" },
                { v: pad(t.hours), l: "часы" },
                { v: pad(t.minutes), l: "минуты" },
                { v: pad(t.seconds), l: "секунды" },
              ].map((c) => (
                <div key={c.l} className="clock-cell rounded-sm px-2 py-3 text-center md:px-3">
                  <div className="font-display text-xl text-gold md:text-2xl">{c.v}</div>
                  <div className="font-cinzel mt-1 text-[8px] uppercase tracking-[0.2em] text-bronze">{c.l}</div>
                </div>
              ))}
            </div>
            <Candle melt={melt * 0.8} onBlow={() => { onDark(true); window.setTimeout(() => onDark(false), 900); }} />
            <div className="hidden sm:block">
              <Candle melt={melt * 1.1} onBlow={() => { onDark(true); window.setTimeout(() => onDark(false), 900); }} />
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              className="ornate-btn rounded-sm px-5 py-3 text-xs"
              onClick={() => {
                sound.page();
                setMap(true);
              }}
            >
              Осмотреть карту прохода
            </button>
            <button
              type="button"
              className="gold-btn rounded-sm px-5 py-3 text-xs"
              onClick={() => {
                sound.page();
                onNext();
              }}
            >
              Карты судьбы →
            </button>
          </div>
        </div>
      </div>

      {map && <MapModal onClose={() => setMap(false)} />}
    </section>
  );
}
