import { PODVERSE_PROXY_ENDPOINT, PODVERSE_PROXY_SESSION_SECRET_TOKEN, podverseConfig, provisionProxyPod } from './podverse-manager/mod.js';


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


/**
 * @typedef {import('@storybook/web-components').Meta} CSFMeta
 */

/**
 * @typedef {import('@storybook/web-components').StoryObj} CSFStory
 */
