/** @type {import('expo/config').ExpoConfig} */
const config = {
  name: "Casa Rustico",
  slug: "omni",
  version: "0.5.2",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  scheme: "casarustico",
  newArchEnabled: true,
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#f5ead8",
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.jrod042.omni",
    buildNumber: "27",
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
    adaptiveIcon: {
      backgroundColor: "#f5ead8",
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
        backgroundColor: "#f5ead8",
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
    shopifyDomain:
      process.env.EXPO_PUBLIC_SHOPIFY_DOMAIN || "b84a47-3.myshopify.com",
    shopifyStorefrontToken:
      process.env.EXPO_PUBLIC_SHOPIFY_STOREFRONT_TOKEN ||
      "e9f17ff7812a3937d12329a73007ce3f",
  },
  owner: "jrod42",
};

module.exports = config;
