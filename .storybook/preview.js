import cem from '../custom-elements.json';
import { swcThemeDecorator } from '@spectrum-web-components/story-decorator/decorator.js';
import { setCustomElementsManifest } from '@storybook/web-components';

setCustomElementsManifest(cem);

export const parameters = {
  docs: { hidden: true },
  controls: { expanded: true },
  layout: 'fullscreen',
};

export const decorators = [swcThemeDecorator];
