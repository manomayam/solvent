import SNBase from '../../base/base.component.js';
import '../pod-info/mod.js';
import deletePodWizardStyles from './styles.css?inline';
import { Task } from '@lit/task';
import '@spectrum-web-components/button/sp-button.js';
import '@spectrum-web-components/dialog/sp-dialog.js';
import '@spectrum-web-components/progress-circle/sp-progress-circle.js';
import { invoke } from '@tauri-apps/api';
import { html, unsafeCSS } from 'lit';

/**
 * @typedef {CustomEvent<{
 *  reason: 'cancel' | 'success'
 * }>} DeletePodWizardCloseEvent
 */

/**
 * Wizard for deleting a pod.
 *
 * @fires {DeletePodWizardCloseEvent} close
 */
export class DeletePodWizard extends SNBase {
  static get properties() {
    return {
      podConfig: { type: Object, reflect: false },
    };
  }

  static styles = [unsafeCSS(deletePodWizardStyles)];

  #task = new Task(this, async ([podId]) => {
    const v = await invoke('deprovision_proxy_pod', { podId });
    return await // Artificial delay.
    new Promise((resolve) => {
      setTimeout(() => {
        resolve(v);
      }, 1500);
    });
  });

  constructor() {
    super();

    /**
     * Config of the pod to be deleted.
     *
     * @type {PodConfig}
     */
    this.podConfig;
  }

  /**
   *
   * @param {'cancel' | 'success'} reason
   */
  #fireClose(reason) {
    this.dispatchEvent(
      new CustomEvent('close', {
        detail: {
          reason,
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  #confirmTemplate = () => {
    return html`
      <div class="wiz-page  wiz-page--confirm">
        This action will delete the following pod view. Note that, the actual
        contents in local folder will not be removed.
        <sn-pod-info
          id="subject-pod-info"
          .config=${this.podConfig}
        ></sn-pod-info>
      </div>
      <sp-button
        slot="button"
        variant="secondary"
        treatment="outline"
        @click=${() => this.#fireClose('cancel')}
        >Cancel</sp-button
      >
      <sp-button
        slot="button"
        variant="negative"
        treatment="fill"
        @click=${() => this.#task.run([this.podConfig.id])}
        >Delete</sp-button
      >
    `;
  };

  #pendingTemplate = () => {
    return html`
      <div class="wiz-page wiz-page--pending">
        <sp-progress-circle size="l" indeterminate></sp-progress-circle>
        <div>Delete action in progress ...</div>
      </div>
    `;
  };

  #successTemplate = () => {
    return html`
      <div class="wiz-page wiz-page--success">
        Pod view deleted successfully.
      </div>
      <sp-button
        slot="button"
        variant="secondary"
        treatment="outline"
        @click=${() => this.#fireClose('success')}
        >Close</sp-button
      >
    `;
  };

  #errorTemplate = () => {
    return html`
      <div class="wiz-page  wiz-page--error">Error in deleting pod view.</div>
      <sp-button
        slot="button"
        variant="secondary"
        treatment="outline"
        @click=${() => this.#fireClose('cancel')}
        >Close</sp-button
      >
    `;
  };

  render() {
    return html`
      <sp-dialog size="l">
        <h2 slot="heading">Delete pod view</h2>
        ${this.#task.render({
          initial: this.#confirmTemplate,
          pending: this.#pendingTemplate,
          complete: this.#successTemplate,
          error: this.#errorTemplate,
        })}
      </sp-dialog>
    `;
  }
}
