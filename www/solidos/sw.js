/**
 * @file Service worker to handle pod proxying.
 */

/**
 * @type {ServiceWorkerGlobalScope}
 */
// @ts-ignore
const sw = self;

sw.addEventListener('install', function (event) {
  event.waitUntil(sw.skipWaiting());
});

sw.addEventListener('activate', (event) => {
  event.waitUntil(sw.clients.claim());
});

/**
 * Podverse proxy endpoint.
 *
 * @type {string}
 */
let podverseProxyEndpoint;
/**
 * Podverse proxy endpoint.
 *
 * @type {string}
 */
let podverseProxySessionSecretToken;
/**
 * Podverse proxy endpoint.
 *
 * @type {import("../podverse_manager/config.js").PodverseConfig}
 */
let podverseConfig;

const logChannel = new BroadcastChannel('sw_log');

/**
 * Console log.
 *
 * @param   {*}  [arg1]
 * @param   {*}  [arg2]
 */
function clLog(arg1, arg2) {
  // console.log('SW0_LOG', arg1, arg2);
  logChannel.postMessage(JSON.parse(JSON.stringify({ arg1, arg2 })));
}

clLog('in service worker');

sw.addEventListener('message', (event) => {
  clLog('message received in sw.', event);
  if (event.data.type === 'PODVERSE_INFO') {
    clLog('podverse info message received.', event);

    ({
      podverseProxyEndpoint,
      podverseProxySessionSecretToken,
      podverseConfig,
    } = event.data.payload);

    event.ports[0].postMessage({});
  } else if (event.data.type === 'PODVERSE_CONFIG_CHANGE') {
    clLog('podverse config change message received.', event);
    podverseConfig = event.data.payload;
    event.ports[0].postMessage({});
  }
});

/**
 * Check if uri is yo be proxied
 *
 * @param   {string}  uri
 *
 * @return  {boolean}
 */
function isProxiedUri(uri) {
  clLog('in isProxiedUri');
  let isProxied = podverseConfig.pods.some((pod) =>
    uri.startsWith(pod.storage.space.root_uri)
  );
  clLog({ uri, isProxied });
  return isProxied;
}

/**
 * Modify request with proxied routing.
 *
 * @param   {Request}  request
 *
 * @return  {Promise<Request>}
 */
async function modifyRequest(request) {
  //   const headers = {};
  //   for (let entry of request.headers) {
  //     headers[entry[0]] = headers[entry[1]];
  //   }
  //   headers["x-local-session-token"] = podverseProxySessionSecretToken;
  //   headers["x-original-resource"] = request.url;

  let pUri = new URL(podverseProxyEndpoint);
  pUri.searchParams.append('res', request.url);
  pUri.searchParams.append('token', podverseProxySessionSecretToken);

  // eslint-disable-next-line no-undef
  return new Request(pUri, {
    method: request.method,
    body: ['PUT', 'POST', 'PATCH', 'DELETE'].includes(request.method)
      ? await request.blob()
      : undefined,
    headers: request.headers,
    cache: request.cache,
    mode: request.mode,
    credentials: request.credentials,
    redirect: request.redirect,
  });
}

/**
 * Fetch with proxy..
 *
 * @param   {Request}  request
 *
 * @return  {Promise<Response>}
 */
async function modFetch(request) {
  request =
    typeof podverseConfig == 'undefined' ||
    typeof podverseProxyEndpoint == 'undefined' ||
    typeof podverseProxySessionSecretToken == 'undefined' ||
    !isProxiedUri(request.url)
      ? request
      : await modifyRequest(request);

  return fetch(request);
}

sw.addEventListener('fetch', (event) => {
  clLog('Received fetch event.', event.request.url);
  clLog({
    podverseConfig,
    podverseProxyEndpoint,
    podverseProxySessionSecretToken,
  });

  event.respondWith(modFetch(event.request));
});
