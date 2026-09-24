import { render, screen } from '@testing-library/react';
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
});
