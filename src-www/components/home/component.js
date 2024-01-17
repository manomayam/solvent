import '../../podverse-manager/mock-ipc.js';
import { podverseConfig } from '../../podverse-manager/mod.js';
import SNBase from '../base/base.component.js';
import '../podverse/podverse-manager/mod.js';
import { solidIcon, solventIcon } from './icons.js';
import homeStyles from './styles.css?inline';
import '@spectrum-web-components/divider';
import bodyStyles from '@spectrum-web-components/styles/body.js';
import headingStyles from '@spectrum-web-components/styles/heading.js';
import { html, unsafeCSS } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

export class Home extends SNBase {
  static styles = [...headingStyles, ...bodyStyles, unsafeCSS(homeStyles)];

  render() {
    return html`
      <header>
        <div id="logo">
          <div id="logo_icon">${solventIcon}</div>
          <div id="logo_label">
            <div id="logo_label-main">Solvent</div>
            <div id="logo_label-powered">
              Powered by <a href="https://github.com/manomayam/manas">Manas</a>
            </div>
          </div>
        </div>
      </header>>

      <main>
        <section id="welcome" class="spectrum-Body spectrum-Body--sizeL">
          Welcome to <em>Solvent</em>. Solvent lets you use
          <!--span id="solid-icon">${solidIcon}</span!-->
          <i>Solid</i> apps in native context over your filesystem. You can create pod
          views over your folders, configure root uri for them to be simulated,
          and run apps over them.
        </section>

        <section id="podverse">
          <header>
            <h2>Your pod views</h2>
          </header>
          <sp-divider size="l"></sp-divider>
          <sn-podverse-manager
            .config=${podverseConfig()}
          ></sn-podverse-manager>
        </section>
      </main>
    `;
  }
}
