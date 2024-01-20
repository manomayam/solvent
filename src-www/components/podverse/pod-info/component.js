import solidIcon from '../../../assets/solid.png';
import SNBase from '../../base/base.component.js';
import podInfoStyles from './styles.css?inline';
import '@spectrum-web-components/action-button';
import '@spectrum-web-components/action-group';
import '@spectrum-web-components/action-menu/sync/sp-action-menu.js';
import '@spectrum-web-components/card/sp-card.js';
import '@spectrum-web-components/icon/sp-icon.js';
import '@spectrum-web-components/link/sp-link.js';
import bodyStyles from '@spectrum-web-components/styles/body.js';
import headingStyles from '@spectrum-web-components/styles/heading.js';
import '@spectrum-web-components/table/elements.js';
import { WebviewWindow } from '@tauri-apps/api/window';
import { html, nothing, unsafeCSS } from 'lit';

/**
 * @typedef {Object} PodAction - Pod action.
 * @property {string} action
 * @property {string} label
 */

/**
 * @typedef {CustomEvent<{podId: string, action: string}>} ActionSelectEvent
 */

/**
 * @summary Pod info component.
 * @element pod-info
 *
 * @fires {ActionSelectEvent} action-select
 *
 */
export class PodInfo extends SNBase {
  /**
   *
   * @return  {import('lit').PropertyDeclarations}
   */
  static get properties() {
    return {
      config: { type: Object, reflect: false },
      actions: {
        type: Array,
        reflect: false,
      },
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

    /**
     *
     * @type {PodAction[]?}
     *
     */
    this.actions = [];
  }

  /**
   * Event listener for action selection.
   *
   * @param   {*}  e
   */
  #onActionSelect = (e) => {
    this.dispatchEvent(
      new CustomEvent('action-select', {
        composed: true,
        bubbles: true,
        detail: {
          podId: this.config.id,
          action: e.target.value,
        },
      }),
    );
    e.stopPropagation();
  };

  /**
   * @param {string} appName
   * @param {string} appUri
   */
  #openAppInNewWindow(appName, appUri) {
    const webview = new WebviewWindow(
      `${appName}-${Math.round(Math.random() * 100000)}`,
      {
        url: appUri,
      },
    );
    webview.once('tauri://error', function (e) {
      // an error occurred during webview window creation
      console.log('Error in opening window', e);
    });
  }

  render() {
    let actionMenu =
      this.actions && this.actions.length > 0
        ? html`
            <sp-action-menu
              slot="actions"
              label="Pod view actions"
              @change="${this.#onActionSelect}"
            >
              ${this.actions.map(
                (action) => html`
                  <sp-menu-item value=${action.action}
                    >${action.label}</sp-menu-item
                  >
                `,
              )}
            </sp-action-menu>
          `
        : nothing;

    let propTable = html`
      <sp-table quiet>
        <sp-table-row>
          <sp-table-head-cell>Local folder:</sp-table-head-cell>
          <sp-table-cell
            >${this.config.storage.repo.backend.root_dir_path}</sp-table-cell
          >
        </sp-table-row>

        <sp-table-row>
          <sp-table-head-cell> Pod view root: </sp-table-head-cell>
          <sp-table-cell> ${this.config.storage.space.root_uri} </sp-table-cell>
        </sp-table-row>
      </sp-table>
    `;

    return html`
      <sp-card>
        <sp-link
          href="/solidos/index.html?root_uri=${encodeURIComponent(
            this.config.storage.space.root_uri,
          )}"
          slot="heading"
          >${this.config.label ?? 'Pod view'}</sp-link
        >

        ${actionMenu}

        <div slot="description">
          <div
            id="description-content"
            class="spectrum-Body spectrum-Body--sizeM"
          >
            ${this.config.description ?? nothing}
          </div>
          ${propTable}
        </div>

        <div slot="footer">
          <div id="open-with">Open with:</div>
          <sp-action-group emphasized>
            <sp-action-button
              size="m"
              emphasized
              @click=${() =>
                this.#openAppInNewWindow(
                  'SolidOS',
                  `/solidos/index.html?root_uri=${encodeURIComponent(
                    this.config.storage.space.root_uri,
                  )}`,
                )}
            >
              <sp-icon slot="icon" src=${solidIcon}> </sp-icon>
              Solid OS
            </sp-action-button>
          </sp-action-group>
        </div>
      </sp-card>
    `;
  }
}
