import './pod.component.js';
import '@spectrum-web-components/theme/sp-theme.js';
import '@spectrum-web-components/theme/src/themes.js';
import { html } from 'lit';

export default {
  title: 'Podverse/Pod',
  component: 'sn-pod',
};

/**
 * @param {{
 *  config: PodConfig
 * }} args
 */
const Template = ({ config }) => {
  return html` <sn-pod .config=${config}></sn-pod> `;
};

export const Simple = Template.bind({});
// @ts-ignore
Simple.args = {
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
};
