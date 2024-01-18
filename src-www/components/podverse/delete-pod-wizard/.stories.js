// sort-imports-ignore

import '../../../podverse-manager/mock-ipc.js';
import { podverseConfig } from '../../../podverse-manager/mod.js';

import './mod.js';
import { html } from 'lit';

/**
 * @type {import("../../../mod.js").CSFMeta}
 */
export default {
  component: 'sn-delete-pod-wizard',
  title: 'podverse/DeletePodWizard',
};

/**
 * @type {import("../../../mod.js").CSFStory}
 */
export const Default = {
  render: ({ podConfig }) => html`
    <sn-delete-pod-wizard .podConfig=${podConfig}></sn-delete-pod-wizard>
  `,

  args: {
    podConfig: podverseConfig().pods[0],
  },
};
