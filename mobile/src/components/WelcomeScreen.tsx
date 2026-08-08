import { CasaRusticoWelcome } from "../welcome/CasaRusticoWelcome";

type Props = {
  onEnter: () => void;
  replayKey?: number;
};

/** App-facing wrapper over the Appllama-engine Casa Rustico welcome. */
export function WelcomeScreen({ onEnter, replayKey = 0 }: Props) {
  return (
    <CasaRusticoWelcome
      autoplay
      replayKey={replayKey}
      onPrimaryPress={onEnter}
      onActionPress={(id) => {
        if (id === "casa.enter-house") onEnter();
      }}
    />
  );
}
