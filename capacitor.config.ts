import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.907c49ca1b9444e2a55e1208b82ad4c0',
  appName: 'allforyou-co-il',
  webDir: 'dist',
  server: {
    url: 'https://907c49ca-1b94-44e2-a55e-1208b82ad4c0.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
      sound: "beep.wav",
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;