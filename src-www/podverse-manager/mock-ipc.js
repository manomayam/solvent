import { MOCK_PODVERSE1_CONFIG } from './mock-data.js';
import { mockIPC } from '@tauri-apps/api/mocks';

export const MOCK_SESSION_SECRET_TOKEN = 'abc';
export const MOCK_PODVERSE_PROXY_ENDPOINT = 'http://localhost:7777/';

const MOCK_PODVERSE_CONFIG = structuredClone(MOCK_PODVERSE1_CONFIG);

mockIPC((cmd, args) => {
  if (cmd === 'podverse_proxy_session_secret_token') {
    return MOCK_SESSION_SECRET_TOKEN;
  }

  if (cmd === 'podverse_proxy_endpoint') {
    return MOCK_PODVERSE_PROXY_ENDPOINT;
  }

  if (cmd === 'podverse_config') {
    return structuredClone(MOCK_PODVERSE_CONFIG);
  }

  if (cmd === 'provision_proxy_pod') {
    const newPodId = Math.random().toString();
    const newPodConfig = {
      // @ts-ignore
      ...args.new_pod_config,
      id: newPodId,
    };
    MOCK_PODVERSE_CONFIG.pods.push(newPodConfig);
    return structuredClone(newPodConfig);
  }

  if (cmd === 'deprovision_proxy_pod') {
    const podIndex = MOCK_PODVERSE_CONFIG.pods.findIndex(
      (podConfig) => podConfig.id == args.pod_id,
    );
    if (podIndex < 0) {
      return false;
    }
    MOCK_PODVERSE_CONFIG.pods.splice(podIndex, 1);
    return true;
  }
});
