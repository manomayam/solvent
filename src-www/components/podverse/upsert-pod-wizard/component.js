import SNBase from '../../base/base.component.js';
import '../pod-info/mod.js';
import upsertPodWizardStyles from './styles.css?inline';
import { Task } from '@lit/task';
import '@spectrum-web-components/action-button';
import '@spectrum-web-components/button-group/sp-button-group.js';
import '@spectrum-web-components/button/sp-button.js';
import '@spectrum-web-components/dialog/sp-dialog.js';
import '@spectrum-web-components/field-label/sp-field-label.js';
import '@spectrum-web-components/help-text/sp-help-text.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-folder-open.js';
import '@spectrum-web-components/progress-circle/sp-progress-circle.js';
import '@spectrum-web-components/textfield/sp-textfield.js';
import { invoke } from '@tauri-apps/api';
import { open as openDialog } from '@tauri-apps/api/dialog';
import { html, unsafeCSS } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { createRef, ref } from 'lit/directives/ref.js';

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
  #task = new Task(this, async ([newPodConfig]) => {
    const v = await invoke('provision_proxy_pod', { newPodConfig });
    return await // Artificial delay.
    new Promise((resolve) => {
      setTimeout(() => {
        resolve(v);
      }, 1500);
    });
  });

  #formRef = createRef();
  #folderInputRef = createRef();

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
   * @param {SubmitEvent} ev
   */
  #onFormSubmit(ev) {
    ev.preventDefault();

    // const formData = new FormData(/** @type {HTMLFormElement} */ (ev.target));

    const form = /** @type {HTMLFormElement} */ (ev.target);
    if (form.querySelector('[invalid]')) {
      // TODO proper validation.
      return;
    }

    const formData = new FormData();
    form.querySelectorAll('[name]').forEach((el) => {
      // @ts-ignore
      formData.append(el.getAttribute('name'), el.value);
    });

    console.log({
      ev,
      formData,
    });

    
    let storageRoot = /** @type {string} */ (formData.get('storageRoot')?.toString());
    if (!storageRoot.endsWith('/')) {
      storageRoot = storageRoot + '/';
    }

    /** @type {Omit<PodConfig, 'id'> | PodConfig} */
    let newPodConfig = {
      id: this.currentPodConfig?.id,
      label: formData.get('label')?.toString() || '',
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
          root_uri: storageRoot,
          owner_id: /** @type {String}*/ (formData.get('ownerId')?.toString()),
        },
      },
    };

    console.log({ newPodConfig });

    this.#task.run([newPodConfig]);
  }

  async #openFolder() {
    // Open a selection dialog for image files
    const selected = await openDialog({
      multiple: false,
      directory: true,
    });
    if (selected === null) {
      // user cancelled the selection
      return;
    } else {
      // user selected a single dir
      const input = /** @type {HTMLInputElement} */ (
        this.#folderInputRef.value
      );
      input.value = /** @type {string} */ (selected);
    }
  }

  #formTemplate() {
    return html`
      <div class="wiz-page wiz-page--form">
        <form
          id="pod-config-form"
          ${ref(this.#formRef)}
          @submit=${this.#onFormSubmit}
        >
          <fieldset>
            <legend>Pod view configuration</legend>

            <label>
              <span class="field-label">Pod name<sup>*</sup></span>
              <input
                name="label"
                id="f-pod-label"
                required
                value=${ifDefined(this.currentPodConfig?.label)}
              />
            </label>

            <label>
              <span class="field-label">Pod description</span>
              <textarea
                name="description"
                id="f-pod-description"
                placeholder="My workplace pod"
                value=${ifDefined(this.currentPodConfig?.description)}
              ></textarea>
            </label>

            <label>
              <span class="field-label">Local folder<sup>*</sup></span>
              <span class="field-description"
                >Path to local folder to back the pod view</span
              >
              <input
                name="rootDirPath"
                id="f-pod-local-root"
                required
                value=${ifDefined(
                  this.currentPodConfig?.storage.repo.backend.root_dir_path,
                )}
                disabled
                ${ref(this.#folderInputRef)}
              />
              <sp-action-button @click=${() => this.#openFolder()}>
                <sp-icon-folder-open slot="icon"></sp-icon-folder-open>
                Pick
              </sp-action-button>
            </label>

            <label>
              <span class="field-label">Pod view root uri<sup>*</sup></span>
              <span class="field-description">
                Pod view will be simulated with this storage root
              </span>
              <input
                name="storageRoot"
                id="f-pod-local-root"
                required
                type="url"
                value=${ifDefined(
                  this.currentPodConfig?.storage.space.root_uri,
                )}
              />
            </label>

            <label>
              <span class="field-label">Pod owner webid<sup>*</sup></span>
              <input
                name="ownerId"
                id="f-pod-owner-webid"
                required
                type="url"
                value=${ifDefined(
                  this.currentPodConfig?.storage.space.owner_id,
                )}
              />
            </label>
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
        variant="accent"
        treatment="fill"
        type="submit"
        @click=${() => {
          const form = /** @type {HTMLFormElement}*/ (this.#formRef.value);
          if (form.reportValidity()) {
            form.requestSubmit();
          }
        }}
        >${this.currentPodConfig ? 'Update' : 'Create'}</sp-button
      >
    `;
  }

  #pendingTemplate() {
    return html`
      <div class="wiz-page wiz-page--pending">
        <sp-progress-circle size="l" indeterminate></sp-progress-circle>
        <div>
          ${this.currentPodConfig ? 'Update' : 'Create'} action in progress ...
        </div>
      </div>
    `;
  }

  /**
   * @param {PodConfig} newPodConfig
   */
  #successTemplate(newPodConfig) {
    return html`
      <div class="wiz-page wiz-page--success">
        Pod view ${this.currentPodConfig ? 'updated' : 'created'} successfully.
        <sn-pod-info
          .config=${newPodConfig}
          id="subject-pod-info"
        ></sn-pod-info>
      </div>
      <sp-button
        slot="button"
        variant="secondary"
        treatment="outline"
        @click=${() =>
          this.#fireClose({
            reason: 'success',
            podConfig: newPodConfig,
          })}
        >Close</sp-button
      >
    `;
  }

  #errorTemplate() {
    return html`
      <div class="wiz-page wiz-page--error">
        Error in ${this.currentPodConfig ? 'updating' : 'creating'} pod view.
      </div>
      <sp-button
        slot="button"
        variant="secondary"
        treatment="outline"
        @click=${() =>
          this.#fireClose({
            reason: 'cancel',
          })}
        >Close</sp-button
      >
    `;
  }

  render() {
    return html`
      <sp-dialog size="l">
        <h2 slot="heading">
          ${this.currentPodConfig ? 'Update' : 'Create'} pod view
        </h2>
        ${this.#task.render({
          initial: () => this.#formTemplate(),
          pending: () => this.#pendingTemplate(),
          complete: (newPodConfig) => {
            return this.#successTemplate(newPodConfig);
          },
          error: () => this.#errorTemplate(),
        })}
      </sp-dialog>
    `;
  }
}
