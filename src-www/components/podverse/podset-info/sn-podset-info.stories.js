import { html } from 'lit';
import './sn-podset-info.js';
import { MOCK_PODVERSE1_CONFIG } from '../../../podverse-manager/mock-data.js';

/**
 * @type {import("../../../mod.js").CSFMeta}
 */
export default {
  component: 'sn-podset-info',
  title: 'podverse/PodSetInfo',
};

/**
 * @type {import("../../../mod.js").CSFStory}
 */
export const Default = {
  render: ({ config }) => html`
    <sn-podset-info .config=${config}></sn-podset-info>
  `,

  args: {
    /** @type {PodConfig[]} */
    config: MOCK_PODVERSE1_CONFIG.pods,
  },
};
