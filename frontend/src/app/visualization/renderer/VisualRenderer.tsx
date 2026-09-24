import { FC } from 'react';
import VisualErrorBoundary from './VisualErrorBoundary';
import { chartRegistry } from '../registry/ChartRegistry';
import {
  rendererRegistry,
  VisualRendererProps,
} from '../registry/RendererRegistry';

export type VisualRendererInput = Omit<VisualRendererProps, 'plugin'>;

const VisualRenderer: FC<VisualRendererInput> = props => {
  const plugin = chartRegistry.get(props.spec.type);
  if (!plugin) {
    return null;
  }

  const Renderer = rendererRegistry.get(plugin.renderer);
  if (!Renderer) {
    return null;
  }

  return (
    <VisualErrorBoundary visualType={plugin.type}>
      <Renderer {...props} plugin={plugin} />
    </VisualErrorBoundary>
  );
};

export default VisualRenderer;
