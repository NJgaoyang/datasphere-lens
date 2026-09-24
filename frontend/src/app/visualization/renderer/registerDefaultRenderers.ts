import { rendererRegistry } from '../registry/RendererRegistry';
import EChartsRenderer from '../renderers/echarts/EChartsRenderer';
import TableRenderer from '../renderers/table/TableRenderer';
import LegacyChartRenderer from './LegacyChartRenderer';

export const registerDefaultRenderers = () => {
  if (!rendererRegistry.has('legacy')) {
    rendererRegistry.register('legacy', LegacyChartRenderer);
  }
  if (!rendererRegistry.has('echarts')) {
    rendererRegistry.register('echarts', EChartsRenderer);
  }
  if (!rendererRegistry.has('table')) {
    rendererRegistry.register('table', TableRenderer);
  }
};
