import { useState } from "react";
import { sound } from "../audio";
import { media } from "../media";

const CARDS = [
  {
    id: "vampire",
    title: "Кровавая знать",
    roman: "I",
    image: media.tarotVampire,
    blurb: "Вампиры, викторианские графы, дамы в корсетах, готическая роскошь.",
    makeup: "Фарфоровая бледность, кроваво-алые губы, дымчатый угольный глаз, тонкая линия карандаша.",
    attrs: "Кружевные перчатки, камея, кубок, клыки, бархат, рубины, высокий ворот.",
  },
  {
    id: "cult",
    title: "Древний культ",
    roman: "II",
    image: media.tarotCult,
    blurb: "Чёрные мантии, ритуальные маски, капюшоны, рунические амулеты.",
    makeup: "Чёрные веки до висков, рунические штрихи на скулах, пепельная кожа, отсутствие румян.",
    attrs: "Капюшон, золотая маска, амулет с руной, свечи, чёрная мантия до пола.",
  },
  {
    id: "undead",
    title: "Восставшие из склепа",
    roman: "III",
    image: media.tarotUndead,
    blurb: "Призраки, зомби, скелеты, винтажные привидения с паутиной.",
    makeup: "Серо-оливковый тон, впалые тени, трещины грима, тёмные губы, паутина у висков.",
    attrs: "Потрёканный викторианский наряд, цепи, фата, искусственная паутина, кости.",
  },
  {
    id: "villain",
    title: "Культовые злодеи",
    roman: "IV",
    image: media.tarotVillain,
    blurb: "Персонажи классических фильмов ужасов и тёмных сказок.",
    makeup: "Гротеск или гламур нуара — в зависимости от избранного злодея. Контраст света и тьмы.",
    attrs: "Плащ, трость, швы, шляпа, зеркало, яблоко, топор — цитата любимого кошмара.",
  },
];

export function TarotScreen({ onNext }: { onNext: () => void }) {
  const [flipped, setFlipped] = useState<string | null>(null);
  const active = CARDS.find((c) => c.id === flipped);

  return (
    <section className="screen-fade-in relative min-h-dvh overflow-hidden bg-oak">
      <div className="absolute inset-0 opacity-40" style={{ backgroundImage: `url(${media.library})`, backgroundSize: "cover" }} />
      <div className="absolute inset-0 bg-gradient-to-b from-obsidian/80 via-velvet/40 to-obsidian" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-20">
        <p className="font-cinzel text-center text-[10px] uppercase tracking-[0.45em] text-gold/70">Спиритический стол</p>
        <h2 className="font-display gold-text mt-2 text-center text-3xl md:text-4xl">Карты Судьбы</h2>
        <p className="font-body mt-3 text-center text-lg italic text-parchment/80">Дресс-код и избранные образы бала</p>

        <div className="tarot-table mx-auto mt-10 max-w-5xl rounded-sm border border-gold/20 px-3 py-8 md:px-8">
          <div className="flex flex-wrap items-start justify-center gap-5">
            {CARDS.map((card, i) => (
              <button
                type="button"
                key={card.id}
                className={`tarot-card ${flipped === card.id ? "flipped" : ""}`}
                style={{ animationDelay: `${i * 0.1}s` }}
                onClick={() => {
                  sound.tarot();
                  setFlipped((prev) => (prev === card.id ? null : card.id));
                }}
              >
                <div className="tarot-inner">
                  <div className="tarot-face">
                    <img src={media.tarotBack} alt="Рубашка карты" className="h-full w-full object-cover" />
                    <span className="font-fraktur absolute inset-x-0 bottom-3 text-center text-2xl text-gold/80">{card.roman}</span>
                  </div>
                  <div className="tarot-face back">
                    <img src={card.image} alt={card.title} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/20 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-3 text-left">
                      <p className="font-cinzel text-[9px] tracking-[0.3em] text-gold">{card.roman}</p>
                      <p className="font-display text-sm leading-tight text-parchment">{card.title}</p>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <p className="font-body mt-6 text-center text-base italic text-parchment/70">
            Кликните на карту, чтобы прочитать советы по макияжу и атрибутам.
          </p>

          {active && (
            <div className="mx-auto mt-5 max-w-2xl rounded-sm border border-gold/30 bg-obsidian/70 p-5 text-parchment">
              <h3 className="font-display text-xl text-gold">
                {active.roman}. {active.title}
              </h3>
              <p className="font-body mt-2 text-lg">{active.blurb}</p>
              <p className="font-body mt-3">
                <span className="text-gold">Макияж: </span>
                {active.makeup}
              </p>
              <p className="font-body mt-1">
                <span className="text-gold">Атрибуты: </span>
                {active.attrs}
              </p>
            </div>
          )}
        </div>

        <div className="mt-10 flex justify-center">
          <button
            type="button"
            className="gold-btn rounded-sm px-6 py-3 text-xs"
            onClick={() => {
              sound.page();
              onNext();
            }}
          >
            Подписать договор →
          </button>
        </div>
      </div>
    </section>
  );
}
