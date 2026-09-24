import Chart from 'app/models/Chart';
import { chartRegistry } from '../registry/ChartRegistry';
import { registerLegacyVisual } from '../plugins/legacy/registerLegacyVisual';

describe('ChartRegistry', () => {
  beforeEach(() => {
    chartRegistry.clear();
  });

  test('registers and finds a visual plugin', () => {
    chartRegistry.register({
      type: 'unit-bar',
      name: 'Unit Bar',
      category: 'comparison',
      renderer: 'legacy',
    });

    expect(chartRegistry.get('unit-bar')?.name).toBe('Unit Bar');
    expect(chartRegistry.getByCategory('comparison')).toHaveLength(1);
  });

  test('registers a legacy chart as a visual plugin', () => {
    const chart = new Chart('legacy-line', 'Legacy Line', 'line');
    registerLegacyVisual(chart);

    const plugin = chartRegistry.get('legacy-line');
    expect(plugin?.legacyChart).toBe(chart);
    expect(plugin?.renderer).toBe('legacy');
    expect(plugin?.category).toBe('trend');
  });
  test('queries plugins by category and capability', () => {
    chartRegistry.register({
      type: 'drill-bar',
      name: 'Drill Bar',
      category: 'comparison',
      renderer: 'echarts',
      capabilities: { drill: true },
    });
    chartRegistry.register({
      type: 'plain-line',
      name: 'Plain Line',
      category: 'trend',
      renderer: 'echarts',
    });

    expect(
      chartRegistry.query({ category: 'comparison', capabilities: ['drill'] }),
    ).toHaveLength(1);
  });

});
