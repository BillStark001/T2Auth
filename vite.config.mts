import { defineConfig } from 'vite';
import { crx, defineManifest } from '@crxjs/vite-plugin';
import path from 'path';

const manifest = defineManifest({
  name: 'T2Auth', 
  description: 'A tool to help students of Tokyo Institute of Technology to log in quicker.', 
  version: '1.15.0', 
  manifest_version: 3, 
  permissions: [
    'storage', 
    'identity', 
    'identity.email'
  ], 
  icons: {
    '16': 'icon16.png',
    '48': 'icon48.png',
    '128': 'icon128.png',
    '256': 'icon256.png',
  },
  background: {
    service_worker: 'src/background.ts'
  },
  action: {
    default_title: 'Open Login Page',
    // default_popup: "index.html",
  },
  options_page: 'options.html',
  content_scripts: [
    {
      js: [
        'src/main.ts',
      ],
      matches: [
        '*://*.gsic.titech.ac.jp/*',
        '*://portal.titech.ac.jp/*',
        '*://www.ocw.titech.ac.jp/*',
        '*://ocw.titech.ac.jp/*',
      ],
      all_frames: true,
      run_at: 'document_end',
    }
  ]
});

export default defineConfig({
  plugins: [crx({ manifest })],
  resolve: {
    alias: {
      '@': path.join(__dirname, 'src/'),
    }
  }
});