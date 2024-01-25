import solidIcon from '../../../assets/solid.png';
import SNBase from '../../base/base.component.js';
import podInfoStyles from './styles.css?inline';
import '@spectrum-web-components/action-button';
import '@spectrum-web-components/action-group';
import '@spectrum-web-components/action-menu/sync/sp-action-menu.js';
import '@spectrum-web-components/card/sp-card.js';
import '@spectrum-web-components/divider';
import '@spectrum-web-components/icon/sp-icon.js';
import '@spectrum-web-components/link/sp-link.js';
import bodyStyles from '@spectrum-web-components/styles/body.js';
import headingStyles from '@spectrum-web-components/styles/heading.js';
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

  static styles = [...bodyStyles, ...headingStyles, unsafeCSS(podInfoStyles)];

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
   * @param {string | undefined} appTitle
   */
  #openAppInNewWindow(appName, appUri, appTitle) {
    const webview = new WebviewWindow(
      `${appName}-${Math.round(Math.random() * 100000)}`,
      {
        // NOTE: tauri interprets relative urls differently in prod build.
        // Thus must convert to absolute.
        url: new URL(appUri, window.location.href).toString(),
        title: `${appTitle || appName}::${this.config.label}::Solvent`,
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

    const propTable = html`
      <dl>
        <dt>Local folder:</dt>
        <dd>${this.config.storage.repo.backend.root_dir_path}</dd>
        <dt>Pod view root:</dt>
        <dd>${this.config.storage.space.root_uri}</dd>
      </dl>
    `;

    return html`
      <sp-card>
        <h3 slot="heading" class="spectrum-Heading spectrum-Heading--sizeM">
          ${this.config.label ?? 'Pod view'}
          <sp-divider size="s"></sp-divider>
        </h3>

        ${actionMenu}

        <div slot="description">
          <div
            id="description-content"
            class="spectrum-Body spectrum-Body--sizeL"
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
                  'Solid OS',
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
