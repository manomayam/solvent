// sort-imports-ignore

import '../../podverse-manager/mock-ipc.js';

import './mod.js';
import { html } from 'lit';

/** @type {import("../../mod.js").CSFMeta} */
export default {
  component: 'sn-home',
  title: 'home',
};

/**
 * @type {import("../../mod.js").CSFStory}
 */
export const Default = {
  render: ({}) => html`<sn-home> </sn-home>`,
};
