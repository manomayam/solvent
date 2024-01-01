/**
 * @overview Defines `sn-pod` component.
 */

import { SpectrumElement, css, html } from '@spectrum-web-components/base';
import '@spectrum-web-components/divider/sp-divider.js';
import '@spectrum-web-components/table/elements.js';
import { nothing } from '@spectrum-web-components/base/src/html.js';
import headingStyles from "@spectrum-web-components/styles/heading.js";
import bodyStyles from '@spectrum-web-components/styles/body.js';

/**
 * @element sn-pod
 * 
 * @slot actions Any actions.
 */
export class Pod extends SpectrumElement {
  static is = 'sn-pod';

  /** @type {import("@spectrum-web-components/base").PropertyDeclarations} */
  static properties = {
    config: {
      type: Object,
      reflect: false,
    },
  };

  static styles = [
    headingStyles,
    bodyStyles,
    css`
      sp-table-head-cell {
        text-align: end;
      }

      header {
        display: flex;
      }

      #actions {
        margin-inline-start: auto;
      }
    `
  ];

  constructor() {
    super();

    /** @type {PodConfig} - Configuration */
    this.config;
  }

  render() {
    return html`
      <header>
        <h3 class="spectrum-Heading spectrum-Heading--sizeM">
          ${this.config.label ?? 'Pod'}
        </h3>
        <div id="actions">
          <slot name="actions"></slot>
        </div>
      </header>

      <div id="description" class="spectrum-Body spectrum-Body--sizeM">
        ${this.config.description || nothing}
      </div>

      <sp-divider></sp-divider>

      <sp-table>
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
  }
}

customElements.define('sn-pod', Pod);
