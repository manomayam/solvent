import SNBase from '../../base/base.component.js';
import '../delete-pod-wizard/mod.js';
import '../podset-info/mod.js';
import '../upsert-pod-wizard/mod.js';
import podverseInfoStyles from './styles.css?inline';
import '@spectrum-web-components/button/sp-button.js';
import '@spectrum-web-components/dialog/sp-dialog-base.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-new-item.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-brackets-square.js';
import '@spectrum-web-components/illustrated-message/sp-illustrated-message.js';
import '@spectrum-web-components/overlay/sp-overlay.js';
import { produce } from 'immer';
import { html, unsafeCSS } from 'lit';
import { choose } from 'lit/directives/choose.js';
import { when } from 'lit/directives/when.js';


export class PodverseManager extends SNBase {
  /**
   * @return  {import('lit').PropertyDeclarations}
   */
  static get properties() {
    return {
      config: { type: Object, reflect: false },
      _modeInfo: { type: String, state: true },
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

    /**
     * @type {{mode: 'normal'} | {mode: 'wiz-pod-delete', subjectPodId: string} | {mode: 'wiz-pod-create'} }
     */
    this._modeInfo = {
      mode: 'normal',
    };
  }

  /**
   * @param   {import('lit').PropertyValues<this>}  changedProperties  [changedProperties description]
   *
   */
  willUpdate(changedProperties) {
    if (changedProperties.has('config')) {
      this.config = produce(this.config, (draft) => {
        draft.pods.sort((p1, p2) =>
          p1.label === p2.label ? 0 : p1.label > p2.label ? 1 : -1,
        );
      });
    }
    super.willUpdate(changedProperties);
  }

  /**
   * @param   {import('../pod-info/component.js').ActionSelectEvent}  ev
   */
  #onPodActionSelect(ev) {
    console.log('pod-action-select', ev);
    if (ev.detail.action === 'delete') {
      this._modeInfo = {
        mode: 'wiz-pod-delete',
        subjectPodId: ev.detail.podId,
      };
    }
  }

  #onCreatePodCTAClick() {
    console.log('pod-create-cta-click');
    this._modeInfo = {
      mode: 'wiz-pod-create',
    };
  }

  /**
   *
   * @param {import('../delete-pod-wizard/component.js').DeletePodWizardCloseEvent} ev
   */
  #onDeletePodWizClose(ev) {
    const subjectPodIndex = this.config.pods.findIndex(
      // @ts-ignore
      (pod) => pod.id === this._modeInfo.subjectPodId,
    );

    if (subjectPodIndex >= 0 && ev.detail.reason === 'success') {
      // Update config.
      this.config = produce(this.config, (draft) => {
        draft.pods.splice(subjectPodIndex, 1);
      });
    }

    // Reset mode.
    this._modeInfo = {
      mode: 'normal',
    };
  }

  /**
   *
   * @param {import('../upsert-pod-wizard/component.js').UpsertPodWizardCloseEvent} ev
   */
  #onCreatePodWizClose(ev) {
    const detail = ev.detail;
    if (detail.reason === 'success') {
      // Update config.
      this.config = produce(this.config, (draft) => {
        draft.pods.push(detail.podConfig);
      });
    }

    // Reset mode.
    this._modeInfo = {
      mode: 'normal',
    };
  }

  render() {
    return html`
      <div>
        <div id="podset-actions">
          <sp-button id="create-pod-cta" @click=${this.#onCreatePodCTAClick}>
            <sp-icon-new-item slot="icon"></sp-icon-new-item>
            Create new
          </sp-button>
        </div>

        ${this.config.pods.length > 0
          ? html`
              <sn-podset-info
                .config=${this.config.pods}
                .podActions=${[
                  {
                    action: 'delete',
                    label: 'Delete',
                  },
                ]}
                @pod-action-select=${this.#onPodActionSelect}
              ></sn-podset-info>
            `
          : html`
              <sp-illustrated-message
                heading="No pod views exists yet."
              >
            <sp-icon-brackets-square></sp-icon-brackets-square>
            </sp-illustrated-message>
            `}
      </div>

      <sp-overlay ?open=${this._modeInfo.mode !== 'normal'} type="modal">
        <sp-dialog-base underlay open>
          ${choose(this._modeInfo.mode, [
            [
              'wiz-pod-delete',
              () => html`
                <sn-delete-pod-wizard
                  .podConfig=${this.config.pods.find(
                    // @ts-ignore
                    (pod) => pod.id == this._modeInfo.subjectPodId,
                  )}
                  @close=${this.#onDeletePodWizClose}
                ></sn-delete-pod-wizard>
              `,
            ],
            [
              'wiz-pod-create',
              () => html`
                <sn-upsert-pod-wizard
                  @close=${this.#onCreatePodWizClose}
                ></sn-upsert-pod-wizard>
              `,
            ],
          ])}
        </sp-dialog-base>
      </sp-overlay>
    `;
  }
}
