// sort-imports-ignore

import '../../../podverse-manager/mock-ipc.js';
import { podverseConfig } from '../../../podverse-manager/mod.js';

import { html } from 'lit';
import './mod.js';

/**
 * @type {import("../../../mod.js").CSFMeta}
 */
export default {
  component: 'sn-podverse-manager',
  title: 'podverse/PodverseManager',
};

/**
 * @type {import("../../../mod.js").CSFStory}
 */
export const Default = {
  render: ({ config }) => html`
    <sn-podverse-manager .config=${config}></sn-podverse-manager>
  `,

  args: {
    /** @type {PodverseConfig} */
    config: podverseConfig(),
  },
};
