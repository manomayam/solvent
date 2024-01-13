import { MOCK_POD1_CONFIG } from '../../../podverse-manager/mock-data.js';
import './mod.js';
import { html } from 'lit';

/**
 * @type {import("../../../mod.js").CSFMeta}
 */
export default {
  component: 'sn-upsert-pod-wizard',
  title: 'podverse/UpsertPodWizard',
};

/**
 * @type {import("../../../mod.js").CSFStory}
 */
export const UpdateWizard = {
  render: ({ currentPodConfig }) => html`
    <sn-upsert-pod-wizard
      .currentPodConfig=${currentPodConfig}
    ></sn-upsert-pod-wizard>
  `,

  args: {
    currentPodConfig: MOCK_POD1_CONFIG,
  },
};

/**
 * @type {import("../../../mod.js").CSFStory}
 */
export const CreateWizard = {
  render: ({}) => html` <sn-upsert-pod-wizard></sn-upsert-pod-wizard> `,

  args: {},
};
