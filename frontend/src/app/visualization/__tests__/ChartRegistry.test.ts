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
});
