import { chartRegistry } from '../registry/ChartRegistry';
import { registerNativeVisualPlugins } from '../plugins/registerNativeVisualPlugins';

describe('native visual plugins', () => {
  beforeEach(() => {
    chartRegistry.clear();
    ['cluster-column-chart', 'cluster-bar-chart', 'line-chart', 'pie-chart', 'mingxi-table'].forEach(type => {
      chartRegistry.register({ type, name: type, category: 'custom', renderer: 'legacy' });
    });
  });

  test('upgrades core visuals without changing their ids', () => {
    registerNativeVisualPlugins();
    expect(chartRegistry.get('cluster-column-chart')?.renderer).toBe('echarts');
    expect(typeof chartRegistry.get('cluster-column-chart')?.buildOption).toBe('function');
    expect(chartRegistry.get('line-chart')?.renderer).toBe('echarts');
    expect(chartRegistry.get('pie-chart')?.renderer).toBe('echarts');
    expect(chartRegistry.get('mingxi-table')?.renderer).toBe('table');
  });
});
