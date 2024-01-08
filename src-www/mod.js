import {
  podverseConfig,
  PODVERSE_PROXY_ENDPOINT,
  PODVERSE_PROXY_SESSION_SECRET_TOKEN,
  provisionProxyPod,
} from './podverse-manager/mod.js';

async function logPodverseProxyInfo() {
  console.log({
    podverseConfig,
    PODVERSE_PROXY_ENDPOINT,
    PODVERSE_PROXY_SECRET_SESSION_TOKEN: PODVERSE_PROXY_SESSION_SECRET_TOKEN,
  });
}

await logPodverseProxyInfo();

// @ts-ignore
window.provision = provisionProxyPod;
