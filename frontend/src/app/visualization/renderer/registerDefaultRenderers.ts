import { rendererRegistry } from '../registry/RendererRegistry';
import LegacyChartRenderer from './LegacyChartRenderer';

export const registerDefaultRenderers = () => {
  if (!rendererRegistry.has('legacy')) {
    rendererRegistry.register('legacy', LegacyChartRenderer);
  }
};
