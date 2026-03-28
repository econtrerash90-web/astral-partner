import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.astrelle',
  appName: 'Astrelle',
  webDir: 'dist',
  server: {
    url: 'https://3253a68f-bb39-41af-b674-10ec4e001df2.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
};

export default config;
