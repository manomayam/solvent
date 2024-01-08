/**
 * @file Sets up solidos data-browser in current html page.
 */
// @ts-nocheck

import './setup_sw.js';
import { podverseConfig } from '../podverse-manager/mod.js';
import { PodConfig } from '../podverse-manager/config.js';

console.log('In solidos/index.ts');

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
const params = new URLSearchParams(location.search);
const rootUri = params.get('root_uri');
if (!rootUri) {
  throw Error('Root uri is not provided.');
}
const podConfig = getPodConfig(rootUri);
if (!podConfig) {
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

// Setup mashlib.
const $rdf = UI.rdf;
const dom = document;
$rdf.Fetcher.crossSiteProxyTemplate = self.origin + '/xss?uri={uri}';
const outliner = panes.getOutliner(dom); //function from solid-panes
const podLabelElem = dom.getElementById('pod-label');
const podDescrElem = dom.getElementById('pod-description');

function go() {
  const subject = $rdf.sym(rootUri);
  outliner.GotoSubject(subject, true, undefined, true, undefined);
  podLabelElem.innerHTML = podConfig.label;
  podDescrElem.innerHTML = podConfig.description;
  // dom.getElementById('pod-description')?.innerHTML = podConfig.description;
  // mungeLoginArea();
}

go();
