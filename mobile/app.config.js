/** @type {import('expo/config').ExpoConfig} */
const config = {
  name: "Casa Rustico",
  slug: "omni",
  version: "0.4.1",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "dark",
  scheme: "casarustico",
  newArchEnabled: true,
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#0E130E",
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.jrod042.omni",
    buildNumber: "17",
    usesAppleSignIn: false,
    infoPlist: {
      CFBundleDisplayName: "Casa Rustico",
      CFBundleName: "Casa Rustico",
      LSRequiresIPhoneOS: true,
      UIRequiredDeviceCapabilities: ["arm64"],
      UIStatusBarStyle: "UIStatusBarStyleLightContent",
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: "com.jrod042.omni",
    adaptiveIcon: {
      backgroundColor: "#0E130E",
      foregroundImage: "./assets/android-icon-foreground.png",
      backgroundImage: "./assets/android-icon-background.png",
      monochromeImage: "./assets/android-icon-monochrome.png",
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  plugins: [
    "expo-secure-store",
    "expo-font",
    [
      "expo-splash-screen",
      {
        backgroundColor: "#0E130E",
        image: "./assets/splash-icon.png",
        imageWidth: 200,
      },
    ],
    [
      "expo-build-properties",
      {
        ios: {
          deploymentTarget: "16.4",
          privacyManifestAggregationEnabled: false,
        },
      },
    ],
  ],
  extra: {
    eas: {
      projectId: process.env.EAS_PROJECT_ID || "b7896713-f57d-4303-850d-b4985ade82ab",
    },
  },
  owner: "jrod42",
};

module.exports = config;
