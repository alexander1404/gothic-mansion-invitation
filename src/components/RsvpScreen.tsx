import { useState, type FormEvent, type ReactNode } from "react";
import { EMPTY_RSVP, makeTicketId, type Attendance, type Potion, type RsvpData } from "../event";
import { sound } from "../audio";
import { media } from "../media";

const POTIONS: { id: Potion; icon: string; title: string; desc: string }[] = [
  { id: "blood", icon: "🍷", title: "Кровь Дракулы", desc: "Красное сухое / авторские коктейли" },
  { id: "poison", icon: "🧪", title: "Яд ведьмы", desc: "Крепкие напитки / лонги" },
  { id: "dew", icon: "🍂", title: "Лунная роса", desc: "Безалкогольные зелья и крафтовые лимонады" },
];

export function RsvpScreen({ onSubmit }: { onSubmit: (data: RsvpData) => void }) {
  const [form, setForm] = useState<RsvpData>(EMPTY_RSVP);
  const [error, setError] = useState("");

  const set = <K extends keyof RsvpData>(k: K, v: RsvpData[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Назови себя — даже инкогнито имеет имя.");
      return;
    }
    if (!form.attending) {
      setError("Избери участь: душа или склеп.");
      return;
    }
    if (form.attending === "yes" && !form.potion) {
      setError("Избери тайное зелье для чаши.");
      return;
    }
    setError("");
    sound.seal();
    onSubmit({
      ...form,
      name: form.name.trim(),
      ticketId: makeTicketId(form.name.trim()),
    });
  };

  return (
    <section className="screen-fade-in relative min-h-dvh overflow-hidden bg-obsidian">
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `url(${media.library})`, backgroundSize: "cover" }} />
      <div className="absolute inset-0 bg-gradient-to-b from-obsidian via-obsidian/80 to-oak" />

      <div className="relative z-10 mx-auto max-w-3xl px-4 py-20">
        <p className="font-cinzel text-center text-[10px] uppercase tracking-[0.45em] text-gold/70">Книга мёртвых</p>
        <h2 className="font-display gold-text mt-2 text-center text-3xl md:text-4xl">Договор Кровью</h2>
        <p className="font-body mt-3 text-center text-lg italic text-parchment/75">Перо готово. Чернила ждут.</p>

        <form onSubmit={submit} className="book-page relative mx-auto mt-10 rounded-sm px-5 py-8 md:px-12 md:py-10">
          <div className="pointer-events-none absolute -right-3 top-8 hidden h-24 w-6 rotate-12 md:block">
            <div className="h-full w-2 rounded-full bg-gradient-to-b from-bronze to-[#3a2418]" />
          </div>

          <label className="font-cinzel block text-[10px] uppercase tracking-[0.3em] text-bronze">Твоё имя / Инкогнито</label>
          <input
            className="gothic-input mt-2 w-full rounded-sm px-4 py-3 text-xl"
            placeholder="Имя, что шёпотом произнесут у врат"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            maxLength={42}
          />

          <p className="font-cinzel mt-8 text-[10px] uppercase tracking-[0.3em] text-bronze">Решение</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <Choice
              selected={form.attending === "yes"}
              onClick={() => {
                sound.hover();
                set("attending", "yes" as Attendance);
              }}
            >
              <span className="text-2xl">🩸</span>
              <span className="font-display block text-base">Продать душу</span>
              <span className="font-body text-sm italic">Буду непременно</span>
            </Choice>
            <Choice
              selected={form.attending === "no"}
              onClick={() => {
                sound.hover();
                set("attending", "no" as Attendance);
              }}
            >
              <span className="text-2xl">⚰️</span>
              <span className="font-display block text-base">Спрятаться в гробу</span>
              <span className="font-body text-sm italic">Увы, не смогу</span>
            </Choice>
          </div>

          <p className="font-cinzel mt-8 text-[10px] uppercase tracking-[0.3em] text-bronze">Тайное зелье</p>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {POTIONS.map((p) => (
              <Choice
                key={p.id}
                selected={form.potion === p.id}
                onClick={() => {
                  sound.hover();
                  set("potion", p.id);
                }}
              >
                <span className="text-2xl">{p.icon}</span>
                <span className="font-display mt-1 block text-sm">{p.title}</span>
                <span className="font-body text-xs italic">{p.desc}</span>
              </Choice>
            ))}
          </div>

          <label className="font-cinzel mt-8 block text-[10px] uppercase tracking-[0.3em] text-bronze">Музыкальный вызов</label>
          <input
            className="gothic-input mt-2 w-full rounded-sm px-4 py-3 text-lg"
            placeholder="Какой трек заставит твой скелет танцевать?"
            value={form.song}
            onChange={(e) => set("song", e.target.value)}
            maxLength={80}
          />

          {error && <p className="font-body mt-4 text-center text-scarlet">{error}</p>}

          <div className="mt-8 flex justify-center">
            <button type="submit" className="ornate-btn rounded-sm px-8 py-3 text-xs">
              Скрепить печатью
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

function Choice({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button type="button" onClick={onClick} className={`choice-btn rounded-sm px-3 py-4 text-left ${selected ? "selected" : ""}`}>
      {children}
    </button>
  );
}
