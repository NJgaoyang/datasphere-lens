import ChartManager from 'app/models/ChartManager';
import { chartRegistry } from '../registry/ChartRegistry';

describe('ChartManager v2 registry integration', () => {
  test('discovers pure v2 visuals through the registry', () => {
    const manager = ChartManager.instance();
    const ids = manager.getAllCharts().map(chart => chart.meta.id);

    expect(ids).toContain('sankey-v2');
    expect(ids).toContain('graph-v2');
    expect(ids).toContain('tree-v2');
    expect(ids).toContain('treemap-v2');
    expect(ids).toContain('sunburst-v2');
    expect(ids).toContain('heatmap-v2');
    expect(ids).toContain('boxplot-v2');

    expect(chartRegistry.get('sankey-v2')?.legacyChart).toBeUndefined();
    expect(manager.getById('sankey-v2')?.meta.id).toBe('sankey-v2');
  });
});
