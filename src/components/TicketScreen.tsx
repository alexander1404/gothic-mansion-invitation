import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { buildICS, EVENT, type RsvpData } from "../event";
import { sound } from "../audio";
import { media } from "../media";

const POTION_LABEL: Record<string, string> = {
  blood: "Кровь Дракулы",
  poison: "Яд ведьмы",
  dew: "Лунная роса",
};

export function TicketScreen({ data }: { data: RsvpData }) {
  const ticketRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const attending = data.attending === "yes";
  const status = attending ? "Посвящён в Орден Теней" : "Душа сокрыта в склепе";

  const saveTicket = async () => {
    if (!ticketRef.current || saving) return;
    setSaving(true);
    sound.seal();
    try {
      const canvas = await html2canvas(ticketRef.current, {
        backgroundColor: "#0a080c",
        scale: 2,
        useCORS: true,
      });
      const blob: Blob | null = await new Promise((res) => canvas.toBlob((b) => res(b), "image/png"));
      if (!blob) throw new Error("blob");
      const safeId = data.ticketId.replace(/[^\w]+/g, "-");
      const file = new File([blob], `propusk-${safeId}.png`, { type: "image/png" });
      const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void>; canShare?: (d: ShareData) => boolean };
      if (nav.canShare?.({ files: [file] })) {
        await nav.share({ files: [file], title: "Пропуск в Обитель Тьмы" });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `propusk-${safeId}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      /* user cancelled share */
    } finally {
      setSaving(false);
    }
  };

  const addCalendar = () => {
    const ics = buildICS();
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "noch-voskresheniya-teney.ics";
    a.click();
    URL.revokeObjectURL(url);
  };

  const share = async (kind: "tg" | "wa" | "copy") => {
    const text = `Ты зван на «${EVENT.ballName}». ${EVENT.dateLabel}, ${EVENT.timeLabel}. ${EVENT.venue}. Поступи трижды, чтобы пробудить древних...`;
    const url = window.location.href;
    if (kind === "tg") {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, "_blank");
    } else if (kind === "wa") {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, "_blank");
    } else {
      try {
        await navigator.clipboard.writeText(`${text} ${url}`);
      } catch {
        /* ignore */
      }
    }
  };

  return (
    <section className="screen-fade-in relative min-h-dvh overflow-hidden bg-obsidian">
      <div className="absolute inset-0 opacity-25" style={{ backgroundImage: `url(${media.castle})`, backgroundSize: "cover" }} />
      <div className="absolute inset-0 bg-obsidian/75" />

      <div className="relative z-10 mx-auto max-w-xl px-4 py-20">
        <p className="font-cinzel text-center text-[10px] uppercase tracking-[0.45em] text-gold/70">Обитель тьмы</p>
        <h2 className="font-display gold-text mt-2 text-center text-3xl md:text-4xl">Запечатанный пропуск</h2>
        <p className="font-body mt-3 text-center text-lg italic text-parchment/75">Именной билет для избранных</p>

        <div
          ref={ticketRef}
          className="ticket-card relative mx-auto mt-8 overflow-hidden rounded-sm p-6 md:p-8"
          style={{ backgroundImage: `linear-gradient(180deg, rgba(10,8,12,0.72), rgba(10,8,12,0.82)), url(${media.ticketBg})`, backgroundSize: "cover" }}
        >
          <div className="pointer-events-none absolute inset-2 border border-gold/30" />
          <p className="font-cinzel text-center text-[10px] uppercase tracking-[0.4em] text-gold/70">Пропуск в Обитель Тьмы</p>
          <h3 className="font-display mt-2 text-center text-2xl text-gold">{EVENT.ballName}</h3>
          <div className="mx-auto my-4 h-px w-32 bg-gradient-to-r from-transparent via-gold to-transparent" />
          <p className="font-cinzel text-center text-[10px] uppercase tracking-[0.3em] text-bronze">Носитель имени</p>
          <p className="font-display mt-1 text-center text-3xl text-parchment">{data.name}</p>
          <p className="font-body mt-2 text-center italic text-gold/80">{status}</p>
          <div className="mt-6 grid grid-cols-2 gap-3 text-center">
            <div>
              <p className="font-cinzel text-[9px] uppercase tracking-[0.25em] text-bronze">Когда</p>
              <p className="font-body text-lg text-parchment">
                {EVENT.dateLabel}, {EVENT.timeLabel}
              </p>
            </div>
            <div>
              <p className="font-cinzel text-[9px] uppercase tracking-[0.25em] text-bronze">Где</p>
              <p className="font-body text-lg text-parchment">{EVENT.venue}</p>
            </div>
          </div>
          {data.potion && (
            <p className="font-body mt-4 text-center text-parchment/80">
              Зелье: <span className="text-gold">{POTION_LABEL[data.potion]}</span>
            </p>
          )}
          {data.song && (
            <p className="font-body mt-1 text-center text-sm italic text-parchment/70">«{data.song}»</p>
          )}
          <div className="mt-6 flex items-center justify-between">
            <div className="wax-seal h-14 w-14 text-xl">M</div>
            <p className="font-cinzel text-sm tracking-[0.2em] text-gold">№ {data.ticketId}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-3">
          <button type="button" className="gold-btn rounded-sm px-4 py-3 text-xs" onClick={saveTicket} disabled={saving}>
            📥 {saving ? "Печать..." : "Сохранить билет в галерею"}
          </button>
          <button type="button" className="ornate-btn rounded-sm px-4 py-3 text-xs" onClick={addCalendar}>
            🗓️ Добавить в календарь
          </button>
          <div className="grid grid-cols-3 gap-2">
            <button type="button" className="ornate-btn rounded-sm px-2 py-3 text-[10px]" onClick={() => share("tg")}>
              Telegram
            </button>
            <button type="button" className="ornate-btn rounded-sm px-2 py-3 text-[10px]" onClick={() => share("wa")}>
              WhatsApp
            </button>
            <button type="button" className="ornate-btn rounded-sm px-2 py-3 text-[10px]" onClick={() => share("copy")}>
              Копировать
            </button>
          </div>
          <p className="font-body text-center text-sm italic text-parchment/50">Поделиться с сообщниками</p>
        </div>
      </div>
    </section>
  );
}
