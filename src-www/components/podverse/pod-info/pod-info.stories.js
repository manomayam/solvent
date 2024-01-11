import './sn-pod-info.js';
import { html } from 'lit';

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
  <sp-menu-item value="delete" slot="action">Delete</sp-menu-item>
</sn-pod-info>`,
  args: {
    /** @type {PodConfig} */
    config: {
      label: 'Test pod',
      description: 'Pod for testing',
      storage: {
        space: {
          root_uri: 'http://localhost:3000/',
          owner_id: 'http://localhost:3000/card#me',
        },
        repo: {
          backend: {
            root_dir_path: '/',
          },
        },
      },
    },
  },
};
