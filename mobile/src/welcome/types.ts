export type CasaWelcomeActionId =
  | "casa.enter-house"
  | "casa.replay-welcome";

export type CasaWelcomeActionPressHandler = (
  actionId: CasaWelcomeActionId
) => void;

export type CasaWelcomeScreenProps = {
  autoplay?: boolean;
  onActionPress?: CasaWelcomeActionPressHandler;
  onPrimaryPress?: () => void;
  replayKey?: number | string;
};
