import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { chartRegistry } from '../registry/ChartRegistry';
import { rendererRegistry } from '../registry/RendererRegistry';
import VisualRenderer from '../renderer/VisualRenderer';

describe('VisualRenderer', () => {
  beforeEach(() => {
    chartRegistry.clear();
    rendererRegistry.clear();
  });

  test('resolves plugin and renderer from registries', () => {
    chartRegistry.register({
      type: 'unit-chart',
      name: 'Unit Chart',
      category: 'custom',
      renderer: 'unit-renderer',
    });
    rendererRegistry.register('unit-renderer', () => <div>rendered</div>);

    render(
      <VisualRenderer
        spec={{
          version: 1,
          type: 'unit-chart',
          dimensions: [],
          measures: [],
        }}
      />,
    );

    expect(screen.getByText('rendered')).toBeInTheDocument();
  });
  test('isolates renderer errors with fallback UI', () => {
    chartRegistry.register({
      type: 'broken-chart',
      name: 'Broken Chart',
      category: 'custom',
      renderer: 'broken-renderer',
    });
    rendererRegistry.register('broken-renderer', () => {
      throw new Error('boom');
    });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(
      <VisualRenderer
        spec={{ version: 1, type: 'broken-chart', dimensions: [], measures: [] }}
      />,
    );
    expect(screen.getByText('Visual failed to render')).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  test('shows field guidance before rendering an invalid native visual', () => {
    chartRegistry.register({
      type: 'sankey-v2',
      name: '桑基图',
      category: 'relationship',
      renderer: 'unit-renderer',
      configSchema: {
        fieldSlots: [
          { key: 'source', label: '源维度', type: 'dimension', required: true, min: 1, max: 1 },
          { key: 'target', label: '目标维度', type: 'dimension', required: true, min: 1, max: 1 },
          { key: 'value', label: '权重', type: 'measure', required: true, min: 1, max: 1 },
        ],
        styles: [], settings: [], interactions: [],
      },
    });
    rendererRegistry.register('unit-renderer', () => <div>should not render</div>);

    render(
      <VisualRenderer
        spec={{ version: 1, type: 'sankey-v2', dimensions: [], measures: [] }}
      />,
    );

    expect(screen.getByText('字段配置不完整')).toBeInTheDocument();
    expect(screen.queryByText('should not render')).not.toBeInTheDocument();
  });

});
