import SNBase from '../../base/base.component.js';
import '../pod-info/mod.js';
import deletePodWizardStyles from './styles.css?inline';
import { Task } from '@lit/task';
import '@spectrum-web-components/button/sp-button.js';
import '@spectrum-web-components/dialog/sp-dialog.js';
import '@spectrum-web-components/progress-circle/sp-progress-circle.js';
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

  #task = new Task(this, () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.5) {
          // @ts-ignore
          resolve({});
        } else {
          reject();
        }
      }, 3000);
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
      <div class="wiz-page">
        This action will delete the following pod view. Note that, the actual
        contents in local folder will not be removed.
        <sn-pod-info .config=${this.podConfig}></sn-pod-info>
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
        @click=${() => this.#task.run()}
        >Delete</sp-button
      >
    `;
  };

  #pendingTemplate = () => {
    return html`
      <div class="wiz-page">
        <sp-progress-circle size="l" indeterminate></sp-progress-circle>
        <div>Delete action in progress ...</div>
      </div>
    `;
  };

  #successTemplate = () => {
    return html`
      <div class="wiz-page">
        Pod view deleted successfully.
        <sp-button
          variant="secondary"
          treatment="outline"
          @click=${() => this.#fireClose('success')}
          >Close</sp-button
        >
      </div>
    `;
  };

  #errorTemplate = () => {
    return html`
      <div class="wiz-page">
        Error in deleting pod view.
        <sp-button
          variant="secondary"
          treatment="outline"
          @click=${() => this.#fireClose('cancel')}
          >Close</sp-button
        >
      </div>
    `;
  };

  render() {
    return html`
      <sp-dialog>
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
