import './sn-pod-info.js';
import { html } from 'lit';
import {MOCK_POD1_CONFIG} from '../../../podverse-manager/mock-data';

/** @type {import("../../../mod.js").CSFMeta} */
export default {
  component: 'sn-pod-info',
  title: 'podverse/PodInfo',
};

/**
 * @type {import("../../../mod.js").CSFStory}
 */
export const Default = {
  render: ({ config }) => html`<sn-pod-info .config=${config}>
</sn-pod-info>`,
  args: {
    /** @type {PodConfig} */
    config: MOCK_POD1_CONFIG,
    /** @type {import('./pod-info.component.js').PodAction[]} */
    actions: [{
      action: 'delete',
      label: 'Delete',
    }]
  },
};
