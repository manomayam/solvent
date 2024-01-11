import SNBase from '../../base/base.component.js';
import podInfoStyles from './pod-info.styles.css?inline';
import '@spectrum-web-components/action-menu/sp-action-menu.js';
import '@spectrum-web-components/card/sp-card.js';
import '@spectrum-web-components/link/sp-link.js';
import bodyStyles from '@spectrum-web-components/styles/body.js';
import '@spectrum-web-components/table/elements.js';
import { html, nothing, unsafeCSS } from 'lit';

/**
 * @summary Pod info component.
 * @element pod-info
 *
 * @slot action
 * @fires action-select
 *
 */
export class PodInfo extends SNBase {
  static get properties() {
    return {
      config: { type: Object, reflect: false },
    };
  }

  static styles = [bodyStyles, unsafeCSS(podInfoStyles)];

  constructor() {
    super();

    /**
     * Pod configuration.
     *
     * @type { PodConfig };
     */
    this.config;
  }

  /**
   * Event listener for action selection.
   *
   * @param   {*}  e
   */
  onActionSelect = (e) => {
    this.dispatchEvent(
      new CustomEvent('action-select', {
        composed: true,
        detail: {
          action: e.target.value,
        },
      }),
    );
    e.stopPropagation();
  };

  render() {
    return html`
      <sp-card>
        <sp-link
          href="/solidos/index.html?${this.config.storage.space.root_uri}"
          slot="heading"
          >${this.config.label ?? 'Pod view'}</sp-link
        >

        <sp-action-menu
          slot="actions"
          label="Pod view actions"
          @change="${this.onActionSelect}"
        >
          <slot name="action"></slot>
        </sp-action-menu>

        <div slot="description">
          <div
            id="description-content"
            class="spectrum-Body spectrum-Body--sizeM"
          >
            ${this.config.description ?? nothing}
          </div>

          <sp-table quiet>
            <sp-table-row>
              <sp-table-head-cell>Local folder:</sp-table-head-cell>
              <sp-table-cell
                >${this.config.storage.repo.backend
                  .root_dir_path}</sp-table-cell
              >
            </sp-table-row>

            <sp-table-row>
              <sp-table-head-cell> Pod view root: </sp-table-head-cell>
              <sp-table-cell>
                ${this.config.storage.space.root_uri}
              </sp-table-cell>
            </sp-table-row>
          </sp-table>
        </div>
      </sp-card>
    `;
  }
}
