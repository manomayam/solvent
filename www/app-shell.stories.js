/**
 * @file Stories for app-shell> .
 */

import { html } from '@spectrum-web-components/base';
import './app-shell.js';

/**
 * @typedef {import('@spectrum-web-components/base').TemplateResult} TemplateResult
 */

export default {
  title: 'AppShell',
  component: 'app-shell',
  argTypes: {
    backgroundColor: { control: 'color' },
  },
};

/**
 * Primary template.
 *
 * @param  {object}         args                  Args
 * @param  {string}         args.header           Header text
 * @param  {string}         args.backgroundColor  background color
 *
 * @return {TemplateResult}                       Story Template.
 */
function Template({ header, backgroundColor }) {
  return html`
    <app-shell
      style="--app-shell-background-color: ${backgroundColor || 'white'}"
      .header="${header}"
    >
    </app-shell>
  `;
}

export const App = Template.bind({});
// @ts-ignore
App.args = {
  header: 'My app',
};
