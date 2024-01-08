/**
 * @file Podverse manager.
 * This module includes functionality that deals with pod management using tauri interfaces.
 */

import { invoke } from '@tauri-apps/api';
import { listen } from '@tauri-apps/api/event';

/**
 * Podverse proxy endpoint.
 *
 * @type {string}
 */
export const PODVERSE_PROXY_ENDPOINT = await invoke('podverse_proxy_endpoint');

/**
 * Podverse proxy session secret token.
 *
 * @type {string}
 */
export const PODVERSE_PROXY_SESSION_SECRET_TOKEN = await invoke(
  'podverse_proxy_session_secret_token'
);

/**
 * Initialize podverse config.
 * @type {PodverseConfig}
 */
let _podverseConfig = await invoke('podverse_config');

/**
 * Get current podverse config.
 *
 * @returns {PodverseConfig}
 */
export function podverseConfig() {
  return _podverseConfig;
}

/**
 * Name of the event for podverse config change.
 */
export const PODVERSE_CONFIG_CHANGE_EVENT = 'podverse_config_change';

// Setup podverse config change listener.
await listen(PODVERSE_CONFIG_CHANGE_EVENT, (event) => {
  console.log('Received podverse config change event from backend.');
  _podverseConfig = event.payload;

  // Dispatch to window context.
  window.dispatchEvent(new Event(PODVERSE_CONFIG_CHANGE_EVENT));
});

/**
 * Provision a proxy pod.
 *
 * @param   {PodConfig}  newPodConfig  - New pod configuration.
 */
export async function provisionProxyPod(newPodConfig) {
  try {
    await invoke('provision_proxy_pod', {
      newPodConfig,
    });
    console.log('Proxy pod provision success.');
  } catch (error) {
    console.log('Error in provisioning a new pod.');
    console.log({ provisionError: error });
    throw error;
  }
}

