import SNBase from '../../base/base.component.js';
import podverseInfoStyles from './podverse-info.styles.css?inline';
import '@spectrum-web-components/button/sp-button.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-new-item.js';
import { html, unsafeCSS } from 'lit';
import { repeat } from 'lit/directives/repeat.js';

export class PodverseManager extends SNBase {
  static get properties() {
    return {
      config: { type: Object, reflect: false },
    };
  }

  static styles = [unsafeCSS(podverseInfoStyles)];

  constructor() {
    super();

    /**
     * Podverse configuration.
     * @type {PodverseConfig}
     */
    this.config;
  }

  render() {
    return html`
      <div>
        <div id="podset-actions">
          <sp-button id="create-pod-cta">
            <sp-icon-new-item slot="icon"></sp-icon-new-item>
            Create new
          </sp-button>
        </div>
        
        <sn-podset-info .config=${this.config.pods}></sn-podset-info>
      </div>
    `;
  }
}
