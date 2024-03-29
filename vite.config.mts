import { defineConfig } from 'vite';
import { crx, defineManifest } from '@crxjs/vite-plugin';
import path from 'path';

const manifest = defineManifest({
  name: 'T2Auth', 
  description: 'A Chrome extension to ease the use and improve user experience of the IT facilities in Tokyo Institute of Technology.', 
  version: '1.15.1', 
  manifest_version: 3, 
  permissions: [
    'storage', 
    'identity', 
    'identity.email'
  ], 
  icons: {
    '32': 'icon32.png',
    '64': 'icon64.png',
    '128': 'icon128.png',
  },
  background: {
    service_worker: 'src/background.ts'
  },
  action: {
    default_title: 'T2Auth',
    default_popup: 'index.html',
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
        '*://kyomu0.gakumu.titech.ac.jp/*',
        '*://kyomu.gakumu.titech.ac.jp/*',
      ],
      all_frames: true,
      run_at: 'document_end',
    }
  ],
  web_accessible_resources: [
    {
      matches: [
        '*://*.gsic.titech.ac.jp/*',
        '*://portal.titech.ac.jp/*',
        '*://www.ocw.titech.ac.jp/*',
        '*://ocw.titech.ac.jp/*',
        '*://kyomu0.gakumu.titech.ac.jp/*',
        '*://kyomu.gakumu.titech.ac.jp/*',
      ],
      resources: [
        'pure-min.css',
      ],
    },
  ],
});

export default defineConfig({
  plugins: [crx({ manifest })],
  resolve: {
    alias: {
      '@': path.join(__dirname, 'src/'),
    }
  }
});