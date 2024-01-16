import SNBase from '../../base/base.component.js';
import wizardFrameStyles from './styles.css?inline';
import { html, unsafeCSS } from 'lit';

/**
 * Wizard modal.
 *
 * @slot heading
 * @slot button
 */
export class WizardFrame extends SNBase {
  static styles = [unsafeCSS(wizardFrameStyles)];

  render() {
    return html`
      <div id="frame">
        <header>
          <slot name="heading"></slot>
        </header>
        <main>
          <slot></slot>
        </main>
        <footer>
          <slot name="button"></slot>
        </footer>
      </div>
    `;
  }
}
