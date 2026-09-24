import { FC } from 'react';
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

  return <Renderer {...props} plugin={plugin} />;
};

export default VisualRenderer;
