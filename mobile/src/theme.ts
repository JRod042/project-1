/**
 * Casa Rústico design tokens — Liquid Glass informed (HIG).
 * Glass = navigation chrome only. Content = solid surfaces.
 */
export const colors = {
  bg: "#0C100C",
  bgElevated: "#141A14",
  bgPanel: "#1A221A",
  bgCard: "#1E261E",
  linen: "#F7F3EC",
  linenDim: "rgba(247, 243, 236, 0.74)",
  linenMuted: "rgba(247, 243, 236, 0.4)",
  ink: "#0A0E0A",
  brass: "#C9A85C",
  brassSoft: "#D8C07A",
  brassDim: "#8B7340",
  leaf: "#6B8F71",
  leafBright: "#9BC4A0",
  danger: "#C45C4A",
  success: "#6B9B72",
  line: "rgba(247, 243, 236, 0.08)",
  lineBright: "rgba(247, 243, 236, 0.16)",
  heroWash: "rgba(201, 168, 92, 0.08)",
  // Chrome-only glass (tab bar / sticky footer)
  glass: "rgba(255, 255, 255, 0.08)",
  glassStrong: "rgba(255, 255, 255, 0.12)",
  glassBorder: "rgba(255, 255, 255, 0.16)",
  glassHighlight: "rgba(255, 255, 255, 0.22)",
  tabGlass: "rgba(12, 16, 12, 0.82)",
};

export const fonts = {
  display: "Fraunces_700Bold",
  displaySoft: "Fraunces_600SemiBold",
  body: "SourceSans3_400Regular",
  bodyMed: "SourceSans3_600SemiBold",
  bodyBold: "SourceSans3_700Bold",
};

/** Concentric radii aligned to device continuous corners */
export const radii = {
  sm: 12,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
};

export const spring = {
  press: { friction: 6, tension: 420 },
  soft: { friction: 9, tension: 120 },
  snappy: { friction: 7, tension: 280 },
};
