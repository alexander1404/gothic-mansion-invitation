import { useState } from "react";
import { sound } from "./audio";
import { EMPTY_RSVP, type RsvpData, type Screen } from "./event";
import { DarknessVeil, Grain, SoundToggle, Spider } from "./components/Chrome";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { HallScreen } from "./components/HallScreen";
import { TarotScreen } from "./components/TarotScreen";
import { RsvpScreen } from "./components/RsvpScreen";
import { TicketScreen } from "./components/TicketScreen";

export default function App() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [soundOn, setSoundOn] = useState(false);
  const [dark, setDark] = useState(false);
  const [rsvp, setRsvp] = useState<RsvpData>(EMPTY_RSVP);

  return (
    <main className="relative min-h-dvh bg-obsidian text-parchment">
      <Grain />
      <SoundToggle
        on={soundOn}
        setOn={(v) => {
          setSoundOn(v);
        }}
      />
      <Spider />
      <DarknessVeil on={dark} />

      {screen === "welcome" && (
        <WelcomeScreen
          onAwaken={() => {
            if (!soundOn) {
              setSoundOn(true);
              sound.setEnabled(true);
            }
          }}
          onEnter={() => {
            setScreen("hall");
          }}
        />
      )}
      {screen === "hall" && <HallScreen onNext={() => setScreen("tarot")} onDark={setDark} />}
      {screen === "tarot" && <TarotScreen onNext={() => setScreen("rsvp")} />}
      {screen === "rsvp" && (
        <RsvpScreen
          onSubmit={(data) => {
            setRsvp(data);
            window.localStorage.setItem("osobnyak-rsvp", JSON.stringify(data));
            setScreen("ticket");
          }}
        />
      )}
      {screen === "ticket" && <TicketScreen data={rsvp} />}
    </main>
  );
}
