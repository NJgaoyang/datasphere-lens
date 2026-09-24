import { visualPluginToChart } from '../adapters/VisualPluginChartAdapter';
import { chartRegistry } from '../registry/ChartRegistry';
import {
  extendedVisualPlugins,
  registerExtendedVisualPlugins,
} from '../plugins/extended/registerExtendedVisualPlugins';

const dataset = {
  columns: [
    { name: 'source' },
    { name: 'target' },
    { name: 'value' },
  ],
  rows: [
    ['A', 'B', '10'],
    ['A', 'C', '20'],
    ['B', 'C', '5'],
  ],
};

const relationshipSpec = {
  version: 1,
  type: 'sankey-v2',
  dimensions: [{ fieldId: 'source' }, { fieldId: 'target' }],
  measures: [{ fieldId: 'value' }],
};

describe('extended visual plugins', () => {
  beforeEach(() => chartRegistry.clear());

  test('registers pure v2 plugins without legacy chart classes', () => {
    registerExtendedVisualPlugins();
    expect(chartRegistry.get('sankey-v2')?.renderer).toBe('echarts');
    expect(chartRegistry.get('heatmap-v2')?.category).toBe('distribution');
    expect(chartRegistry.get('boxplot-v2')?.legacyChart).toBeUndefined();
    expect(extendedVisualPlugins).toHaveLength(7);
  });

  test('builds sankey links and auto-adapts to the legacy editor contract', () => {
    registerExtendedVisualPlugins();
    const plugin = chartRegistry.get('sankey-v2')!;
    const option = plugin.buildOption?.(relationshipSpec, dataset) as any;
    expect(option.series[0].type).toBe('sankey');
    expect(option.series[0].links).toHaveLength(3);

    const chart = visualPluginToChart(plugin);
    expect(chart.meta.id).toBe('sankey-v2');
    expect(chart.config?.datas).toHaveLength(4);
  });

  test('builds heatmap and boxplot options from dataset rows', () => {
    registerExtendedVisualPlugins();
    const heatmap = chartRegistry.get('heatmap-v2')!;
    const heatmapOption = heatmap.buildOption?.(
      { ...relationshipSpec, type: 'heatmap-v2' },
      dataset,
    ) as any;
    expect(heatmapOption.series[0].type).toBe('heatmap');
    expect(heatmapOption.series[0].data).toHaveLength(3);

    const boxplot = chartRegistry.get('boxplot-v2')!;
    const boxplotOption = boxplot.buildOption?.(
      {
        version: 1,
        type: 'boxplot-v2',
        dimensions: [{ fieldId: 'source' }],
        measures: [{ fieldId: 'value' }],
      },
      dataset,
    ) as any;
    expect(boxplotOption.series[0].type).toBe('boxplot');
    expect(boxplotOption.xAxis.data).toEqual(['A', 'B']);
  });
});
