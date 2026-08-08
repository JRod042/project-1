import type {
  CasaWelcomeActionId,
  CasaWelcomeActionPressHandler,
} from "../types";

/** Prefers semantic action API; falls back to legacy primary callback. */
export function resolveActionPress(
  actionId: CasaWelcomeActionId,
  onActionPress: CasaWelcomeActionPressHandler | undefined,
  legacyFallback?: () => void
) {
  if (!onActionPress) {
    return legacyFallback;
  }
  return () => onActionPress(actionId);
}
