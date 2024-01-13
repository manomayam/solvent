import SNBase from '../../base/base.component.js';
import '../pod-info/mod.js';
import upsertPodWizardStyles from './styles.css?inline';
import { Task } from '@lit/task';
import '@spectrum-web-components/button/sp-button.js';
import '@spectrum-web-components/dialog/sp-dialog.js';
import '@spectrum-web-components/field-label/sp-field-label.js';
import '@spectrum-web-components/help-text/sp-help-text.js';
import '@spectrum-web-components/progress-circle/sp-progress-circle.js';
import '@spectrum-web-components/textfield/sp-textfield.js';
import { html, unsafeCSS } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

/**
 * @typedef {{
 *  reason: 'cancel'
 * } | {
 *  reason: 'success',
 *  podConfig: PodConfig,
 * }} UpsertPodWizardCloseEventDetail
 */

/**
 * @typedef {CustomEvent<UpsertPodWizardCloseEventDetail>} UpsertPodWizardCloseEvent
 */

/**
 * Wizard for deleting a pod.
 *
 * @fires {UpsertPodWizardCloseEvent} close
 */
export class UpsertPodWizard extends SNBase {
  static get properties() {
    return {
      currentPodConfig: {
        type: Object,
        reflect: false,
      },
    };
  }

  static styles = [unsafeCSS(upsertPodWizardStyles)];

  /**
   * @type { Task<unknown[], PodConfig> }
   */
  #task = new Task(this, ([newPodConfig]) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.5) {
          // @ts-ignore
          resolve({
            .../** @type {PodConfig | Omit<PodConfig, 'id'>} */ (newPodConfig),
            // @ts-ignore
            id: newPodConfig.id || '12345',
          });
        } else {
          reject();
        }
      }, 3000);
    });
  });

  constructor() {
    super();

    /**
     * Config of the pod to be upserted.
     *
     * @type {PodConfig | undefined}
     */
    this.currentPodConfig;
  }

  /**
   *
   * @param {UpsertPodWizardCloseEventDetail} detail
   */
  #fireClose(detail) {
    this.dispatchEvent(
      new CustomEvent('close', {
        detail,
        bubbles: true,
        composed: true,
      }),
    );
  }

  /**
   * @param {SubmitEvent} e
   */
  #onFormSubmit(e) {
    const formData = new FormData(/** @type {HTMLFormElement} */ (e.target));

    /** @type {Omit<PodConfig, 'id'> | PodConfig} */
    let newPodConfig = {
      id: this.currentPodConfig?.id,
      label: formData.get('label')?.toString(),
      description: formData.get('description')?.toString(),
      storage: {
        repo: {
          backend: {
            root_dir_path: /** @type {String}*/ (
              formData.get('rootDirPath')?.toString()
            ),
          },
        },
        space: {
          root_uri: /** @type {String}*/ (
            formData.get('storageRoot')?.toString()
          ),
          owner_id: /** @type {String}*/ (formData.get('ownerId')?.toString()),
        },
      },
    };

    console.log({ newPodConfig });

    this.#task.run([newPodConfig]);
    e.preventDefault();
  }

  #formTemplate() {
    return html`
      <div class="wiz-page">
        <form
          id="pod-config-form"
          @submit=${(/** @type {SubmitEvent} */ e) => this.#onFormSubmit(e)}
        >
          <fieldset>
            <legend>Pod view configuration</legend>

            <sp-field-label for="f-pod-label" required>Pod name</sp-field-label>
            <sp-textfield
              name="label"
              id="f-pod-label"
              required
              minlength="3"
              value=${ifDefined(this.currentPodConfig?.label)}
            >
              <sp-help-text slot="negative-help-text"
                >Name must have at least 3 characters</sp-help-text
              >
            </sp-textfield>

            <br /><br />

            <sp-field-label for="f-pod-description"
              >Pod description</sp-field-label
            >
            <sp-textfield
              name="description"
              id="f-pod-description"
              multiline
              placeholder="My workplace pod"
              value=${ifDefined(this.currentPodConfig?.description)}
            >
            </sp-textfield>

            <br /><br />

            <sp-field-label for="f-pod-local-root" required
              >Local folder</sp-field-label
            >
            <sp-textfield
              name="rootDirPath"
              id="f-pod-local-root"
              required
              value=${ifDefined(
                this.currentPodConfig?.storage.repo.backend.root_dir_path,
              )}
            >
              <sp-help-text slot="help-text"
                >Path to local folder to back the pod view</sp-help-text
              >
            </sp-textfield>

            <br /><br />

            <sp-field-label for="f-pod-storage-root" required
              >Pod view root uri</sp-field-label
            >
            <sp-textfield
              name="storageRoot"
              id="f-pod-local-root"
              required
              type="url"
              value=${ifDefined(this.currentPodConfig?.storage.space.root_uri)}
            >
              <sp-help-text slot="help-text"
                >Pod view will be simulated with this storage root</sp-help-text
              >
              <sp-help-text slot="negative-help-text"
                >Must be a valid http(s) absolute uri, ending with a
                slash</sp-help-text
              >
            </sp-textfield>

            <br /><br />

            <sp-field-label for="f-pod-owner-webid" required
              >Pod owner webid</sp-field-label
            >
            <sp-textfield
              name="ownerId"
              id="f-pod-owner-webid"
              required
              type="url"
              value=${ifDefined(this.currentPodConfig?.storage.space.owner_id)}
            >
              <sp-help-text slot="negative-help-text"
                >Must be a valid http(s) uri</sp-help-text
              >
            </sp-textfield>
          </fieldset>
        </form>
      </div>

      <sp-button
        slot="button"
        variant="secondary"
        treatment="outline"
        @click=${() =>
          this.#fireClose({
            reason: 'cancel',
          })}
        >Cancel</sp-button
      >
      <sp-button
        slot="button"
        variant="negative"
        treatment="fill"
        type="submit"
        form="pod-config-form"
        >Upsert</sp-button
      >
    `;
  }

  #pendingTemplate() {
    return html`
      <div class="wiz-page">
        <sp-progress-circle size="l" indeterminate></sp-progress-circle>
        <div>Upsert action in progress ...</div>
      </div>
    `;
  }

  /**
   * @param {PodConfig} newPodConfig
   */
  #successTemplate(newPodConfig) {
    return html`
      <div class="wiz-page">
        Pod view upserted successfully.
        <sn-pod-info .config=${newPodConfig}></sn-pod-info>
        <sp-button
          variant="secondary"
          treatment="outline"
          @click=${() =>
            this.#fireClose({
              reason: 'success',
              podConfig: newPodConfig,
            })}
          >Close</sp-button
        >
      </div>
    `;
  }

  #errorTemplate() {
    return html`
      <div class="wiz-page">
        Error in deleting pod view.
        <sp-button
          variant="secondary"
          treatment="outline"
          @click=${() =>
            this.#fireClose({
              reason: 'cancel',
            })}
          >Close</sp-button
        >
      </div>
    `;
  }

  render() {
    return html`
      <sp-dialog>
        <h2 slot="heading">Upsert pod view</h2>
        ${this.#task.render({
          initial: () => this.#formTemplate(),
          pending: () => this.#pendingTemplate(),
          complete: (newPodConfig) => this.#successTemplate(newPodConfig),
          error: () => this.#errorTemplate(),
        })}
      </sp-dialog>
    `;
  }
}
