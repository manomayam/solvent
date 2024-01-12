import { html } from 'lit';
import './mod.js';
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
  render: ({ config, podActions }) => html`
    <sn-podset-info .config=${config} .podActions=${podActions}></sn-podset-info>
  `,

  args: {
    /** @type {PodConfig[]} */
    config: MOCK_PODVERSE1_CONFIG.pods,
    podActions: []
  },
};
