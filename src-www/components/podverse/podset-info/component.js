import SNBase from '../../base/base.component.js';
import podsetInfoStyles from './styles.css?inline';
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
     * @type {import('../pod-info/component.js').PodAction[]}
     */
    this.podActions;
  }

  /**
   * Delegated listener for 'action-select' event on pod infos.
   *
   * @param   {import('../pod-info/component.js').ActionSelectEvent}  e
   */
  #onPodActionSelect = (e) => {
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent('pod-action-select', {
        bubbles: true,
        composed: true,
        detail: e.detail,
      }),
    );
  };

  createRenderRoot() {
    let shadowRoot = super.createRenderRoot();
    shadowRoot.addEventListener(
      'action-select',
      /** @type {EventListener}*/ (this.#onPodActionSelect),
    );
    return shadowRoot;
  }

  render() {
    return html`
      <ul id="podset-list">
        ${repeat(
          this.config,
          (podConfig) => podConfig.id,
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
