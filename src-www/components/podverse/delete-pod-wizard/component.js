import SNBase from '../../base/base.component.js';
import { Task } from '@lit/task';
import '@spectrum-web-components/button/sp-button.js';
import '@spectrum-web-components/dialog/sp-dialog.js';
import '@spectrum-web-components/progress-circle/sp-progress-circle.js';
import '../pod-info/mod.js';
import { html } from 'lit';

export class DeletePodWizard extends SNBase {
  static get properties() {
    return {
      podConfig: { type: Object, reflect: false },
    };
  }

  #task;

  constructor() {
    super();

    /**
     * Config of the pod to be deleted.
     *
     * @type {PodConfig}
     */
    this.podConfig;

    /** @type {Task} */
  this.#task = new Task(this, () => {
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

  }

  #confirmTemplate() {
    return html`
      This action will delete the following pod view. Note that, the actual
      contents in local folder will not be removed.
      <sn-pod-info .config=${this.podConfig}></sn-pod-info>
      <sp-button slot="button" variant="secondary" treatment="outline"
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
  }

  #pendingTemplate() {
    return html`
      <sp-progress-circle size="l" indeterminate></sp-progress-circle>
      <div>Delete action in progress ...</div>
    `;
  }

  #successTemplate() {
    return html`
      Pod view deleted successfully.
      <sp-button variant="secondary" treatment="outline">Close</sp-button>
    `;
  }

  #errorTemplate() {
    return html`
      Error in deleting pod view.
      <sp-button variant="secondary" treatment="outline">Close</sp-button>
    `;
  }

  render() {
    return html`
      <sp-dialog>
        <h2 slot="heading">Delete pod view</h2>
        ${this.#task.render({
          initial: () => this.#confirmTemplate(),
          pending: () => this.#pendingTemplate(),
          complete: () => this.#successTemplate(),
          error: () => this.#errorTemplate(),
        })}
      </sp-dialog>
    `;
  }
}
