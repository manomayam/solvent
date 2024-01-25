/**
 * @file Sets up solidos data-browser in current html page.
 */
// @ts-nocheck
import { podverseConfig } from '../podverse-manager/mod.js';
import './setup_sw.js';
import { WebviewWindow } from '@tauri-apps/api/window';

console.log('In solidos/mod.js');

document.addEventListener('click', (ev) => {
  const elem = /** @type {Element} */ (ev.target);
  console.log('Doc click event.', ev);
  if (elem.tagName === 'A' && elem.getAttribute('target') === '_blank') {
    console.log('Anchor click event.', ev);
    ev.preventDefault();
    const webview = new WebviewWindow(
      `solidos-${Math.round(Math.random() * 100000)}`,
      {
        url: elem.getAttribute('href'),
      },
    );
    webview.once('tauri://error', function (e) {
      // an error occurred during webview window creation
      console.log('Error in opening window', e);
    });
  }
});

/**
 * Get the config of pod with given storage root uri.
 *
 * @param {string} rootUri
 * @returns {PodConfig | undefined}
 */
function getPodConfig(rootUri) {
  console.log({ podverseConfig: podverseConfig() });
  return podverseConfig().pods.find((pod) => {
    console.log({ rootUri, u: pod.storage.space.root_uri });
    return pod.storage.space.root_uri == rootUri;
  });
}

// Resolve pod config from supplied root uri.
// Note, we use hash, as tauri has issue with qparams in prod build.
const params = new URLSearchParams(location.hash.substring(1));
const rootUri = params.get('root_uri');
console.log({ rootUri });
if (!rootUri) {
  console.log('NPODR');
  throw Error('Root uri is not provided.');
}
const podConfig = getPodConfig(rootUri);
if (!podConfig) {
  console.log('NPODR2');
  throw Error('No pod resolved for given root uri.');
}
console.log({
  params,
  rootUri,
  podConfig,
});

// @ts-ignore
window.SolidAppContext = {
  noAuth: rootUri,
  webId: podConfig.storage.space.owner_id,
  app: rootUri,
  webid: podConfig.storage.space.owner_id,
};
window.document.title = `(${podConfig.label}) - SolidOs`;

window.$SolidTestEnvironment = {
  iconBase: '/solidos/solid-ui/icons/',
  originalIconBase: '/solidos/solid-ui/originalIcons/',
  username: podConfig.storage.space.owner_id,
};

// Setup mashlib.
const $rdf = UI.rdf;
const dom = document;
$rdf.Fetcher.crossSiteProxyTemplate = self.origin + '/xss?uri={uri}';
const outliner = panes.getOutliner(dom); //function from solid-panes
const podLabelElem = dom.getElementById('pod-label');
// const podDescrElem = dom.getElementById('pod-description');

function go() {
  const subject = $rdf.sym(rootUri);
  outliner.GotoSubject(subject, true, undefined, true, undefined);
  podLabelElem.innerHTML = podConfig.label;
  // podDescrElem.innerHTML = podConfig.description;
  // dom.getElementById('pod-description')?.innerHTML = podConfig.description;
  // mungeLoginArea();
}

go();
