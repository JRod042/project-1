/** @type {import('expo/config').ExpoConfig} */
const config = {
  name: "Casa Rustico",
  slug: "omni",
  version: "0.2.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "dark",
  scheme: "casarustico",
  newArchEnabled: true,
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#1A2118",
  },
  ios: {
    supportsTablet: true,
    // Keep existing ASC / TestFlight identity; display name rebranded.
    bundleIdentifier: "com.jrod042.omni",
    // Bump before each new ASC upload if that number was already used.
    // EAS autoIncrement is unsupported with app.config.js.
    buildNumber: "7",
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
      backgroundColor: "#1A2118",
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
    "expo-image",
    [
      "expo-splash-screen",
      {
        backgroundColor: "#1A2118",
        image: "./assets/splash-icon.png",
        imageWidth: 200,
      },
    ],
    [
      "expo-build-properties",
      {
        ios: {
          deploymentTarget: "16.4",
          // Avoid RN privacy_manifest_utils.rb crash:
          // "no implicit conversion of nil into Array" during pod post_install.
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
