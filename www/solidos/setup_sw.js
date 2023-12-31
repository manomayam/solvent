/**
 * @file Sets up podverse proxy service worker.
 */

import { Workbox } from 'workbox-window';
import {
  PODVERSE_CONFIG_CHANGE_EVENT,
  PODVERSE_PROXY_ENDPOINT,
  PODVERSE_PROXY_SESSION_SECRET_TOKEN,
  podverseConfig,
} from '../podverse_manager/mod.js';

console.log('Initializing podverse proxy setup.');

const wb = new Workbox('./sw.js');
await wb.register();

// Setup log proxy channel for service worker.
// Work around to get logs from service worker in tauri webview.
const swLogChannel = new BroadcastChannel('sw_log');
// @ts-ignore
window['swLogChannel'] = swLogChannel;
swLogChannel.addEventListener('message', (event) => {
  console.log('SW_LOG:', event.data.arg1, event.data.arg2);
});

// Proxy podverse config change event to service worker.
window.addEventListener(PODVERSE_CONFIG_CHANGE_EVENT, () => {
  wb.messageSW({
    type: 'PODVERSE_CONFIG_CHANGE',
    payload: podverseConfig(),
  });
});

// Initialize sw with current podverse info.
await wb.messageSW({
  type: 'PODVERSE_INFO',
  payload: {
    podverseProxyEndpoint: PODVERSE_PROXY_ENDPOINT,
    podverseProxySessionSecretToken: PODVERSE_PROXY_SESSION_SECRET_TOKEN,
    podverseConfig: podverseConfig(),
  },
});

console.log('Podverse proxy setup complete.');
