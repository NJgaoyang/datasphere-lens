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

});
