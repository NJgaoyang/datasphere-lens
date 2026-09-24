import { chartRegistry } from '../registry/ChartRegistry';
import { registerNativeVisualPlugins } from '../plugins/registerNativeVisualPlugins';

const coreTypes = [
  'cluster-column-chart',
  'cluster-bar-chart',
  'line-chart',
  'pie-chart',
  'mingxi-table',
  'piovt-sheet',
  'react-scorecard',
  'react-rich-text',
  'normal-outline-map-chart',
  'scatter-outline-map-chart',
];

const migratedLegacyTypes = [
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
];

describe('native visual plugins', () => {
  beforeEach(() => {
    chartRegistry.clear();
    [...coreTypes, ...migratedLegacyTypes].forEach(type => {
      chartRegistry.register({
        type,
        name: type,
        category: 'custom',
        renderer: 'legacy',
        legacyChart: {
          getOptions: () => ({ series: [{ type }] }),
        } as any,
      });
    });
  });

  test('upgrades core visuals without changing their ids', () => {
    registerNativeVisualPlugins();
    expect(chartRegistry.get('cluster-column-chart')?.renderer).toBe('echarts');
    expect(typeof chartRegistry.get('cluster-column-chart')?.buildOption).toBe('function');
    expect(chartRegistry.get('line-chart')?.renderer).toBe('echarts');
    expect(chartRegistry.get('pie-chart')?.renderer).toBe('echarts');
    expect(chartRegistry.get('mingxi-table')?.renderer).toBe('table');
    expect(chartRegistry.get('piovt-sheet')?.renderer).toBe('s2');
    expect(chartRegistry.get('react-scorecard')?.renderer).toBe('react');
    expect(chartRegistry.get('react-rich-text')?.renderer).toBe('react');
    expect(chartRegistry.get('normal-outline-map-chart')?.renderer).toBe('map');
    expect(chartRegistry.get('scatter-outline-map-chart')?.renderer).toBe('map');
  });

  test('upgrades second-batch visuals through the shared ECharts renderer', () => {
    registerNativeVisualPlugins();
    migratedLegacyTypes.forEach(type => {
      const plugin = chartRegistry.get(type);
      expect(plugin?.renderer).toBe('echarts');
      expect(typeof plugin?.buildOption).toBe('function');
    });

    const gauge = chartRegistry.get('gauge');
    const option = gauge?.buildOption?.(
      { version: 1, type: 'gauge', dimensions: [], measures: [] },
      { columns: [], rows: [] },
      { datas: [] },
    );
    expect(option).toEqual({ series: [{ type: 'gauge' }] });
  });
});
