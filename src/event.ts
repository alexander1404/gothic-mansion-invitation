export const EVENT = {
  invitationTitle: "Тайна Заброшенного Особняка",
  ballName: "Ночь Воскрешения Теней",
  dateLabel: "31 октября",
  timeLabel: "20:00",
  gathering: "сбор нечисти",
  address: "Подсосенский переулок, 21",
  city: "Москва",
  venue: "Особняк Морозова",
  lat: 55.7575,
  lng: 37.6533,
};

export function getEventDate() {
  const now = new Date();
  let year = now.getFullYear();
  const event = new Date(year, 9, 31, 20, 0, 0);
  if (now.getTime() > event.getTime()) {
    return new Date(year + 1, 9, 31, 20, 0, 0);
  }
  return event;
}

export function yandexMapsUrl() {
  return `https://yandex.ru/maps/?text=${encodeURIComponent(`${EVENT.city}, ${EVENT.address}`)}`;
}

export function googleMapsUrl() {
  return `https://maps.google.com/?q=${encodeURIComponent(`${EVENT.city}, ${EVENT.address}`)}`;
}

export function navigatorUrl() {
  return `geo:${EVENT.lat},${EVENT.lng}?q=${encodeURIComponent(`${EVENT.venue}, ${EVENT.city}, ${EVENT.address}`)}`;
}

export function makeTicketId(name: string) {
  const roman = ["III", "VII", "IX", "XI", "XIII", "XVII", "XIX", "XXI", "XXIII", "XXVIII", "XXXIII", "XL"];
  let hash = 2166136261;
  for (let i = 0; i < name.length; i++) {
    hash ^= name.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const r = roman[Math.abs(hash) % roman.length];
  const n = String(1000 + (Math.abs(hash) % 9000));
  return `${r}–${n}`;
}

export function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function toICSDate(d: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}T${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}Z`;
}

export function buildICS() {
  const start = getEventDate();
  const end = new Date(start.getTime() + 6 * 60 * 60 * 1000);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Osobnyak//ShadowBall//RU",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `DTSTART:${toICSDate(start)}`,
    `DTEND:${toICSDate(end)}`,
    `SUMMARY:${EVENT.ballName}`,
    `DESCRIPTION:${EVENT.invitationTitle}. ${EVENT.gathering}. Дресс-код: карты судьбы.`,
    `LOCATION:${EVENT.venue}, ${EVENT.address}, ${EVENT.city}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export type Screen = "welcome" | "hall" | "tarot" | "rsvp" | "ticket";

export type Potion = "blood" | "poison" | "dew";
export type Attendance = "yes" | "no";

export interface RsvpData {
  name: string;
  attending: Attendance | null;
  potion: Potion | null;
  song: string;
  ticketId: string;
}

export const EMPTY_RSVP: RsvpData = {
  name: "",
  attending: null,
  potion: null,
  song: "",
  ticketId: "",
};
