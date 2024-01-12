import { html } from 'lit';
import './mod.js';
import { MOCK_PODVERSE1_CONFIG } from '../../../podverse-manager/mock-data.js';

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
    config: MOCK_PODVERSE1_CONFIG,
  },
};
