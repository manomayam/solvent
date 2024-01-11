import SNBase from '../../base/base.component.js';
import podsetInfoStyles from './podverse-info.styles.css?inline';
import '@spectrum-web-components/button/sp-button.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-new-item.js';
import { html, unsafeCSS } from 'lit';
import { repeat } from 'lit/directives/repeat.js';

export class PodsetInfo extends SNBase {
  static get properties() {
    return {
      config: { type: Array, reflect: false },
      podActions: {
        type: Array,
        reflect: false,
      },
    };
  }

  static styles = [unsafeCSS(podsetInfoStyles)];

  constructor() {
    super();

    /**
     * Podverse configuration.
     * @type {PodConfig[]}
     */
    this.config;

    /**
     * Pod actions list.
     * @type {import('../pod-info/pod-info.component.js').PodAction[]}
     */
    this.podActions;
  }

  render() {
    return html`
      <ul id="podset-list">
        ${repeat(
          this.config,
          (podConfig) => {
            podConfig.storage.space.root_uri +
              '::' +
              podConfig.storage.repo.backend.root_dir_path;
          },
          (podConfig) => html`
            <li>
              <sn-pod-info .config="${podConfig}" .actions=${this.podActions}>
              </sn-pod-info>
            </li>
          `,
        )}
      </ul>
    `;
  }
}
