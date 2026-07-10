import type { CapacitorConfig } from '@capacitor/cli';

const webUrl = process.env.BUILDMASTER_WEB_URL || 'https://buildmaster-ai-git-main-buildmaster-ai.vercel.app';

const config: CapacitorConfig = {
  appId: 'com.buildmaster.elitetatico',
  appName: 'BuildMaster Elite Tático',
  webDir: 'apk-shell',
  server: {
    url: webUrl,
    cleartext: false
  }
};

export default config;
