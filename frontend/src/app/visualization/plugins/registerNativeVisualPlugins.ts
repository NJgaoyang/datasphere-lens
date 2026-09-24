import { buildBarOption } from '../builder/echarts/bar';
import { buildLineOption } from '../builder/echarts/line';
import { buildPieOption } from '../builder/echarts/pie';
import { chartRegistry, VisualOptionBuilder } from '../registry/ChartRegistry';

const upgradeVisual = (
  type: string,
  renderer: string,
  buildOption?: VisualOptionBuilder,
) => {
  const existing = chartRegistry.get(type);
  if (!existing) return;
  chartRegistry.register(
    {
      ...existing,
      renderer,
      buildOption,
    },
    { replace: true },
  );
};


const buildFromLegacy = (type: string): VisualOptionBuilder =>
  (_spec, dataset, config) => {
    const plugin = chartRegistry.get(type);
    const legacy = plugin?.legacyChart as any;
    if (!legacy?.getOptions || !dataset || !config) return {};
    return legacy.getOptions(dataset, config);
  };

const upgradeLegacyEChartsVisual = (type: string) =>
  upgradeVisual(type, 'echarts', buildFromLegacy(type));

export const registerNativeVisualPlugins = () => {
  upgradeVisual('cluster-column-chart', 'echarts', buildBarOption);
  upgradeVisual('cluster-bar-chart', 'echarts', buildBarOption);
  upgradeVisual('line-chart', 'echarts', buildLineOption);
  upgradeVisual('pie-chart', 'echarts', buildPieOption);
  upgradeVisual('mingxi-table', 'table');
  upgradeVisual('piovt-sheet', 's2');
  upgradeVisual('react-scorecard', 'react');
  upgradeVisual('react-rich-text', 'react');
  upgradeVisual('normal-outline-map-chart', 'map');
  upgradeVisual('scatter-outline-map-chart', 'map');

  [
    'area-chart',
    'stack-area-chart',
    'stack-column-chart',
    'stack-bar-chart',
    'percentage-stack-column-chart',
    'percentage-stack-bar-chart',
    'scatter',
    'radar',
    'funnel-chart',
    'gauge',
    'waterfall-chart',
    'word-cloud',
    'double-y',
    'doughnut-chart',
    'rose-chart',
  ].forEach(upgradeLegacyEChartsVisual);
};
