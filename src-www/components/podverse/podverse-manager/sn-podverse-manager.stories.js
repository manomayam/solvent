import { html } from 'lit';
import './sn-podverse-manager.js';

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
    config: {
      pods: [
        {
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
      ],
    },
  },
};
