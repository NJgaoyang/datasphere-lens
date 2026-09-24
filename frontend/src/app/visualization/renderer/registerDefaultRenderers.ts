import { rendererRegistry } from '../registry/RendererRegistry';
import EChartsRenderer from '../renderers/echarts/EChartsRenderer';
import TableRenderer from '../renderers/table/TableRenderer';
import S2Renderer from '../renderers/s2/S2Renderer';
import ReactVisualRenderer from '../renderers/react/ReactVisualRenderer';
import MapRenderer from '../renderers/map/MapRenderer';
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
  if (!rendererRegistry.has('s2')) {
    rendererRegistry.register('s2', S2Renderer);
  }
  if (!rendererRegistry.has('react')) {
    rendererRegistry.register('react', ReactVisualRenderer);
  }
  if (!rendererRegistry.has('map')) {
    rendererRegistry.register('map', MapRenderer);
  }
};
