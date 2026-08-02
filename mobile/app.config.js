/** @type {import('expo/config').ExpoConfig} */
const config = {
  name: "Omni",
  slug: "omni-agent",
  version: "0.1.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "dark",
  scheme: "omni",
  newArchEnabled: true,
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#0B0F0C",
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.jrod042.omni",
    buildNumber: "1",
    usesAppleSignIn: false,
    infoPlist: {
      CFBundleDisplayName: "Omni",
      CFBundleName: "Omni",
      LSRequiresIPhoneOS: true,
      UIRequiredDeviceCapabilities: ["arm64"],
      UIStatusBarStyle: "UIStatusBarStyleLightContent",
      // Allow talking to the Omni agent server on LAN over HTTP.
      NSAppTransportSecurity: {
        NSAllowsLocalNetworking: true,
      },
      NSLocalNetworkUsageDescription:
        "Omni connects to your personal agent server on the local network so it can act on your behalf.",
      NSBonjourServices: ["_http._tcp."],
      ITSAppUsesNonExemptEncryption: false,
    },
    privacyManifests: {
      NSPrivacyAccessedAPITypes: [
        {
          NSPrivacyAccessedAPIType:
            "NSPrivacyAccessedAPICategoryUserDefaults",
          NSPrivacyAccessedAPIReasons: ["CA92.1"],
        },
        {
          NSPrivacyAccessedAPIType: "NSPrivacyAccessedAPICategoryFileTimestamp",
          NSPrivacyAccessedAPIReasons: ["C617.1"],
        },
      ],
    },
  },
  android: {
    package: "com.jrod042.omni",
    adaptiveIcon: {
      backgroundColor: "#0B0F0C",
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
        backgroundColor: "#0B0F0C",
        image: "./assets/splash-icon.png",
        imageWidth: 200,
      },
    ],
    [
      "expo-build-properties",
      {
        ios: {
          deploymentTarget: "16.4",
        },
      },
    ],
    "expo-dev-client",
  ],
  extra: {
    eas: {
      // Paste your Expo Project ID here (Project settings → General).
      // Example: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
      projectId: process.env.EAS_PROJECT_ID || undefined,
    },
  },
  owner: "jrod42",
};

module.exports = config;
