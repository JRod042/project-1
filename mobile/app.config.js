/** @type {import('expo/config').ExpoConfig} */
const config = {
  name: "Casa Rustico",
  slug: "omni",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  scheme: "casarustico",
  newArchEnabled: true,
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#9c704b",
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.jrod042.omni",
    buildNumber: "36",
    usesAppleSignIn: false,
    infoPlist: {
      CFBundleDisplayName: "Casa Rustico",
      CFBundleName: "Casa Rustico",
      LSRequiresIPhoneOS: true,
      UIRequiredDeviceCapabilities: ["arm64"],
      UIStatusBarStyle: "UIStatusBarStyleDarkContent",
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: "com.jrod042.omni",
    versionCode: 36,
    adaptiveIcon: {
      backgroundColor: "#9c704b",
      foregroundImage: "./assets/android-icon-foreground.png",
      backgroundImage: "./assets/android-icon-background.png",
      monochromeImage: "./assets/android-icon-monochrome.png",
    },
    predictiveBackGestureEnabled: false,
    softwareKeyboardLayoutMode: "resize",
  },
  androidStatusBar: {
    backgroundColor: "#9c704b",
    barStyle: "light-content",
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
        backgroundColor: "#9c704b",
        image: "./assets/splash-icon.png",
        imageWidth: 280,
      },
    ],
    [
      "expo-build-properties",
      {
        ios: {
          deploymentTarget: "16.4",
          privacyManifestAggregationEnabled: false,
        },
        android: {
          minSdkVersion: 26,
          targetSdkVersion: 35,
        },
      },
    ],
  ],
  extra: {
    eas: {
      projectId: process.env.EAS_PROJECT_ID || "b7896713-f57d-4303-850d-b4985ade82ab",
    },
    shopifyDomain:
      process.env.EXPO_PUBLIC_SHOPIFY_DOMAIN || "b84a47-3.myshopify.com",
    shopifyStorefrontToken:
      process.env.EXPO_PUBLIC_SHOPIFY_STOREFRONT_TOKEN ||
      "e9f17ff7812a3937d12329a73007ce3f",
  },
  owner: "jrod42",
};

module.exports = config;
